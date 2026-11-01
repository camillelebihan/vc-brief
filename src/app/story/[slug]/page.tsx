import Link from "next/link";
import { notFound } from "next/navigation";
import { GLOSSARY, STORIES } from "@/lib/sample";
import { Pill } from "@/components/StoryCard";
import { StoryReader } from "@/components/StoryReader";

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export default async function StoryPage({ params }: PageProps<"/story/[slug]">) {
  const { slug } = await params;
  const story = STORIES.find((s) => s.slug === slug);
  if (!story) notFound();

  return (
    <main className="mx-auto max-w-[720px] md:pt-6">
      <div className="flex items-center justify-between px-5 pt-5">
        <Link href="/" aria-label="Back to the brief" className="grid size-11 place-items-center rounded-full bg-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M19 12H5m6-6-6 6 6 6" />
          </svg>
        </Link>
        <span className="text-[13px] text-ink-soft">{story.readMinutes} min</span>
      </div>
      <header className="px-5 pt-6">
        <div className="flex gap-2">
          <Pill>{story.sector}</Pill>
          <Pill>{story.region}</Pill>
          {story.placeholder && <Pill tone="coral">Sample</Pill>}
        </div>
        <h1 className="mt-4 text-[32px] leading-[1.1] font-light tracking-[-0.025em] md:text-[44px]">{story.headline}</h1>
      </header>
      <StoryReader story={story} glossary={GLOSSARY} />
    </main>
  );
}
