"use client";
import { useMemo, useState } from "react";
import type { Citation, Claim, GlossaryTerm, Story } from "@/lib/types";

type Sheet = { kind: "source"; citation: Citation; n: number } | { kind: "term"; term: GlossaryTerm } | null;

const LAYERS = [
  { id: "brief", label: "Brief", time: "30 s" },
  { id: "understand", label: "Understand", time: "3 min" },
  { id: "deeper", label: "Go deeper", time: "on demand" },
] as const;

export function StoryReader({ story, glossary }: { story: Story; glossary: Record<string, GlossaryTerm> }) {
  const [layer, setLayer] = useState<(typeof LAYERS)[number]["id"]>("brief");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  // Footnote numbers follow the order sources appear in the story.
  const numbers = useMemo(() => new Map(story.citations.map((c, i) => [c.id, i + 1])), [story.citations]);
  const terms = useMemo(() => Object.keys(glossary).sort((a, b) => b.length - a.length), [glossary]);

  function withTerms(text: string) {
    if (!terms.length) return text;
    const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) => {
      const key = terms.find((t) => t.toLowerCase() === p.toLowerCase());
      return key ? (
        <button key={i} type="button" className="term" onClick={() => setSheet({ kind: "term", term: glossary[key] })}>
          {p}
        </button>
      ) : (
        p
      );
    });
  }

  function ClaimText({ c }: { c: Claim }) {
    const citation = c.cite ? story.citations.find((x) => x.id === c.cite) : undefined;
    const n = c.cite ? numbers.get(c.cite) : undefined;
    return (
      <>
        {withTerms(c.text)}
        {citation && n && (
          <button
            type="button"
            onClick={() => setSheet({ kind: "source", citation, n })}
            aria-label={`Source ${n}: ${citation.publisher}`}
            className="ml-0.5 align-super text-[11px] font-semibold text-cobalt"
          >
            [{n}]
          </button>
        )}
        {c.kind === "analysis" && <span className="ml-1 rounded-pill bg-mist px-2 py-0.5 text-[11px] text-ink-soft">Analysis</span>}{" "}
      </>
    );
  }

  const u = story.understand;

  return (
    <article className="px-5 pt-4">
      <div role="tablist" aria-label="Depth" className="flex rounded-pill bg-mist p-1">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            role="tab"
            aria-selected={layer === l.id}
            onClick={() => setLayer(l.id)}
            className={`flex-1 rounded-pill px-2 py-2 text-[14px] ${layer === l.id ? "bg-ink text-white" : "text-ink-soft"}`}
          >
            {l.label}
            <span className="block text-[10px] opacity-70">{l.time}</span>
          </button>
        ))}
      </div>

      {layer === "brief" && (
        <ul className="mt-6 space-y-4 text-[18px] leading-relaxed">
          {story.brief.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-3 size-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
              <span>
                <ClaimText c={c} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {layer === "understand" && (
        <div className="mt-6 space-y-8 text-[17px] leading-relaxed">
          {!u && <p className="text-ink-soft">This layer appears on real stories.</p>}
          {u && (
            <>
              <div>
                <h2 className="mb-2 text-[13px] text-ink-soft">What happened</h2>
                <p>{u.what.map((c, i) => <ClaimText key={i} c={c} />)}</p>
              </div>

              {story.card && (
                <figure className="rounded-[var(--radius-card)] bg-cobalt p-5 text-white">
                  <blockquote className="rounded-2xl bg-paper p-4 text-[16px] leading-relaxed text-ink">
                    {story.card.quote.split(story.card.highlight).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && <span className="mark">{story.card!.highlight}</span>}
                      </span>
                    ))}
                  </blockquote>
                  <figcaption className="mt-3 text-[13px] text-white/75">{story.card.attribution}</figcaption>
                  <dl className="mt-5 grid grid-cols-3 gap-3">
                    {story.card.figures.map((f) => (
                      <div key={f.label}>
                        <dt className="text-[24px] leading-none font-light">{f.value}</dt>
                        <dd className="mt-1.5 text-[12px] leading-snug text-white/75">{f.label}</dd>
                      </div>
                    ))}
                  </dl>
                </figure>
              )}

              <div>
                <h2 className="mb-2 text-[13px] text-ink-soft">Why it matters for investors</h2>
                <p>{u.whyItMatters.map((c, i) => <ClaimText key={i} c={c} />)}</p>
              </div>

              <div className="rounded-[var(--radius-card)] bg-lilac p-5">
                <h2 className="mb-2 text-[13px]">Picture it this way</h2>
                <p>{u.analogy.text}</p>
              </div>

              <div>
                <h2 className="mb-2 text-[13px] text-ink-soft">What is not proven</h2>
                <ul className="space-y-2">
                  {u.notProven.map((c, i) => (
                    <li key={i} className="border-l-2 border-coral pl-3">
                      <ClaimText c={c} />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {layer === "deeper" && (
        <div className="mt-6 space-y-8">
          {story.perspectives && (
            <div>
              <h2 className="mb-3 text-[13px] text-ink-soft">Perspectives</h2>
              <div className="space-y-3">
                {story.perspectives.map((p) => (
                  <div key={p.who} className="rounded-2xl bg-mist p-4">
                    <p className="text-[15px] font-semibold">
                      {p.who} <span className="font-normal text-ink-soft">{p.role}</span>
                    </p>
                    <p className="mt-1 text-[16px] leading-relaxed">
                      <ClaimText c={{ text: p.view, kind: "fact", cite: p.cite }} />
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-ink-soft">VC Brief states no opinion of its own; it shows who said what.</p>
            </div>
          )}

          <div className="rounded-[var(--radius-card)] border border-line p-5">
            <h2 className="text-[18px] font-medium">Ask more</h2>
            <p className="mt-1 text-[14px] text-ink-soft">Answers only from this story&apos;s sources. 5 questions a day.</p>
            <input
              disabled
              placeholder="Available at milestone 2"
              className="mt-4 w-full rounded-pill border border-line bg-mist px-4 py-3 text-[15px]"
            />
          </div>
        </div>
      )}

      {story.citations.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-[13px] text-ink-soft">Sources</h2>
          <ol className="space-y-2 text-[14px]">
            {story.citations.map((c, i) => (
              <li key={c.id} className="flex gap-2">
                <span className="w-5 shrink-0 font-semibold text-cobalt">{i + 1}</span>
                <a href={c.url} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4">
                  {c.publisher}: {c.title}
                  {c.date && `, ${new Date(c.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-8 flex gap-2">
        <button onClick={() => setSaved(!saved)} aria-pressed={saved} className={`rounded-pill px-4 py-2 text-[14px] ${saved ? "bg-ink text-white" : "border border-line"}`}>
          {saved ? "Saved" : "Save"}
        </button>
        <button onClick={() => setLiked(!liked)} aria-pressed={liked} className={`rounded-pill px-4 py-2 text-[14px] ${liked ? "bg-lilac" : "border border-line"}`}>
          {liked ? "Liked" : "Like"}
        </button>
        <button className="ml-auto rounded-pill px-4 py-2 text-[14px] text-ink-soft underline underline-offset-4">Report an error</button>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 md:items-center md:p-6" onClick={() => setSheet(null)}>
          <div
            role="dialog"
            aria-modal
            className="w-full max-w-[480px] rounded-t-[var(--radius-card)] bg-paper p-6 pb-10 md:rounded-[var(--radius-card)] md:pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {sheet.kind === "source" ? (
              <>
                <p className="text-[13px] text-ink-soft">Source {sheet.n}</p>
                <p className="mt-1 text-[18px] font-semibold">{sheet.citation.publisher}</p>
                <p className="mt-1 text-[16px]">{sheet.citation.title}</p>
                <a href={sheet.citation.url} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-pill bg-ink px-5 py-3 text-[14px] text-white">
                  Open the original
                </a>
              </>
            ) : (
              <>
                <p className="text-[13px] text-ink-soft">Definition</p>
                <p className="mt-1 text-[20px] font-semibold">{sheet.term.term}</p>
                <p className="mt-2 text-[16px] leading-relaxed">{sheet.term.definition}</p>
                {sheet.term.example && <p className="mt-3 rounded-2xl bg-mist p-3 text-[14px]">{sheet.term.example}</p>}
              </>
            )}
            <button onClick={() => setSheet(null)} className="mt-6 block text-[14px] text-ink-soft underline underline-offset-4">
              Close
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
