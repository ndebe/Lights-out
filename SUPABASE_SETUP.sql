-- Run this in the Supabase SQL editor after creating your project

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  best_time_ms integer not null,
  average_time_ms integer,
  attempts integer not null default 1,
  false_starts integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.scores
  add constraint best_time_reasonable check (best_time_ms >= 100 and best_time_ms <= 2000);

alter table public.scores
  add constraint attempts_positive check (attempts > 0);

alter table public.scores
  add constraint false_starts_non_negative check (false_starts >= 0);

create index scores_best_time_idx
  on public.scores (best_time_ms asc, false_starts asc, created_at asc);

-- Row Level Security: public read + insert, no auth needed for show-and-tell
alter table public.scores enable row level security;

create policy "Public read" on public.scores for select using (true);
create policy "Public insert" on public.scores for insert with check (true);

-- Enable Realtime for live leaderboard
-- In Supabase dashboard: Database → Replication → enable "scores" table
