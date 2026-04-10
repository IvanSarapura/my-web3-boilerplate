import type { Chain } from 'viem/chains';
import { env } from './env';
import { getChainsForProfile } from './chain-definitions';

export {
  getBlockExplorerBaseUrl,
  getExplorerAddressUrl,
  getExplorerTxUrl,
} from './explorer';

/** Cadenas activas según `NEXT_PUBLIC_CHAIN_PROFILE` y el resto de env. */
export const supportedChains: [Chain, ...Chain[]] = getChainsForProfile(
  env.chainProfile,
);

export function getSupportedChainNames(): string {
  return supportedChains.map((c) => c.name).join(', ');
}
