import { absoluteUrl, site } from "@/lib/site";

export type EmailInput = {
  kind: "showing" | "valuation" | "inquiry";
  name: string; email: string;
  details: [string, string][];
  topic?: string;
};
export type EmailMessage = { subject: string; text: string; html: string };
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}
function frame(eyebrow: string, heading: string, content: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head><body style="margin:0;background:#f5f1e8;color:#073f35;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 14px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff9e9;border-radius:16px;overflow:hidden"><tr><td style="padding:28px 30px;background:#f6b8cc;border-bottom:4px solid #d6b669"><a href="${site.url}" style="font-size:25px;font-weight:bold;letter-spacing:-1px;color:#073f35;text-decoration:none">MELLON<span style="display:block;font-size:10px;letter-spacing:2px;margin-top:5px">REAL ESTATE</span></a></td></tr><tr><td style="padding:32px 30px"><p style="font-size:10px;font-weight:bold;letter-spacing:1.5px;color:#49675b">${escapeHtml(eyebrow)}</p><h1 style="font-size:30px;line-height:1.15;letter-spacing:-.7px;margin:18px 0 22px">${escapeHtml(heading)}</h1>${content}</td></tr><tr><td style="padding:25px 30px;background:#103c2f;color:#fff9e9;font-size:13px;line-height:1.8"><strong>Ian Mellon</strong><br>California Real Estate Broker · DRE #${site.license}<br>Bakersfield &amp; Kern County<br><a href="${site.phoneHref}" style="color:#e4c77b">${site.phone}</a> · <a href="mailto:${site.email}" style="color:#e4c77b">${site.email}</a><br><a href="${site.url}" style="color:#fff9e9">mellonhomes.com</a></td></tr></table><p style="max-width:550px;font-size:11px;line-height:1.6;color:#52695e">This is a reply to a request submitted on mellonhomes.com. You have not been added to a marketing list.</p></td></tr></table></body></html>`;
}

export function createEmails(input: EmailInput): { broker: EmailMessage; customer: EmailMessage } {
  const labels = { showing: "showing request", valuation: "home-value request", inquiry: "specialty inquiry" };
  const label = labels[input.kind];
  const steps = input.kind === "showing" ? [
    "Ian will review your preferred date and time and contact you to confirm the property's availability.",
    "Your request has been received, but your showing is not booked until Ian confirms the appointment.",
    "Reply to this email if you need to update your request, or call Ian to talk through the details.",
  ] : input.kind === "valuation" ? [
    "Ian will review the property information you provided and follow up about your home and your goals.",
    "Any automated value shown on the website is an estimate, not an appraisal or a guaranteed sale price.",
    "Reply to this email with questions, or call Ian to discuss your next step.",
  ] : [
    `Ian will review your ${input.topic ? input.topic.toLowerCase() + " " : ""}inquiry and contact you to discuss your property and priorities.`,
    "The first conversation is a chance to understand your situation and decide what information you need next.",
    "If a notice or legal deadline is involved, contact your servicer or attorney promptly. This inquiry does not pause a deadline or schedule an appointment.",
  ];
  // Freeform messages and property/financial details stay in the broker email only.
  const customerText = `Hello ${input.name},\n\nThank you for reaching out to Mellon Real Estate. Your ${label} has been received.\n\nWhat happens next\n${steps.map((step, index) => `${index + 1}. ${step}`).join("\n\n")}\n\nIan Mellon\nCalifornia Real Estate Broker · DRE #${site.license}\n${site.phone} | ${site.email}\n${site.url}`;
  return {
    broker: {
      subject: `Mellon: new ${label}`,
      text: input.details.map(([key, value]) => `${key}: ${value}`).join("\n\n"),
      html: frame("NEW WEBSITE REQUEST", `New ${label}.`, `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6">${input.details.map(([key, value]) => `<tr><td style="padding:10px 14px 10px 0;width:30%;vertical-align:top;border-bottom:1px solid #073f3518;color:#52695e">${escapeHtml(key)}</td><td style="padding:10px 0;border-bottom:1px solid #073f3518;overflow-wrap:anywhere;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="margin-top:24px;font-size:14px">Reply to this email to contact the visitor.</p>`),
    },
    customer: {
      subject: "Thank you for reaching out to Mellon Real Estate",
      text: customerText,
      html: frame("YOUR NEXT CHAPTER STARTS HERE", "A fresh place to begin.", `<p style="font-size:16px;line-height:1.75">Hello ${escapeHtml(input.name)},</p><p style="font-size:16px;line-height:1.75">Thank you for reaching out to Mellon Real Estate. Your ${label} has been received, and I look forward to learning more about how I can help.</p><h2 style="font-size:21px;margin-top:28px">What happens next</h2><ol style="padding-left:22px;font-size:15px;line-height:1.75">${steps.map(step => `<li style="padding-bottom:14px">${escapeHtml(step)}</li>`).join("")}</ol><p style="font-size:16px;line-height:1.75">A private conversation. No pressure. Just a place to begin.</p><p style="margin:26px 0"><a href="${absoluteUrl("/")}" style="display:inline-block;background:#073f35;color:#fff9e9;padding:15px 23px;border-radius:28px;text-decoration:none;font-size:14px;font-weight:bold">Visit Mellon Real Estate</a></p><p style="font-size:15px;line-height:1.7">Talk soon,<br><strong>Ian Mellon</strong></p>`),
    },
  };
}
