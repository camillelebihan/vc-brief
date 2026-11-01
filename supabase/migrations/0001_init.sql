-- VC Brief — initial schema
-- Rule enforced here: a story cannot be published unless every claim has a source.

-- gen_random_uuid() is built into Postgres 13+

-- ---------- Sources ----------
create type source_tier as enum ('primary', 'signal');
create type access_method as enum ('rss', 'api', 'page', 'newsletter', 'manual');

create table sources (
  id            text primary key,              -- e.g. 'maddyness', 'sec-edgar'
  name          text not null,
  homepage      text not null,
  tier          source_tier not null,
  access        access_method not null,
  feed_url      text,
  region        text,                          -- 'FR', 'EU', 'US', 'GLOBAL'
  sectors       text[] not null default '{}',
  is_press      boolean not null default false, -- press publisher → link + own words only
  allow_fulltext_llm boolean not null default false, -- false for press (TDM opt-outs)
  active        boolean not null default true,
  last_ok_at    timestamptz,
  last_error    text,
  created_at    timestamptz not null default now()
);

-- ---------- Raw items collected from sources ----------
create table items (
  id            uuid primary key default gen_random_uuid(),
  source_id     text not null references sources(id),
  url           text not null,
  url_hash      text not null unique,          -- dedupe key
  title         text not null,
  description   text,                          -- publisher-provided excerpt only
  author        text,
  published_at  timestamptz,
  fetched_at    timestamptz not null default now(),
  raw           jsonb
);
create index items_published_idx on items (published_at desc);

-- ---------- Stories (clusters of items about one event) ----------
create type story_status as enum ('draft', 'needs_review', 'published', 'rejected');
create type story_slot as enum ('must_know', 'quick_hit', 'niche_find', 'your_topic', 'evening', 'weekly');

create table stories (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique,
  headline        text not null,
  brief           text,                        -- layer 1 (30 s)
  understand      jsonb,                       -- layer 2: {what, why_it_matters, analogy, not_proven, key_numbers[]}
  visual_card     jsonb,                       -- structured data for the evidence card
  perspectives    jsonb,                       -- [{who, role, view, claim_ids[]}]
  sector          text,
  region          text,
  importance      int check (importance between 0 and 100),
  importance_note text,                        -- "would a VC partner bring it up?" answer
  status          story_status not null default 'draft',
  created_at      timestamptz not null default now(),
  published_at    timestamptz
);

create table story_items (
  story_id uuid references stories(id) on delete cascade,
  item_id  uuid references items(id) on delete cascade,
  primary key (story_id, item_id)
);

-- ---------- Citations: every factual sentence is a claim with a source ----------
create type claim_kind as enum ('fact', 'quote', 'number', 'analogy', 'definition', 'transition', 'analysis');

create table citations (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  title       text not null,
  publisher   text not null,
  source_id   text references sources(id),
  published_at timestamptz,
  accessed_at timestamptz not null default now()
);

create table claims (
  id           uuid primary key default gen_random_uuid(),
  story_id     uuid references stories(id) on delete cascade,
  position     int not null,
  text         text not null,
  kind         claim_kind not null default 'fact',
  citation_id  uuid references citations(id),
  passage      text,                           -- exact supporting passage from the source
  verified     boolean not null default false,
  -- facts, quotes and numbers must carry a citation; analogies etc. must not pretend to
  constraint claim_sourced check (
    kind in ('analogy', 'definition', 'transition', 'analysis') or citation_id is not null
  )
);

-- A story can only be published when all its sourced claims are verified.
create function check_story_publishable() returns trigger language plpgsql as $$
begin
  if new.status = 'published' and exists (
    select 1 from claims c
    where c.story_id = new.id
      and c.kind in ('fact', 'quote', 'number')
      and (c.citation_id is null or c.verified = false)
  ) then
    raise exception 'Story % has unsourced or unverified claims', new.id;
  end if;
  return new;
end $$;

create trigger stories_publish_guard
  before update of status on stories
  for each row execute function check_story_publishable();

-- ---------- Editions ----------
create type edition_kind as enum ('morning', 'evening', 'weekly', 'friday_digest');

create table editions (
  id           uuid primary key default gen_random_uuid(),
  kind         edition_kind not null,
  edition_date date not null,
  published_at timestamptz,
  unique (kind, edition_date)
);

create table edition_stories (
  edition_id uuid references editions(id) on delete cascade,
  story_id   uuid references stories(id) on delete cascade,
  slot       story_slot not null,
  position   int not null,
  primary key (edition_id, story_id)
);

-- ---------- Deals ----------
create type deal_confidence as enum ('confirmed', 'single_report', 'conflicting');

create table deals (
  id            uuid primary key default gen_random_uuid(),
  story_id      uuid references stories(id) on delete set null,
  company       text not null,
  round         text,                          -- 'Seed', 'Series A', 'M&A', 'IPO'
  amount        numeric,
  currency      text,
  amount_usd    numeric,
  fx_date       date,
  lead_investors text[] not null default '{}',
  other_investors text[] not null default '{}',
  sector        text,
  country       text,
  announced_on  date,
  confidence    deal_confidence not null default 'single_report',
  citation_ids  uuid[] not null default '{}'
);

-- ---------- Glossary ----------
create table glossary_terms (
  id          uuid primary key default gen_random_uuid(),
  term        text not null unique,
  definition  text not null,
  example     text,
  approved    boolean not null default false,  -- you approve new terms in review
  created_at  timestamptz not null default now()
);

-- ---------- Learning tracks ----------
create table tracks (
  id     text primary key,                     -- 'vc-foundations'
  title  text not null,
  weeks  int not null default 4,
  position int not null
);

create table lessons (
  id         uuid primary key default gen_random_uuid(),
  track_id   text not null references tracks(id),
  number     int not null,                     -- 1..20
  title      text not null,
  week       int not null,
  body       jsonb,                            -- {concept, now, analogy, visual, sources}
  unique (track_id, number)
);

create table quiz_questions (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  uuid references lessons(id) on delete cascade,
  story_id   uuid references stories(id) on delete cascade,
  prompt     text not null,
  options    jsonb not null,                   -- [{id, text}]
  answer_id  text not null,
  explanation text not null
);

-- ---------- Users and activity ----------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  topics        text[] not null default '{}',  -- drives the "Your topic" section
  active_track  text references tracks(id),
  recall_format text not null default 'quiz' check (recall_format in ('quiz', 'flashcards', 'explain_back', 'off')),
  push_morning  boolean not null default true,
  push_evening  boolean not null default true,
  streak_days   int not null default 0,
  streak_freezes int not null default 1,
  last_active   date,
  created_at    timestamptz not null default now()
);

create table reads  (user_id uuid references profiles(id) on delete cascade, story_id uuid references stories(id) on delete cascade, read_at timestamptz not null default now(), primary key (user_id, story_id));
create table saves  (user_id uuid references profiles(id) on delete cascade, story_id uuid references stories(id) on delete cascade, saved_at timestamptz not null default now(), primary key (user_id, story_id));
create table likes  (user_id uuid references profiles(id) on delete cascade, story_id uuid references stories(id) on delete cascade, liked_at timestamptz not null default now(), primary key (user_id, story_id));
create table lesson_progress (user_id uuid references profiles(id) on delete cascade, lesson_id uuid references lessons(id) on delete cascade, done_at timestamptz not null default now(), primary key (user_id, lesson_id));

-- Spaced repetition: one row per user × question; interval grows when answered right.
create table reviews (
  user_id      uuid references profiles(id) on delete cascade,
  question_id  uuid references quiz_questions(id) on delete cascade,
  ease         real not null default 2.5,
  interval_days int not null default 1,
  due_on       date not null default current_date,
  correct_streak int not null default 0,
  primary key (user_id, question_id)
);

create table badges (
  user_id  uuid references profiles(id) on delete cascade,
  badge    text not null,                      -- 'streak-5', 'streak-30', 'weeks-5', 'track-vc-foundations', 'perfect-quiz'
  earned_at timestamptz not null default now(),
  primary key (user_id, badge)
);

create table ask_more_usage (
  user_id uuid references profiles(id) on delete cascade,
  day     date not null default current_date,
  count   int not null default 0,
  primary key (user_id, day)
);

create table error_reports (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete set null,
  story_id   uuid references stories(id) on delete cascade,
  claim_id   uuid references claims(id) on delete set null,
  note       text,
  status     text not null default 'open' check (status in ('open', 'fixed', 'dismissed')),
  created_at timestamptz not null default now()
);

create table story_feedback (           -- your thumbs up/down to tune the importance rubric
  user_id  uuid references profiles(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  vote     smallint not null check (vote in (-1, 1)),
  primary key (user_id, story_id)
);

-- ---------- Row-level security ----------
-- Content tables: readable by any signed-in user when published; written only by the server (service role).
alter table stories enable row level security;
alter table claims enable row level security;
alter table citations enable row level security;
alter table deals enable row level security;
alter table glossary_terms enable row level security;
alter table editions enable row level security;
alter table edition_stories enable row level security;
alter table tracks enable row level security;
alter table lessons enable row level security;
alter table quiz_questions enable row level security;

create policy "read published stories" on stories for select to authenticated using (status = 'published');
create policy "read claims of published" on claims for select to authenticated using (exists (select 1 from stories s where s.id = story_id and s.status = 'published'));
create policy "read citations" on citations for select to authenticated using (true);
create policy "read deals" on deals for select to authenticated using (true);
create policy "read approved glossary" on glossary_terms for select to authenticated using (approved);
create policy "read editions" on editions for select to authenticated using (published_at is not null);
create policy "read edition stories" on edition_stories for select to authenticated using (true);
create policy "read tracks" on tracks for select to authenticated using (true);
create policy "read lessons" on lessons for select to authenticated using (true);
create policy "read questions" on quiz_questions for select to authenticated using (true);

-- Personal tables: each user sees and edits only their own rows.
alter table profiles enable row level security;
create policy "own profile" on profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['reads','saves','likes','lesson_progress','reviews','badges','ask_more_usage','story_feedback'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "own rows" on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

alter table error_reports enable row level security;
create policy "file reports" on error_reports for insert to authenticated with check (user_id = auth.uid());
create policy "see own reports" on error_reports for select to authenticated using (user_id = auth.uid());

-- Sources and raw items stay server-only (no policies = no client access).
alter table sources enable row level security;
alter table items enable row level security;
alter table story_items enable row level security;

-- Create a profile automatically at first sign-in.
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
