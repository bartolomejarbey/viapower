import Link from "next/link";

export function AnnouncementBar({
  text = "Poslední šance v roce 2026 — dotace až 160 000 Kč.",
  ctaText = "Spočítat moji nabídku →",
  ctaHref = "/poptavkovy-formular/",
}: {
  text?: string;
  ctaText?: string;
  ctaHref?: string;
}) {
  return (
    <div className="bg-red-dark px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-white sm:text-[12.5px]">
      <span data-edit="announcement.text" suppressContentEditableWarning>{text}</span>
      <Link href={ctaHref} className="ml-2 font-semibold underline underline-offset-2 hover:text-white/80">
        <span data-edit="announcement.ctaText" suppressContentEditableWarning>{ctaText}</span>
      </Link>
    </div>
  );
}
