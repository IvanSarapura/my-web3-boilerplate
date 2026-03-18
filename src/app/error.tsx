'use client';

import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="main">
      <div className={styles.container}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>{error.message}</p>
        <button className={styles.action} onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
