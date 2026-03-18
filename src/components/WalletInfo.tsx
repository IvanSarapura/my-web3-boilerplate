'use client';

import { useAccount, useBalance } from 'wagmi';
import styles from './WalletInfo.module.css';

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!isConnected) {
    return (
      <p className={styles.status}>
        Ninguna wallet conectada. Hacé clic en &quot;Connect Wallet&quot; para
        empezar.
      </p>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Wallet conectada</h2>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <span className={styles.label}>Dirección:</span>
          <span className={`${styles.value} ${styles.mono}`}>{address}</span>
        </li>
        <li className={styles.listItem}>
          <span className={styles.label}>Red:</span>
          <span className={styles.value}>{chain?.name ?? 'Desconocida'}</span>
        </li>
        <li className={styles.listItem}>
          <span className={styles.label}>Balance:</span>
          <span className={styles.value}>
            {balance
              ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
              : 'Cargando...'}
          </span>
        </li>
      </ul>
    </div>
  );
}
