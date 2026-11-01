# VC Brief

Venture, deeptech and markets, explained and sourced. A 7:45 brief, an 18:00 recap, one lesson a day.
Every factual sentence links to its source; the database refuses to publish a story with an unsourced claim.

Product spec: the "VC Brief app — Product spec" doc in Claude.

## What's here (milestone 1)

| Part | Where | Status |
| --- | --- | --- |
| App screens (PWA, offline reading) | `src/app` | Built with sample data |
| Database schema + publish guard | `supabase/migrations/0001_init.sql` | Tested |
| Source registry | `workers/sources.ts` | Feeds marked `verify: true` to check in week 1 |
| Feed collector (RSS, Atom, arXiv, SEC) | `workers/collect.ts`, `workers/parse.ts` | Tested on sample feeds |
| Collector schedule | `.github/workflows/collect.yml` | Every 30 min once secrets are set |

Next: milestone 2 — triage, writing and verification with the Claude API.

## Setup (one time)

1. **Supabase** → New project (region: EU, e.g. Frankfurt or Paris).
   - SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.
   - Authentication → Providers → keep **Email** on (magic link).
   - Project Settings → API: copy the **Project URL**, the **anon key** and the **service_role key**.
2. **GitHub** → this repo → Settings → Secrets and variables → Actions → add:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_EMAIL` (sent to feeds as a polite contact).
   - Then Actions → "Collect feeds" → Run workflow.
3. **Vercel** → Add New Project → import `vc-brief` → Deploy. Later add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Anthropic Console** (milestone 2): create an API key, set a monthly spend limit, add it as `ANTHROPIC_API_KEY` in GitHub secrets.

Never commit keys. `.env*` files are ignored by git.

## Run locally

```bash
npm install
npm run dev        # app on http://localhost:3000
npm test           # parser tests
npm run collect -- --dry   # fetch feeds without writing
```

## Install on your phone

Open the Vercel link in Safari (iPhone) or Chrome (Android) → Share → **Add to Home Screen**.
Push notifications on iPhone only work once the app is on the Home Screen.
