import type { Metadata } from "next";
import { pageMetadata, businessSchema } from "@/lib/seo";
import { site } from "@/lib/site";
import StructuredData from "@/components/StructuredData";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata("Bakersfield Real Estate & Seller Support | Mellon", "Explore homes, investment property, and new construction in Bakersfield and Kern County with Ian Mellon. Personal guidance for residential and complex sales.", "/"),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><StructuredData data={businessSchema} />{children}</body>
    </html>
  );
}
