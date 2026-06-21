// Single source of truth for which migrated page categories can be "taken over"
// into the visual editor. Imported by both the server actions and the Stránky
// list so the takeover list and the import logic can never diverge.
export const IMPORTABLE = new Set([
  "service",
  "generic",
  "news",
  "legal",
  "reference-detail",
  "career-detail",
]);
