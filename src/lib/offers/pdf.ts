import "server-only";
import { chromium } from "playwright";

/** Render the print route for an offer to an A4 PDF buffer via headless Chromium. */
export async function renderOfferPdf(origin: string, id: string): Promise<Buffer> {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/nabidka/${id}/`, { waitUntil: "networkidle", timeout: 30000 });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
