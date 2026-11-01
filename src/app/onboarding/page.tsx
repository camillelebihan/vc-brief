"use client";
import Link from "next/link";
import { useState } from "react";

const TOPICS = [
  "VC", "AI", "Deeptech", "Medtech", "Biotech", "Climate", "Fintech", "Quantum", "Robotics", "Space",
  "Chips", "Defence", "Energy", "Crypto", "SaaS", "Consumer", "Macro", "M&A", "IPOs", "Policy",
];
const FILLS = ["bg-lilac", "bg-lime", "bg-cobalt text-white", "bg-coral text-white"];

export default function Onboarding() {
  const [picked, setPicked] = useState<string[]>(["VC", "AI"]);
  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-8 pb-8">
      <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">
        Choose your
        <br />
        favourite topics
      </h1>
      <p className="mt-2 text-[14px] text-ink-soft">They shape the &ldquo;Your topic&rdquo; section. The main brief is the same for everyone.</p>

      <div className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-2">
        {TOPICS.map((t, i) => {
          const on = picked.includes(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t)}
              className={`grid size-[84px] place-items-center rounded-full text-[13px] transition-colors ${
                on ? FILLS[i % FILLS.length] : "bg-mist"
              } ${i % 2 ? "translate-y-5" : ""}`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <Link href="/" className="mt-auto block rounded-pill bg-ink py-4 text-center text-[16px] text-white">
        Continue with {picked.length} topic{picked.length === 1 ? "" : "s"}
      </Link>
    </main>
  );
}
