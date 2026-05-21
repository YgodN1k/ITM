import { NextResponse } from "next/server";
import { getServerSupabase, type LeadStatus } from "@/lib/supabase";

const VALID_STATUSES: LeadStatus[] = ["new", "in_progress", "done"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = typeof body.status === "string" ? (body.status as LeadStatus) : null;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { ok: false, message: "Некорректный статус." },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Не удалось обновить статус." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
