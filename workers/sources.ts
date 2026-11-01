// Source registry. Every feed URL marked `verify: true` must be checked once
// before going live (week-1 task) — publishers move their feeds.
//
// Rules (see spec, "Legal rules"):
// - isPress: press publisher → we store title + publisher description + link only,
//   and write our own 1–2 lines. Never full text, never a replacement summary.
// - allowFulltextLlm: only primary sources (companies, regulators, papers).

export type Tier = 'primary' | 'signal'
export type Access = 'rss' | 'api' | 'page' | 'newsletter' | 'manual'

export interface Source {
  id: string
  name: string
  homepage: string
  tier: Tier
  access: Access
  feedUrl?: string
  region: 'FR' | 'EU' | 'US' | 'GLOBAL'
  sectors: string[]
  isPress: boolean
  allowFulltextLlm: boolean
  verify?: boolean
}

export const SOURCES: Source[] = [
  // ---------- Tier 1: primary ----------
  {
    id: 'sec-edgar-formd',
    name: 'SEC EDGAR — Form D filings',
    homepage: 'https://www.sec.gov/edgar',
    tier: 'primary',
    access: 'rss',
    feedUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=D&company=&dateb=&owner=include&count=100&output=atom',
    region: 'US',
    sectors: ['vc'],
    isPress: false,
    allowFulltextLlm: true,
    verify: true,
  },
  {
    id: 'ecb-press',
    name: 'European Central Bank — press releases',
    homepage: 'https://www.ecb.europa.eu',
    tier: 'primary',
    access: 'rss',
    feedUrl: 'https://www.ecb.europa.eu/rss/press.html',
    region: 'EU',
    sectors: ['macro'],
    isPress: false,
    allowFulltextLlm: true,
    verify: true,
  },
  {
    id: 'fed-press',
    name: 'Federal Reserve — press releases',
    homepage: 'https://www.federalreserve.gov',
    tier: 'primary',
    access: 'rss',
    feedUrl: 'https://www.federalreserve.gov/feeds/press_all.xml',
    region: 'US',
    sectors: ['macro'],
    isPress: false,
    allowFulltextLlm: true,
    verify: true,
  },
  {
    id: 'arxiv-ai',
    name: 'arXiv — AI and machine learning',
    homepage: 'https://arxiv.org',
    tier: 'primary',
    access: 'api',
    feedUrl: 'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=50',
    region: 'GLOBAL',
    sectors: ['ai', 'research'],
    isPress: false,
    allowFulltextLlm: true,
  },
  {
    id: 'arxiv-quantum',
    name: 'arXiv — quantum physics',
    homepage: 'https://arxiv.org',
    tier: 'primary',
    access: 'api',
    feedUrl: 'https://export.arxiv.org/api/query?search_query=cat:quant-ph&sortBy=submittedDate&sortOrder=descending&max_results=30',
    region: 'GLOBAL',
    sectors: ['deeptech', 'research'],
    isPress: false,
    allowFulltextLlm: true,
  },
  {
    id: 'biorxiv',
    name: 'bioRxiv — biology preprints (not peer-reviewed)',
    homepage: 'https://www.biorxiv.org',
    tier: 'primary',
    access: 'rss',
    feedUrl: 'https://connect.biorxiv.org/biorxiv_xml/bioengineering.xml',
    region: 'GLOBAL',
    sectors: ['medtech', 'biotech', 'research'],
    isPress: false,
    allowFulltextLlm: true,
    verify: true,
  },
  {
    id: 'medrxiv',
    name: 'medRxiv — medical preprints (not peer-reviewed)',
    homepage: 'https://www.medrxiv.org',
    tier: 'primary',
    access: 'rss',
    feedUrl: 'https://connect.medrxiv.org/medrxiv_xml/health_informatics.xml',
    region: 'GLOBAL',
    sectors: ['medtech', 'research'],
    isPress: false,
    allowFulltextLlm: true,
    verify: true,
  },

  // ---------- Tier 2: signals (link + our own words) ----------
  {
    id: 'maddyness',
    name: 'Maddyness',
    homepage: 'https://www.maddyness.com',
    tier: 'signal',
    access: 'rss',
    feedUrl: 'https://www.maddyness.com/feed/',
    region: 'FR',
    sectors: ['vc', 'startups'],
    isPress: true,
    allowFulltextLlm: false,
    verify: true,
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    homepage: 'https://techcrunch.com',
    tier: 'signal',
    access: 'rss',
    feedUrl: 'https://techcrunch.com/feed/',
    region: 'US',
    sectors: ['vc', 'startups', 'ai'],
    isPress: true,
    allowFulltextLlm: false,
    verify: true,
  },
  {
    id: 'sifted',
    name: 'Sifted',
    homepage: 'https://sifted.eu',
    tier: 'signal',
    access: 'manual', // paywalled, no reliable public feed: headlines linked by hand
    region: 'EU',
    sectors: ['vc', 'startups'],
    isPress: true,
    allowFulltextLlm: false,
  },
  {
    id: 'the-nbs',
    name: 'The Next Big Sh*t',
    homepage: 'https://www.the-nbs.fr',
    tier: 'signal',
    access: 'newsletter', // email only — read by you, linked by hand
    region: 'FR',
    sectors: ['business', 'tech'],
    isPress: true,
    allowFulltextLlm: false,
  },
]

export const activeFeeds = () => SOURCES.filter((s) => s.feedUrl && (s.access === 'rss' || s.access === 'api'))
