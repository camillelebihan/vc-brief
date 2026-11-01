// Minimal robots.txt check for the "*" user agent and our own agent name.
const cache = new Map<string, string[]>()

export const USER_AGENT = `VCBriefBot/0.1 (personal news reader; ${process.env.CONTACT_EMAIL ?? 'contact via github.com/camillelebihan/vc-brief'})`

export function disallowedPaths(robots: string, agent = 'vcbriefbot'): string[] {
  const groups: { agents: string[]; rules: string[] }[] = []
  let current: { agents: string[]; rules: string[] } | null = null
  for (const rawLine of robots.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const [k, ...rest] = line.split(':')
    const key = k.trim().toLowerCase()
    const value = rest.join(':').trim()
    if (key === 'user-agent') {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
    } else if (key === 'disallow' && current) {
      current.rules.push(value)
    } else if (key === 'allow' && current) {
      current.rules.push('') // keeps group boundaries; allow lines are not needed for feeds
    }
  }
  const mine = groups.find((g) => g.agents.includes(agent))
  const star = groups.find((g) => g.agents.includes('*'))
  return (mine ?? star)?.rules.filter(Boolean) ?? []
}

export async function isAllowed(url: string): Promise<boolean> {
  const u = new URL(url)
  const key = u.origin
  if (!cache.has(key)) {
    try {
      const res = await fetch(`${u.origin}/robots.txt`, { headers: { 'User-Agent': USER_AGENT } })
      cache.set(key, res.ok ? disallowedPaths(await res.text()) : [])
    } catch {
      cache.set(key, [])
    }
  }
  const path = u.pathname + u.search
  return !cache.get(key)!.some((rule) => rule === '/' || path.startsWith(rule))
}
