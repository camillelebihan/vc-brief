// Live data from Supabase, read with the publishable (anon) key on the server.
// Everything is cached and refreshed every 15 minutes. If the keys are not set
// (e.g. a local build), functions return null and pages fall back to sample data.
import { cacheLife } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SOURCES } from "../../workers/sources";

export interface LiveItem {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAt: string | null;
  author: string | null;
}

export interface LiveDeal {
  id: string;
  company: string;
  industry: string | null;
  fundType: string | null;
  isFund: boolean;
  amountSold: number | null;
  offeringTotal: number | null;
  state: string | null;
  announcedOn: string | null;
  filingUrl: string | null;
}

const byNeed = (...tags: string[]) => SOURCES.filter((x) => x.feedUrl && x.sectors.some((t) => tags.includes(t))).map((x) => x.id);

/** Groups built from the source registry, so a new feed shows up without touching the pages. */
export const SOURCE_GROUPS = {
  vc: byNeed("vc", "startups"),
  tech: byNeed("tech", "ai").filter((id) => !id.startsWith("arxiv")),
  markets: [...byNeed("markets"), "ecb-press", "fed-press"],
  world: byNeed("world", "society"),
  research: ["arxiv-ai", "arxiv-quantum", "biorxiv", "medrxiv"],
  medical: ["biorxiv", "medrxiv"],
};

const SOURCE_NAMES: Record<string, string> = {
  ...Object.fromEntries(SOURCES.map((x) => [x.id, x.name])),
  "arxiv-ai": "arXiv",
  "arxiv-quantum": "arXiv",
  biorxiv: "bioRxiv (preprint)",
  medrxiv: "medRxiv (preprint)",
  "ecb-press": "European Central Bank",
  "fed-press": "Federal Reserve",
  "sec-edgar-formd": "SEC filing",
};

/** "Les Echos — Start-up" and "Les Echos — Tech" count as one outlet when mixing. */
const brand = (name: string) => name.split(" — ")[0].replace(/^NYT .*/, "New York Times").replace(/^FT .*/, "Financial Times").replace(/^BBC .*/, "BBC News");

/** Keeps newest-first order but caps how many items one outlet can place. */
export function diversify<T extends { sourceName: string }>(items: T[], limit: number, maxPerOutlet: number): T[] {
  const count = new Map<string, number>();
  const out: T[] = [];
  for (const it of items) {
    const b = brand(it.sourceName);
    if ((count.get(b) ?? 0) >= maxPerOutlet) continue;
    count.set(b, (count.get(b) ?? 0) + 1);
    out.push(it);
    if (out.length === limit) break;
  }
  return out;
}

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const LIFE = { stale: 300, revalidate: 900, expire: 86400 };

export async function getLatestItems(sourceIds: readonly string[], limit: number, maxPerOutlet = 99): Promise<LiveItem[] | null> {
  "use cache";
  cacheLife(LIFE);
  const db = client();
  if (!db) return null;
  const { data, error } = await db
    .from("items")
    .select("id,title,url,source_id,published_at,author")
    .in("source_id", [...sourceIds])
    .not("published_at", "is", null)
    .lte("published_at", new Date(Date.now() + 3600_000).toISOString()) // ignore items dated in the future
    .order("published_at", { ascending: false })
    .limit(limit * 6);
  if (error) {
    console.error("getLatestItems", error.message);
    return null;
  }
  const rows = data.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    sourceId: r.source_id,
    sourceName: SOURCE_NAMES[r.source_id] ?? r.source_id,
    publishedAt: r.published_at,
    author: r.author,
  }));
  return diversify(rows, limit, maxPerOutlet);
}

export async function getDeals(opts: { funds: boolean; days: number; limit: number; minAmount?: number }): Promise<LiveDeal[] | null> {
  "use cache";
  cacheLife(LIFE);
  const db = client();
  if (!db) return null;
  const since = new Date(Date.now() - opts.days * 86400_000).toISOString().slice(0, 10);
  const base = db
    .from("deals")
    .select("id,company,industry,fund_type,is_fund,amount_usd,offering_total,state,announced_on,filing_url")
    .eq("is_fund", opts.funds)
    .gte("announced_on", since)
    .gte("amount_usd", opts.minAmount ?? 1);
  // Startups: drop real-estate vehicles. Funds: keep venture and private equity funds only.
  const q = opts.funds
    ? base.in("fund_type", ["Venture Capital Fund", "Private Equity Fund"])
    : base.not("industry", "in", '("Pooled Investment Fund","REITS and Finance","Residential","Commercial","Other Real Estate")');
  const { data, error } = await q.order("amount_usd", { ascending: false }).limit(opts.limit);
  if (error) {
    console.error("getDeals", error.message);
    return null;
  }
  return data.map((r) => ({
    id: r.id,
    company: r.company,
    industry: r.industry,
    fundType: r.fund_type,
    isFund: r.is_fund,
    amountSold: r.amount_usd,
    offeringTotal: r.offering_total,
    state: r.state,
    announcedOn: r.announced_on,
    filingUrl: r.filing_url,
  }));
}

export async function getCounts(): Promise<{ items: number; deals: number } | null> {
  "use cache";
  cacheLife(LIFE);
  const db = client();
  if (!db) return null;
  const [a, b] = await Promise.all([
    db.from("items").select("id", { count: "exact", head: true }),
    db.from("deals").select("id", { count: "exact", head: true }),
  ]);
  return { items: a.count ?? 0, deals: b.count ?? 0 };
}

/** "Mon 2 Nov, 14:05" in Paris time — deterministic, so pages can be cached. */
export function formatWhen(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

export function formatDay(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Paris" }).format(new Date(iso));
}
