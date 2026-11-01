// Collector: fetches every active feed, normalizes items and stores new ones.
// Run:  npm run collect          (writes to Supabase if keys are set)
//       npm run collect -- --dry (prints counts only)
import { createClient } from '@supabase/supabase-js'
import { activeFeeds, SOURCES } from './sources'
import { parseFeed, type RawItem } from './parse'
import { isAllowed, USER_AGENT } from './robots'
import { formIndexUrl, parseFormIndex, recentWeekdays } from './sec'
import type { Source } from './sources'
import { parseFormD } from './formd'

const dry = process.argv.includes('--dry')
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY // server-only secret, never shipped to the app
const db = url && key && !dry ? createClient(url, key, { auth: { persistSession: false } }) : null

async function fetchFeed(feedUrl: string): Promise<string> {
  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

/** Fetches items for one source, whatever its adapter. */
async function collectSource(s: Source): Promise<RawItem[]> {
  if (s.adapter === 'sec-form-d') {
    // Try the last 3 weekdays; the newest index may not be published yet.
    const items: RawItem[] = []
    for (const day of recentWeekdays(new Date(), 3)) {
      const u = formIndexUrl(day)
      if (!(await isAllowed(u))) throw new Error('blocked by robots.txt')
      try {
        items.push(...parseFormIndex(await fetchFeed(u), s.id))
      } catch (e) {
        if (!(e instanceof Error && e.message === 'HTTP 404')) throw e // 404 = holiday or not yet published
      }
      await new Promise((r) => setTimeout(r, 300))
    }
    return items
  }
  if (!(await isAllowed(s.feedUrl!))) throw new Error('blocked by robots.txt')
  return parseFeed(await fetchFeed(s.feedUrl!), s.id)
}

async function syncSources() {
  if (!db) return
  const rows = SOURCES.map((s) => ({
    id: s.id,
    name: s.name,
    homepage: s.homepage,
    tier: s.tier,
    access: s.access,
    feed_url: s.feedUrl ?? null,
    region: s.region,
    sectors: s.sectors,
    is_press: s.isPress,
    allow_fulltext_llm: s.allowFulltextLlm,
  }))
  const { error } = await db.from('sources').upsert(rows)
  if (error) throw error
}

async function store(items: RawItem[]) {
  if (!db || !items.length) return 0
  const { data, error } = await db
    .from('items')
    .upsert(
      items.map((i) => ({
        source_id: i.sourceId,
        url: i.url,
        url_hash: i.urlHash,
        title: i.title,
        description: i.description,
        author: i.author,
        published_at: i.publishedAt,
      })),
      { onConflict: 'url_hash', ignoreDuplicates: true },
    )
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Reads amount, sector and state for new Form D filings (max per run keeps the job short). */
async function enrichFormD(maxPerRun = 120) {
  if (!db) return { checked: 0, added: 0 }
  const { data: items, error } = await db
    .from('items')
    .select('id,url,title,published_at')
    .eq('source_id', 'sec-edgar-formd')
    .order('published_at', { ascending: false })
    .limit(600)
  if (error) throw error
  const ids = (items ?? []).map((i) => i.id)
  const done = new Set<string>()
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db.from('deals').select('item_id').in('item_id', ids.slice(i, i + 200))
    data?.forEach((d) => done.add(d.item_id))
  }
  const todo = (items ?? []).filter((i) => !done.has(i.id)).slice(0, maxPerRun)
  let added = 0
  for (const it of todo) {
    // url: https://www.sec.gov/Archives/edgar/data/{cik}/{accNoDash}/{acc}-index.htm
    const m = it.url.match(/\/data\/(\d+)\/(\d+)\//)
    if (!m) continue
    const base = `https://www.sec.gov/Archives/edgar/data/${m[1]}/${m[2]}/`
    let xml: string | null = null
    try {
      xml = await fetchFeed(base + 'primary_doc.xml')
    } catch {
      try {
        const idx = JSON.parse(await fetchFeed(base + 'index.json'))
        const f = idx?.directory?.item?.find((x: { name: string }) => x.name.endsWith('.xml'))
        if (f) xml = await fetchFeed(base + f.name)
      } catch {
        /* leave xml null */
      }
    }
    const d = xml ? parseFormD(xml) : null
    const row = {
      item_id: it.id,
      company: d?.company ?? it.title.replace(/^Form D filed: /, ''),
      round: d ? (d.isFund ? 'Fund' : 'Private round') : 'Private round',
      amount: d?.amountSold ?? null,
      currency: 'USD',
      amount_usd: d?.amountSold ?? null,
      offering_total: d?.offeringTotal ?? null,
      industry: d?.industry ?? null,
      sector: d?.industry ?? null,
      fund_type: d?.fundType ?? null,
      is_fund: d?.isFund ?? false,
      state: d?.state ?? null,
      country: 'US',
      first_sale_on: d?.firstSaleOn && /^\d{4}-\d{2}-\d{2}$/.test(d.firstSaleOn) ? d.firstSaleOn : null,
      announced_on: it.published_at ? it.published_at.slice(0, 10) : null,
      confidence: 'confirmed', // filed with the regulator
      filing_url: it.url,
    }
    const { error: e2 } = await db.from('deals').upsert(row, { onConflict: 'item_id', ignoreDuplicates: true })
    if (!e2) added++
    await sleep(250) // stays well under the SEC's 10 requests/second
  }
  return { checked: todo.length, added }
}

async function main() {
  await syncSources()
  const report: { source: string; found: number; stored: number; error?: string }[] = []

  for (const s of activeFeeds()) {
    try {
      const items = await collectSource(s)
      const stored = await store(items)
      report.push({ source: s.id, found: items.length, stored })
      if (db) await db.from('sources').update({ last_ok_at: new Date().toISOString(), last_error: null }).eq('id', s.id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      report.push({ source: s.id, found: 0, stored: 0, error: msg })
      if (db) await db.from('sources').update({ last_error: msg }).eq('id', s.id)
    }
    await new Promise((r) => setTimeout(r, 1000)) // be polite: one request per second
  }

  console.table(report)
  try {
    const r = await enrichFormD()
    console.log(`Form D details: ${r.added} of ${r.checked} filings read`)
  } catch (e) {
    console.warn('Form D details failed:', e instanceof Error ? e.message : e)
  }
  const failed = report.filter((r) => r.error)
  if (failed.length) console.warn(`${failed.length} source(s) failed — check feed URLs marked verify:true`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
