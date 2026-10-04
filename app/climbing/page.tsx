import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Climbing Game',
  description: 'Klättra uppför tegelväggen så högt du kan.',
};

// Climbing Game: än så länge bara startskärmen; själva spelet är inte byggt.
export default function ClimbingGame() {
  return (
    <main className={styles.screen}>
      <a className={styles.back} href="/">← Spel</a>
      <h1 className={styles.title}>Climbing Game</h1>
      <img className={styles.hero} src="/spel/climbing-game.png" alt="Apan från Flappy Game på en tegelvägg" width={512} height={512} />
      <p className={styles.tagline}>Klättra uppför tegelväggen så högt du kan.</p>
      <button className={styles.start} type="button" disabled>Kommer snart</button>
    </main>
  );
}
