-- Koden med ägare är ute, så den gamla submit_score utan ägare behövs inte längre.
drop function public.submit_score(text, integer, text);
