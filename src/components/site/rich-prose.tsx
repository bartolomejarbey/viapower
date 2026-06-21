import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Quote } from "lucide-react";
import { localizeMarkdown } from "@/lib/content";
import { Reveal, MaskRise, TickIn, FadeIn } from "@/components/ui/motion";

/**
 * Homepage-grade rendering of page markdown: animated section headings,
 * scroll-revealed blocks, numbered timelines for ordered lists, feature-card
 * grids for bullet lists, and testimonial cards for quotes.
 */
export function RichProse({ markdown }: { markdown: string }) {
  const md = localizeMarkdown(markdown);
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <div className="mt-16 first:mt-2">
              <TickIn className="mb-4 w-10" />
              <h2 className="text-[clamp(1.8rem,3.2vw,2.6rem)] font-bold leading-tight text-ink">
                <MaskRise>{children}</MaskRise>
              </h2>
            </div>
          ),
          h3: ({ children }) => (
            <FadeIn>
              <h3 className="mt-9 text-[1.4rem] font-bold text-ink">{children}</h3>
            </FadeIn>
          ),
          h4: ({ children }) => <h4 className="mb-2 mt-7 text-[1.1rem] font-bold text-ink">{children}</h4>,
          p: ({ children }) => (
            <Reveal>
              <p className="my-4 text-[16.5px] leading-relaxed text-ink-muted">{children}</p>
            </Reveal>
          ),
          a: ({ href, children }) => {
            const h = href ?? "#";
            const internal = h.startsWith("/");
            const cls = "group/link font-medium text-red-bright underline underline-offset-2 transition-colors hover:text-red";
            return internal ? (
              <Link href={h} className={cls}>
                {children}
              </Link>
            ) : (
              <a href={h} className={cls} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
          ol: ({ children }) => (
            <Reveal>
              <ol className="rich-ol">{children}</ol>
            </Reveal>
          ),
          ul: ({ children }) => {
            const items = Children.toArray(children).filter((c): c is ReactElement<{ children?: ReactNode }> => isValidElement(c));
            const short = items.length >= 4 && items.every((it) => textLen(it.props.children) < 120);
            if (short) {
              return (
                <div className="my-7 grid gap-3 sm:grid-cols-2">
                  {items.map((it, i) => (
                    <Reveal key={i} delay={(i % 2) * 0.06}>
                      <div className="brackets brackets-draw group flex h-full items-start gap-3 border border-line-strong bg-card p-4 text-[15px] leading-snug text-ink-muted transition-colors hover:border-red">
                        <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-red" />
                        <span>{it.props.children}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              );
            }
            return (
              <Reveal>
                <ul className="rich-ul">{children}</ul>
              </Reveal>
            );
          },
          blockquote: ({ children }) => (
            <Reveal>
              <blockquote className="brackets my-7 border border-line-strong bg-card p-7 pl-8">
                <Quote size={26} className="mb-3 text-red" />
                <div className="cms-quote text-[17px] italic leading-relaxed text-ink">{children}</div>
              </blockquote>
            </Reveal>
          ),
          hr: () => <div className="my-12 h-px bg-line" />,
          table: ({ children }) => (
            <Reveal>
              <div className="my-8 overflow-x-auto border border-line-strong">
                <table className="w-full border-collapse text-left text-[14.5px]">{children}</table>
              </div>
            </Reveal>
          ),
          thead: ({ children }) => <thead className="bg-card text-[12px] uppercase tracking-wide text-red-bright">{children}</thead>,
          th: ({ children }) => <th className="border-b border-line px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-line px-4 py-3 text-ink-muted">{children}</td>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              <Reveal>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt ?? ""} className="my-8 w-full border border-line-strong" />
              </Reveal>
            ) : null,
          code: ({ children }) => <code className="bg-card px-1.5 py-0.5 font-mono text-[13px] text-red-bright">{children}</code>,
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}

function textLen(node: ReactNode): number {
  if (node == null || typeof node === "boolean") return 0;
  if (typeof node === "string" || typeof node === "number") return String(node).length;
  if (Array.isArray(node)) return node.reduce((s, n) => s + textLen(n), 0);
  if (isValidElement(node)) return textLen((node.props as { children?: ReactNode }).children);
  return 0;
}
