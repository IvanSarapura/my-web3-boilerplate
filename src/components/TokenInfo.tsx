'use client';

import { useReadContract, useAccount } from 'wagmi';
import { erc20Abi } from '@/abi/erc20';
import { getSupportedChainNames } from '@/config/chains';
import { getUsdcAddress } from '@/config/contracts';
import styles from './TokenInfo.module.css';

/**
 * Ejemplo de cómo leer datos de un smart contract usando useReadContract.
 *
 * Este componente lee el nombre y símbolo de un token ERC-20.
 * Para adaptarlo a tu propio contrato:
 * 1. Creá tu ABI en src/abi/ (ver src/abi/erc20.ts como referencia).
 * 2. Cambiá el `address` por la dirección de tu contrato.
 * 3. Cambiá el `abi` por el que creaste.
 * 4. Cambiá `functionName` por la función que querés llamar.
 */

export function TokenInfo() {
  const { isConnected, chain } = useAccount();

  const contractAddress =
    chain?.id !== undefined ? getUsdcAddress(chain.id) : undefined;
  const isSupported = !!contractAddress;

  const { data: name, isLoading: nameLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'name',
    query: { enabled: isConnected && isSupported },
  });

  const { data: symbol, isLoading: symbolLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    query: { enabled: isConnected && isSupported },
  });

  const { data: decimals, isLoading: decimalsLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: isConnected && isSupported },
  });

  if (!isConnected) return null;

  if (!isSupported) {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Token Info (ejemplo)</h2>
        <p className={styles.hint}>
          Cambiá a una de estas redes para ver este ejemplo de lectura de
          contrato: {getSupportedChainNames()}.
        </p>
      </div>
    );
  }

  const isLoading = nameLoading || symbolLoading || decimalsLoading;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Token Info (ejemplo)</h2>
      {isLoading ? (
        <p className={styles.hint}>Leyendo contrato...</p>
      ) : (
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <span className={styles.label}>Nombre:</span>
            <span className={styles.value}>{name}</span>
          </li>
          <li className={styles.listItem}>
            <span className={styles.label}>Símbolo:</span>
            <span className={styles.value}>{symbol}</span>
          </li>
          <li className={styles.listItem}>
            <span className={styles.label}>Decimales:</span>
            <span className={styles.value}>{decimals?.toString()}</span>
          </li>
          <li className={styles.listItem}>
            <span className={styles.label}>Contrato:</span>
            <span className={`${styles.value} ${styles.mono}`}>
              {contractAddress}
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}
