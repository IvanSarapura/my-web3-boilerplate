import { describe, it, expect } from 'vitest';
import { getTokenAddress } from './contracts';

describe('contracts', () => {
  it('resolves USDC on Sepolia for testnet profile', () => {
    const addr = getTokenAddress(11155111, 'usdc', 'testnet');
    expect(addr).toBe('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238');
  });

  it('resolves USDC on Ethereum mainnet for mainnet profile', () => {
    const addr = getTokenAddress(1, 'usdc', 'mainnet');
    expect(addr).toBe('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  });

  it('returns undefined when chain is not configured', () => {
    expect(getTokenAddress(999999, 'usdc', 'testnet')).toBeUndefined();
  });
});
