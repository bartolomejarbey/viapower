import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getCmsPageById } from "@/lib/cms";
import { VisualEditor } from "@/components/editor/visual-editor";
import { DesktopGate } from "@/components/editor/desktop-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Vizuální editor", robots: { index: false } };

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const page = await getCmsPageById(id);
  if (!page) notFound();

  return (
    <DesktopGate>
      <VisualEditor
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          metaDescription: page.metaDescription,
          published: page.published,
          showInNav: page.showInNav,
          navLabel: page.navLabel,
          blocks: page.blocks.map((b) => ({ type: b.type, data: b.data })),
        }}
      />
    </DesktopGate>
  );
}
