import Link from "next/link";
import { USER } from "@/lib/sample";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-4 text-[16px]">
      <span>{label}</span>
      <span className="text-ink-soft">{value}</span>
    </div>
  );
}

export default function Profile() {
  return (
    <main className="px-5 pt-8">
      <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">{USER.name}</h1>
      <section className="mt-6">
        <Row label="Topics" value={USER.topics.join(", ")} />
        <Row label="Morning push" value="7:45" />
        <Row label="Evening push" value="18:00" />
        <Row label="Recall format" value="Quiz" />
        <Row label="How often old questions return" value="Adapts to your answers" />
        <Row label="Ask more today" value="5 of 5 left" />
      </section>
      <div className="mt-6 flex flex-col gap-3 text-[15px]">
        <Link href="/onboarding" className="rounded-pill border border-line px-5 py-3 text-center">
          Change topics
        </Link>
        <Link href="/privacy" className="text-center text-ink-soft underline underline-offset-4">
          Privacy note
        </Link>
      </div>
    </main>
  );
}
