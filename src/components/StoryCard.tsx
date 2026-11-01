import Link from "next/link";
import type { Story } from "@/lib/types";

const TONES = {
  mist: "bg-mist text-ink",
  ink: "bg-ink text-white",
  lilac: "bg-lilac text-ink",
} as const;

export function Pill({ children, tone = "line" }: { children: React.ReactNode; tone?: "line" | "dark" | "lime" | "lilac" | "coral" }) {
  const cls = {
    line: "border border-current/25",
    dark: "bg-ink text-white",
    lime: "bg-lime text-ink",
    lilac: "bg-lilac text-ink",
    coral: "bg-coral text-white",
  }[tone];
  return <span className={`inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-medium ${cls}`}>{children}</span>;
}

export function StoryCard({ story, tone = "mist", index }: { story: Story; tone?: keyof typeof TONES; index?: number }) {
  const publishers = [...new Set(story.citations.map((c) => c.publisher))];
  return (
    <Link
      href={`/story/${story.slug}`}
      className={`block rounded-[var(--radius-card)] p-5 transition-transform active:scale-[0.99] ${TONES[tone]}`}
    >
      <div className="flex items-center gap-2">
        <Pill>{story.sector}</Pill>
        <Pill>{story.region}</Pill>
        {index != null && <span className="ml-auto text-[13px] opacity-60">{index} of 3</span>}
      </div>
      <h3 className="mt-4 text-[21px] leading-[1.2] font-semibold tracking-[-0.01em]">{story.headline}</h3>
      <div className="mt-4 flex items-center justify-between text-[13px] opacity-70">
        <span>{story.placeholder ? "Sample layout" : publishers.join(", ")}</span>
        <span>{story.readMinutes} min</span>
      </div>
    </Link>
  );
}
