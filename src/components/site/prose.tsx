import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { localizeMarkdown } from "@/lib/content";

export function Prose({ markdown }: { markdown: string }) {
  const md = localizeMarkdown(markdown);
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-5 mt-12 text-[clamp(2rem,3.4vw,2.75rem)] font-bold leading-tight text-ink first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-12 text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold leading-tight text-ink">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mb-3 mt-9 text-[1.35rem] font-bold text-ink">{children}</h3>,
          h4: ({ children }) => <h4 className="mb-2 mt-7 text-[1.1rem] font-bold text-ink">{children}</h4>,
          p: ({ children }) => <p className="my-4 text-[16.5px] leading-relaxed text-ink-muted">{children}</p>,
          a: ({ href, children }) => {
            const h = href ?? "#";
            const internal = h.startsWith("/");
            return internal ? (
              <Link href={h} className="font-medium text-red-bright underline underline-offset-2 hover:text-red">
                {children}
              </Link>
            ) : (
              <a href={h} className="font-medium text-red-bright underline underline-offset-2 hover:text-red" target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
          ul: ({ children }) => <ul className="my-5 flex flex-col gap-2.5">{children}</ul>,
          ol: ({ children }) => <ol className="my-5 flex list-decimal flex-col gap-2.5 pl-5 marker:text-red">{children}</ol>,
          li: ({ children }) => (
            <li className="relative pl-6 text-[16px] leading-relaxed text-ink-muted before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:bg-red">
              {children}
            </li>
          ),
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-red bg-red-soft px-5 py-3 text-[16px] italic text-ink-muted">{children}</blockquote>
          ),
          hr: () => <hr className="my-10 border-line" />,
          table: ({ children }) => (
            <div className="my-7 overflow-x-auto border border-line-strong">
              <table className="w-full border-collapse text-left text-[14.5px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-card font-mono text-[12px] uppercase tracking-wide text-red-bright">{children}</thead>,
          th: ({ children }) => <th className="border-b border-line px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-line px-4 py-3 text-ink-muted">{children}</td>,
          img: () => null,
          code: ({ children }) => <code className="bg-card px-1.5 py-0.5 font-mono text-[13px] text-red-bright">{children}</code>,
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}
