// Safe non-custodial browser wallet adapter for TronLink & TRON providers

declare global {
  interface Window {
    tronWeb?: any;
    tronLink?: any;
  }
}

export interface WalletConnectionState {
  connected: boolean;
  address: string | null;
  network?: string;
  isTronLinkInstalled: boolean;
  error?: string;
}

export async function detectTronLink(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.tronWeb || window.tronLink) return true;

  // Sometimes TronLink injects with a slight delay
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.tronWeb || window.tronLink) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts >= 8) {
        clearInterval(interval);
        resolve(false);
      }
    }, 200);
  });
}

export async function connectTronWallet(): Promise<WalletConnectionState> {
  const isInstalled = await detectTronLink();

  if (!isInstalled) {
    return {
      connected: false,
      address: null,
      isTronLinkInstalled: false,
      error: 'TronLink extension not detected. Please install TronLink or paste your public TRON address below.',
    };
  }

  try {
    // Request account access if available
    if (window.tronLink && window.tronLink.request) {
      await window.tronLink.request({ method: 'tron_requestAccounts' });
    }

    const tronWeb = window.tronWeb;
    if (tronWeb && tronWeb.defaultAddress && tronWeb.defaultAddress.base58) {
      return {
        connected: true,
        address: tronWeb.defaultAddress.base58,
        network: tronWeb.fullNode?.host || 'TRON Network',
        isTronLinkInstalled: true,
      };
    }

    return {
      connected: false,
      address: null,
      isTronLinkInstalled: true,
      error: 'Please unlock your TronLink wallet to continue.',
    };
  } catch (err: any) {
    const isDeclined = /declined|rejected|cancelled|denied/i.test(err?.message || String(err));
    return {
      connected: false,
      address: null,
      isTronLinkInstalled: true,
      error: isDeclined ? 'Wallet connection was declined.' : (err?.message || 'Wallet connection failed.'),
    };
  }
}

export interface BurnExecutionResult {
  txHash: string;
  success: boolean;
  isUserDeclined?: boolean;
}

export async function executeBurnTransactionViaWallet(
  burnAddress: string,
  amountInTrx = 0.25
): Promise<BurnExecutionResult> {
  if (!window.tronWeb || !window.tronWeb.ready) {
    throw new Error('TronLink wallet is not connected or ready. Please unlock TronLink.');
  }

  const tronWeb = window.tronWeb;

  try {
    // 25 TRX burn default in SUN (1 TRX = 1,000,000 SUN)
    const amountSun = Math.round(amountInTrx * 1_000_000);
    const tx = await tronWeb.trx.sendTransaction(burnAddress, amountSun);

    if (tx && (tx.result || tx.txid || tx.transaction?.txID)) {
      return {
        txHash: tx.txid || tx.transaction?.txID || tx.id,
        success: true,
      };
    }

    if (tx && tx.message) {
      const isDeclined = /declined|rejected|cancelled|denied/i.test(tx.message);
      const error: any = new Error(isDeclined ? 'Confirmation declined by user' : tx.message);
      error.isUserDeclined = isDeclined;
      throw error;
    }

    throw new Error('Transaction was not confirmed by the network.');
  } catch (err: any) {
    const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
    const isDeclined = /declined|rejected|cancelled|denied/i.test(errorStr);

    const error: any = new Error(isDeclined ? 'Confirmation declined by user' : (err?.message || 'Transaction failed'));
    error.isUserDeclined = isDeclined;
    throw error;
  }
}

export async function sendTrxTransaction(
  recipientAddress: string,
  amountInTrx = 0.25
): Promise<BurnExecutionResult> {
  return executeBurnTransactionViaWallet(recipientAddress, amountInTrx);
}
