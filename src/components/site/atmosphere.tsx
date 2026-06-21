/**
 * Page atmosphere: static film grain + edge vignette. Server component,
 * zero JS. Grain dithers every radial gradient on the page for free;
 * vignette pulls the eye center-ward and makes #08090b read as depth.
 * z-order: grain 55 (above z-50 nav, below z-[60] drawer / z-[70] edit bar).
 */
const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Atmosphere() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40"
        style={{ background: "radial-gradient(120% 90% at 50% 42%, transparent 62%, rgba(0,0,0,0.25) 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[55] opacity-[0.03]"
        style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundRepeat: "repeat" }}
      />
    </>
  );
}
