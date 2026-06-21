import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 311 730 → "311 730 Kč" (CZK, no decimals, cs-CZ spacing). */
export function formatCZK(value: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

/** 9.9 → "9,9" (Czech decimal comma). */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** ISO date → "31. 3. 2026". */
export function formatDateCZ(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "long" }).format(d);
}

/** "Krásná instalace" → "krasna-instalace" (strips Czech diacritics). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
