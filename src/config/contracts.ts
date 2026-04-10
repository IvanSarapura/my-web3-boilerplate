import type { Address } from 'viem';
import type { ChainProfile } from './chain-definitions';
import { env } from './env';

/**
 * Direcciones de contratos por `chainId`.
 * Separar por perfil evita mezclar mainnet y testnet por error.
 *
 * USDC oficiales en testnets (ejemplo del boilerplate). Reemplazá por tus
 * contratos al construir el producto.
 */
const USDC_TESTNET: Partial<Record<number, Address>> = {
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji
};

const USDC_MAINNET: Partial<Record<number, Address>> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche C-Chain
};

export type TokenContractKey = 'usdc';

function usdcMap(profile: ChainProfile): Partial<Record<number, Address>> {
  return profile === 'mainnet' ? USDC_MAINNET : USDC_TESTNET;
}

export function getTokenAddress(
  chainId: number,
  token: TokenContractKey,
  profile: ChainProfile,
): Address | undefined {
  if (token === 'usdc') {
    return usdcMap(profile)[chainId];
  }
  return undefined;
}

/** USDC para el `chainProfile` actual (según env). */
export function getUsdcAddress(chainId: number): Address | undefined {
  return getTokenAddress(chainId, 'usdc', env.chainProfile);
}
