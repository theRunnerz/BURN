import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { TronAdapter, DEMO_WALLETS } from './server/chainAdapters/tronAdapter.js';
import { X1Adapter } from './server/chainAdapters/x1Adapter.js';
import { ChainAdapter } from './server/chainAdapters/chainAdapter.js';
import { generateAutopsyWithGemini } from './server/gemini.js';
import { AutopsyReport, ChatMessage, ArcadeScore } from './server/types.js';
import { generateFuneralEulogy, generateWalletHoroscope, generateDeathOracleProphecy } from './server/features.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent database for autopsies and leaderboard
const autopsies = new Map<string, AutopsyReport>();
const leaderboard: Array<{
  id: string;
  address: string;
  degenScore: number;
  causeOfDeath: string;
  unlocked: boolean;
  burnTxHash?: string;
  timestamp: number;
}> = [];

// Arcade & Revenue configuration
const ARCADE_REVENUE_ADDRESS = 'TENXRknaJG3acTjdm9pLzLrPHahZLgHygP';
const ARCADE_COIN_PRICE_TRX = 0.25;

const arcadeScores: ArcadeScore[] = [
  { id: 'as-1', game: 'tron-man', player: 'SatoshiN', walletAddress: 'TXd3Ge5kX81cE4f7Y6n1M2s9Lk7P2Q5bZa', score: 24800, timestamp: Date.now() - 86400000 * 2 },
  { id: 'as-2', game: 'tron-man', player: 'JustinTron', walletAddress: 'TLyqzVGLV1srkB7dToTAnY929auPU2oYt6', score: 19500, timestamp: Date.now() - 86400000 },
  { id: 'as-3', game: 'tron-man', player: 'SunPumpKing', walletAddress: 'TG5n1G3fT6s8M4v2C7y9W1z2x3a4B5cD6e', score: 14200, timestamp: Date.now() - 36000000 },
  { id: 'as-4', game: 'tron-man', player: 'DiamondHands', walletAddress: 'TM3v1P9qR2s4T5u7V8w9X0y1Z2a3B4cD5e', score: 9850, timestamp: Date.now() - 14400000 },
  { id: 'as-5', game: 'tron-man', player: 'MemeVictim', walletAddress: 'TN2w4X6y8Z0a1B3cD5e7F9g1H3j5K7m9P1', score: 4500, timestamp: Date.now() - 7200000 },

  { id: 'as-6', game: 'x1-roid', player: 'VoidPilot', walletAddress: 'TXd3Ge5kX81cE4f7Y6n1M2s9Lk7P2Q5bZa', score: 38400, timestamp: Date.now() - 86400000 * 3 },
  { id: 'as-7', game: 'x1-roid', player: 'X1Commander', walletAddress: 'TM3v1P9qR2s4T5u7V8w9X0y1Z2a3B4cD5e', score: 29100, timestamp: Date.now() - 86400000 },
  { id: 'as-8', game: 'x1-roid', player: 'LaserBags', walletAddress: 'TLyqzVGLV1srkB7dToTAnY929auPU2oYt6', score: 18750, timestamp: Date.now() - 43200000 },
  { id: 'as-9', game: 'x1-roid', player: 'AsteroidHunter', walletAddress: 'TG5n1G3fT6s8M4v2C7y9W1z2x3a4B5cD6e', score: 12200, timestamp: Date.now() - 21600000 },
  { id: 'as-10', game: 'x1-roid', player: 'RektSurvivor', walletAddress: 'TN2w4X6y8Z0a1B3cD5e7F9g1H3j5K7m9P1', score: 6800, timestamp: Date.now() - 3600000 },
];

const chatMessages: ChatMessage[] = [
  {
    id: 'cm-1',
    sender: 'Morgue Keeper',
    text: '🪦 Welcome to the TRON Wallet Autopsy Degen Chat & Arcade! Deposit 0.25 TRX into the coin slot to play Tron Man & X1roid. High scores earn community bragging rights.',
    timestamp: Date.now() - 1000 * 60 * 35,
    badge: 'CORONER',
  },
  {
    id: 'cm-2',
    sender: 'TXd3...bZa',
    walletAddress: 'TXd3Ge5kX81cE4f7Y6n1M2s9Lk7P2Q5bZa',
    text: 'Just dropped a 0.25 TRX quarter into Tron Man. Watch out for the Gary ghost in wave 3, it cuts off the corner nodes!',
    timestamp: Date.now() - 1000 * 60 * 24,
    badge: 'DEGEN',
  },
  {
    id: 'cm-3',
    sender: 'TLyq...oYt6',
    walletAddress: 'TLyqzVGLV1srkB7dToTAnY929auPU2oYt6',
    text: 'X1roid hyperspace physics are addictive. Smashed 18 dead meme asteroids before the red candle swarm got me.',
    timestamp: Date.now() - 1000 * 60 * 16,
    badge: 'CHAMPION',
  },
  {
    id: 'cm-4',
    sender: 'SunPumpKing',
    walletAddress: 'TG5n1G3fT6s8M4v2C7y9W1z2x3a4B5cD6e',
    text: 'My autopsy returned 96 Degen Score. Cause of death: bought animal coins at 4 AM.',
    timestamp: Date.now() - 1000 * 60 * 9,
    badge: 'WHALE',
    autopsyCard: {
      degenScore: 96,
      causeOfDeath: 'Bought 7 dead SunPump meme tokens at 4 AM and suffered 99.8% liquidity evaporation.',
    },
  },
  {
    id: 'cm-5',
    sender: 'ApexDegen',
    walletAddress: 'TENXRknaJG3acTjdm9pLzLrPHahZLgHygP',
    text: 'All 0.25 TRX arcade quarters go directly to revenue address TENXRknaJG3acTjdm9pLzLrPHahZLgHygP. Who can beat 38,400 on X1roid?',
    timestamp: Date.now() - 1000 * 60 * 3,
    badge: 'CHAMPION',
  },
];

// Modular chain adapters registry
const adapters: Record<string, ChainAdapter> = {
  tron: new TronAdapter(),
  x1: new X1Adapter(),
};
let activeChainId = 'tron';

function getActiveAdapter(): ChainAdapter {
  return adapters[activeChainId] || adapters.tron;
}

// Pre-seed some iconic community autopsies for the leaderboard
const SEED_WALLETS = [
  {
    address: 'TXd3Ge5kX81cE4f7Y6n1M2s9Lk7P2Q5bZa',
    degen: 96,
    cause: 'Bought 7 dead SunPump meme tokens at 4 AM and suffered 99.8% liquidity evaporation.',
    burned: true,
    hash: '8f7a91c01e941...39b',
  },
  {
    address: 'TLyqzVGLV1srkB7dToTAnY929auPU2oYt6',
    degen: 88,
    cause: 'Crushed beneath 14 million TRX in an attempt to buy every animal coin on the blockchain.',
    burned: true,
    hash: '5a1098bfe1920...88c',
  },
  {
    address: 'TG5n1G3fT6s8M4v2C7y9W1z2x3a4B5cD6e',
    degen: 22,
    cause: 'Diamond hand rigor mortis. Held bags since 2017 without ever pressing the sell button.',
    burned: false,
  },
];

SEED_WALLETS.forEach((seed, i) => {
  leaderboard.push({
    id: `seed-${i + 1}`,
    address: seed.address,
    degenScore: seed.degen,
    causeOfDeath: seed.cause,
    unlocked: seed.burned,
    burnTxHash: seed.hash,
    timestamp: Date.now() - (i + 1) * 3600000 * 5,
  });
});

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: Date.now(), activeChain: activeChainId });
});

app.get('/api/config', (_req: Request, res: Response) => {
  const adapter = getActiveAdapter();
  res.json({
    activeChain: activeChainId,
    config: adapter.getConfig(),
    availableChains: [
      { id: 'tron', name: 'TRON Mainnet', active: activeChainId === 'tron' },
      { id: 'x1', name: 'X1 Network (Next Gen EVM)', active: activeChainId === 'x1' },
    ],
  });
});

app.post('/api/config', (req: Request, res: Response) => {
  const { chainId, partialConfig } = req.body;
  if (chainId && adapters[chainId]) {
    activeChainId = chainId;
  }
  if (partialConfig) {
    getActiveAdapter().updateConfig(partialConfig);
  }
  res.json({
    success: true,
    activeChain: activeChainId,
    config: getActiveAdapter().getConfig(),
  });
});

// Demo wallets listing
app.get('/api/demo-wallets', (_req: Request, res: Response) => {
  res.json({
    wallets: Object.keys(DEMO_WALLETS).map(addr => ({
      address: addr,
      type: DEMO_WALLETS[addr].sampleWalletType,
      trxBalance: DEMO_WALLETS[addr].trxBalance,
      tokenCount: DEMO_WALLETS[addr].tokens.length,
      days: DEMO_WALLETS[addr].walletAgeDays,
    })),
  });
});

// Fetch raw public wallet data
app.get('/api/wallet/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  const adapter = getActiveAdapter();

  if (!adapter.isValidAddress(address)) {
    return res.status(400).json({ error: `Invalid ${adapter.getConfig().chainName} address format.` });
  }

  try {
    const data = await adapter.fetchWalletData(address);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch public blockchain wallet data' });
  }
});

// Analyze wallet and generate Autopsy report (Free Preview by default)
app.post('/api/autopsy/analyze', async (req: Request, res: Response) => {
  const { address } = req.body;
  const adapter = getActiveAdapter();

  if (!address || !adapter.isValidAddress(address)) {
    return res.status(400).json({ error: `Please provide a valid ${adapter.getConfig().chainName} address.` });
  }

  try {
    // 1. Fetch public wallet forensics
    const walletData = await adapter.fetchWalletData(address);

    // 2. Call Gemini AI to roast the wallet
    const analysis = await generateAutopsyWithGemini(walletData);

    // 3. Create autopsy record
    const id = `autopsy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const autopsy: AutopsyReport = {
      id,
      address,
      createdAt: Date.now(),
      walletData,
      scores: analysis.scores,
      causeOfDeath: analysis.causeOfDeath,
      doctorsDiagnosis: analysis.doctorsDiagnosis,
      coronersNote: analysis.coronersNote,
      pathologyFindings: analysis.pathologyFindings,
      longestHeldBaggage: analysis.longestHeldBaggage,
      toxicHolding: analysis.toxicHolding,
      rxPrescription: analysis.rxPrescription,
      toxicQuote: analysis.toxicQuote,
      unlocked: false, // FREE PREVIEW initially! Burn token to unlock full report
    };

    autopsies.set(id, autopsy);

    // Add to community leaderboard
    leaderboard.unshift({
      id,
      address,
      degenScore: analysis.scores.degenScore,
      causeOfDeath: analysis.causeOfDeath,
      unlocked: false,
      timestamp: Date.now(),
    });
    if (leaderboard.length > 50) leaderboard.pop();

    res.json({
      autopsyId: id,
      report: autopsy,
      activeChainConfig: adapter.getConfig(),
    });
  } catch (err: any) {
    console.error('Autopsy analysis error:', err);
    res.status(500).json({ error: err.message || 'Error processing wallet autopsy' });
  }
});

// Verify token burn and unlock the full autopsy report
app.post('/api/autopsy/verify-burn', async (req: Request, res: Response) => {
  const { autopsyId, txHash, senderAddress, burnAmount, burnTokenSymbol } = req.body;
  const adapter = getActiveAdapter();
  const config = adapter.getConfig();

  if (!autopsyId || !txHash) {
    return res.status(400).json({ error: 'Missing autopsyId or txHash for verification.' });
  }

  const autopsy = autopsies.get(autopsyId);
  if (!autopsy) {
    return res.status(404).json({ error: 'Autopsy examination report not found.' });
  }

  try {
    const targetAmount = burnAmount !== undefined ? Number(burnAmount) : 0.25;
    const targetSymbol = burnTokenSymbol || 'TRX';

    const verification = await adapter.verifyBurnTransaction(
      txHash,
      senderAddress || autopsy.address,
      config.burnAddress,
      targetAmount
    );

    if (verification.verified) {
      autopsy.unlocked = true;
      autopsy.burnTxHash = verification.txHash;
      autopsy.burnTokenSymbol = targetSymbol;
      autopsy.burnAmount = targetAmount;
      autopsy.burnAddress = config.burnAddress;
      autopsies.set(autopsyId, autopsy);

      // Update leaderboard
      const entry = leaderboard.find(l => l.id === autopsyId);
      if (entry) {
        entry.unlocked = true;
        entry.burnTxHash = verification.txHash;
      }

      return res.json({
        success: true,
        report: autopsy,
        burnDetails: verification,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Burn transaction verification failed.',
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to verify transaction on blockchain' });
  }
});

// Get autopsy report by ID
app.get('/api/autopsy/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const autopsy = autopsies.get(id);
  if (!autopsy) {
    return res.status(404).json({ error: 'Autopsy report not found' });
  }
  res.json({ report: autopsy, config: getActiveAdapter().getConfig() });
});

// Community Degen Leaderboard
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  res.json({
    leaderboard: leaderboard.slice(0, 30),
  });
});

// Portfolio Funeral Eulogy
app.post('/api/funeral', async (req: Request, res: Response) => {
  const { deadTokens, burialType, address } = req.body;
  try {
    const eulogy = await generateFuneralEulogy(deadTokens || [], burialType || 'SunPump Cremation', address || 'Anonymous');
    res.json({ eulogy });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate funeral eulogy' });
  }
});

// Wallet Horoscope
app.post('/api/horoscope', async (req: Request, res: Response) => {
  const { address, zodiacSign, degenScore } = req.body;
  try {
    const horoscope = await generateWalletHoroscope(address || 'T-Unknown', zodiacSign || 'Scorpio', degenScore || 50);
    res.json({ horoscope });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate horoscope' });
  }
});

// The Spooky Halloween Death Oracle
app.post('/api/oracle', async (req: Request, res: Response) => {
  const { address, zodiacSign, degenScore } = req.body;
  try {
    const prophecy = await generateDeathOracleProphecy(address || 'T-Unknown', zodiacSign || 'Scorpio', degenScore || 85);
    res.json({ prophecy });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'The Crypt Keeper refused to speak' });
  }
});

// Arcade Configuration (Revenue address and coin price)
app.get('/api/arcade/config', (_req: Request, res: Response) => {
  res.json({
    revenueAddress: ARCADE_REVENUE_ADDRESS,
    coinPriceTrx: ARCADE_COIN_PRICE_TRX,
  });
});

// Arcade Coin Deposit (0.25 TRX revenue collection)
app.post('/api/arcade/deposit', (req: Request, res: Response) => {
  const { walletAddress, game, txHash, isDemo } = req.body;
  const player = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Degen Player';
  const gameTitle = game === 'x1-roid' ? 'X1roid' : 'Tron Man';

  // System broadcast in the Degen Chat
  const depositAnnouncement: ChatMessage = {
    id: `arcade_dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sender: 'Arcade Coin Slot',
    text: `🪙 ${player} deposited 0.25 TRX into ${gameTitle}! Revenue forwarded to ${ARCADE_REVENUE_ADDRESS.slice(0, 6)}...${ARCADE_REVENUE_ADDRESS.slice(-4)} ${isDemo ? '(Demo Quarter)' : 'Tx: ' + (txHash ? txHash.slice(0, 8) + '...' : 'Verified')}`,
    timestamp: Date.now(),
    badge: 'CHAMPION',
  };

  chatMessages.push(depositAnnouncement);
  if (chatMessages.length > 80) chatMessages.shift();

  res.json({
    success: true,
    revenueAddress: ARCADE_REVENUE_ADDRESS,
    coinPriceTrx: ARCADE_COIN_PRICE_TRX,
    credits: 1,
    txHash: txHash || 'demo_quarter',
  });
});

// Arcade High Scores
app.get('/api/arcade/scores', (_req: Request, res: Response) => {
  res.json({
    scores: arcadeScores,
    tronManScores: arcadeScores.filter(s => s.game === 'tron-man').sort((a, b) => b.score - a.score).slice(0, 10),
    x1RoidScores: arcadeScores.filter(s => s.game === 'x1-roid').sort((a, b) => b.score - a.score).slice(0, 10),
  });
});

app.post('/api/arcade/scores', (req: Request, res: Response) => {
  const { game, player, walletAddress, score } = req.body;
  if (!game || score === undefined) {
    return res.status(400).json({ error: 'Game and score are required.' });
  }

  const cleanPlayer = player?.trim()?.slice(0, 16) || (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Anonymous');
  const cleanWallet = walletAddress || 'T-Guest';

  const newEntry: ArcadeScore = {
    id: `as_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    game: game === 'x1-roid' ? 'x1-roid' : 'tron-man',
    player: cleanPlayer,
    walletAddress: cleanWallet,
    score: Math.max(0, parseInt(score, 10) || 0),
    timestamp: Date.now(),
  };

  arcadeScores.push(newEntry);
  arcadeScores.sort((a, b) => b.score - a.score);

  // If top score, announce in chat
  const gameScores = arcadeScores.filter(s => s.game === newEntry.game);
  if (gameScores[0]?.id === newEntry.id) {
    const chatMsg: ChatMessage = {
      id: `hs_${Date.now()}`,
      sender: 'Arcade Announcer',
      text: `🏆 NEW HIGH SCORE! ${cleanPlayer} just hit ${newEntry.score.toLocaleString()} points in ${newEntry.game === 'x1-roid' ? 'X1roid' : 'Tron Man'}!`,
      timestamp: Date.now(),
      badge: 'CHAMPION',
    };
    chatMessages.push(chatMsg);
    if (chatMessages.length > 80) chatMessages.shift();
  }

  res.json({
    success: true,
    newEntry,
    scores: arcadeScores,
  });
});

// Degen Crypt & Morgue Chat
app.get('/api/chat', (_req: Request, res: Response) => {
  res.json({
    messages: chatMessages,
  });
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { text, sender, walletAddress, badge, autopsyCard } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const cleanText = text.trim().slice(0, 300);
  const cleanSender = sender?.trim()?.slice(0, 20) || (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Degen');

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sender: cleanSender,
    walletAddress: walletAddress || undefined,
    text: cleanText,
    badge: badge || 'DEGEN',
    autopsyCard: autopsyCard || undefined,
    timestamp: Date.now(),
  };

  chatMessages.push(newMsg);
  if (chatMessages.length > 80) chatMessages.shift();

  res.json({
    success: true,
    message: newMsg,
    messages: chatMessages,
  });
});

// Development vs Production serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRON Wallet Autopsy] Server operating on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server boot failed:', err);
});
