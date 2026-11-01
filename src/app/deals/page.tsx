import { DEALS } from "@/lib/sample";
import { GeoMark } from "@/components/GeoMark";
import { Pill } from "@/components/StoryCard";

export default function Deals() {
  return (
    <main className="px-5 pt-8 md:px-8 lg:pt-12">
      <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em] md:text-[52px]">Deals</h1>
      <p className="mt-1 text-[14px] text-ink-soft">Every round we found today, with its sources. Sample rows for now.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {DEALS.map((d) => (
          <div key={d.company} className="rounded-[var(--radius-card)] bg-mist p-5">
            <div className="flex items-center gap-3">
              <GeoMark name={d.company} size={44} />
              <div className="flex-1">
                <p className="text-[18px] font-semibold">{d.company}</p>
                <p className="text-[13px] text-ink-soft">
                  {d.sector}, {d.country}
                </p>
              </div>
              <p className="text-[22px] font-light">{d.amount}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone="dark">{d.round}</Pill>
              <Pill>Lead: {d.lead}</Pill>
              <Pill tone={d.confidence === "confirmed" ? "lime" : d.confidence === "conflicting" ? "coral" : "lilac"}>
                {{ confirmed: "Confirmed by company", single_report: "One press report", conflicting: "Sources differ" }[d.confidence]}
              </Pill>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
