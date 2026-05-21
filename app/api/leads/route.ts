import { NextResponse } from "next/server";
import { getServerSupabase, type Build } from "@/lib/supabase";
import { sendLeadEmail } from "@/lib/notify";

const MIN_FORM_FILL_TIME_MS = 3000;
const MAX_NAME_LENGTH = 35;
const DEDUP_WINDOW_MINUTES = 15;

const SUCCESS_PAYLOAD = { ok: true, message: "Спасибо! Заявка отправлена." };

function isValidRussianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("7");
}

function isSpammyName(name: string) {
  return (
    /https?:\/\//i.test(name) ||
    /www\./i.test(name) ||
    /@/.test(name) ||
    /(.)\1{5,}/i.test(name)
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const website = String(body.website ?? "").trim();
    const startedAt = Number(body.startedAt ?? 0);
    const rawBuildId = typeof body.build_id === "string" ? body.build_id.trim() : "";

    if (website) {
      return NextResponse.json(SUCCESS_PAYLOAD);
    }

    if (!startedAt || Date.now() - startedAt < MIN_FORM_FILL_TIME_MS) {
      return NextResponse.json(
        { ok: false, message: "Слишком быстрая отправка формы. Попробуйте ещё раз." },
        { status: 400 },
      );
    }

    if (!name || name.length > MAX_NAME_LENGTH || isSpammyName(name)) {
      return NextResponse.json(
        { ok: false, message: "Укажите имя без ссылок и спам-символов." },
        { status: 400 },
      );
    }

    if (!isValidRussianPhone(phone)) {
      return NextResponse.json(
        { ok: false, message: "Введите номер в формате +7 (999) 999-99-99." },
        { status: 400 },
      );
    }

    let buildId: string | null = null;
    if (rawBuildId) {
      if (!isUuid(rawBuildId)) {
        return NextResponse.json(
          { ok: false, message: "Некорректный идентификатор сборки." },
          { status: 400 },
        );
      }
      buildId = rawBuildId;
    }

    const supabase = getServerSupabase();

    let buildInfo: Pick<Build, "sku" | "cpu" | "gpu" | "price"> | null = null;
    if (buildId) {
      const { data: existingBuild, error: buildError } = await supabase
        .from("builds")
        .select("sku, cpu, gpu, price")
        .eq("id", buildId)
        .maybeSingle();

      if (buildError) {
        return NextResponse.json(
          { ok: false, message: "Не удалось проверить сборку." },
          { status: 500 },
        );
      }

      if (!existingBuild) {
        return NextResponse.json(
          { ok: false, message: "Сборка не найдена." },
          { status: 400 },
        );
      }

      buildInfo = existingBuild as Pick<Build, "sku" | "cpu" | "gpu" | "price">;
    }

    const dedupSince = new Date(Date.now() - DEDUP_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: recentLead, error: dedupError } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", phone)
      .gte("created_at", dedupSince)
      .limit(1)
      .maybeSingle();

    if (dedupError) {
      return NextResponse.json(
        { ok: false, message: "Не удалось отправить заявку. Попробуйте позже." },
        { status: 500 },
      );
    }

    if (recentLead) {
      return NextResponse.json(SUCCESS_PAYLOAD);
    }

    const { error: insertError } = await supabase
      .from("leads")
      .insert({ name, phone, build_id: buildId });

    if (insertError) {
      return NextResponse.json(
        { ok: false, message: "Не удалось отправить заявку. Попробуйте позже." },
        { status: 500 },
      );
    }

    try {
      await sendLeadEmail({ name, phone, build: buildInfo });
    } catch (emailError) {
      console.error("sendLeadEmail failed", emailError);
    }

    return NextResponse.json(SUCCESS_PAYLOAD);
  } catch {
    return NextResponse.json(
      { ok: false, message: "Не удалось отправить заявку. Попробуйте позже." },
      { status: 500 },
    );
  }
}
