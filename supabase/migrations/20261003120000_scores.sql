-- Topplistan: ett namn per rad med sitt bästa resultat.
-- Alla får läsa listan. Ingen skriver direkt i tabellen; resultat sparas med
-- submit_score, som kontrollerar värdena och bara skriver över ett sämre resultat.

create table public.scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 12),
  -- namnet i gemener, satt av /api/scores, så att "Erik" och "erik" blir samma rad
  name_key text not null unique check (char_length(name_key) between 1 and 12),
  score integer not null check (score between 1 and 9999),
  figure text not null check (figure ~ '^[a-z]{1,20}$'),
  created_at timestamptz not null default now()
);

create index scores_rank_idx on public.scores (score desc, created_at asc);

alter table public.scores enable row level security;

create policy "Alla kan läsa topplistan"
  on public.scores for select
  to anon, authenticated
  using (true);

create function public.submit_score(p_name text, p_name_key text, p_score integer, p_figure text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.scores (name, name_key, score, figure)
  values (p_name, p_name_key, p_score, p_figure)
  on conflict (name_key) do update
    set name = excluded.name, score = excluded.score, figure = excluded.figure, created_at = now()
    where public.scores.score < excluded.score;
$$;

revoke execute on function public.submit_score(text, text, integer, text) from public;
grant execute on function public.submit_score(text, text, integer, text) to anon, authenticated, service_role;
