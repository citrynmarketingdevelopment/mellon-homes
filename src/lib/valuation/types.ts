import { z } from "zod";

export const consentText = "I agree that Ian Mellon may contact me by phone or email about this property and my request.";
export const leadSchema = z.object({
  requestId: z.uuid(),
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(10).max(250).regex(/\d/).regex(/\b\d{5}(?:-\d{4})?\s*$/, "Include the full property address and ZIP code."),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  phone: z.string().trim().max(30).refine(value => /^\+?[\d\s().-]+$/.test(value) && [10, 11].includes(value.replace(/\D/g, "").length)),
  loanBalance: z.number().finite().min(0).max(100_000_000).optional(),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
export type ValuationLead = z.infer<typeof leadSchema>;
export type ValuationReport = {
  address: string; value: number; low?: number; high?: number;
  equity?: number; loanBalance?: number; propertyType?: string;
  beds?: number; baths?: number; sqft?: number; yearBuilt?: number; lotSize?: number;
  source: "RentCast"; asOf: string;
};
export type ValuationResponse = { status: "estimate"; report: ValuationReport } | { status: "requested" };

const optionalNumber = z.number().finite().nonnegative().nullish();
const providerSchema = z.object({
  price: z.number().finite().positive(),
  priceRangeLow: optionalNumber, priceRangeHigh: optionalNumber,
  subjectProperty: z.object({
    formattedAddress: z.string().nullish(), propertyType: z.string().nullish(),
    bedrooms: optionalNumber, bathrooms: optionalNumber, squareFootage: optionalNumber,
    yearBuilt: optionalNumber, lotSize: optionalNumber,
  }).nullish(),
});

export function parseValuation(data: unknown, lead: ValuationLead): ValuationReport {
  const parsed = providerSchema.parse(data);
  const property = parsed.subjectProperty;
  return {
    address: property?.formattedAddress || lead.address,
    value: parsed.price, low: parsed.priceRangeLow ?? undefined, high: parsed.priceRangeHigh ?? undefined,
    // An unknown loan balance is not zero; negative equity is a valid result.
    equity: lead.loanBalance === undefined ? undefined : parsed.price - lead.loanBalance,
    loanBalance: lead.loanBalance, propertyType: property?.propertyType ?? undefined,
    beds: property?.bedrooms ?? undefined, baths: property?.bathrooms ?? undefined,
    sqft: property?.squareFootage ?? undefined, yearBuilt: property?.yearBuilt ?? undefined,
    lotSize: property?.lotSize ?? undefined, source: "RentCast", asOf: new Date().toISOString(),
  };
}
