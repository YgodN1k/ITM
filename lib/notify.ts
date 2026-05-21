import { Resend } from "resend";
import type { Build } from "@/lib/supabase";

type LeadEmailInput = {
  name: string;
  phone: string;
  build: Pick<Build, "sku" | "cpu" | "gpu" | "price"> | null;
};

export async function sendLeadEmail(lead: LeadEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !to || !from) {
    return;
  }

  const resend = new Resend(apiKey);

  const kindLine = lead.build
    ? `Заказ сборки: ${lead.build.sku} — ${lead.build.cpu} / ${lead.build.gpu} — ${lead.build.price} тыс.руб`
    : "Ремонт";

  const subject = lead.build
    ? `Новая заявка: ${lead.build.sku}`
    : "Новая заявка: ремонт";

  const text = [
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Тип: ${kindLine}`,
    "",
    "Открыть админку: /admin",
  ].join("\n");

  await resend.emails.send({ from, to, subject, text });
}
