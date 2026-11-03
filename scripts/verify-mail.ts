import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { sendNotification } from "../src/lib/mail/delivery";
import { createEmails, type EmailInput } from "../src/lib/mail/templates";

async function main() {
  const originalFetch = globalThis.fetch;
  const originalApi = process.env.SMTP_API;
  const originalChannel = process.env.SMTP_CHANNEL;
  const input: EmailInput = { kind: "inquiry", name: "Alex <Homeowner>", email: "visitor@example.test", topic: "Probate & inherited property", details: [["Name", "Alex <Homeowner>"], ["Message", "<script>private-message</script>"], ["Phone", "6615550100"]] };
  try {
    process.env.SMTP_API = "fixture-api-key"; process.env.SMTP_CHANNEL = "fixture-channel";
    for (const kind of ["inquiry", "showing", "valuation"] as const) {
      const calls: Record<string, unknown>[] = [];
      globalThis.fetch = async (url, init) => {
        assert.equal(url, "https://api.smtp.com/v4/messages");
        assert.equal((init?.headers as Record<string, string>)["X-SMTPCOM-API"], "fixture-api-key");
        calls.push(JSON.parse(String(init?.body)));
        return Response.json({ status: "success", data: { message: "accepted, msg_id: fixture-id" } });
      };
      assert.deepEqual(await sendNotification({ ...input, kind }), { broker: "sent", customer: "sent" });
      assert.equal(calls.length, 2);
      assert.deepEqual(calls[0].recipients, { to: [{ address: "ianmellon@yahoo.com" }, { address: "citryn.contactforms@gmail.com" }] });
      assert.deepEqual(calls[1].recipients, { to: [{ address: input.email }] });
      assert.deepEqual(calls[0].originator, { from: { name: "Mellon Real Estate", address: "contactforms@citryn.com" }, reply_to: { address: input.email } });
      assert.deepEqual(calls[1].originator, { from: { name: "Mellon Real Estate", address: "contactforms@citryn.com" }, reply_to: { address: "ianmellon@yahoo.com" } });
      const templates = createEmails({ ...input, kind });
      assert(templates.broker.html.includes("&lt;script&gt;")); assert(!templates.broker.html.includes("<script>"));
      assert(templates.customer.html.includes("Alex &lt;Homeowner&gt;")); assert(!templates.customer.html.includes("private-message"));
      assert(templates.customer.html.includes("https://mellonhomes.com"));
      if (kind === "showing") assert(templates.customer.text.includes("not booked"));
      if (kind === "valuation") assert(templates.customer.text.includes("not an appraisal"));
    }
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ status: "success", data: { message: "accepted" } }); };
    assert.deepEqual(await sendNotification(input), { broker: "failed", customer: "not_sent" }); assert.equal(calls, 1);
    calls = 0;
    globalThis.fetch = async () => { if (++calls === 2) throw new Error("Confirmation failed"); return Response.json({ status: "success", data: { msg_id: "fixture-id" } }); };
    assert.deepEqual(await sendNotification(input), { broker: "sent", customer: "failed" }); assert.equal(calls, 2);
    process.env.SMTP_API = ""; calls = 0;
    assert.deepEqual(await sendNotification(input), { broker: "unconfigured", customer: "unconfigured" }); assert.equal(calls, 0);
    const preview = createEmails({ ...input, name: "Alex", details: [["Name", "Alex"], ["Email", input.email], ["Service", "Probate & inherited property"], ["Message", "I would like to discuss selling an inherited home in Bakersfield."]] });
    await mkdir("artifacts/email", { recursive: true });
    await writeFile("artifacts/email/customer-welcome.html", preview.customer.html);
    await writeFile("artifacts/email/broker-inquiry.html", preview.broker.html);
    console.log("Email checks passed: all 3 request types, correct recipients/reply-to, HTML escaping, plain-text alternatives, provider acceptance, missing config, and independent failure status. No live emails sent.");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApi === undefined) delete process.env.SMTP_API; else process.env.SMTP_API = originalApi;
    if (originalChannel === undefined) delete process.env.SMTP_CHANNEL; else process.env.SMTP_CHANNEL = originalChannel;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
