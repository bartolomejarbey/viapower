"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Heading2, Link as LinkIcon } from "lucide-react";

export function RichText({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false }), LinkExt.configure({ openOnClick: false })],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "cms-html min-h-[120px] max-w-none p-3.5 text-ink outline-none" } },
  });

  // sync external value changes (e.g. when a block is duplicated) without
  // clobbering the cursor during normal typing (value === current HTML then).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return <div className="min-h-[160px] border border-line-strong bg-base" />;

  const tools = [
    { icon: Bold, label: "Tučně", on: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, label: "Kurzíva", on: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: Heading2, label: "Nadpis", on: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { icon: List, label: "Odrážky", on: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { icon: ListOrdered, label: "Číslovaný seznam", on: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    {
      icon: LinkIcon,
      label: "Odkaz",
      on: () => {
        const url = window.prompt("Odkaz (URL):", editor.getAttributes("link").href ?? "https://");
        if (url === null) return;
        if (url === "") editor.chain().focus().unsetLink().run();
        else editor.chain().focus().setLink({ href: url }).run();
      },
      active: editor.isActive("link"),
    },
  ];

  return (
    <div className="border border-line-strong bg-base">
      <div className="flex flex-wrap gap-1 border-b border-line p-1.5">
        {tools.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={t.on}
            aria-label={t.label}
            aria-pressed={t.active}
            title={t.label}
            className={`grid h-8 w-8 place-items-center transition-colors ${t.active ? "bg-red text-white" : "text-ink-muted hover:bg-white/5 hover:text-ink"}`}
          >
            <t.icon size={15} />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
