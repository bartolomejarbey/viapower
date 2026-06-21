import "server-only";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

/** True when running on Vercel / AWS Lambda serverless (read-only FS, no system Chrome). */
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/** Launch a Chromium that works both on Vercel serverless and in local dev. */
async function launchBrowser(): Promise<Browser> {
  if (isServerless) {
    // @sparticuz/chromium provides a Chromium build + flags tuned for Lambda/Vercel.
    // Imported lazily so local dev never needs the package resolved at module load.
    const chromium = (await import("@sparticuz/chromium")).default;

    // WebGL/graphics stack is unnecessary for PDF rendering and costs memory.
    chromium.setGraphicsMode = false;

    // chromium.args already includes --no-sandbox and --disable-dev-shm-usage.
    // NOTE (v149 breaking change): puppeteer.defaultArgs() now returns a Promise.
    return puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }

  // Local dev: use a locally installed Chrome/Chromium. channel:"chrome" finds the
  // system Chrome; override with PUPPETEER_EXECUTABLE_PATH if you use a different binary.
  return puppeteer.launch({
    channel: process.env.PUPPETEER_EXECUTABLE_PATH ? undefined : "chrome",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox"],
    headless: true,
  });
}

/** Render the print route for an offer to an A4 PDF buffer via headless Chromium. */
export async function renderOfferPdf(origin: string, id: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    // Absolute origin is required: the headless browser self-navigates back to this
    // same deployment to fetch the PUBLIC print route (no auth on /nabidka/[id]/).
    await page.goto(`${origin}/nabidka/${id}/`, { waitUntil: "networkidle0", timeout: 30000 });
    await page.emulateMediaType("print");
    // Ensure self-hosted webfonts (Czech diacritics) are fully loaded before printing.
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });
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
