import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
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
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
