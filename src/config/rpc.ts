import type { Transport } from 'viem';
import { http } from 'wagmi';
import type { Chain } from 'viem/chains';
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  avalanche,
  avalancheFuji,
} from 'wagmi/chains';

/**
 * URLs HTTP de Infura por chain id. Si usás otro proveedor (Alchemy, etc.),
 * reemplazá la entrada correspondiente o añadí lógica por variable de entorno.
 */
const infuraHttpUrlByChainId: Record<number, (apiKey: string) => string> = {
  [mainnet.id]: (k) => `https://mainnet.infura.io/v3/${k}`,
  [sepolia.id]: (k) => `https://sepolia.infura.io/v3/${k}`,
  [base.id]: (k) => `https://base-mainnet.infura.io/v3/${k}`,
  [baseSepolia.id]: (k) => `https://base-sepolia.infura.io/v3/${k}`,
  [avalanche.id]: (k) => `https://avalanche-mainnet.infura.io/v3/${k}`,
  [avalancheFuji.id]: (k) => `https://avalanche-fuji.infura.io/v3/${k}`,
};

export function buildTransportsForChains(
  chains: readonly Chain[],
  infuraApiKey: string | undefined,
): Record<number, Transport> {
  const out: Record<number, Transport> = {};

  for (const chain of chains) {
    const buildUrl = infuraHttpUrlByChainId[chain.id];
    if (infuraApiKey?.trim() && buildUrl) {
      out[chain.id] = http(buildUrl(infuraApiKey.trim()));
    } else {
      out[chain.id] = http();
    }
  }

  return out;
}
