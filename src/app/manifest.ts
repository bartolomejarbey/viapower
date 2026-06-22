import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/cms";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getSettings();
  const raw = t["app.icon"];
  const icon = raw != null && String(raw).trim() !== "" ? String(raw) : "/favicon.ico";
  const type = icon.endsWith(".png") ? "image/png" : icon.endsWith(".webp") ? "image/webp" : icon.endsWith(".svg") ? "image/svg+xml" : "image/x-icon";
  return {
    name: "Viapower — energetika na klíč",
    short_name: "Viapower",
    description: "Fotovoltaika, baterie, tepelná čerpadla a elektromobilita na klíč.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090b",
    theme_color: "#08090b",
    lang: "cs",
    icons: [
      { src: icon, sizes: "any", type },
    ],
  };
}
