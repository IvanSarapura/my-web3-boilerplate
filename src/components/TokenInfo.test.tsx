import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TokenInfo } from './TokenInfo';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useReadContract: vi.fn(),
}));

import { useAccount, useReadContract } from 'wagmi';

const mockUseAccount = vi.mocked(useAccount);
const mockUseReadContract = vi.mocked(useReadContract);

describe('TokenInfo', () => {
  it('renders nothing when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({
      isConnected: false,
      chain: undefined,
    } as unknown as ReturnType<typeof useAccount>);
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useReadContract>);

    const { container } = render(<TokenInfo />);
    expect(container.firstChild).toBeNull();
  });

  it('shows switch-chain hint when not on mainnet', () => {
    mockUseAccount.mockReturnValue({
      isConnected: true,
      chain: { id: 11155111, name: 'Sepolia' },
    } as unknown as ReturnType<typeof useAccount>);
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useReadContract>);

    render(<TokenInfo />);

    expect(screen.getByText(/cambiá a ethereum mainnet/i)).toBeInTheDocument();
  });

  it('shows token data when connected to mainnet', () => {
    mockUseAccount.mockReturnValue({
      isConnected: true,
      chain: { id: 1, name: 'Ethereum' },
    } as unknown as ReturnType<typeof useAccount>);

    let callIndex = 0;
    mockUseReadContract.mockImplementation(() => {
      const results = [
        { data: 'USD Coin', isLoading: false },
        { data: 'USDC', isLoading: false },
        { data: 6, isLoading: false },
      ];
      return results[callIndex++ % results.length] as unknown as ReturnType<
        typeof useReadContract
      >;
    });

    render(<TokenInfo />);

    expect(screen.getByText('USD Coin')).toBeInTheDocument();
    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});
