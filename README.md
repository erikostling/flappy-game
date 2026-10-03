# Flappy Game

Flyg genom tio världar, samla saker och blå mynt, köp nya figurer och ta dig in på topplistan.

Byggt med Next.js. Själva spelet är en canvas som ritas av `public/game.js`. Topplistan sparas i Supabase via `/api/scores`.

## Köra lokalt

```bash
pnpm install
pnpm dev
```

Öppna http://localhost:3000.

Topplistan behöver Supabase: kopiera `.env.example` till `.env.local` och fyll i projektets värden. Utan dem fungerar allt utom topplistan, som då visar att den inte går att hämta.

## Struktur

| Sökväg | Vad |
|---|---|
| `app/page.tsx` | Sidan: canvasen och rutan för namn på topplistan |
| `app/layout.tsx` | Typsnitt (next/font), titel och viewport |
| `app/globals.css` | Spelets layout och stil |
| `app/api/scores/route.ts` | API för topplistan: `GET` ger de tio bästa, `POST` sparar ett resultat |
| `lib/supabase.ts` | Supabase-klienten |
| `public/game.js` | Spelet |
| `public/musik/`, `public/ljud/` | Musik och ljudeffekter (gjorda med ElevenLabs) |
| `supabase/migrations/` | Tabellen och funktionen för topplistan |

## Topplistan

`GET /api/scores` svarar `{ entries: [{ name, score, figure, at }] }`, de tio bästa.

`POST /api/scores` tar `{ name, score, figure }` och svarar med den nya listan.

Ett namn står bara en gång på listan, med sitt bästa resultat. "Erik" och "erik" räknas som samma namn.

I Supabase (projektet "Flappy game"):
- Tabellen `scores` får alla läsa.
- Ingen kan skriva direkt i tabellen. Resultat sparas med funktionen `submit_score`. Den snyggar till namnet, räknar själv fram vilka namn som är samma, kontrollerar värdena och skriver bara över ett sämre resultat.
- Därför räcker den publika nyckeln. Ingen hemlig nyckel behövs.
- Supabase varnar för att vem som helst kan anropa `submit_score`. Det är avsiktligt: det är samma sak som spelets eget API tillåter.

API:t svarar 503 om nycklarna saknas och 502 om Supabase inte svarar. Då visar spelet att listan inte går att hämta, och ingen kan skriva in sig.

## Deploy på Vercel

1. Importera repot i Vercel. Next.js och pnpm känns igen av sig själva.
2. Lägg in miljövariablerna under Settings → Environment Variables:
   - `SUPABASE_URL`: projektets URL, `https://<projekt-id>.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY`: projektets publika nyckel, `sb_publishable_...`
3. Deploya.
