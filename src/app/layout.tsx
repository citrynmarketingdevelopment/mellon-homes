import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mellon Real Estate | A Fresh Slice of Home",
  description: "Homes, multifamily investments, new construction, and specialist seller support in Kern County. Talk with California real estate broker Ian Mellon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
