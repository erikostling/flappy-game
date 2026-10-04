import { CAR, getBoard, postScore } from '@/lib/scores';

// Car Games topplista: tiden för ett varv i hundradels sekunder, där lägst är bäst.
// Fungerar som de andra listorna:
//   GET  → { entries, mine }, snabbast först
//   POST { name, score, figure } → { entries, mine }, eller 409 när namnet hör till en
//        annan enhet, i något av spelen.
// Svarar 503 när Supabase inte är kopplad och 502 när databasen inte svarar.

export const dynamic = 'force-dynamic';

export const GET = (request: Request) => getBoard(request, CAR);
export const POST = (request: Request) => postScore(request, CAR);
