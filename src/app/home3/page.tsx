import type { Metadata } from "next";
import AlternateHome from "@/components/AlternateHome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "A Fresh Place to Call Home | Mellon Real Estate",
  description: "Explore new listings, seller support, and development opportunities with Ian Mellon in Bakersfield and Shafter.",
};

export default function Home3() {
  return <AlternateHome version={3} />;
}
