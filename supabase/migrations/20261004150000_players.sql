-- Spelarna: varje enhet väljer ett namn första gången den spelar, och kan aldrig byta
-- det. Namnet gäller i båda spelen, och resultat sparas bara under det.
--
-- Ingen läser tabellen direkt: claim_player tar ett namn eller säger vilket enheten
-- redan har, och submit_score och submit_climbing_score vägrar ett annat namn.

create table public.players (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 12),
  name_key text not null unique check (char_length(name_key) between 1 and 12),
  owner text not null unique check (owner ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

alter table public.players enable row level security;

-- Ett namn som en annan enhet har valt är upptaget, också innan den har sparat något.
create or replace function public.name_taken(p_name_key text, p_owner text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from public.scores where name_key = p_name_key and owner is distinct from p_owner)
      or exists (select 1 from public.climbing_scores where name_key = p_name_key and owner is distinct from p_owner)
      or exists (select 1 from public.players where name_key = p_name_key and owner <> p_owner);
$$;

revoke execute on function public.name_taken(text, text) from public, anon, authenticated;

-- Svarar 'mine:<namn>' med enhetens namn: det den redan har, eller p_name om det var
-- ledigt och enheten inte hade något. Annars 'taken' (namnet hör till en annan enhet)
-- eller 'invalid' (inget namn att ta). Med ett tomt p_name säger den bara vilket namn
-- enheten har.
create function public.claim_player(p_name text, p_owner text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_mine public.players%rowtype;
begin
  select * into v_mine from public.players where owner = p_owner;
  if found then
    return 'mine:' || v_mine.name;
  end if;
  if char_length(v_name) not between 1 and 12 then
    return 'invalid';
  end if;
  if public.name_taken(lower(v_name), p_owner) then
    return 'taken';
  end if;
  insert into public.players (name, name_key, owner) values (v_name, lower(v_name), p_owner);
  return 'mine:' || v_name;
exception when unique_violation then
  return 'taken';
end;
$$;

-- Medvetet körbar för anon, som submit_score: /api/player använder den publika nyckeln.
revoke execute on function public.claim_player(text, text) from public;
grant execute on function public.claim_player(text, text) to anon, authenticated, service_role;

-- Som förut, men en enhet som har valt ett namn kan bara spara under det.
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
  if public.name_taken(lower(v_name), p_owner)
     or exists (select 1 from public.players where owner = p_owner and name_key <> lower(v_name)) then
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

create or replace function public.submit_climbing_score(p_name text, p_score integer, p_figure text, p_owner text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(btrim(p_name), '\s+', ' ', 'g');
  v_row public.climbing_scores%rowtype;
begin
  if public.name_taken(lower(v_name), p_owner)
     or exists (select 1 from public.players where owner = p_owner and name_key <> lower(v_name)) then
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
