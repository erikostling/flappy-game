-- Car Games topplista: tiden för ett varv i hundradels sekunder, och lägst är bäst.
-- Ett namn per rad med sitt snabbaste varv. Samma form som de andra listorna, och ett
-- namn hör till samma enhet i alla spelen.

create table public.car_scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 12),
  name_key text not null unique check (char_length(name_key) between 1 and 12),
  score integer not null check (score between 1 and 999999),
  figure text not null check (figure ~ '^[a-z]{1,20}$'),
  owner text not null check (owner ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index car_scores_rank_idx on public.car_scores (score asc, created_at asc);
create index car_scores_owner_idx on public.car_scores (owner);

alter table public.car_scores enable row level security;

create policy "Alla kan läsa topplistan"
  on public.car_scores for select
  to anon, authenticated
  using (true);

-- Ett namn som en annan enhet har i Car Game är också upptaget.
create or replace function public.name_taken(p_name_key text, p_owner text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from public.scores where name_key = p_name_key and owner is distinct from p_owner)
      or exists (select 1 from public.climbing_scores where name_key = p_name_key and owner is distinct from p_owner)
      or exists (select 1 from public.car_scores where name_key = p_name_key and owner is distinct from p_owner)
      or exists (select 1 from public.players where name_key = p_name_key and owner <> p_owner);
$$;

revoke execute on function public.name_taken(text, text) from public, anon, authenticated;

-- Svarar 'saved' (sparat), 'kept' (ett snabbare varv fanns redan) eller 'taken' (namnet
-- hör till en annan enhet, eller är inte enhetens valda namn), som de andra.
create function public.submit_car_score(p_name text, p_score integer, p_figure text, p_owner text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(btrim(p_name), '\s+', ' ', 'g');
  v_row public.car_scores%rowtype;
begin
  if public.name_taken(lower(v_name), p_owner)
     or exists (select 1 from public.players where owner = p_owner and name_key <> lower(v_name)) then
    return 'taken';
  end if;
  select * into v_row from public.car_scores where name_key = lower(v_name) for update;
  if not found then
    insert into public.car_scores (name, name_key, score, figure, owner)
    values (v_name, lower(v_name), p_score, p_figure, p_owner);
    return 'saved';
  end if;
  if p_score < v_row.score then
    update public.car_scores set name = v_name, score = p_score, figure = p_figure, created_at = now()
    where id = v_row.id;
    return 'saved';
  end if;
  return 'kept';
end;
$$;

-- Medvetet körbar för anon, som de andra: /api/car/scores använder den publika nyckeln.
revoke execute on function public.submit_car_score(text, integer, text, text) from public;
grant execute on function public.submit_car_score(text, integer, text, text) to anon, authenticated, service_role;
