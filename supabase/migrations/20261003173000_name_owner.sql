-- Ett namn på topplistan hör till den enhet som tog det först. /api/scores skickar en
-- hash av enhetens slumpade nyckel, och med en annan nyckel går det inte att skriva
-- med namnet. Rader från innan nycklarna fanns har ingen ägare. De tas med
-- claim_name av den enhet som sparade namnet hos sig, och ingen annan kan skriva
-- med dem så länge.

alter table public.scores add column owner text check (owner ~ '^[0-9a-f]{64}$');
create index scores_owner_idx on public.scores (owner);

-- Den gamla versionen utan ägare finns kvar tills den nya koden är ute, så att
-- sparandet fungerar under tiden. Den skriver aldrig över ett namn som har en ägare.
-- Nästa migrering tar bort den.
create or replace function public.submit_score(p_name text, p_score integer, p_figure text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.scores (name, name_key, score, figure)
  select cleaned.name, lower(cleaned.name), p_score, p_figure
  from (select regexp_replace(btrim(p_name), '\s+', ' ', 'g') as name) as cleaned
  on conflict (name_key) do update
    set name = excluded.name, score = excluded.score, figure = excluded.figure, created_at = now()
    where public.scores.score < excluded.score and public.scores.owner is null;
$$;

-- Svarar 'saved' (sparat), 'kept' (ett bättre resultat fanns redan) eller 'taken'
-- (namnet hör till en annan enhet).
create function public.submit_score(p_name text, p_score integer, p_figure text, p_owner text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(btrim(p_name), '\s+', ' ', 'g');
  v_row public.scores%rowtype;
begin
  select * into v_row from public.scores where name_key = lower(v_name) for update;
  if not found then
    insert into public.scores (name, name_key, score, figure, owner)
    values (v_name, lower(v_name), p_score, p_figure, p_owner);
    return 'saved';
  end if;
  if v_row.owner is distinct from p_owner then
    return 'taken';
  end if;
  if p_score > v_row.score then
    update public.scores set name = v_name, score = p_score, figure = p_figure, created_at = now()
    where id = v_row.id;
    return 'saved';
  end if;
  return 'kept';
end;
$$;

-- Tar ett namn utan ägare. Svarar sant om namnet nu hör till p_owner.
create function public.claim_name(p_name text, p_owner text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with cleaned as (select lower(regexp_replace(btrim(p_name), '\s+', ' ', 'g')) as name_key),
  claimed as (
    update public.scores s set owner = p_owner
    from cleaned
    where s.name_key = cleaned.name_key and s.owner is null
    returning s.id
  )
  select exists (select 1 from claimed)
      or exists (select 1 from public.scores s, cleaned where s.name_key = cleaned.name_key and s.owner = p_owner);
$$;

-- Medvetet körbara för anon, som submit_score förut: /api/scores använder den publika nyckeln.
revoke execute on function public.submit_score(text, integer, text, text) from public;
grant execute on function public.submit_score(text, integer, text, text) to anon, authenticated, service_role;
revoke execute on function public.claim_name(text, text) from public;
grant execute on function public.claim_name(text, text) to anon, authenticated, service_role;
