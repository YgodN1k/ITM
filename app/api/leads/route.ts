import { NextResponse } from "next/server";

const MIN_FORM_FILL_TIME_MS = 3000;
const MAX_NAME_LENGTH = 35;

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

async function sendTelegramLead(name: string, phone: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  const message = [
    "New lead from ITmedical",
    `Name: ${name}`,
    `Phone: ${phone}`,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send Telegram notification");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const website = String(body.website ?? "").trim();
    const startedAt = Number(body.startedAt ?? 0);

    if (website) {
      return NextResponse.json({ ok: true, message: "Request accepted." });
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

    await sendTelegramLead(name, phone);

    return NextResponse.json({ ok: true, message: "Спасибо! Заявка отправлена." });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Не удалось отправить заявку. Попробуйте позже." },
      { status: 500 },
    );
  }
}
