import fs from "node:fs";
import path from "node:path";

// Load OPENAI_API_KEY from .env.local (standalone script, not via Next).
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error("no OPENAI_API_KEY"); process.exit(1); }

const ASSETS = [
  {
    name: "cover.png",
    size: "1024x1536",
    prompt:
      "Cinematic editorial photograph of a modern minimalist Czech family house with sleek matte-black solar photovoltaic panels covering the roof, photographed at blue-hour dusk, warm interior lights glowing through large windows, dramatic moody gradient sky, refined premium color grade with very deep blacks and a subtle crimson-red light accent on the horizon, ultra high-end architectural brochure aesthetic, photorealistic, sharp, no text, no logos, no watermark, no people, vertical composition with a darker calmer area in the lower third for overlaying text.",
  },
  {
    name: "band.png",
    size: "1536x1024",
    prompt:
      "Minimalist abstract macro of dark matte-black photovoltaic solar cells arranged in a precise grid, deep black background, a single thin glowing crimson-red light line sweeping diagonally across, premium high-tech energy aesthetic, soft shallow depth of field, subtle reflections, no text, no logos, clean horizontal banner composition.",
  },
  {
    name: "closing.png",
    size: "1024x1536",
    prompt:
      "Cinematic low-angle close-up of sleek black solar panels on a modern roof edge against a deep indigo dusk sky with a faint warm crimson glow near the horizon, premium minimalist, clean lines, photorealistic, calm and confident mood, no text, no logos, no people, vertical composition.",
  },
];

async function gen(name: string, prompt: string, size: string) {
  console.log("generating", name, `(${size}) ...`);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-2", prompt, size, quality: "high", n: 1 }),
  });
  if (!res.ok) { console.error("✗", name, res.status, (await res.text()).slice(0, 400)); return false; }
  const data = (await res.json()) as { data: { b64_json: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) { console.error("✗", name, "no image data"); return false; }
  const dir = path.join(process.cwd(), "public", "offer-assets");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, name);
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("✓ saved", out, `(${Math.round(Buffer.from(b64, "base64").length / 1024)} KB)`);
  return true;
}

async function main() {
  const only = process.argv[2]; // optional: generate just one by name
  for (const a of ASSETS) {
    if (only && a.name !== only) continue;
    await gen(a.name, a.prompt, a.size);
  }
  console.log("done.");
}
main();
