// Smoke-tests Resend by sending a fake lead notification.
// Run with: node --env-file=.env.local scripts/test-email.mjs

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.NOTIFY_EMAIL;
const from = process.env.RESEND_FROM;

if (!apiKey || !to || !from) {
  console.error("Missing env: RESEND_API_KEY / NOTIFY_EMAIL / RESEND_FROM");
  process.exit(1);
}

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Resend smoke test — ITmedical",
  text: [
    "Это тестовое письмо от Resend.",
    "",
    `From: ${from}`,
    `To: ${to}`,
    `Sent at: ${new Date().toISOString()}`,
    "",
    "Если ты это видишь — пайплайн email-уведомлений работает.",
  ].join("\n"),
});

if (error) {
  console.error("Send failed:", error);
  process.exit(1);
}

console.log("Sent:", data);
