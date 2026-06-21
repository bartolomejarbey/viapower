// Local review helper: renders an offer print route to /tmp/offer.pdf for screenshot review.
// Uses puppeteer-core against the local system Chrome (set PUPPETEER_EXECUTABLE_PATH to override).
import puppeteer from "puppeteer-core";
async function main() {
  const id = process.argv[2] || "vzor-fve-medium";
  const browser = await puppeteer.launch({
    channel: process.env.PUPPETEER_EXECUTABLE_PATH ? undefined : "chrome",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox"],
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:3008/nabidka/${id}/`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.emulateMediaType("print");
  await page.pdf({ path: "/tmp/offer.pdf", format: "A4", printBackground: true, margin: { top: "0", bottom: "0", left: "0", right: "0" }, preferCSSPageSize: true });
  await browser.close();
  console.log("wrote /tmp/offer.pdf");
}
main();
