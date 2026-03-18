import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { env } from './env';

/**
 * Transports: cómo tu DApp se comunica con la blockchain.
 *
 * - Sin API key → http() usa RPCs públicos (OK para desarrollo).
 * - Con API key → http('https://...infura.io/v3/TU_KEY') usa tu RPC privado.
 *
 * Para configurar tu RPC privado de Infura:
 * 1. Creá una cuenta en https://app.infura.io
 * 2. Creá un proyecto y copiá tu API key.
 * 3. Pegá la key en .env.local como NEXT_PUBLIC_INFURA_API_KEY=tu_key_aqui
 * 4. Reiniciá el dev server (npm run dev).
 *
 * Si usás Alchemy en lugar de Infura, cambiá las URLs:
 *   mainnet → https://eth-mainnet.g.alchemy.com/v2/TU_KEY
 *   sepolia → https://eth-sepolia.g.alchemy.com/v2/TU_KEY
 *
 * Podés agregar más redes abajo, siguiendo el mismo patrón.
 */
const infuraKey = env.infuraApiKey;

const transports = {
  [mainnet.id]: infuraKey
    ? http(`https://mainnet.infura.io/v3/${infuraKey}`)
    : http(),
  [sepolia.id]: infuraKey
    ? http(`https://sepolia.infura.io/v3/${infuraKey}`)
    : http(),
};

export const config = getDefaultConfig({
  appName: env.appName,
  projectId: env.walletConnectProjectId,
  chains: [mainnet, sepolia],
  transports,
  ssr: true,
});
