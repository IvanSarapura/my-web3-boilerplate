import type { Chain } from 'viem/chains';

/** URL base del explorador de bloques (metadata de la chain en viem/wagmi). */
export function getBlockExplorerBaseUrl(
  chain: Chain | undefined,
): string | undefined {
  return chain?.blockExplorers?.default?.url;
}

export function getExplorerAddressUrl(
  chain: Chain | undefined,
  address: string,
): string | undefined {
  const base = getBlockExplorerBaseUrl(chain);
  if (!base) return undefined;
  return `${base}/address/${address}`;
}

export function getExplorerTxUrl(
  chain: Chain | undefined,
  txHash: `0x${string}`,
): string | undefined {
  const base = getBlockExplorerBaseUrl(chain);
  if (!base) return undefined;
  return `${base}/tx/${txHash}`;
}
