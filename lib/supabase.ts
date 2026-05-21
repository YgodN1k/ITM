import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type LeadStatus = "new" | "in_progress" | "done";

export type Build = {
  id: string;
  created_at: string;
  sku: string;
  motherboard: string;
  cpu: string;
  gpu: string;
  ram: string;
  ssd: string;
  hdd: string | null;
  cooler: string;
  power: string;
  price: string;
  image: string;
  sort_order: number;
};

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  build_id: string | null;
  status: LeadStatus;
};

export type LeadWithBuild = Lead & {
  build: Pick<Build, "sku" | "cpu" | "gpu" | "price"> | null;
};

let cachedClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
