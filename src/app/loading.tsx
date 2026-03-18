import styles from './loading.module.css';

export default function Loading() {
  return (
    <main className="main">
      <div className={styles.spinner} aria-label="Loading" />
    </main>
  );
}
