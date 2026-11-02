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
  /** 'feed' = RSS/Atom (default); 'sec-form-d' = SEC daily form index */
  adapter?: 'feed' | 'sec-form-d'
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
    access: 'api',
    adapter: 'sec-form-d',
    // Daily index, the route the SEC documents for automated tools (sec.gov/os/accessing-edgar-data)
    feedUrl: 'https://www.sec.gov/Archives/edgar/daily-index/',
    region: 'US',
    sectors: ['vc'],
    isPress: false,
    allowFulltextLlm: true,
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
  },
  {
    id: 'arxiv-ai',
    name: 'arXiv — AI and machine learning',
    homepage: 'https://arxiv.org',
    tier: 'primary',
    access: 'rss',
    feedUrl: 'https://rss.arxiv.org/rss/cs.AI', // official RSS (info.arxiv.org/help/rss.html)
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
    access: 'rss',
    feedUrl: 'https://rss.arxiv.org/rss/quant-ph',
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
    feedUrl: 'https://connect.biorxiv.org/biorxiv_xml.php?subject=bioengineering+bioinformatics+synthetic_biology',
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
    feedUrl: 'https://connect.medrxiv.org/medrxiv_xml.php?subject=Health_Informatics',
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
  },
  ...press([
    // [id, name, homepage, feed, region, sectors]
    ['eu-startups', 'EU-Startups', 'https://www.eu-startups.com', 'https://www.eu-startups.com/feed/', 'EU', ['vc', 'startups']],
    ['crunchbase-news', 'Crunchbase News', 'https://news.crunchbase.com', 'https://news.crunchbase.com/feed/', 'US', ['vc', 'startups']],
    ['frenchweb', 'FrenchWeb', 'https://www.frenchweb.fr', 'https://www.frenchweb.fr/feed', 'FR', ['vc', 'startups', 'tech']],
    ['lemonde-une', 'Le Monde', 'https://www.lemonde.fr', 'https://www.lemonde.fr/rss/une.xml', 'FR', ['world', 'society']],
    ['lemonde-eco', 'Le Monde — Économie', 'https://www.lemonde.fr', 'https://www.lemonde.fr/economie/rss_full.xml', 'FR', ['markets']],
    ['nyt-home', 'New York Times', 'https://www.nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'US', ['world', 'society']],
    ['nyt-dealbook', 'NYT DealBook', 'https://www.nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Dealbook.xml', 'US', ['markets', 'vc']],
    ['nyt-tech', 'NYT Technology', 'https://www.nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', 'US', ['tech', 'ai']],
    ['ft-home', 'Financial Times', 'https://www.ft.com', 'https://www.ft.com/rss/home', 'GLOBAL', ['world', 'markets']],
    ['ft-tech', 'FT Technology', 'https://www.ft.com', 'https://www.ft.com/technology?format=rss', 'GLOBAL', ['tech']],
    ['bbc-world', 'BBC News', 'https://www.bbc.com/news', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'GLOBAL', ['world', 'society']],
    ['bbc-business', 'BBC Business', 'https://www.bbc.com/news/business', 'https://feeds.bbci.co.uk/news/business/rss.xml', 'GLOBAL', ['markets']],
    ['guardian-tech', 'The Guardian — Technology', 'https://www.theguardian.com', 'https://www.theguardian.com/uk/technology/rss', 'GLOBAL', ['tech', 'ai']],
  ]),
  {
    id: 'lesechos',
    name: 'Les Echos',
    homepage: 'https://www.lesechos.fr',
    tier: 'signal',
    access: 'manual', // its feeds refuse automated readers (HTTP 403): respected, linked by hand
    region: 'FR',
    sectors: ['vc', 'markets', 'world'],
    isPress: true,
    allowFulltextLlm: false,
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

/** Press sources share the same rules: headline + link + our own words only. */
function press(rows: [string, string, string, string, Source['region'], string[]][]): Source[] {
  return rows.map(([id, name, homepage, feedUrl, region, sectors]) => ({
    id, name, homepage, feedUrl, region, sectors,
    tier: 'signal', access: 'rss', isPress: true, allowFulltextLlm: false, verify: true,
  }))
}

export const activeFeeds = () => SOURCES.filter((s) => s.feedUrl && (s.access === 'rss' || s.access === 'api'))
