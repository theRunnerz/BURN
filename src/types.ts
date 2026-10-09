export interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  contractAddress?: string;
  usdValueEstimate?: number;
  percentageOfPortfolio: number;
  isMemeToken?: boolean;
}

export interface WalletData {
  address: string;
  trxBalance: number;
  trxUsdValue: number;
  totalUsdEstimate: number;
  tokens: TokenHolding[];
  transactionCount: number;
  walletAgeDays: number;
  firstSeenTimestamp: number;
  lastActiveTimestamp: number;
  largestIncomingTx?: { amount: number; symbol: string; date: string; hash: string };
  largestOutgoingTx?: { amount: number; symbol: string; date: string; hash: string };
  frequentTokens: string[];
  defiInteractionsCount: number;
  isContract: boolean;
  sampleWalletType?: 'whale' | 'rug_victim' | 'hodler' | 'newbie';
}

export interface PathologyFinding {
  condition: string;
  severity: 'MILD' | 'SEVERE' | 'TERMINAL';
  description: string;
}

export interface AutopsyScores {
  degenScore: number;
  diamondHandsScore: number;
  financialIq: number;
  rugSurvivalScore: number;
  diversificationScore: number;
}

export interface AutopsyReport {
  id: string;
  address: string;
  createdAt: number;
  walletData: WalletData;
  scores: AutopsyScores;
  causeOfDeath: string;
  doctorsDiagnosis: string;
  coronersNote: string;
  pathologyFindings: PathologyFinding[];
  longestHeldBaggage: string;
  toxicHolding: string;
  rxPrescription: string;
  toxicQuote: string;
  unlocked: boolean;
  burnTxHash?: string;
  burnTokenSymbol?: string;
  burnAmount?: number;
  burnAddress?: string;
}

export interface ChainConfig {
  chainId: string;
  chainName: string;
  currencySymbol: string;
  burnTokenSymbol: string;
  burnTokenName: string;
  burnTokenContract: string;
  burnAddress: string;
  requiredBurnAmount: number;
  explorerBaseUrl: string;
  isTestnet: boolean;
}

export interface LeaderboardEntry {
  id: string;
  address: string;
  degenScore: number;
  causeOfDeath: string;
  unlocked: boolean;
  burnTxHash?: string;
  timestamp: number;
}

export interface DeathOracleResult {
  predictedDateOfDeath: string;
  daysRemaining: number;
  mannerOfDeath: string;
  cryptKeeperEpitaph: string;
  spookyCurse: string;
  hauntingSpirit: string;
  survivalTalisman: string;
  fearScore: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  walletAddress?: string;
  text: string;
  autopsyCard?: {
    degenScore: number;
    causeOfDeath: string;
  };
  timestamp: number;
  badge?: 'DEGEN' | 'WHALE' | 'CHAMPION' | 'CORONER';
}

export interface ArcadeScore {
  id: string;
  game: 'tron-man' | 'x1-roid';
  player: string;
  walletAddress: string;
  score: number;
  timestamp: number;
}

export interface ArcadeConfig {
  revenueAddress: string;
  coinPriceTrx: number;
}
