import { XMLParser } from 'fast-xml-parser'
import { createHash } from 'node:crypto'

export interface RawItem {
  sourceId: string
  url: string
  urlHash: string
  title: string
  description: string | null
  author: string | null
  publishedAt: string | null
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  textNodeName: '#text',
  trimValues: true,
})

const MAX_DESCRIPTION = 400 // publisher-provided excerpt only, kept short

export function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim()
}

function text(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (Array.isArray(v)) return text(v[0])
  if (typeof v === 'object' && '#text' in (v as Record<string, unknown>)) return text((v as Record<string, unknown>)['#text'])
  return ''
}

/** Remove tracking parameters so the same article from two feeds dedupes. */
export function canonicalUrl(raw: string): string {
  try {
    const u = new URL(raw.trim())
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|ref$|source$)/i.test(k)) u.searchParams.delete(k)
    }
    u.hash = ''
    let s = u.toString()
    if (s.endsWith('/') && u.pathname !== '/') s = s.slice(0, -1)
    return s
  } catch {
    return raw.trim()
  }
}

export const hashUrl = (url: string) => createHash('sha256').update(canonicalUrl(url)).digest('hex')

function toIso(v: string): string | null {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function clip(s: string): string | null {
  if (!s) return null
  return s.length > MAX_DESCRIPTION ? s.slice(0, MAX_DESCRIPTION - 1).trimEnd() + '…' : s
}

/** Parses RSS 2.0 and Atom (incl. arXiv API and SEC EDGAR) into normalized items. */
export function parseFeed(xml: string, sourceId: string): RawItem[] {
  const doc = parser.parse(xml)
  const out: RawItem[] = []

  const rssItems = doc?.rss?.channel?.item ?? doc?.['rdf:RDF']?.item
  if (rssItems) {
    for (const it of [].concat(rssItems)) {
      const i = it as Record<string, unknown>
      const url = text(i.link) || text(i.guid)
      const title = stripHtml(text(i.title))
      if (!url || !title) continue
      out.push({
        sourceId,
        url: canonicalUrl(url),
        urlHash: hashUrl(url),
        title,
        description: clip(stripHtml(text(i.description))),
        author: stripHtml(text(i['dc:creator']) || text(i.author)) || null,
        publishedAt: toIso(text(i.pubDate) || text(i['dc:date'])),
      })
    }
    return out
  }

  const entries = doc?.feed?.entry
  if (entries) {
    for (const e of [].concat(entries)) {
      const en = e as Record<string, unknown>
      const links = [].concat((en.link ?? []) as never) as Array<Record<string, string> | string>
      const alt =
        links.find((l) => typeof l === 'object' && (l['@rel'] === 'alternate' || !l['@rel'])) ?? links[0]
      const url = typeof alt === 'string' ? alt : alt?.['@href'] ?? text(en.id)
      const title = stripHtml(text(en.title))
      if (!url || !title) continue
      const authors = [].concat((en.author ?? []) as never) as Array<Record<string, unknown>>
      out.push({
        sourceId,
        url: canonicalUrl(url),
        urlHash: hashUrl(url),
        title,
        description: clip(stripHtml(text(en.summary) || text(en.content))),
        author: authors.map((a) => text(a.name)).filter(Boolean).slice(0, 3).join(', ') || null,
        publishedAt: toIso(text(en.published) || text(en.updated)),
      })
    }
  }
  return out
}
