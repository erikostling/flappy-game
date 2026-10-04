-- Climbing Games topplista: höjden i meter, ett namn per rad med sitt bästa resultat.
-- Samma form som scores, men alla rader har en ägare från början.
--
-- Ett namn hör till den enhet som tog det först, i vilket av spelen som helst.
-- name_taken frågar båda listorna, och både submit_score och submit_climbing_score
-- frågar den, så att ingen kan ta någon annans namn genom att spela det andra spelet.

create table public.climbing_scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 12),
  name_key text not null unique check (char_length(name_key) between 1 and 12),
  score integer not null check (score between 1 and 9999),
  figure text not null check (figure ~ '^[a-z]{1,20}$'),
  owner text not null check (owner ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index climbing_scores_rank_idx on public.climbing_scores (score desc, created_at asc);
create index climbing_scores_owner_idx on public.climbing_scores (owner);

alter table public.climbing_scores enable row level security;

create policy "Alla kan läsa topplistan"
  on public.climbing_scores for select
  to anon, authenticated
  using (true);

-- Sant om namnet hör till en annan enhet i något av spelen. Ett namn utan ägare, från
-- innan namnen fick ägare, är upptaget tills claim_name har gett det en.
-- Bara för funktionerna nedan; ingen utifrån kan anropa den.
create function public.name_taken(p_name_key text, p_owner text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from public.scores where name_key = p_name_key and owner is distinct from p_owner)
      or exists (select 1 from public.climbing_scores where name_key = p_name_key and owner is distinct from p_owner);
$$;

revoke execute on function public.name_taken(text, text) from public, anon, authenticated;

-- Som förut, men ett namn som en annan enhet har i Climbing Game är också upptaget.
create or replace function public.submit_score(p_name text, p_score integer, p_figure text, p_owner text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(btrim(p_name), '\s+', ' ', 'g');
  v_row public.scores%rowtype;
begin
  if public.name_taken(lower(v_name), p_owner) then
    return 'taken';
  end if;
  select * into v_row from public.scores where name_key = lower(v_name) for update;
  if not found then
    insert into public.scores (name, name_key, score, figure, owner)
    values (v_name, lower(v_name), p_score, p_figure, p_owner);
    return 'saved';
  end if;
  if p_score > v_row.score then
    update public.scores set name = v_name, score = p_score, figure = p_figure, created_at = now()
    where id = v_row.id;
    return 'saved';
  end if;
  return 'kept';
end;
$$;

-- Svarar 'saved' (sparat), 'kept' (ett bättre resultat fanns redan) eller 'taken'
-- (namnet hör till en annan enhet), som submit_score.
create function public.submit_climbing_score(p_name text, p_score integer, p_figure text, p_owner text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(btrim(p_name), '\s+', ' ', 'g');
  v_row public.climbing_scores%rowtype;
begin
  if public.name_taken(lower(v_name), p_owner) then
    return 'taken';
  end if;
  select * into v_row from public.climbing_scores where name_key = lower(v_name) for update;
  if not found then
    insert into public.climbing_scores (name, name_key, score, figure, owner)
    values (v_name, lower(v_name), p_score, p_figure, p_owner);
    return 'saved';
  end if;
  if p_score > v_row.score then
    update public.climbing_scores set name = v_name, score = p_score, figure = p_figure, created_at = now()
    where id = v_row.id;
    return 'saved';
  end if;
  return 'kept';
end;
$$;

-- Medvetet körbar för anon, som submit_score: /api/climbing/scores använder den
-- publika nyckeln, och funktionen är det enda sättet att skriva i tabellen.
revoke execute on function public.submit_climbing_score(text, integer, text, text) from public;
grant execute on function public.submit_climbing_score(text, integer, text, text) to anon, authenticated, service_role;
