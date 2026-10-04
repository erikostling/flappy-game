import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Adressen till en fil i public/ med en hash av filen, räknad när sidan byggs.
// Ändras filen ändras adressen, så att ingen webbläsare visar eller kör en gammal
// version ur sin cache. `file` är sökvägen under public/, utan snedstreck först.
export function versioned(file: string) {
  const hash = createHash('sha256').update(readFileSync(join(process.cwd(), 'public', file))).digest('hex').slice(0, 12);
  return `/${file}?v=${hash}`;
}
