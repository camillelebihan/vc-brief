// SEC Form D reader, using the daily form index (the route the SEC documents for automated tools).
// Form D = a private fundraising notice: it gives the issuer and amount, not the investors.
import type { RawItem } from './parse'
import { hashUrl } from './parse'

/** Index file URL for a given date, e.g. .../daily-index/2026/QTR4/form.20261030.idx */
export function formIndexUrl(d: Date): string {
  const y = d.getUTCFullYear()
  const q = Math.floor(d.getUTCMonth() / 3) + 1
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '')
  return `https://www.sec.gov/Archives/edgar/daily-index/${y}/QTR${q}/form.${ymd}.idx`
}

/** Last N weekdays before `from` (most recent first): the index is published each business evening. */
export function recentWeekdays(from: Date, n: number): Date[] {
  const out: Date[] = []
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  while (out.length < n) {
    d.setUTCDate(d.getUTCDate() - 1)
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) out.push(new Date(d))
  }
  return out
}

/** Parses a form.idx file and keeps new Form D filings (not amendments). */
export function parseFormIndex(idx: string, sourceId: string): RawItem[] {
  const lines = idx.split('\n')
  const start = lines.findIndex((l) => /^-{20,}/.test(l))
  if (start < 0) return []
  const out: RawItem[] = []
  for (const line of lines.slice(start + 1)) {
    const cols = line.trim().split(/\s{2,}/)
    if (cols.length < 5 || cols[0] !== 'D') continue
    const [, company, cik, dateFiled, file] = cols
    const acc = file.split('/').pop()!.replace('.txt', '') // 0001234567-26-000123
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${acc.replace(/-/g, '')}/${acc}-index.htm`
    const date = /^\d{8}$/.test(dateFiled)
      ? `${dateFiled.slice(0, 4)}-${dateFiled.slice(4, 6)}-${dateFiled.slice(6, 8)}`
      : dateFiled
    out.push({
      sourceId,
      url,
      urlHash: hashUrl(url),
      title: `Form D filed: ${company}`,
      description: `Private offering notice filed with the SEC (CIK ${cik}). Amount and details in the filing.`,
      author: null,
      publishedAt: new Date(`${date}T00:00:00Z`).toISOString(),
    })
  }
  return out
}
