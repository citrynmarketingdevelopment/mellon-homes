export default function PropertyDetails({ lotSize, pool, spa }: { lotSize: number | null; pool: boolean | null; spa: boolean | null }) {
  return <>{lotSize != null && <span>Lot: {lotSize.toLocaleString("en-US")} sq ft</span>}{pool != null && <span>Pool: {pool ? "Yes" : "No"}</span>}{spa != null && <span>Spa: {spa ? "Yes" : "No"}</span>}</>;
}
