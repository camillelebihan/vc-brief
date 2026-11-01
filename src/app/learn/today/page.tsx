import Link from "next/link";
import { TODAY_LESSON } from "@/lib/sample";
import { Quiz } from "@/components/Quiz";

export default function TodayLesson() {
  const l = TODAY_LESSON;
  return (
    <main className="mx-auto max-w-[720px] md:pt-6">
      <div className="bg-lime px-5 pt-5 pb-8 md:rounded-[var(--radius-card)] md:px-8">
        <Link href="/learn" aria-label="Back to the track" className="grid size-11 place-items-center rounded-full bg-paper/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M19 12H5m6-6-6 6 6 6" />
          </svg>
        </Link>
        <p className="mt-6 text-[13px]">
          {l.track}, week {l.week}, lesson {l.number}
        </p>
        <h1 className="mt-2 text-[32px] leading-[1.1] font-light tracking-[-0.025em]">{l.title}</h1>
      </div>

      <article className="space-y-8 px-5 pt-6 text-[17px] leading-relaxed">
        <section>
          <h2 className="mb-2 text-[13px] text-ink-soft">The idea</h2>
          <p>{l.concept}</p>
        </section>
        <section className="rounded-[var(--radius-card)] bg-lilac p-5">
          <h2 className="mb-2 text-[13px]">Picture it this way</h2>
          <p>{l.analogy}</p>
        </section>
        <section>
          <h2 className="mb-2 text-[13px] text-ink-soft">What is happening now</h2>
          <p className="text-ink-soft">{l.now}</p>
        </section>
        <section>
          <h2 className="mb-3 text-[22px] font-medium">Check yourself</h2>
          <Quiz questions={l.quiz} />
        </section>
      </article>
    </main>
  );
}
