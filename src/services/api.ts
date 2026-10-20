import { 
  AutopsyReport, 
  BurnCertificate, 
  DeathOracleResult, 
  HallOfDeadItem, 
  BurnLeaderboardEntry,
  CommunityMemorial,
  ArcadeScore,
  ArcadeConfig,
  ChatMessage
} from '../types';

export async function fetchAutopsyReport(address: string): Promise<AutopsyReport> {
  const res = await fetch(`/api/autopsy?address=${encodeURIComponent(address)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Autopsy failed' }));
    throw new Error(err.error || 'Autopsy failed to complete');
  }
  return res.json();
}

export async function fetchLiveTokens(address: string): Promise<{ tokens: any[]; trxBalance: number }> {
  const res = await fetch(`/api/tokens?address=${encodeURIComponent(address)}`);
  if (!res.ok) {
    return { tokens: [], trxBalance: 0 };
  }
  return res.json();
}

export async function burnDeadToken(params: {
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  walletAddress: string;
  epitaph?: string;
  sinRepented?: string;
}): Promise<BurnCertificate> {
  const res = await fetch('/api/burn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Burn incantation failed' }));
    throw new Error(err.error || 'Failed to burn token');
  }
  return res.json();
}

export async function fetchHallOfDead(): Promise<{ items: HallOfDeadItem[]; totalBurntCount: number; totalLostUsd: number }> {
  const res = await fetch('/api/hall-of-dead');
  if (!res.ok) throw new Error('Failed to fetch hall of the dead');
  return res.json();
}

export async function fetchLeaderboard(): Promise<{ leaderboard: BurnLeaderboardEntry[] }> {
  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchMemorials(): Promise<{ memorials: CommunityMemorial[] }> {
  const res = await fetch('/api/memorials');
  if (!res.ok) throw new Error('Failed to fetch memorials');
  return res.json();
}

export async function lightCandle(id: string): Promise<{ success: boolean; candles: number }> {
  const res = await fetch(`/api/memorials/${encodeURIComponent(id)}/candle`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to light candle');
  return res.json();
}

export async function createMemorial(data: {
  tokenSymbol: string;
  tokenName: string;
  rugYear: number;
  deathCause: string;
  eulogy: string;
  creator: string;
}): Promise<CommunityMemorial> {
  const res = await fetch('/api/memorials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to record memorial');
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
  game: 'tron-man' | 'x1-roid' | 'football-alien';
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
  footballAlienScores?: ArcadeScore[];
}> {
  const res = await fetch('/api/arcade/scores');
  if (!res.ok) throw new Error('Failed to fetch arcade scores');
  return res.json();
}

export async function submitArcadeScore(params: {
  game: 'tron-man' | 'x1-roid' | 'football-alien';
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
  if (!res.ok) throw new Error('Failed to fetch cemetery chat');
  return res.json();
}

export async function postChatMessage(params: {
  player: string;
  walletAddress: string;
  message: string;
  avatarSeed?: string;
  rankBadge?: string;
}): Promise<{ success: boolean; message: ChatMessage }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to broadcast shout' }));
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}
