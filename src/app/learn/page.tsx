import Link from "next/link";
import { TRACK, USER } from "@/lib/sample";
import { Pill } from "@/components/StoryCard";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const BADGES = [
  { id: "streak-5", label: "5-day streak" },
  { id: "streak-10", label: "10-day streak" },
  { id: "streak-30", label: "30-day streak" },
  { id: "weeks-5", label: "5 weeks in a row" },
  { id: "track-vc-foundations", label: "VC Foundations" },
  { id: "perfect-quiz", label: "Perfect quiz" },
];

export default function Learn() {
  const today = 0; // Monday, lesson 1
  return (
    <main className="px-5 pt-8">
      <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">{TRACK.title}</h1>
      <p className="mt-1 text-[14px] text-ink-soft">Week 1 of 4, one lesson each weekday</p>

      <div className="mt-6 grid grid-cols-5 gap-2 text-center">
        {DAYS.map((d, i) => (
          <div key={d}>
            <p className="text-[12px] text-ink-soft">{d}</p>
            <p className={`mx-auto mt-1 grid size-10 place-items-center rounded-full text-[15px] ${i === today ? "bg-ink text-white" : "bg-mist"}`}>{i + 1}</p>
          </div>
        ))}
      </div>

      <Link href="/learn/today" className="mt-6 block rounded-[var(--radius-card)] bg-lilac p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-[30px] font-light tracking-[-0.02em]">Today</h2>
          <span className="text-[14px]">0%</span>
        </div>
        <div className="mt-2 h-[3px] rounded bg-ink/15">
          <div className="h-full w-0 rounded bg-ink" />
        </div>
        <p className="mt-4 text-[15px]">{TRACK.weeks[0].lessons[0]}</p>
        <div className="mt-4 flex gap-2">
          <Pill>4 min</Pill>
          <Pill>3 questions</Pill>
          <Pill tone="lime">{USER.streakDays}-day streak</Pill>
        </div>
      </Link>

      <section className="mt-10">
        <h2 className="mb-4 text-[22px] font-medium">The four weeks</h2>
        <ol className="space-y-3">
          {TRACK.weeks.map((w) => (
            <li key={w.n} className="rounded-[var(--radius-card)] bg-mist p-5">
              <p className="text-[13px] text-ink-soft">Week {w.n}</p>
              <p className="mt-1 text-[19px] font-semibold">{w.title}</p>
              <ol className="mt-3 space-y-1.5 text-[15px]" start={(w.n - 1) * 5 + 1}>
                {w.lessons.map((l, i) => (
                  <li key={l} className="flex gap-3">
                    <span className="w-5 shrink-0 text-ink-soft">{(w.n - 1) * 5 + i + 1}</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] text-ink-soft">Next tracks: AI, Deeptech, Finance, Other expertise.</p>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-[22px] font-medium">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const earned = USER.badges.includes(b.id);
            return (
              <div key={b.id} className={`rounded-2xl p-3 text-center text-[12px] ${earned ? "bg-lime" : "bg-mist text-ink-soft"}`}>
                <span className={`mx-auto mb-2 block size-8 rounded-full ${earned ? "bg-ink" : "border-2 border-dashed border-line"}`} aria-hidden />
                {b.label}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
