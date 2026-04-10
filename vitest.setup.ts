import '@testing-library/jest-dom/vitest';

// Wagmi/RainbowKit leen `env` al importar `contracts` / `chains`. Sin esto,
// los tests fallan si no existe `.env.local` con NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()) {
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID =
    'vitest-walletconnect-placeholder';
}
