import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

export function pageMetadata(title: string, description: string, path: string, image = "/images/specialties/pre-foreclosure.webp"): Metadata {
  return {
    title: { absolute: title }, description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: "website", locale: "en_US", siteName: site.name, title, description, url: absoluteUrl(path), images: [{ url: absoluteUrl(image), alt: site.name }] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(image)] },
  };
}

export const businessSchema = {
  "@context": "https://schema.org", "@type": "RealEstateAgent", "@id": `${site.url}/#business`,
  name: site.name, url: site.url, telephone: "+1-661-805-2481", email: site.email,
  logo: absoluteUrl("/mellon-logo.png"), image: absoluteUrl("/images/specialties/pre-foreclosure.webp"),
  areaServed: [{ "@type": "City", name: "Bakersfield" }, { "@type": "AdministrativeArea", name: "Kern County, California" }],
  founder: { "@type": "Person", name: site.broker, jobTitle: "California Real Estate Broker", identifier: `DRE #${site.license}` },
};
