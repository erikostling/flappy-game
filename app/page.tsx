import { versioned } from '@/lib/versioned';
import styles from './page.module.css';

// Första sidan: spelen att välja mellan, i ett rutnät med två i bredd. Där ett spel
// saknas för att fylla rutnätet står det att ett kommer snart. Varje spel är en egen
// sida. Länken laddar spelets sida på nytt, så att ett spel börjar från början varje
// gång och slutar spela musik när man går därifrån. Ett spel som inte är öppet för alla än (`soon`)
// får ett kort som säger att det kommer snart; länken fungerar ändå. Bildernas adresser
// bär en hash av filen, så att alla ser den senaste bilden.
const GAMES: { href: string; name: string; text: string; image: string; soon?: boolean }[] = [
  {
    href: '/flappy',
    name: 'Flappy Game',
    text: 'Flyg genom 24 världar, samla blå mynt och köp nya figurer.',
    image: versioned('spel/flappy-game.png'),
  },
  {
    href: '/climbing',
    name: 'Climbing Game',
    text: 'Klättra uppför tegelväggen så högt du kan.',
    image: versioned('spel/climbing-game.png'),
  },
  {
    href: '/car',
    name: 'Car Game',
    text: 'Kör ett varv på racerbanan så fort du kan.',
    image: versioned('spel/car-game.png'),
  },
];

// Rutnätet har minst fyra platser och fylls till jämnt antal, så att raderna blir hela.
const SLOTS = Math.max(4, Math.ceil(GAMES.length / 2) * 2);

export default function Home() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Välj ett spel</h1>
      <ul className={styles.games}>
        {GAMES.map(game => (
          <li key={game.href}>
            <a className={styles.card} href={game.href}>
              <img className={styles.image} src={game.image} alt="" width={512} height={512} />
              <span className={styles.name}>{game.name}</span>
              <span className={styles.text}>{game.text}</span>
              <span className={game.soon ? `${styles.play} ${styles.soon}` : styles.play}>{game.soon ? 'Kommer snart' : 'Spela'}</span>
            </a>
          </li>
        ))}
        {Array.from({ length: SLOTS - GAMES.length }, (_, i) => (
          <li key={`snart-${i}`}>
            <div className={`${styles.card} ${styles.empty}`}>
              <span className={styles.mystery} aria-hidden="true">?</span>
              <span className={styles.name}>Kommer snart</span>
              <span className={styles.text}>Ett nytt spel är på väg.</span>
              <span className={`${styles.play} ${styles.soon}`}>Kommer snart</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
