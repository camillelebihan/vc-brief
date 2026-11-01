import type { LiveDeal, LiveItem } from "@/lib/data";
import { formatDay, formatWhen } from "@/lib/data";
import { formatUsd } from "@/lib/format";
import { GeoMark } from "./GeoMark";
import { Pill } from "./StoryCard";

const TONES = { mist: "bg-mist text-ink", ink: "bg-ink text-white", lilac: "bg-lilac text-ink" } as const;

/** A live headline. Press items show our headline + link only (no excerpt), per the spec's legal rules. */
export function NewsCard({ item, tone = "mist", label }: { item: LiveItem; tone?: keyof typeof TONES; label?: string }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className={`flex h-full flex-col rounded-[var(--radius-card)] p-5 transition-transform active:scale-[0.99] ${TONES[tone]}`}
    >
      <div className="flex items-center gap-2">
        <Pill>{item.sourceName}</Pill>
        {label && <span className="ml-auto text-[13px] opacity-60">{label}</span>}
      </div>
      <h3 className="mt-4 text-[20px] leading-[1.25] font-semibold tracking-[-0.01em]">{item.title}</h3>
      <div className="mt-auto flex items-center justify-between pt-4 text-[13px] opacity-70">
        <span>{formatWhen(item.publishedAt)}</span>
        <span aria-hidden>Read the original ↗</span>
      </div>
    </a>
  );
}

export function HeadlineList({ items }: { items: LiveItem[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((it) => (
        <li key={it.id}>
          <a href={it.url} target="_blank" rel="noreferrer" className="flex gap-3 py-4">
            <span className="w-24 shrink-0 text-[13px] leading-snug text-ink-soft">{it.sourceName}</span>
            <span className="min-w-0">
              <span className="block text-[16px] leading-snug">{it.title}</span>
              <span className="mt-1 block text-[12px] text-ink-soft">{formatWhen(it.publishedAt)}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ResearchList({ items }: { items: LiveItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-2xl border border-line p-4">
          <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-coral" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[16px] leading-snug">{it.title}</span>
            <span className="mt-1 block truncate text-[12px] text-ink-soft">
              {it.sourceName}
              {it.author ? `, ${it.author}` : ""}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

function industryLabel(d: LiveDeal) {
  if (d.isFund) return d.fundType ?? "Fund";
  return d.industry && d.industry !== "Other" ? d.industry : "Private company";
}

export function DealRows({ deals }: { deals: LiveDeal[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-mist">
      {deals.map((d) => (
        <a
          key={d.id}
          href={d.filingUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 border-b border-paper px-4 py-3 last:border-0"
        >
          <GeoMark name={d.company} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold capitalize">{d.company.toLowerCase()}</p>
            <p className="truncate text-[12px] text-ink-soft">
              {industryLabel(d)}
              {d.state ? `, ${d.state}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[16px] font-semibold">{formatUsd(d.amountSold)}</p>
            <p className="text-[11px] text-ink-soft">SEC filing, {formatDay(d.announcedOn)}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

export function DealCard({ d }: { d: LiveDeal }) {
  const target = formatUsd(d.offeringTotal);
  return (
    <a href={d.filingUrl ?? "#"} target="_blank" rel="noreferrer" className="block rounded-[var(--radius-card)] bg-mist p-5">
      <div className="flex items-center gap-3">
        <GeoMark name={d.company} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold capitalize">{d.company.toLowerCase()}</p>
          <p className="text-[13px] text-ink-soft">
            {industryLabel(d)}
            {d.state ? `, ${d.state}` : ""}
          </p>
        </div>
        <p className="text-[22px] font-light">{formatUsd(d.amountSold)}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone="dark">{d.isFund ? "Fund raising" : "Private round"}</Pill>
        {target && <Pill>Target {target}</Pill>}
        <Pill tone="lime">SEC filing, {formatDay(d.announcedOn)}</Pill>
      </div>
    </a>
  );
}
