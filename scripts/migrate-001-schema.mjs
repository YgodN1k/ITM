// One-shot migration: creates lead_status enum, builds + leads tables, indexes,
// RLS, anon SELECT policy on leads, and enables realtime for leads.
// Run with: node --env-file=.env.local scripts/migrate-001-schema.mjs

import pg from "pg";

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error("POSTGRES_URL_NON_POOLING is missing. Load .env.local with --env-file.");
  process.exit(1);
}

const SQL = `
create type lead_status as enum ('new', 'in_progress', 'done');

create table builds (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  sku         text not null unique,
  motherboard text not null,
  cpu         text not null,
  gpu         text not null,
  ram         text not null,
  ssd         text not null,
  hdd         text,
  cooler      text not null,
  power       text not null,
  price       text not null,
  image       text not null,
  sort_order  int  not null default 0
);

create table leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  phone      text not null,
  build_id   uuid references builds(id) on delete set null,
  status     lead_status not null default 'new'
);

create index leads_created_at_idx on leads (created_at desc);
create index leads_status_idx     on leads (status);
create index builds_sort_idx      on builds (sort_order asc, created_at asc);

alter table builds enable row level security;
alter table leads  enable row level security;

create policy "anon can select leads"
  on leads for select to anon using (true);

alter publication supabase_realtime add table leads;
`;

// Supabase uses certs not in Node's default CA bundle. Strip sslmode from the
// connection string and configure SSL explicitly so pg uses our settings.
const cleanedConnectionString = connectionString.replace(/[?&]sslmode=[^&]+/g, "");

const client = new pg.Client({
  connectionString: cleanedConnectionString,
  ssl: { rejectUnauthorized: false },
});
client.on("error", () => {}); // Supabase resets the TLS socket on close; harmless after queries succeed

try {
  await client.connect();
  console.log("Connected to Supabase Postgres");

  await client.query("begin");
  await client.query(SQL);
  await client.query("commit");
  console.log("Migration committed");

  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_name in ('builds','leads')
     order by table_name`
  );
  console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

  const leadsCols = await client.query(
    `select column_name, data_type from information_schema.columns
     where table_schema = 'public' and table_name = 'leads' order by ordinal_position`
  );
  console.log("leads columns:");
  for (const row of leadsCols.rows) {
    console.log(`  ${row.column_name.padEnd(12)} ${row.data_type}`);
  }

  const buildsCols = await client.query(
    `select column_name, data_type from information_schema.columns
     where table_schema = 'public' and table_name = 'builds' order by ordinal_position`
  );
  console.log("builds columns:");
  for (const row of buildsCols.rows) {
    console.log(`  ${row.column_name.padEnd(12)} ${row.data_type}`);
  }

  const realtime = await client.query(
    `select tablename from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'leads'`
  );
  console.log("realtime on leads:", realtime.rowCount === 1 ? "ON" : "OFF");
} catch (error) {
  await client.query("rollback").catch(() => {});
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
