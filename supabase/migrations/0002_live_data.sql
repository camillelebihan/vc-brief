-- VC Brief — live data without AI
-- 1) Deal details read from SEC Form D filings
-- 2) Public read access to headlines, sources and deals (public news, no personal data),
--    so the app can use the publishable "anon" key instead of the secret key.

alter table deals add column if not exists item_id uuid unique references items(id) on delete cascade;
alter table deals add column if not exists filing_url text;
alter table deals add column if not exists industry text;
alter table deals add column if not exists fund_type text;          -- e.g. 'Venture Capital Fund' when a fund is raising
alter table deals add column if not exists is_fund boolean not null default false;
alter table deals add column if not exists offering_total numeric;  -- target size; null when "Indefinite"
alter table deals add column if not exists state text;              -- US state or country code from the filing
alter table deals add column if not exists first_sale_on date;

create index if not exists deals_announced_idx on deals (announced_on desc);
create index if not exists items_source_published_idx on items (source_id, published_at desc);

-- Public read: headlines (title, link, date) and deals. Writes stay server-only.
create policy "public read items" on items for select to anon, authenticated using (true);
create policy "public read sources" on sources for select to anon, authenticated using (true);
drop policy if exists "read deals" on deals;
create policy "public read deals" on deals for select to anon, authenticated using (true);
