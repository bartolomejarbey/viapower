import type { ElementType, ReactNode } from "react";

/**
 * Editable text node for the on-site live editor. Renders a plain span
 * (or `as` tag) tagged with data-edit; the AdminEditBar turns these
 * contentEditable in live-edit mode and persists changes to Settings.
 * Works in both server and client components (no hooks, no directives).
 */
export function T({
  k,
  children,
  as,
  className,
}: {
  k: string;
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  const Tag: ElementType = as ?? "span";
  return (
    <Tag data-edit={k} className={className} suppressContentEditableWarning>
      {children}
    </Tag>
  );
}

/** Settings lookup helper shared by live-editable components. */
export function tx(t: Record<string, string> | undefined, k: string, fallback: string): string {
  const v = t?.[k];
  return typeof v === "string" && v.trim().length > 0 ? v : fallback;
}
