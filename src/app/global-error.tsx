"use client";

// Last-resort boundary: catches errors in the root layout itself, so it must
// render its own <html>/<body> with self-contained styles.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, background: "#08090b", color: "#e6e7e8", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", textAlign: "center" }}>
          <div>
            <div style={{ color: "#e8201a", fontSize: 12, letterSpacing: 4, textTransform: "uppercase" }}>Něco se pokazilo</div>
            <h1 style={{ marginTop: 16, fontSize: 56, fontWeight: 800, color: "#fff" }}>
              Nastala <span style={{ color: "#c00f0a" }}>chyba.</span>
            </h1>
            <p style={{ marginTop: 16, color: "#9aa0a6", maxWidth: 420, marginInline: "auto" }}>
              Omlouváme se — stránku se nepodařilo načíst. Zkuste to prosím znovu.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: 28, background: "#c00f0a", color: "#fff", border: "none", padding: "16px 28px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer" }}
            >
              Zkusit znovu
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
