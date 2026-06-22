import type { MetadataRoute } from "next";
import { getCompany } from "@/lib/company";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { url } = await getCompany();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
