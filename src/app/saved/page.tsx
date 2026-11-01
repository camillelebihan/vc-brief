import { STORIES } from "@/lib/sample";
import { StoryCard } from "@/components/StoryCard";

export default function Saved() {
  const saved = STORIES.filter((s) => !s.placeholder);
  return (
    <main className="px-5 pt-8">
      <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">Library</h1>
      <div className="mt-5 flex rounded-pill bg-mist p-1 text-[14px]">
        <span className="flex-1 rounded-pill bg-ink py-2 text-center text-white">Saved</span>
        <span className="flex-1 py-2 text-center text-ink-soft">Liked</span>
        <span className="flex-1 py-2 text-center text-ink-soft">Archive</span>
      </div>
      <label className="mt-4 block">
        <span className="sr-only">Search every past story</span>
        <input placeholder="Search every past story" className="w-full rounded-pill border border-line px-4 py-3 text-[15px]" />
      </label>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-card)] bg-cobalt p-4 text-white">
          <p className="text-[28px] font-light">{saved.length}</p>
          <p className="text-[13px] text-white/75">saved this week</p>
        </div>
        <div className="rounded-[var(--radius-card)] bg-lime p-4">
          <p className="text-[28px] font-light">Fri</p>
          <p className="text-[13px] text-ink/70">your saved-stories digest</p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {saved.map((s) => (
          <StoryCard key={s.slug} story={s} />
        ))}
      </div>
    </main>
  );
}
