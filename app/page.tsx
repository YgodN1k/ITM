import { getServerSupabase, type Build } from "@/lib/supabase";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("builds")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load builds: ${error.message}`);
  }

  const builds = (data ?? []) as Build[];

  return <HomeClient builds={builds} />;
}
