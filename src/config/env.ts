import type { ChainProfile } from './chain-definitions';

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Copy .env.local.example to .env.local and fill in the values.`,
    );
  }
  return value.trim();
}

/**
 * Solo para `next dev` sin `.env.local`. Cumple el tipo `projectId` de RainbowKit;
 * WalletConnect (QR / wallets móviles) no es fiable hasta registrar un ID real.
 *
 * @see https://cloud.reown.com
 */
const DEV_WALLETCONNECT_PROJECT_ID_PLACEHOLDER =
  '00000000000000000000000000000000' as const;

function resolveWalletConnectProjectId(): string {
  const raw = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();
  if (raw) {
    return raw;
  }

  if (process.env.NODE_ENV === 'development') {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[env] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID no está definido. ' +
          'Se usa un placeholder solo para desarrollo; WalletConnect puede fallar. ' +
          'Obtené un Project ID en https://cloud.reown.com y añadilo a .env.local.',
      );
    }
    return DEV_WALLETCONNECT_PROJECT_ID_PLACEHOLDER;
  }

  return requireEnv(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  );
}

/**
 * Qué conjunto de redes usa el frontend: testnets (default, más seguro) o mainnets.
 * En Vercel: Preview/Development suelen usar `testnet`; Production puede usar `mainnet`.
 */
function resolveChainProfile(): ChainProfile {
  const raw = process.env.NEXT_PUBLIC_CHAIN_PROFILE?.trim().toLowerCase();
  if (raw === 'mainnet') {
    return 'mainnet';
  }
  return 'testnet';
}

export const env = {
  walletConnectProjectId: resolveWalletConnectProjectId(),
  appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'My Web3 App',

  /** `testnet` | `mainnet` — controla `supportedChains` y direcciones en `contracts.ts`. */
  chainProfile: resolveChainProfile(),

  // Opcional — si está vacío, se usan RPCs públicos (suficiente para desarrollo).
  infuraApiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY?.trim() || undefined,
} as const;
