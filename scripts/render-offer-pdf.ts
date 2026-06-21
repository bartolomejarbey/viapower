import { chromium } from "playwright";
async function main() {
  const id = process.argv[2] || "vzor-fve-medium";
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`http://localhost:3008/nabidka/${id}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: "/tmp/offer.pdf", format: "A4", printBackground: true, margin: { top: "0", bottom: "0", left: "0", right: "0" }, preferCSSPageSize: true });
  await browser.close();
  console.log("wrote /tmp/offer.pdf");
}
main();
