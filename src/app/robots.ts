import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin/", "/api/auth/", "/api/contact", "/api/showings", "/api/valuation"] }, sitemap: absoluteUrl("/sitemap.xml") };
}
