"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const TOPICS = [
  "VC", "AI", "Deeptech", "Medtech", "Biotech", "Climate", "Fintech", "Quantum", "Robotics", "Space",
  "Chips", "Defence", "Energy", "Crypto", "SaaS", "Consumer", "Macro", "M&A", "IPOs", "Policy",
];
const FILLS = ["bg-lilac", "bg-lime", "bg-cobalt text-white", "bg-coral text-white"];
const ROLES = ["Student", "Investor or VC", "Founder", "Works at a startup", "Corporate or finance job", "Just curious"];
const DEPTHS = [
  { id: "quick", label: "Quick", note: "The facts, fast" },
  { id: "balanced", label: "Balanced", note: "Facts + why it matters" },
  { id: "deep", label: "Deep", note: "Full context, every time" },
];

export interface ReaderProfile {
  topics: string[];
  role: string | null;
  entrepreneurial: boolean;
  focus: string;
  depth: string;
}

const KEY = "vcbrief.profile";

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-pill px-4 py-2.5 text-[14px] ${on ? "bg-ink text-white" : "bg-mist"}`}
    >
      {children}
    </button>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2>(1);
  const [p, setP] = useState<ReaderProfile>({ topics: ["VC", "AI"], role: null, entrepreneurial: false, focus: "", depth: "balanced" });

  // Saved on this device for now; moves to your account once sign-in is on.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setP(JSON.parse(saved));
    } catch {}
  }, []);
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {}
  };
  const toggle = (t: string) => setP((x) => ({ ...x, topics: x.topics.includes(t) ? x.topics.filter((y) => y !== t) : [...x.topics, t] }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[560px] flex-col px-5 pt-8 pb-8 md:pt-16">
      <div className="mb-6 flex gap-2" aria-label={`Step ${step} of 2`}>
        <span className={`h-1 flex-1 rounded-pill ${step >= 1 ? "bg-ink" : "bg-line"}`} />
        <span className={`h-1 flex-1 rounded-pill ${step >= 2 ? "bg-ink" : "bg-line"}`} />
      </div>

      {step === 1 ? (
        <>
          <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">
            Choose your
            <br />
            favourite topics
          </h1>
          <p className="mt-2 text-[14px] text-ink-soft">They shape the &ldquo;Your topic&rdquo; section. The main brief is the same for everyone.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-2">
            {TOPICS.map((t, i) => {
              const on = p.topics.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(t)}
                  className={`grid size-[84px] place-items-center rounded-full text-[13px] transition-colors ${on ? FILLS[i % FILLS.length] : "bg-mist"} ${i % 2 ? "translate-y-5" : ""}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setStep(2)} className="mt-auto block rounded-pill bg-ink py-4 text-center text-[16px] text-white">
            Continue with {p.topics.length} topic{p.topics.length === 1 ? "" : "s"}
          </button>
        </>
      ) : (
        <>
          <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">About you</h1>
          <p className="mt-2 text-[14px] text-ink-soft">
            Used to explain why each story matters to you, and how much detail to give. You can change it anytime.
          </p>

          <h2 className="mt-8 text-[15px] font-semibold">What do you do?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Choice key={r} on={p.role === r} onClick={() => setP((x) => ({ ...x, role: r }))}>
                {r}
              </Choice>
            ))}
          </div>

          <label className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-mist p-4">
            <span>
              <span className="block text-[15px] font-semibold">Entrepreneurial mindset</span>
              <span className="block text-[13px] text-ink-soft">Flag opportunities and founder angles in stories</span>
            </span>
            <input
              type="checkbox"
              checked={p.entrepreneurial}
              onChange={(e) => setP((x) => ({ ...x, entrepreneurial: e.target.checked }))}
              className="size-6 accent-[var(--color-cobalt)]"
            />
          </label>

          <label className="mt-6 block">
            <span className="text-[15px] font-semibold">What are you working on or focused on?</span>
            <textarea
              value={p.focus}
              onChange={(e) => setP((x) => ({ ...x, focus: e.target.value }))}
              rows={3}
              placeholder="e.g. IR intern at a crowdfunding platform, building an AI career-coaching startup, aiming for a VC role"
              className="mt-2 w-full rounded-2xl border border-line p-4 text-[15px]"
            />
          </label>

          <h2 className="mt-6 text-[15px] font-semibold">How deep should explanations go?</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DEPTHS.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={p.depth === d.id}
                onClick={() => setP((x) => ({ ...x, depth: d.id }))}
                className={`rounded-2xl p-3 text-left ${p.depth === d.id ? "bg-lilac" : "bg-mist"}`}
              >
                <span className="block text-[15px] font-semibold">{d.label}</span>
                <span className="block text-[12px] text-ink-soft">{d.note}</span>
              </button>
            ))}
          </div>

          <div className="mt-10 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-pill border border-line px-6 py-4 text-[16px]">
              Back
            </button>
            <Link href="/" onClick={save} className="flex-1 rounded-pill bg-ink py-4 text-center text-[16px] text-white">
              Start reading
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
