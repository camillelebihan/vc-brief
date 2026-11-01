import Link from "next/link";
import { DEALS, EDITION, STORIES, TODAY_LESSON, USER } from "@/lib/sample";
import { Pill, StoryCard } from "@/components/StoryCard";
import { GeoMark } from "@/components/GeoMark";

const by = (slot: string) => STORIES.filter((s) => s.slot === slot);

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 px-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[22px] font-medium tracking-[-0.01em]">{title}</h2>
        {note && <span className="text-[13px] text-ink-soft">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const must = by("must_know");
  const tones = ["lilac", "ink", "mist"] as const;

  return (
    <main>
      <p className="bg-cobalt px-5 py-2 text-center text-[12px] text-white">
        Sample edition: layout only. Real stories start at milestone 2.
      </p>

      <header className="px-5 pt-8">
        <div className="flex items-start justify-between">
          <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">
            Morning,
            <br />
            {USER.name}
          </h1>
          <Link href="/saved?q=" aria-label="Search the archive" className="mt-2 rounded-full p-2 hover:bg-mist">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill tone="lilac">{EDITION.label}</Pill>
          <Pill tone="lime">{USER.streakDays}-day streak</Pill>
        </div>
      </header>

      <Section title="Must-knows" note={`${EDITION.readMinutes} min brief`}>
        <div className="space-y-3">
          {must.map((s, i) => (
            <StoryCard key={s.slug} story={s} tone={tones[i % 3]} index={i + 1} />
          ))}
        </div>
      </Section>

      <section className="mt-6 px-5">
        <Link href="/learn/today" className="relative block rounded-[var(--radius-card)] bg-lime p-6">
          <p className="text-[13px]">
            {TODAY_LESSON.track}, lesson {TODAY_LESSON.number} of 20
          </p>
          <h2 className="mt-3 max-w-[85%] text-[28px] leading-[1.1] font-light tracking-[-0.02em]">{TODAY_LESSON.title}</h2>
          <p className="mt-4 text-[14px] text-ink/70">{TODAY_LESSON.minutes} min, with a 3-question quiz</p>
          <span className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-ink text-white" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </Link>
      </section>

      <Section title="Quick hits">
        <ul className="divide-y divide-line border-y border-line">
          {by("quick_hit").map((s) => (
            <li key={s.slug}>
              <Link href={`/story/${s.slug}`} className="flex gap-3 py-4">
                <span className="w-16 shrink-0 text-[13px] text-ink-soft">{s.sector}</span>
                <span className="text-[16px] leading-snug">{s.headline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Niche finds" note="Picked for novelty, not size">
        <div className="space-y-3">
          {by("niche_find").map((s) => (
            <Link key={s.slug} href={`/story/${s.slug}`} className="flex items-start gap-3 rounded-2xl border border-line p-4">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-coral" aria-hidden />
              <span className="text-[16px] leading-snug">{s.headline}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Deals of the day" note="Sample rows">
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-mist">
          {DEALS.map((d) => (
            <div key={d.company} className="flex items-center gap-3 border-b border-paper px-4 py-3 last:border-0">
              <GeoMark name={d.company} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{d.company}</p>
                <p className="truncate text-[12px] text-ink-soft">
                  {d.round}, led by {d.lead}, {d.country}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-semibold">{d.amount}</p>
                <p className="text-[11px] text-ink-soft">
                  {{ confirmed: "Confirmed", single_report: "One report", conflicting: "Sources differ" }[d.confidence]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Your topic: Medtech">
        <div className="space-y-3">
          {by("your_topic").map((s) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>
      </Section>
    </main>
  );
}
