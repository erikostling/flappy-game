# Flappy Game

Flyg genom tio världar, samla saker och blå mynt, köp nya figurer och ta dig in på topplistan.

Byggt med Next.js. Första sidan är en spelväljare. Flappy Game ligger på `/flappy` och Climbing Game på `/climbing`. Varje spel är en canvas som ritas av ett eget skript: `public/game.js` och `public/climbing.js`. Topplistan sparas i Supabase via `/api/scores`.

## Köra lokalt

```bash
pnpm install
pnpm dev
```

Öppna http://localhost:3000. Där väljer du spel, och Flappy Game finns på http://localhost:3000/flappy.

Topplistan behöver Supabase: kopiera `.env.example` till `.env.local` och fyll i projektets värden. Utan dem fungerar allt utom topplistan, som då visar att den inte går att hämta.

## Struktur

| Sökväg | Vad |
|---|---|
| `app/page.tsx`, `app/page.module.css` | Spelväljaren: ett kort per spel |
| `app/flappy/page.tsx` | Flappy Game: canvasen och rutan för namn på topplistan |
| `app/climbing/page.tsx`, `public/climbing.js` | Climbing Game: en figur klättrar uppför en tegelvägg och väjer för det som faller. Figurerna är Flappy Games, ritade som klättrare, och man klättrar med dem man har där. Rekordet sparas på enheten |
| `app/layout.tsx` | Typsnitt (next/font), titel och viewport |
| `app/globals.css` | Gemensamma färger och typsnitt, och spelets layout och stil |
| `public/spel/` | Bilderna på korten i spelväljaren |
| `app/api/scores/route.ts` | API för topplistan: `GET` ger de tio bästa, `POST` sparar ett resultat |
| `app/api/scores/claim/route.ts` | Kopplar ett namn från innan namnen fick ägare till enheten |
| `lib/scores.ts` | Det API-vägarna delar: listan, enhetens nyckel |
| `lib/supabase.ts` | Supabase-klienten |
| `public/game.js` | Spelet |
| `public/musik/`, `public/ljud/` | Musik och ljudeffekter (gjorda med ElevenLabs) |
| `supabase/migrations/` | Tabellen och funktionen för topplistan |

## Topplistan

`GET /api/scores` svarar `{ entries: [{ name, score, figure, at }], mine }`. `entries` är de tio bästa, och `mine` är namnen som hör till den här enheten.

`POST /api/scores` tar `{ name, score, figure }` och svarar på samma sätt.

`POST /api/scores/claim` tar `{ name }` och kopplar ett namn som sparades innan namnen fick ägare till enheten.

Ett namn står bara en gång på listan, med sitt bästa resultat. "Erik" och "erik" räknas som samma namn.

Ett namn hör till den enhet som tog det först:
- Spelet skickar en slumpad nyckel i `x-player-key`, och databasen sparar bara en hash av den.
- Med ett namn som hör till någon annan svarar `POST` 409.
- Namn från innan nycklarna fanns tas av den enhet som har namnet sparat hos sig, när spelet startar där.

Guldpersonen är en gåva till Wilhelm. Den går inte att köpa och syns bara på enheten som äger namnet Wilhelm.

I Supabase (projektet "Flappy game"):
- Tabellen `scores` får alla läsa.
- Ingen kan skriva direkt i tabellen. Resultat sparas med funktionen `submit_score`. Den snyggar till namnet, räknar själv fram vilka namn som är samma, kontrollerar värdena och ägaren, och skriver bara över ett sämre resultat. Namn utan ägare tas med `claim_name`.
- Därför räcker den publika nyckeln. Ingen hemlig nyckel behövs.
- Supabase varnar för att vem som helst kan anropa `submit_score` och `claim_name`. Det är avsiktligt: den publika nyckeln finns bara på servern, och funktionerna tillåter inget mer än spelets eget API.

API:t svarar 503 om nycklarna saknas och 502 om Supabase inte svarar. Då visar spelet att listan inte går att hämta, och ingen kan skriva in sig.

## Deploy på Vercel

1. Importera repot i Vercel. Next.js och pnpm känns igen av sig själva.
2. Lägg in miljövariablerna under Settings → Environment Variables:
   - `SUPABASE_URL`: projektets URL, `https://<projekt-id>.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY`: projektets publika nyckel, `sb_publishable_...`
3. Deploya.
