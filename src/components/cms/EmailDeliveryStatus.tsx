export default function EmailDeliveryStatus({ broker, customer }: { broker: string; customer: string }) {
  const status = (value: string) => value === "sent" ? "Accepted by email provider" : value === "unconfigured" ? "SMTP.com not configured; follow up from this inbox" : value === "failed" ? "Delivery failed; follow up from this inbox" : value === "not_sent" ? "Not sent" : "Pending; check this inbox for follow-up";
  return <div><p>Broker notification: {status(broker)}</p><p>Visitor thank-you: {status(customer)}</p></div>;
}
