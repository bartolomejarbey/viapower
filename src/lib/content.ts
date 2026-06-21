import "server-only";
import fs from "node:fs";
import path from "node:path";

export type ExtractedImage = { src: string; alt?: string };
export type ExtractedLink = { text?: string; href: string };

export type ContentPackage = {
  name: string;
  tagline?: string;
  specs: [string, string][];
  href?: string;
  featured?: boolean;
};

export type ExtractedPage = {
  url: string;
  status: "ok" | "error";
  title?: string;
  metaDescription?: string;
  h1?: string;
  contentMarkdown?: string;
  /** Editorially cleaned, artifact-free version — preferred for rendering. */
  cleanMarkdown?: string;
  /** Structured product packages extracted from the page (rendered as cards). */
  packages?: ContentPackage[];
  images?: ExtractedImage[];
  internalLinks?: ExtractedLink[];
  keyFacts?: string[];
  notes?: string;
};

let CACHE: ExtractedPage[] | null = null;

function load(): ExtractedPage[] {
  if (CACHE) return CACHE;
  const file = path.join(process.cwd(), "data", "viapower-content.json");
  CACHE = JSON.parse(fs.readFileSync(file, "utf8")) as ExtractedPage[];
  return CACHE;
}

const ORIGIN = "https://www.viapower.cz";

/** Absolute viapower URL → site-relative path with trailing slash. "/" stays "/". */
export function pathFromUrl(url: string): string {
  let p = url.replace(ORIGIN, "").trim();
  if (!p) p = "/";
  if (!p.startsWith("/")) p = "/" + p;
  if (p !== "/" && !p.endsWith("/")) p += "/";
  return p;
}

/** Slug segments for the catch-all route. "/o-nas/" → ["o-nas"]. */
export function segmentsFromPath(p: string): string[] {
  return p.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
}

export function getAllPages(): ExtractedPage[] {
  return load().filter((p) => p.status === "ok");
}

/** All page paths except the homepage. */
export function getAllPaths(): string[] {
  return getAllPages()
    .map((p) => pathFromUrl(p.url))
    .filter((p) => p !== "/");
}

export function getPageByPath(target: string): ExtractedPage | null {
  const norm = target.endsWith("/") ? target : target + "/";
  return getAllPages().find((p) => pathFromUrl(p.url) === norm) ?? null;
}

export function getPageBySegments(segments: string[]): ExtractedPage | null {
  return getPageByPath("/" + segments.join("/") + "/");
}

/** Strip the global "- Viapower …" suffix that WordPress appended to every <title>. */
export function cleanTitle(page: ExtractedPage): string {
  const raw = (page.h1 || page.title || "Viapower").trim();
  return raw.replace(/\s*[-–|]\s*Viapower.*$/i, "").replace(/\s*[-–|]\s*Fotovoltaiky.*$/i, "").trim() || "Viapower";
}

export function getReferenceDetailPages(): ExtractedPage[] {
  return getAllPages().filter((p) => {
    const s = segmentsFromPath(pathFromUrl(p.url));
    return s[0] === "nase-reference" && s.length > 1;
  });
}

export function getCareerDetailPages(): ExtractedPage[] {
  return getAllPages().filter((p) => {
    const s = segmentsFromPath(pathFromUrl(p.url));
    return s[0] === "volne-pozice" && s.length > 1;
  });
}

/** Rewrite absolute viapower links inside markdown to site-relative. */
export function localizeMarkdown(md: string): string {
  return md.replaceAll(ORIGIN, "");
}

/**
 * Page body for rendering: prefer the cleaned rewrite; fall back to the raw
 * migration dump with defensive artifact stripping (button-label leftovers).
 */
export function getMarkdown(page: ExtractedPage): string {
  if (page.cleanMarkdown?.trim()) return page.cleanMarkdown.trim();
  const raw = page.contentMarkdown ?? "";
  return raw
    .replace(/^\s*\[(Více informací|KONZULTACE ZDARMA|Zjistit více|Chci nabídku)\]\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type PageCategory =
  | "reference-detail"
  | "reference-index"
  | "career-index"
  | "career-detail"
  | "service"
  | "contact"
  | "form"
  | "legal"
  | "thanks"
  | "news"
  | "generic";

export function categorize(p: string): PageCategory {
  const segs = segmentsFromPath(p);
  if (segs[0] === "nase-reference") return segs.length > 1 ? "reference-detail" : "reference-index";
  if (segs[0] === "volne-pozice") return segs.length > 1 ? "career-detail" : "career-index";
  if (p === "/kariera-volne-pozice/") return "career-index";
  if (["/reference/", "/reference-nasich-zakazniku/", "/viapower-reference-od-nasich-zakazniku/"].includes(p)) return "reference-index";
  if (["/gdpr/", "/zasady-cookies-eu/"].includes(p)) return "legal";
  if (["/dekujeme/", "/dekujeme-za-zpravu/", "/ozveme-se-vam/"].includes(p)) return "thanks";
  if (["/poptavkovy-formular/"].includes(p)) return "form";
  if (["/viapower-pobocka-cechy-kontakt/", "/viapower-pobocka-morava-kontakt/"].includes(p)) return "contact";
  if (["/aktuality/", "/jak-se-pripravit-na-odstavku-distribucni-site-s-infigy/", "/kondice-strechy-je-dulezita/"].includes(p)) return "news";
  if (
    [
      "/fotovoltaiky-pro-rodinne-domy-na-klic/",
      "/fotovoltaiky-pro-rodinne-domy-na-klic/maly-vykon/",
      "/fotovoltaiky-pro-rodinne-domy-na-klic/stredni-vykon/",
      "/fotovoltaiky-pro-rodinne-domy-na-klic/velky-vykon/",
      "/fotovoltaiky-pro-firmy/",
      "/viapower-tepelna-cerpadla-2/",
      "/wallbox/",
      "/wallbox-zdarma/",
      "/klimatizace/",
      "/infigy/",
      "/servis/",
    ].includes(p)
  )
    return "service";
  return "generic";
}

/** Friendly section label for an interior page eyebrow. */
export function categoryLabel(c: PageCategory): string {
  switch (c) {
    case "reference-detail":
    case "reference-index":
      return "reference";
    case "career-index":
    case "career-detail":
      return "kariéra";
    case "service":
      return "služby";
    case "contact":
      return "kontakt";
    case "form":
      return "poptávka";
    case "legal":
      return "právní";
    case "thanks":
      return "děkujeme";
    case "news":
      return "aktuality";
    default:
      return "viapower";
  }
}
