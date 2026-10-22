import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mellon Real Estate | A Fresh Slice of Home",
  description: "Homes, development projects, and specialist seller support in Bakersfield and Shafter. Talk with California real estate broker Ian Mellon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
