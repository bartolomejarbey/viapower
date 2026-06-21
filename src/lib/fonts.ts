import { Space_Grotesk } from "next/font/google";

// latin-ext is required for Czech diacritics (ě š č ř ž ů ...).
export const fontDisplay = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});
