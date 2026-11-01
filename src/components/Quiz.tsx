"use client";
import { useState } from "react";
import type { Lesson } from "@/lib/types";

export function Quiz({ questions }: { questions: Lesson["quiz"] }) {
  const [picked, setPicked] = useState<(number | null)[]>(questions.map(() => null));
  const done = picked.every((p) => p !== null);
  const score = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <fieldset key={qi} className="rounded-[var(--radius-card)] bg-mist p-5">
          <legend className="sr-only">Question {qi + 1}</legend>
          <p className="text-[17px] font-semibold">{q.prompt}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((o, oi) => {
              const chosen = picked[qi] === oi;
              const answered = picked[qi] !== null;
              const right = oi === q.answer;
              const cls = !answered
                ? "bg-paper"
                : right
                  ? "bg-lime"
                  : chosen
                    ? "bg-coral text-white"
                    : "bg-paper opacity-60";
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={answered}
                  onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                  className={`block w-full rounded-pill px-4 py-3 text-left text-[15px] ${cls}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked[qi] !== null && <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{q.explanation}</p>}
        </fieldset>
      ))}
      {done && (
        <p className="rounded-pill bg-ink px-5 py-3 text-center text-[15px] text-white" role="status">
          {score} of {questions.length} right.{" "}
          {score === questions.length ? "These come back in a week." : "Missed questions come back tomorrow."}
        </p>
      )}
    </div>
  );
}
