// Seeds the 4 original builds with SKUs B-001..B-004.
// Uses Supabase REST API (HTTPS) to avoid pg TLS instability on Windows.
// Run with: node --env-file=.env.local scripts/migrate-002-seed-builds.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const builds = [
  {
    sku: "B-001",
    motherboard: "AMD B850",
    cpu: "Ryzen 7 9800X3D",
    gpu: "RX 7700XT",
    ram: "16 GB (2x8GB) 3200MHz",
    ssd: "500GB",
    hdd: "1TB",
    cooler: "DeepCool AG300 LED",
    power: "DeepCool PF700",
    price: "От 90 до 120",
    image: "/assets/figma/build-red.png",
    sort_order: 0,
  },
  {
    sku: "B-002",
    motherboard: "AMD X870",
    cpu: "Ryzen 9 9900X3D",
    gpu: "RX 9070XT",
    ram: "16GB (2x8GB) 3200MHz",
    ssd: "500GB",
    hdd: "2TB",
    cooler: "DeepCool AG400",
    power: "DeepCool PF750D",
    price: "От 100 до 150",
    image: "/assets/figma/build-orange.png",
    sort_order: 1,
  },
  {
    sku: "B-003",
    motherboard: "B760M",
    cpu: "Intel Core i5 14600K",
    gpu: "RTX 5060 12GB",
    ram: "16GB (2x8GB) 4200MHz",
    ssd: "500GB",
    hdd: "2TB",
    cooler: "DeepCool AG400 BK",
    power: "DeepCool PF750D",
    price: "От 50 до 95",
    image: "/assets/figma/build-yellow.png",
    sort_order: 2,
  },
  {
    sku: "B-004",
    motherboard: "Z790",
    cpu: "i7-12700",
    gpu: "RTX 5080 12GB",
    ram: "32GB (2x16GB) 5600MHz",
    ssd: "1TB",
    hdd: "2TB",
    cooler: "DeepCool AG500 ARGB",
    power: "DeepCool DQ1000",
    price: "От 150 до 200",
    image: "/assets/figma/build-green.png",
    sort_order: 3,
  },
];

const { data: existing } = await supabase.from("builds").select("sku");
const existingSkus = new Set((existing ?? []).map((r) => r.sku));
const missing = builds.filter((b) => !existingSkus.has(b.sku));

if (missing.length === 0) {
  console.log("All 4 builds already present — skipping insert");
} else {
  // Insert one at a time. Supabase's pooler occasionally chokes on multi-row
  // INSERT here and queues a statement_timeout, blocking the table for ~8s.
  for (const b of missing) {
    const { error } = await supabase.from("builds").insert(b);
    if (error) {
      console.error(`Insert ${b.sku} failed:`, error.message);
      process.exit(1);
    }
    console.log(`Inserted ${b.sku}`);
  }
}

const { data: all, error: listError } = await supabase
  .from("builds")
  .select("sku, cpu, gpu, price, sort_order")
  .order("sort_order", { ascending: true });

if (listError) {
  console.error("List failed:", listError.message);
  process.exit(1);
}

console.log("Builds in DB:");
for (const r of all) {
  console.log(`  ${r.sku}  sort=${r.sort_order}  ${r.cpu} / ${r.gpu} / ${r.price}`);
}
