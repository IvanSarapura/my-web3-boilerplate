import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { env } from './env';
import { supportedChains } from './chains';
import { buildTransportsForChains } from './rpc';

/**
 * Transports: cómo tu DApp se comunica con la blockchain.
 *
 * - Sin API key → `http()` usa RPCs públicos (OK para desarrollo).
 * - Con Infura → ver `src/config/rpc.ts` (mapa por chain id).
 *
 * Redes soportadas y direcciones de contratos:
 * - `NEXT_PUBLIC_CHAIN_PROFILE` → `src/config/chain-definitions.ts`
 * - Contratos por chain → `src/config/contracts.ts`
 *
 * Si usás Alchemy u otro proveedor, ajustá `buildTransportsForChains` o las URLs en `rpc.ts`.
 */
const transports = buildTransportsForChains(supportedChains, env.infuraApiKey);

export const config = getDefaultConfig({
  appName: env.appName,
  projectId: env.walletConnectProjectId,
  chains: supportedChains,
  transports,
  ssr: true,
});
