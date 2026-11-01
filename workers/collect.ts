// Collector: fetches every active feed, normalizes items and stores new ones.
// Run:  npm run collect          (writes to Supabase if keys are set)
//       npm run collect -- --dry (prints counts only)
import { createClient } from '@supabase/supabase-js'
import { activeFeeds, SOURCES } from './sources'
import { parseFeed, type RawItem } from './parse'
import { isAllowed, USER_AGENT } from './robots'

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

async function main() {
  await syncSources()
  const report: { source: string; found: number; stored: number; error?: string }[] = []

  for (const s of activeFeeds()) {
    try {
      if (!(await isAllowed(s.feedUrl!))) throw new Error('blocked by robots.txt')
      const items = parseFeed(await fetchFeed(s.feedUrl!), s.id)
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
  const failed = report.filter((r) => r.error)
  if (failed.length) console.warn(`${failed.length} source(s) failed — check feed URLs marked verify:true`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
