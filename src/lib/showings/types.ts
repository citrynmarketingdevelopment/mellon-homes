import { z } from "zod";

export const showingConsent = "I agree that Ian Mellon may contact me about this showing request.";
export const showingSchema = z.object({
  requestId: z.uuid(), listingId: z.uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase().max(254),
  phone: z.string().trim().min(7).max(30).regex(/^[\d\s()+.\-]+$/).refine(value => value.replace(/\D/g, "").length >= 7),
  date: z.iso.date(),
  time: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  notes: z.string().trim().max(2000),
  consent: z.literal(true),
  website: z.literal(""),
}).strict();
export type ShowingRequest = z.infer<typeof showingSchema>;
export type SavedShowing = ShowingRequest & { address: string; consentText: string };
export function pacificNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (type: string) => parts.find(value => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function showingDateRange(now = new Date()) {
  return { minDate: pacificNow(now).slice(0, 10), maxDate: pacificNow(new Date(now.getTime() + 180 * 86400000)).slice(0, 10) };
}
