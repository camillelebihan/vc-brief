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
