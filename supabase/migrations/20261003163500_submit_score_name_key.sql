-- submit_score tar bara namnet och räknar fram name_key själv, i stället för att lita
-- på den som anropar. Då kan samma namn inte hamna på två rader med olika name_key.
-- Namnet snyggas till som i spelet: blanksteg i början och slutet bort, flera blanksteg
-- i rad blir ett. "Erik" och "erik" blir samma rad, och lower() klarar å, ä och ö.

drop function public.submit_score(text, text, integer, text);

create function public.submit_score(p_name text, p_score integer, p_figure text)
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
    where public.scores.score < excluded.score;
$$;

comment on column public.scores.name_key is 'Namnet i gemener, satt av submit_score; ett namn per rad.';

-- Medvetet körbar för anon: /api/scores använder den publika nyckeln, och funktionen
-- är det enda sättet att skriva i tabellen. Supabase varnar för det (lint 0028 och 0029).
revoke execute on function public.submit_score(text, integer, text) from public;
grant execute on function public.submit_score(text, integer, text) to anon, authenticated, service_role;
