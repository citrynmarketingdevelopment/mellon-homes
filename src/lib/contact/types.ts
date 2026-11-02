import { z } from "zod";
import { specialties } from "@/lib/specialties";

export const contactConsent = "I agree that Ian Mellon may contact me about my real estate inquiry.";
export const contactSchema = z.object({
  requestId: z.uuid(), name: z.string().trim().min(2).max(100), email: z.email().trim().toLowerCase().max(254),
  phone: z.string().trim().min(7).max(30).regex(/^[\d\s()+.\-]+$/).refine(value => value.replace(/\D/g, "").length >= 7),
  specialty: z.string().refine(value => specialties.some(item => item.slug === value)),
  address: z.string().trim().max(250), message: z.string().trim().min(10).max(2000), consent: z.literal(true), website: z.literal(""),
}).strict();
export type ContactRequest = z.infer<typeof contactSchema>;
