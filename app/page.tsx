import styles from './page.module.css';

// Första sidan: spelen att välja mellan. Varje spel är en egen sida. Länken laddar
// spelets sida på nytt, så att ett spel börjar från början varje gång och slutar
// spela musik när man går därifrån.
const GAMES = [
  {
    href: '/flappy',
    name: 'Flappy Game',
    text: 'Flyg genom tio världar, samla blå mynt och köp nya figurer.',
    image: '/spel/flappy-game.png',
  },
];

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
              <span className={styles.play}>Spela</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
