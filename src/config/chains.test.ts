import { describe, it, expect } from 'vitest';
import { sepolia } from 'wagmi/chains';
import {
  getBlockExplorerBaseUrl,
  getExplorerAddressUrl,
  getExplorerTxUrl,
} from './explorer';

describe('chains (explorers)', () => {
  it('builds explorer URLs from chain metadata', () => {
    const base = getBlockExplorerBaseUrl(sepolia);
    expect(base).toBeTruthy();
    expect(
      getExplorerAddressUrl(
        sepolia,
        '0x1234567890123456789012345678901234567890',
      ),
    ).toBe(`${base}/address/0x1234567890123456789012345678901234567890`);
    expect(
      getExplorerTxUrl(
        sepolia,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      ),
    ).toBe(
      `${base}/tx/0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd`,
    );
  });
});
