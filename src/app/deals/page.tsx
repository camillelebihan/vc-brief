import { DEALS } from "@/lib/sample";
import { getDeals } from "@/lib/data";
import { GeoMark } from "@/components/GeoMark";
import { Pill } from "@/components/StoryCard";
import { DealCard } from "@/components/Live";

export default async function Deals() {
  const [startups, funds] = await Promise.all([
    getDeals({ funds: false, days: 7, limit: 24, minAmount: 1_000_000 }),
    getDeals({ funds: true, days: 14, limit: 12 }),
  ]);
  const live = !!startups?.length;

  return (
    <main className="px-5 pt-8 md:px-8 lg:pt-12">
      <h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em] md:text-[52px]">Deals</h1>
      <p className="mt-1 max-w-[60ch] text-[14px] text-ink-soft">
        {live
          ? "From SEC Form D filings: the notice US companies and funds file when they raise private money. It shows the amount and sector, not the investors."
          : "Every round we found today, with its sources. Sample rows for now."}
      </p>

      {live ? (
        <>
          <h2 className="mt-8 mb-4 text-[22px] font-medium">Startups raising, last 7 days</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {startups!.map((d) => (
              <DealCard key={d.id} d={d} />
            ))}
          </div>
          {!!funds?.length && (
            <>
              <h2 className="mt-10 mb-4 text-[22px] font-medium">Venture and private equity funds raising</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {funds.map((d) => (
                  <DealCard key={d.id} d={d} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
