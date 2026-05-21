import pg from "pg";

const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace(
  /[?&]sslmode=[^&]+/g,
  ""
);
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
client.on("error", () => {}); // Supabase resets the TLS socket on close; harmless after queries succeed

await client.connect();

const tables = await client.query(
  `select table_name from information_schema.tables
   where table_schema='public' and table_name in ('builds','leads') order by table_name`
);
console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

const idx = await client.query(
  `select indexname from pg_indexes where schemaname='public' and tablename in ('builds','leads') order by indexname`
);
console.log("Indexes:", idx.rows.map((r) => r.indexname).join(", "));

const rls = await client.query(
  `select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('builds','leads') order by tablename`
);
console.log("RLS:", rls.rows.map((r) => `${r.tablename}=${r.rowsecurity}`).join(", "));

const pol = await client.query(
  `select policyname, tablename, roles from pg_policies where schemaname='public' order by tablename`
);
console.log("Policies:", pol.rows.map((r) => `${r.tablename}.${r.policyname} (${r.roles})`).join(", ") || "(none)");

const rt = await client.query(
  `select tablename from pg_publication_tables where pubname='supabase_realtime' and tablename in ('builds','leads')`
);
console.log("Realtime tables:", rt.rows.map((r) => r.tablename).join(", ") || "(none)");

const enumVals = await client.query(
  `select unnest(enum_range(null::lead_status))::text as v`
);
console.log("lead_status values:", enumVals.rows.map((r) => r.v).join(", "));

await client.end();
