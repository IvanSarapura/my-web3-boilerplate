import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { TransferForm } from './TransferForm';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useReadContract: vi.fn(),
}));

vi.mock('@/hooks/useErc20Transfer', () => ({
  useErc20Transfer: vi.fn(),
}));

import { useAccount, useReadContract } from 'wagmi';
import { useErc20Transfer } from '@/hooks/useErc20Transfer';

const mockUseAccount = vi.mocked(useAccount);
const mockUseReadContract = vi.mocked(useReadContract);
const mockUseErc20Transfer = vi.mocked(useErc20Transfer);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_TRANSFER_HOOK: ReturnType<typeof useErc20Transfer> = {
  execute: vi.fn(),
  status: 'idle',
  txHash: undefined,
  error: null,
  simulateError: null,
  reset: vi.fn(),
  canExecute: false,
};

const VALID_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

/**
 * mockReadContract diferencia llamadas por functionName para simular que
 * TransferForm recibe distintos valores para decimals y balanceOf.
 */
function mockReadContract(
  overrides: { decimals?: number; balance?: bigint } = {},
) {
  const { decimals = 6, balance = BigInt(5_000_000) } = overrides; // 5 USDC

  mockUseReadContract.mockImplementation((params) => {
    const fn = (params as { functionName?: string })?.functionName;
    if (fn === 'decimals')
      return {
        data: decimals,
        isLoading: false,
      } as unknown as ReturnType<typeof useReadContract>;
    if (fn === 'balanceOf')
      return {
        data: balance,
        isLoading: false,
      } as unknown as ReturnType<typeof useReadContract>;
    return {
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useReadContract>;
  });
}

function mockConnectedToSepolia(
  readOverrides: { decimals?: number; balance?: bigint } = {},
) {
  mockUseAccount.mockReturnValue({
    isConnected: true,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chain: {
      id: 11155111,
      name: 'Ethereum Sepolia',
      blockExplorers: { default: { url: 'https://sepolia.etherscan.io' } },
    },
  } as unknown as ReturnType<typeof useAccount>);

  mockReadContract(readOverrides);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TransferForm', () => {
  afterEach(cleanup);

  // ── Wallet desconectada ────────────────────────────────────────────────────
  describe('cuando la wallet no está conectada', () => {
    it('no renderiza nada', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chain: undefined,
        address: undefined,
      } as unknown as ReturnType<typeof useAccount>);
      mockReadContract();
      mockUseErc20Transfer.mockReturnValue(DEFAULT_TRANSFER_HOOK);

      const { container } = render(<TransferForm />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ── Red no soportada ───────────────────────────────────────────────────────
  describe('cuando la red no está soportada', () => {
    it('muestra el hint de cambio de red', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chain: { id: 1, name: 'Ethereum' },
        address: '0x123',
      } as unknown as ReturnType<typeof useAccount>);
      mockReadContract();
      mockUseErc20Transfer.mockReturnValue(DEFAULT_TRANSFER_HOOK);

      render(<TransferForm />);
      expect(
        screen.getByText(/cambiá a una de estas redes/i),
      ).toBeInTheDocument();
    });
  });

  // ── Formulario conectado a Sepolia ─────────────────────────────────────────
  describe('cuando está conectado a Sepolia', () => {
    beforeEach(() => {
      mockConnectedToSepolia();
      mockUseErc20Transfer.mockReturnValue(DEFAULT_TRANSFER_HOOK);
    });

    it('muestra los campos de dirección y monto', () => {
      render(<TransferForm />);
      expect(screen.getByLabelText(/dirección destino/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monto \(usdc\)/i)).toBeInTheDocument();
    });

    it('el botón de enviar está deshabilitado cuando canExecute es false', () => {
      render(<TransferForm />);
      expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled();
    });

    it('el botón de enviar está habilitado cuando canExecute es true', () => {
      mockUseErc20Transfer.mockReturnValue({
        ...DEFAULT_TRANSFER_HOOK,
        canExecute: true,
      });
      render(<TransferForm />);
      expect(
        screen.getByRole('button', { name: /enviar/i }),
      ).not.toBeDisabled();
    });

    it('muestra el balance disponible', () => {
      render(<TransferForm />);
      // 5_000_000 con 6 decimales = 5.00 USDC
      expect(
        screen.getByText(/balance disponible: 5.00 usdc/i),
      ).toBeInTheDocument();
    });
  });

  // ── Validación Zod en tiempo real (mode: 'onChange') ──────────────────────
  describe('validación de formulario', () => {
    beforeEach(() => {
      mockConnectedToSepolia();
      mockUseErc20Transfer.mockReturnValue(DEFAULT_TRANSFER_HOOK);
    });

    it('no muestra errores con inputs vacíos', () => {
      render(<TransferForm />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('muestra error para dirección inválida', async () => {
      render(<TransferForm />);
      fireEvent.change(screen.getByLabelText(/dirección destino/i), {
        target: { value: 'not-an-address' },
      });
      await waitFor(() => {
        expect(
          screen.getByText(/dirección ethereum inválida/i),
        ).toBeInTheDocument();
      });
    });

    it('no muestra error cuando la dirección es válida', async () => {
      render(<TransferForm />);
      fireEvent.change(screen.getByLabelText(/dirección destino/i), {
        target: { value: VALID_ADDRESS },
      });
      await waitFor(() => {
        expect(
          screen.queryByText(/dirección ethereum inválida/i),
        ).not.toBeInTheDocument();
      });
    });

    it('muestra error para monto inválido', async () => {
      render(<TransferForm />);
      fireEvent.change(screen.getByLabelText(/monto \(usdc\)/i), {
        target: { value: '-5' },
      });
      await waitFor(() => {
        expect(
          screen.getByText(/ingresá un monto positivo válido/i),
        ).toBeInTheDocument();
      });
    });

    it('muestra error para monto cero', async () => {
      render(<TransferForm />);
      fireEvent.change(screen.getByLabelText(/monto \(usdc\)/i), {
        target: { value: '0' },
      });
      await waitFor(() => {
        expect(
          screen.getByText(/ingresá un monto positivo válido/i),
        ).toBeInTheDocument();
      });
    });

    it('muestra error de simulación cuando el contrato revertirá', () => {
      mockUseErc20Transfer.mockReturnValue({
        ...DEFAULT_TRANSFER_HOOK,
        simulateError: new Error('ERC20: transfer amount exceeds balance'),
      });
      render(<TransferForm />);
      expect(
        screen.getByText('ERC20: transfer amount exceeds balance'),
      ).toBeInTheDocument();
    });
  });

  // ── Formulario en progreso ─────────────────────────────────────────────────
  describe('durante la transacción', () => {
    beforeEach(() => mockConnectedToSepolia());

    it('deshabilita los inputs mientras la tx está pendiente', () => {
      mockUseErc20Transfer.mockReturnValue({
        ...DEFAULT_TRANSFER_HOOK,
        status: 'pending',
      });
      render(<TransferForm />);
      expect(screen.getByLabelText(/dirección destino/i)).toBeDisabled();
      expect(screen.getByLabelText(/monto \(usdc\)/i)).toBeDisabled();
    });

    it('muestra "Procesando..." durante pending y confirming', () => {
      mockUseErc20Transfer.mockReturnValue({
        ...DEFAULT_TRANSFER_HOOK,
        status: 'confirming',
      });
      render(<TransferForm />);
      expect(
        screen.getByRole('button', { name: /procesando/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Estado de éxito ────────────────────────────────────────────────────────
  describe('estado de éxito', () => {
    const TX_HASH =
      '0xdeadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000000000001' as `0x${string}`;

    beforeEach(() => mockConnectedToSepolia());

    it('oculta el formulario y muestra TxStatus con botón de reset', () => {
      mockUseErc20Transfer.mockReturnValue({
        ...DEFAULT_TRANSFER_HOOK,
        status: 'success',
        txHash: TX_HASH,
      });

      render(<TransferForm />);

      expect(
        screen.queryByLabelText(/dirección destino/i),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /nueva transferencia/i }),
      ).toBeInTheDocument();
    });

    it('llama a reset del hook y resetea el formulario al hacer clic', () => {
      const hookReset = vi.fn();
      mockUseErc20Transfer.mockReturnValue({
        ...DEFAULT_TRANSFER_HOOK,
        status: 'success',
        txHash: TX_HASH,
        reset: hookReset,
      });

      render(<TransferForm />);
      fireEvent.click(
        screen.getByRole('button', { name: /nueva transferencia/i }),
      );

      expect(hookReset).toHaveBeenCalledOnce();
    });
  });
});
