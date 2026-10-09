import { ChainConfig, WalletData } from '../types.js';

export interface ChainAdapter {
  getConfig(): ChainConfig;
  updateConfig(partial: Partial<ChainConfig>): void;
  isValidAddress(address: string): boolean;
  fetchWalletData(address: string): Promise<WalletData>;
  verifyBurnTransaction(
    txHash: string,
    senderAddress: string,
    expectedBurnAddress: string,
    expectedAmount: number
  ): Promise<{
    verified: boolean;
    txHash: string;
    amountBurned: number;
    tokenSymbol: string;
    timestamp: number;
    error?: string;
  }>;
}
