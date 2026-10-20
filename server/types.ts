export interface AutopsyReport {
  address: string;
  timestamp: string;
  riskScore: number;
  status: 'SURVIVING' | 'TERMINAL' | 'BRAIN_DEAD' | 'FLATLINED' | 'BLESSED';
  summary: string;
  primaryCauseOfDeath: string;
  pathologyFindings: PathologyFinding[];
  financialVitals: FinancialVitals;
  degenSins: DegenSin[];
  eulogy: string;
  survivalTips: string[];
  shareableSlug?: string;
}

export interface PathologyFinding {
  system: 'LIQUIDITY' | 'SMART_CONTRACT' | 'PORTFOLIO_DIVERSITY' | 'LEVERAGE' | 'RUG_EXPOSURE';
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  finding: string;
  description: string;
}

export interface FinancialVitals {
  trxBalance: number;
  totalTokensTracked: number;
  totalLossEstimatedUsd: number;
  totalGasSpentUsd: number;
  deadTokensCount: number;
  winRate: number;
  worstRugName: string;
  worstRugLossUsd: number;
}

export interface DegenSin {
  sinName: string;
  punishment: string;
  severity: 'MINOR' | 'MORTAL' | 'UNFORGIVABLE';
}

export interface BurnCertificate {
  certificateId: string;
  timestamp: string;
  deadTokenAddress: string;
  deadTokenSymbol: string;
  deadTokenAmount: number;
  walletAddress: string;
  ashesReceived: number;
  txHash: string;
  epitaph: string;
  sinRepented: string;
  burnCountTotal?: number;
}

export interface DeathOracleResult {
  deathDate: string;
  deathCause: string;
  finalWords: string;
  graveyardTombstone: string;
  predictedLossUsd: number;
  survivalOdds: number;
  dangerToken: string;
  oraclePoem: string;
}

export interface HallOfDeadItem {
  id: string;
  timestamp: string;
  tokenSymbol: string;
  tokenName: string;
  burntAmount: number;
  estimatedLostUsd: number;
  epitaph: string;
  walletShort: string;
  ashesMinted: number;
}

export interface BurnLeaderboardEntry {
  rank: number;
  wallet: string;
  ashesBalance: number;
  tokensBurntCount: number;
  totalUsdMemorialized: number;
  epitaph: string;
}

export interface CommunityMemorial {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  rugYear: number;
  deathCause: string;
  totalCandlesLit: number;
  ripCount: number;
  eulogy: string;
  creator: string;
  timestamp: string;
}

export interface ArcadeScore {
  id: string;
  player: string;
  score: number;
  game: 'tron-man' | 'x1-roid' | 'football-alien';
  timestamp: string;
  walletAddress?: string;
}

export interface ArcadeConfig {
  feeTrx: number;
  revenueAddress: string;
  demoCredits: number;
}

export interface ChatMessage {
  id: string;
  player: string;
  walletAddress: string;
  message: string;
  avatarSeed: string;
  rankBadge: string;
  timestamp: string;
}
