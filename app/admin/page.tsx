import { getServerSupabase, type LeadWithBuild } from "@/lib/supabase";
import { AdminList } from "./AdminList";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; kind?: string }>;

const VALID_STATUSES = new Set(["new", "in_progress", "done"]);

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = getServerSupabase();

  let query = supabase
    .from("leads")
    .select("*, build:builds(sku, cpu, gpu, price)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status && VALID_STATUSES.has(params.status)) {
    query = query.eq("status", params.status);
  }

  if (params.kind === "repair") {
    query = query.is("build_id", null);
  } else if (params.kind === "order") {
    query = query.not("build_id", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load leads: ${error.message}`);
  }

  const leads = (data ?? []) as unknown as LeadWithBuild[];

  return <AdminList leads={leads} filters={{ status: params.status, kind: params.kind }} />;
}
