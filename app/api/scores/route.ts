import { FLAPPY, getBoard, postScore } from '@/lib/scores';

// Flappy Games topplista.
//   GET  → { entries, mine }: de tio bästa, ett namn per rad, och vilka namn som hör
//        till enheten i x-player-key.
//   POST { name, score, figure } → { entries, mine }: sparar resultatet om det är
//        namnets bästa. Ett namn hör till den enhet som tog det först; för andra
//        svarar den 409.
// Svarar 503 när Supabase inte är kopplad och 502 när databasen inte svarar.

export const dynamic = 'force-dynamic';

export const GET = (request: Request) => getBoard(request, FLAPPY);
export const POST = (request: Request) => postScore(request, FLAPPY);
