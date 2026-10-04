import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Adressen till ett skript i public/ med en hash av filen, räknad när sidan byggs.
// Ändras skriptet ändras adressen, så att ingen webbläsare kör en gammal version ur
// sin cache.
export function scriptUrl(file: string) {
  const hash = createHash('sha256').update(readFileSync(join(process.cwd(), 'public', file))).digest('hex').slice(0, 12);
  return `/${file}?v=${hash}`;
}
