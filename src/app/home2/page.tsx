import type { Metadata } from "next";
import "@fontsource/archivo-black/latin.css";
import AlternateHome from "@/components/AlternateHome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Big Plans. Fresh Starts. | Mellon Real Estate",
  description: "Find your next home with local guidance from Ian Mellon in Bakersfield and Shafter.",
};

export default function Home2() {
  return <AlternateHome version={2} />;
}
