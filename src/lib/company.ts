import "server-only";
import { company as defaults } from "@/config/site";
import { getSettings } from "@/lib/cms";

/** Effective company facts — DB settings (editable in CMS → Nastavení) over the static seed. */
export type Company = {
  name: string;
  legalName: string;
  url: string;
  tagline: string;
  ico: string;
  founded: number;
  address: { street: string; city: string; zip: string; country: string };
  phone: string;
  phoneHref: string;
  email: string;
  facebook: string;
  projectManager: { name: string; role: string; phone: string; phoneHref: string; email: string };
  stats: { installations: string; experienceYears: string; rating: string; grantSuccess: string };
};

/** Build a `tel:` href from a human phone string ("+420 705 117 664" → "tel:+420705117664"). */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return "tel:" + (digits.startsWith("+") ? digits : digits.length === 9 ? "+420" + digits : digits);
}

/**
 * The keys exposed in CMS → Nastavení, mapped to their effective string values.
 * Used both to render the website and to prefill the settings form.
 */
export function companyFields(c: Company): Record<string, string> {
  return {
    "company.name": c.name,
    "company.legalName": c.legalName,
    "company.tagline": c.tagline,
    "company.founded": String(c.founded),
    "company.ico": c.ico,
    "company.phone": c.phone,
    "company.email": c.email,
    "company.facebook": c.facebook,
    "company.address.street": c.address.street,
    "company.address.city": c.address.city,
    "company.address.zip": c.address.zip,
    "company.pm.name": c.projectManager.name,
    "company.pm.role": c.projectManager.role,
    "company.pm.phone": c.projectManager.phone,
    "company.pm.email": c.projectManager.email,
    "company.stats.installations": c.stats.installations,
    "company.stats.experienceYears": c.stats.experienceYears,
    "company.stats.rating": c.stats.rating,
    "company.stats.grantSuccess": c.stats.grantSuccess,
  };
}

/** Resolve the effective company facts for the current request (settings cached per request). */
export async function getCompany(): Promise<Company> {
  const s = await getSettings();
  const g = (key: string, fb: string) => {
    const v = s[`company.${key}`];
    return v != null && String(v).trim() !== "" ? String(v) : fb;
  };
  const phone = g("phone", defaults.phone);
  const pmPhone = g("pm.phone", defaults.projectManager.phone);
  return {
    name: g("name", defaults.name),
    legalName: g("legalName", defaults.legalName),
    url: defaults.url,
    tagline: g("tagline", defaults.tagline),
    ico: g("ico", defaults.ico),
    founded: parseInt(g("founded", String(defaults.founded)), 10) || defaults.founded,
    address: {
      street: g("address.street", defaults.address.street),
      city: g("address.city", defaults.address.city),
      zip: g("address.zip", defaults.address.zip),
      country: defaults.address.country,
    },
    phone,
    phoneHref: telHref(phone),
    email: g("email", defaults.email),
    facebook: g("facebook", defaults.facebook),
    projectManager: {
      name: g("pm.name", defaults.projectManager.name),
      role: g("pm.role", defaults.projectManager.role),
      phone: pmPhone,
      phoneHref: telHref(pmPhone),
      email: g("pm.email", defaults.projectManager.email),
    },
    stats: {
      installations: g("stats.installations", defaults.stats.installations),
      experienceYears: g("stats.experienceYears", defaults.stats.experienceYears),
      rating: g("stats.rating", defaults.stats.rating),
      grantSuccess: g("stats.grantSuccess", defaults.stats.grantSuccess),
    },
  };
}
