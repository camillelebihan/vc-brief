import { describe, expect, it } from 'vitest'
import { canonicalUrl, hashUrl, parseFeed, stripHtml } from './parse'
import { disallowedPaths } from './robots'

const RSS = `<?xml version="1.0"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel><title>Example</title>
<item>
  <title><![CDATA[Startup X lève 20 millions d&#8217;euros]]></title>
  <link>https://example.com/2026/11/01/startup-x/?utm_source=rss&amp;utm_medium=rss</link>
  <description><![CDATA[<p>La startup parisienne <b>X</b> annonce une Série A.</p>]]></description>
  <dc:creator>Jane Doe</dc:creator>
  <pubDate>Sun, 01 Nov 2026 07:30:00 +0100</pubDate>
</item>
<item><title>No link item</title></item>
</channel></rss>`

const ATOM = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<entry>
  <id>http://arxiv.org/abs/2611.00001v1</id>
  <title>A New Method for
    Error-Corrected Qubits</title>
  <summary>We show a method that reduces error rates.</summary>
  <published>2026-10-31T18:00:00Z</published>
  <author><name>A. Researcher</name></author>
  <author><name>B. Scientist</name></author>
  <link href="http://arxiv.org/abs/2611.00001v1" rel="alternate" type="text/html"/>
  <link title="pdf" href="http://arxiv.org/pdf/2611.00001v1" rel="related"/>
</entry>
</feed>`

describe('parseFeed', () => {
  it('parses RSS, strips HTML and tracking params, skips items without link', () => {
    const items = parseFeed(RSS, 'maddyness')
    expect(items).toHaveLength(1)
    const [i] = items
    expect(i.title).toBe('Startup X lève 20 millions d’euros')
    expect(i.url).toBe('https://example.com/2026/11/01/startup-x')
    expect(i.description).toBe('La startup parisienne X annonce une Série A.')
    expect(i.author).toBe('Jane Doe')
    expect(i.publishedAt).toBe('2026-11-01T06:30:00.000Z')
  })

  it('parses Atom (arXiv) with the alternate link and multiple authors', () => {
    const [e] = parseFeed(ATOM, 'arxiv-quantum')
    expect(e.title).toBe('A New Method for Error-Corrected Qubits')
    expect(e.url).toBe('http://arxiv.org/abs/2611.00001v1')
    expect(e.author).toBe('A. Researcher, B. Scientist')
  })

  it('dedupes the same article with different tracking params', () => {
    expect(hashUrl('https://a.com/x?utm_source=a')).toBe(hashUrl('https://a.com/x/?utm_medium=b#top'))
  })

  it('keeps meaningful query params', () => {
    expect(canonicalUrl('https://a.com/p?id=42&utm_source=x')).toBe('https://a.com/p?id=42')
  })

  it('decodes numeric entities', () => {
    expect(stripHtml('d&#8217;euros')).toBe('d’euros')
  })
})

describe('robots.txt', () => {
  it('uses the * group when there is no specific group', () => {
    const r = 'User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nDisallow: /private\n'
    expect(disallowedPaths(r)).toEqual(['/private'])
  })
  it('prefers our own group', () => {
    const r = 'User-agent: *\nDisallow: /a\n\nUser-agent: VCBriefBot\nDisallow: /\n'
    expect(disallowedPaths(r)).toEqual(['/'])
  })
})

import { formIndexUrl, parseFormIndex, recentWeekdays } from './sec'

const IDX = `Description:           Daily Index of EDGAR Dissemination Feed by Form Type
Last Data Received:    October 30, 2026

Form Type   Company Name                                                  CIK         Date Filed  File Name
---------------------------------------------------------------------------------------------------------------------------------------------
10-Q        EXAMPLE CORP                                                  1000001     20261030    edgar/data/1000001/0001000001-26-000010.txt
D           ACME ROBOTICS INC                                             1999999     20261030    edgar/data/1999999/0001999999-26-000001.txt
D/A         OLD FUND LP                                                   1888888     20261030    edgar/data/1888888/0001888888-26-000002.txt
`

describe('SEC Form D index', () => {
  it('keeps new Form D filings only and builds the filing page link', () => {
    const items = parseFormIndex(IDX, 'sec-edgar-formd')
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Form D filed: ACME ROBOTICS INC')
    expect(items[0].url).toBe('https://www.sec.gov/Archives/edgar/data/1999999/000199999926000001/0001999999-26-000001-index.htm')
    expect(items[0].publishedAt).toBe('2026-10-30T00:00:00.000Z')
  })
  it('builds the right index URL and skips weekends', () => {
    expect(formIndexUrl(new Date('2026-10-30T12:00:00Z'))).toBe('https://www.sec.gov/Archives/edgar/daily-index/2026/QTR4/form.20261030.idx')
    const days = recentWeekdays(new Date('2026-11-02T08:00:00Z'), 2).map((d) => d.toISOString().slice(0, 10))
    expect(days).toEqual(['2026-10-30', '2026-10-29'])
  })
})

import { formatUsd, parseFormD } from './formd'

const FORMD = `<?xml version="1.0"?>
<edgarSubmission>
  <primaryIssuer>
    <cik>0001999999</cik>
    <entityName>ACME ROBOTICS INC</entityName>
    <issuerAddress><street1>1 Main St</street1><city>Boston</city><stateOrCountry>MA</stateOrCountry></issuerAddress>
  </primaryIssuer>
  <offeringData>
    <industryGroup><industryGroupType>Other Technology</industryGroupType></industryGroup>
    <typeOfFiling><newOrAmendment><isAmendment>false</isAmendment></newOrAmendment><dateOfFirstSale><value>2026-10-15</value></dateOfFirstSale></typeOfFiling>
    <offeringSalesAmounts><totalOfferingAmount>12000000</totalOfferingAmount><totalAmountSold>9500000</totalAmountSold></offeringSalesAmounts>
  </offeringData>
</edgarSubmission>`

const FUND = FORMD.replace('<industryGroupType>Other Technology</industryGroupType>', '<industryGroupType>Pooled Investment Fund</industryGroupType><investmentFundInfo><investmentFundType>Venture Capital Fund</investmentFundType></investmentFundInfo>').replace('<totalOfferingAmount>12000000</totalOfferingAmount>', '<totalOfferingAmount>Indefinite</totalOfferingAmount>')

describe('Form D details', () => {
  it('reads company, industry, amounts, state and first sale', () => {
    const d = parseFormD(FORMD)!
    expect(d).toMatchObject({ company: 'ACME ROBOTICS INC', industry: 'Other Technology', isFund: false, offeringTotal: 12000000, amountSold: 9500000, state: 'MA', firstSaleOn: '2026-10-15', isAmendment: false })
  })
  it('flags venture funds and handles "Indefinite"', () => {
    const d = parseFormD(FUND)!
    expect(d.isFund).toBe(true)
    expect(d.fundType).toBe('Venture Capital Fund')
    expect(d.offeringTotal).toBeNull()
  })
  it('formats amounts', () => {
    expect(formatUsd(9500000)).toBe('$9.5M')
    expect(formatUsd(250000000)).toBe('$250M')
    expect(formatUsd(1200000000)).toBe('$1.2B')
  })
})
