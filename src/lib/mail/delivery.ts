import "server-only";
import { z } from "zod";
import { site } from "@/lib/site";
import { createEmails, type EmailInput, type EmailMessage } from "./templates";

export type EmailStatus = "sent" | "failed" | "unconfigured";
export type EmailDelivery = { broker: EmailStatus; customer: EmailStatus | "not_sent" };
export type NotificationResult = EmailDelivery | string;
export const normalizeDelivery = (result: NotificationResult): EmailDelivery => typeof result === "string"
  ? { broker: result === "sent" || result === "unconfigured" ? result : "failed", customer: "not_sent" } : result;

// Matches trends-frontend: SMTP.com authenticates this sender on citryn.com.
// The Yahoo address is the recipient/reply-to, never an unauthenticated From address.
const sender = "contactforms@citryn.com";
const notificationRecipients = [site.email, "citryn.contactforms@gmail.com"];
const configSchema = z.object({ apiKey: z.string().min(1), channel: z.string().min(1) });
const acceptedSchema = z.object({ status: z.literal("success"), data: z.union([
  z.object({ msg_id: z.string().trim().min(1) }),
  z.object({ message: z.string().regex(/^accepted,\s*msg_id:\s*[a-zA-Z0-9][a-zA-Z0-9._-]*\s*$/i) }),
]) });
export function emailConfigured() { return configSchema.safeParse({ apiKey: process.env.SMTP_API, channel: process.env.SMTP_CHANNEL }).success; }

async function send(config: z.infer<typeof configSchema>, email: EmailMessage, recipients: readonly string[], replyTo: string) {
  const response = await fetch("https://api.smtp.com/v4/messages", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-SMTPCOM-API": config.apiKey },
    body: JSON.stringify({ channel: config.channel, recipients: { to: recipients.map(address => ({ address })) },
      originator: { from: { name: site.name, address: sender }, reply_to: { address: replyTo } },
      subject: email.subject, body: { parts: [{ type: "text/plain", charset: "UTF-8", content: email.text }, { type: "text/html", charset: "UTF-8", content: email.html }] } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok || !acceptedSchema.safeParse(await response.json()).success) throw new Error("MAIL_NOT_ACCEPTED");
}

export async function sendNotification(input: EmailInput): Promise<EmailDelivery> {
  const config = configSchema.safeParse({ apiKey: process.env.SMTP_API, channel: process.env.SMTP_CHANNEL });
  if (!config.success) return { broker: "unconfigured", customer: "unconfigured" };
  const templates = createEmails(input);
  try { await send(config.data, templates.broker, notificationRecipients, input.email); }
  catch { return { broker: "failed", customer: "not_sent" }; }
  try { await send(config.data, templates.customer, [input.email], site.email); return { broker: "sent", customer: "sent" }; }
  catch { return { broker: "sent", customer: "failed" }; }
}
