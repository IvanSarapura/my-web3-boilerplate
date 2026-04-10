import type { Chain } from 'viem/chains';
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  avalanche,
  avalancheFuji,
} from 'wagmi/chains';

/** Perfil de despliegue: qué conjunto de redes expone la DApp. */
export type ChainProfile = 'testnet' | 'mainnet';

/**
 * Cadenas de prueba usadas en desarrollo / preview / staging.
 * Mantener alineado con direcciones en `contracts.ts` y transports en `rpc.ts`.
 */
export const testnetChains = [sepolia, baseSepolia, avalancheFuji] as const;

/**
 * Cadenas principales para producción (cuando `NEXT_PUBLIC_CHAIN_PROFILE=mainnet`).
 */
export const mainnetChains = [mainnet, base, avalanche] as const;

export function getChainsForProfile(
  profile: ChainProfile,
): [Chain, ...Chain[]] {
  const list = profile === 'mainnet' ? mainnetChains : testnetChains;
  return [...list] as [Chain, ...Chain[]];
}
