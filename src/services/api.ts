import { ArcadeConfig, ArcadeScore, AutopsyReport, ChainConfig, ChatMessage, DeathOracleResult, LeaderboardEntry, WalletData } from '../types.js';

export async function fetchChainConfig(): Promise<{ activeChain: string; config: ChainConfig; availableChains: Array<{ id: string; name: string; active: boolean }> }> {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to fetch chain configuration');
  return res.json();
}

export async function updateChainConfig(chainId?: string, partialConfig?: Partial<ChainConfig>): Promise<{ success: boolean; config: ChainConfig; activeChain: string }> {
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chainId, partialConfig }),
  });
  if (!res.ok) throw new Error('Failed to update chain config');
  return res.json();
}

export async function fetchWalletData(address: string): Promise<WalletData> {
  const res = await fetch(`/api/wallet/${encodeURIComponent(address)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch wallet info for ${address}`);
  }
  return res.json();
}

export async function analyzeWallet(address: string): Promise<{ autopsyId: string; report: AutopsyReport; activeChainConfig: ChainConfig }> {
  const res = await fetch('/api/autopsy/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to examine wallet');
  }
  return res.json();
}

export async function verifyBurnTransaction(
  autopsyId: string,
  txHash: string,
  senderAddress?: string,
  burnAmount = 0.25,
  burnTokenSymbol = 'TRX'
): Promise<{ success: boolean; report: AutopsyReport; burnDetails: any }> {
  const res = await fetch('/api/autopsy/verify-burn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autopsyId, txHash, senderAddress, burnAmount, burnTokenSymbol }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Transaction verification rejected');
  }
  return res.json();
}

export async function fetchLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function createFuneralEulogy(deadTokens: string[], burialType: string, address: string): Promise<{ eulogy: string }> {
  const res = await fetch('/api/funeral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deadTokens, burialType, address }),
  });
  if (!res.ok) throw new Error('Failed to generate funeral eulogy');
  return res.json();
}

export async function createWalletHoroscope(address: string, zodiacSign: string, degenScore: number): Promise<{ horoscope: string }> {
  const res = await fetch('/api/horoscope', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, zodiacSign, degenScore }),
  });
  if (!res.ok) throw new Error('Failed to generate horoscope');
  return res.json();
}

export async function createDeathOracle(address: string, zodiacSign: string, degenScore: number): Promise<{ prophecy: DeathOracleResult }> {
  const res = await fetch('/api/oracle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, zodiacSign, degenScore }),
  });
  if (!res.ok) throw new Error('The Crypt Keeper failed to answer');
  return res.json();
}

// Arcade API client
export async function fetchArcadeConfig(): Promise<ArcadeConfig> {
  const res = await fetch('/api/arcade/config');
  if (!res.ok) throw new Error('Failed to fetch arcade configuration');
  return res.json();
}

export async function depositArcadeQuarter(params: {
  walletAddress?: string;
  game: 'tron-man' | 'x1-roid';
  txHash?: string;
  isDemo?: boolean;
}): Promise<{ success: boolean; credits: number; revenueAddress: string }> {
  const res = await fetch('/api/arcade/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Arcade coin deposit failed');
  return res.json();
}

export async function fetchArcadeScores(): Promise<{
  scores: ArcadeScore[];
  tronManScores: ArcadeScore[];
  x1RoidScores: ArcadeScore[];
}> {
  const res = await fetch('/api/arcade/scores');
  if (!res.ok) throw new Error('Failed to fetch arcade scores');
  return res.json();
}

export async function submitArcadeScore(params: {
  game: 'tron-man' | 'x1-roid';
  player: string;
  walletAddress?: string;
  score: number;
}): Promise<{ success: boolean; newEntry: ArcadeScore; scores: ArcadeScore[] }> {
  const res = await fetch('/api/arcade/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to submit high score');
  return res.json();
}

// Chat API client
export async function fetchChatMessages(): Promise<{ messages: ChatMessage[] }> {
  const res = await fetch('/api/chat');
  if (!res.ok) throw new Error('Failed to fetch chat messages');
  return res.json();
}

export async function sendChatMessage(params: {
  text: string;
  sender?: string;
  walletAddress?: string;
  badge?: 'DEGEN' | 'WHALE' | 'CHAMPION' | 'CORONER';
  autopsyCard?: { degenScore: number; causeOfDeath: string };
}): Promise<{ success: boolean; message: ChatMessage; messages: ChatMessage[] }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
