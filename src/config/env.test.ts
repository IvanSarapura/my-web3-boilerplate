import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('env', () => {
  beforeEach(() => {
    vi.resetModules();
    // Aísla tests entre sí: el caso "development placeholder" cambia NODE_ENV.
    vi.stubEnv('NODE_ENV', 'test');
  });

  it('throws when NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', '');

    await expect(() => import('./env')).rejects.toThrow(
      'Missing required environment variable: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    );
  });

  it('throws when NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is only whitespace', async () => {
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', '   ');

    await expect(() => import('./env')).rejects.toThrow(
      'Missing required environment variable',
    );
  });

  it('returns trimmed project ID when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', '  abc123def456  ');

    const { env } = await import('./env');
    expect(env.walletConnectProjectId).toBe('abc123def456');
  });

  it('uses a development placeholder when NODE_ENV is development and project ID is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', '');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { env } = await import('./env');
    expect(env.walletConnectProjectId).toBe('00000000000000000000000000000000');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'),
    );

    warnSpy.mockRestore();
  });

  it('uses default app name when NEXT_PUBLIC_APP_NAME is not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', 'test-id');
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', '');

    const { env } = await import('./env');
    expect(env.appName).toBe('My Web3 App');
  });

  it('uses custom app name when provided', async () => {
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', 'test-id');
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'My Custom DApp');

    const { env } = await import('./env');
    expect(env.appName).toBe('My Custom DApp');
  });

  it('defaults chain profile to testnet when NEXT_PUBLIC_CHAIN_PROFILE is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', 'test-id');
    vi.stubEnv('NEXT_PUBLIC_CHAIN_PROFILE', '');

    const { env } = await import('./env');
    expect(env.chainProfile).toBe('testnet');
  });

  it('uses mainnet chain profile when NEXT_PUBLIC_CHAIN_PROFILE is mainnet', async () => {
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', 'test-id');
    vi.stubEnv('NEXT_PUBLIC_CHAIN_PROFILE', 'mainnet');

    const { env } = await import('./env');
    expect(env.chainProfile).toBe('mainnet');
  });
});
