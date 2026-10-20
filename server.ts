import express from 'express';
import { createServer as createViteServer } from 'vite';
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
} from './server/types.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent demo store
const hallOfDead: HallOfDeadItem[] = [
  {
    id: 'hod-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    tokenSymbol: 'TRXPEPE',
    tokenName: 'TRON Frog King',
    burntAmount: 145000000,
    estimatedLostUsd: 1840.50,
    epitaph: 'Died when dev dumped 40% dev supply at 4 AM',
    walletShort: 'TJ9X...4kL9',
    ashesMinted: 184,
  },
  {
    id: 'hod-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    tokenSymbol: 'JUSTMOON',
    tokenName: 'Sun Moon Degen',
    burntAmount: 520000,
    estimatedLostUsd: 650.00,
    epitaph: 'Liquidity was pulled while Justin Sun was tweeting a cryptic emoji',
    walletShort: 'TW4r...8mP1',
    ashesMinted: 65,
  },
  {
    id: 'hod-3',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    tokenSymbol: 'SUNWUKONG',
    tokenName: 'Monkey King VIP',
    burntAmount: 999999999,
    estimatedLostUsd: 4210.00,
    epitaph: 'Thought it was the official game token. Turned out to be a honeypot clone.',
    walletShort: 'TD3z...1vX0',
    ashesMinted: 421,
  },
  {
    id: 'hod-4',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    tokenSymbol: 'SUNDOGE',
    tokenName: 'Golden Sun Doge',
    burntAmount: 3400000,
    estimatedLostUsd: 890.15,
    epitaph: 'Bought the absolute top green candle with high leverage',
    walletShort: 'TA8y...9qR3',
    ashesMinted: 89,
  }
];

const memorials: CommunityMemorial[] = [
  {
    id: 'mem-1',
    tokenSymbol: 'TRXPEPE',
    tokenName: 'TRON Pepe Classic',
    rugYear: 2024,
    deathCause: 'Midnight Liquidity Drain',
    totalCandlesLit: 142,
    ripCount: 98,
    eulogy: 'Gone but never forgotten. The TG chat disappeared faster than my college fund.',
    creator: 'TJ9X...4kL9',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'mem-2',
    tokenSymbol: 'JUSTINPUMP',
    tokenName: 'Justin Pump High',
    rugYear: 2024,
    deathCause: 'Blacklist Contract Trap',
    totalCandlesLit: 89,
    ripCount: 54,
    eulogy: 'You let us buy, but you never let us sell. RIP to the red candles.',
    creator: 'TD3z...1vX0',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'mem-3',
    tokenSymbol: 'TRONSHIBA',
    tokenName: 'Sun Shiba Inactive',
    rugYear: 2023,
    deathCause: 'Dev Abandonment Syndrome',
    totalCandlesLit: 231,
    ripCount: 165,
    eulogy: 'Roadmap promised a metaverse. Delivered a 404 page.',
    creator: 'TW4r...8mP1',
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

const leaderboard: BurnLeaderboardEntry[] = [
  { rank: 1, wallet: 'TD3z...1vX0', ashesBalance: 3450, tokensBurntCount: 14, totalUsdMemorialized: 34500, epitaph: 'King of Bagholders' },
  { rank: 2, wallet: 'TJ9X...4kL9', ashesBalance: 2120, tokensBurntCount: 9, totalUsdMemorialized: 21200, epitaph: 'Chasing Green Candles Since 2021' },
  { rank: 3, wallet: 'TW4r...8mP1', ashesBalance: 1850, tokensBurntCount: 7, totalUsdMemorialized: 18500, epitaph: 'Never Sold, Now I Burn' },
  { rank: 4, wallet: 'TA8y...9qR3', ashesBalance: 1240, tokensBurntCount: 5, totalUsdMemorialized: 12400, epitaph: 'SunPump Victim #441' },
  { rank: 5, wallet: 'TP7m...5kQ2', ashesBalance: 980, tokensBurntCount: 4, totalUsdMemorialized: 9800, epitaph: 'HODL Until Flatline' },
];

// Arcade State
const ARCADE_REVENUE_WALLET = 'TNW5ABkp3v4jfeDo1vRVjxa3gtnoxP3DBN'; // Football Alien dev / burning wallet

const arcadeScores: ArcadeScore[] = [
  { id: 'sc-1', player: 'TRX_SLAYER', score: 18450, game: 'tron-man', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), walletAddress: 'TJ9X...4kL9' },
  { id: 'sc-2', player: 'NEO_CYBORG', score: 14200, game: 'tron-man', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), walletAddress: 'TD3z...1vX0' },
  { id: 'sc-3', player: 'ASTRO_DEGEN', score: 26800, game: 'x1-roid', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), walletAddress: 'TW4r...8mP1' },
  { id: 'sc-4', player: 'VOID_RUNNER', score: 21350, game: 'x1-roid', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), walletAddress: 'TA8y...9qR3' },
  { id: 'sc-5', player: 'FBA_TOUCHDOWN', score: 38400, game: 'football-alien', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), walletAddress: 'TNW5...3DBN' },
  { id: 'sc-6', player: 'COSMIC_QB', score: 29500, game: 'football-alien', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), walletAddress: 'TJ9X...4kL9' }
];

// Cemetery Chat State
const chatMessages: ChatMessage[] = [
  {
    id: 'chat-1',
    player: 'Gravedigger_Joe',
    walletAddress: 'TJ9X...4kL9',
    message: 'Welcome degens. The funeral furnace is roaring 24/7. Bring your dead tokens!',
    avatarSeed: 'skull',
    rankBadge: 'ARCH-MOURNER',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'chat-2',
    player: 'SunPumpSurvivor',
    walletAddress: 'TD3z...1vX0',
    message: 'Just dropped 20 TRX into the Tron-Man cabinet. Who has top score?',
    avatarSeed: 'alien',
    rankBadge: 'ARCADE CHAMP',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'chat-3',
    player: 'AshesCollector',
    walletAddress: 'TW4r...8mP1',
    message: 'Burned 500M TRXPEPE today. My wallet feels so clean and unburdened.',
    avatarSeed: 'flame',
    rankBadge: 'FIRE MARSHAL',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

// 1. Autopsy Analysis Endpoint
app.get('/api/autopsy', (req, res) => {
  const address = (req.query.address as string) || '';
  if (!address || address.length < 10) {
    return res.status(400).json({ error: 'Valid TRON address (e.g. T...) is required' });
  }

  // Deterministic seed based on address
  let seed = 0;
  for (let i = 0; i < address.length; i++) {
    seed = (seed * 31 + address.charCodeAt(i)) % 1000000;
  }

  const riskScore = 40 + (seed % 56); // 40 to 95
  let status: AutopsyReport['status'] = 'TERMINAL';
  if (riskScore > 85) status = 'FLATLINED';
  else if (riskScore > 70) status = 'BRAIN_DEAD';
  else if (riskScore > 50) status = 'TERMINAL';
  else status = 'SURVIVING';

  const rugNames = ['TRXPEPE', 'JUSTMOON', 'SUNDOGE', 'SUNWUKONG_FAKE', 'TRONINU', 'MEMETRON', 'JUSTIN_ROCKET'];
  const worstRug = rugNames[seed % rugNames.length];
  const deadCount = 3 + (seed % 14);
  const estimatedLost = 450 + (seed % 12500) * 1.35;
  const gasSpent = 120 + (seed % 890);
  const winRate = Math.max(4, 38 - Math.floor(riskScore * 0.35));

  const report: AutopsyReport = {
    address,
    timestamp: new Date().toISOString(),
    riskScore,
    status,
    summary: `Subject shows severe acute memecoin toxicity. Post-mortem examination detected ${deadCount} dead token contracts with zero remaining liquidity. Vital signs indicate terminal degen trauma.`,
    primaryCauseOfDeath: `Massive liquidity hemorrhage induced by holding unverified SunPump launches into the red candle abyss.`,
    pathologyFindings: [
      {
        system: 'LIQUIDITY',
        severity: riskScore > 75 ? 'CRITICAL' : 'SEVERE',
        finding: `${deadCount} Untradeable Zombie Tokens`,
        description: `Over 80% of token contracts in this address have liquidity pools drained below $10 total depth.`
      },
      {
        system: 'SMART_CONTRACT',
        severity: 'SEVERE',
        finding: 'Honeypot Exposure Detected',
        description: `Subject approved unlimited allowances to at least 2 contracts containing blacklist/tax-hijack functions.`
      },
      {
        system: 'PORTFOLIO_DIVERSITY',
        severity: 'MODERATE',
        finding: 'Zero Stablecoin Reserve',
        description: `No USDT, USDJ, or USDD safety margin detected. 98.4% allocation to high-velocity animal tokens.`
      },
      {
        system: 'RUG_EXPOSURE',
        severity: 'CRITICAL',
        finding: `Lethal Hit by ${worstRug}`,
        description: `Primary trauma source identified. Dev dumped liquidity pool 14 minutes after deployment.`
      }
    ],
    financialVitals: {
      trxBalance: 12.4 + (seed % 450),
      totalTokensTracked: deadCount + 5,
      totalLossEstimatedUsd: Math.round(estimatedLost),
      totalGasSpentUsd: Math.round(gasSpent),
      deadTokensCount: deadCount,
      winRate,
      worstRugName: worstRug,
      worstRugLossUsd: Math.round(estimatedLost * 0.65)
    },
    degenSins: [
      {
        sinName: 'Buying 5-Minute-Old SunPump Green Candles',
        punishment: 'Eternal holding of 100,000,000,000 unsellable tokens',
        severity: 'MORTAL'
      },
      {
        sinName: 'Never Taking 2x Profits',
        punishment: 'Watching 10x gains dissolve into -99.9% while repeating "WAGMI"',
        severity: 'UNFORGIVABLE'
      },
      {
        sinName: 'Trusting Telegram Voice Chat Devs',
        punishment: 'Re-listening to "marketing push at 500k MC" on loop forever',
        severity: 'MORTAL'
      }
    ],
    eulogy: `Here lies ${address.slice(0, 6)}...${address.slice(-4)}, a brave warrior who never saw a dip they didn't buy, nor a rug they didn't step on. May the blockchain remember your gas fees.`,
    survivalTips: [
      'Stop buying tokens where top 5 holders own 85% of total supply.',
      'Revoke smart contract approvals for contracts older than 30 days.',
      'Memorialize and burn your zombie tokens to clear toxic wallet energy and mint $ASHES.',
      'Take initial investment out once token crosses 2x.'
    ],
    shareableSlug: `autopsy-${address.slice(0, 8)}`
  };

  res.json(report);
});

// 2. Mock / Real Tokens by address
app.get('/api/tokens', (req, res) => {
  const address = (req.query.address as string) || '';
  let seed = 0;
  for (let i = 0; i < address.length; i++) {
    seed = (seed * 17 + address.charCodeAt(i)) % 50000;
  }

  const sampleDeadTokens = [
    {
      symbol: 'TRXPEPE',
      name: 'TRON Pepe Classic',
      address: 'TRXPEPE99xDeadLqPool99014589',
      balance: 145000000,
      decimals: 18,
      status: 'RUGGED',
      reason: 'Dev drained liquidity 12 hours after launch',
      burnValueAshes: 145,
      lossUsd: 1240
    },
    {
      symbol: 'JUSTMOON',
      name: 'Just Moon Token',
      address: 'TJSTMOON888ZombieToken890123',
      balance: 5500000,
      decimals: 6,
      status: 'ABANDONED',
      reason: 'Zero volume for 180 days, Telegram deleted',
      burnValueAshes: 55,
      lossUsd: 480
    },
    {
      symbol: 'SUNDOGE',
      name: 'Sun Doge VIP',
      address: 'TSUNDOGE777SunPumpDead998231',
      balance: 2400000000,
      decimals: 9,
      status: 'HONEYPOT',
      reason: 'Transfer fee set to 99% upon selling',
      burnValueAshes: 240,
      lossUsd: 2100
    },
    {
      symbol: 'BABYSUN',
      name: 'Baby Sun Emperor',
      address: 'TBABYSUN111DevDumpedLiquidity',
      balance: 89000000,
      decimals: 18,
      status: 'RUGGED',
      reason: 'Mint function exploited, trillions minted',
      burnValueAshes: 89,
      lossUsd: 650
    }
  ];

  res.json({
    tokens: sampleDeadTokens,
    trxBalance: 42.50 + (seed % 100)
  });
});

// 3. Burn Dead Token Endpoint
app.post('/api/burn', (req, res) => {
  const { tokenAddress, tokenSymbol, amount, walletAddress, epitaph, sinRepented } = req.body;

  if (!tokenSymbol || !amount || !walletAddress) {
    return res.status(400).json({ error: 'Missing required burn parameters' });
  }

  const ashesReceived = Math.max(1, Math.round(amount > 1000 ? Math.log10(amount) * 25 : amount * 0.1));
  const certificateId = `BURN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const cert: BurnCertificate = {
    certificateId,
    timestamp: new Date().toISOString(),
    deadTokenAddress: tokenAddress || 'TRXDEAD00000000000000000000000000',
    deadTokenSymbol: tokenSymbol,
    deadTokenAmount: amount,
    walletAddress,
    ashesReceived,
    txHash,
    epitaph: epitaph || 'Forgive me Justin, for I have aped without looking at the liquidity lock.',
    sinRepented: sinRepented || 'Fallen victim to green dildos and FOMO voices.'
  };

  // Add to Hall of Dead
  hallOfDead.unshift({
    id: `hod-${Date.now()}`,
    timestamp: cert.timestamp,
    tokenSymbol: cert.deadTokenSymbol,
    tokenName: `${cert.deadTokenSymbol} Memorial`,
    burntAmount: cert.deadTokenAmount,
    estimatedLostUsd: ashesReceived * 10,
    epitaph: cert.epitaph,
    walletShort: `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
    ashesMinted: ashesReceived
  });

  // Update leaderboard
  const existing = leaderboard.find(l => l.wallet.toLowerCase() === `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`.toLowerCase());
  if (existing) {
    existing.ashesBalance += ashesReceived;
    existing.tokensBurntCount += 1;
    existing.totalUsdMemorialized += ashesReceived * 10;
  } else {
    leaderboard.push({
      rank: leaderboard.length + 1,
      wallet: `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
      ashesBalance: ashesReceived,
      tokensBurntCount: 1,
      totalUsdMemorialized: ashesReceived * 10,
      epitaph: cert.epitaph
    });
  }
  leaderboard.sort((a, b) => b.ashesBalance - a.ashesBalance);
  leaderboard.forEach((entry, idx) => { entry.rank = idx + 1; });

  res.json(cert);
});

// 4. Hall of Dead Public List
app.get('/api/hall-of-dead', (req, res) => {
  res.json({
    items: hallOfDead,
    totalBurntCount: hallOfDead.length + 1420,
    totalLostUsd: hallOfDead.reduce((acc, curr) => acc + curr.estimatedLostUsd, 284500)
  });
});

// 5. Burn Leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard });
});

// 6. Community Memorials
app.get('/api/memorials', (req, res) => {
  res.json({ memorials });
});

app.post('/api/memorials/:id/candle', (req, res) => {
  const { id } = req.params;
  const mem = memorials.find(m => m.id === id);
  if (!mem) return res.status(404).json({ error: 'Memorial not found' });
  mem.totalCandlesLit += 1;
  res.json({ success: true, candles: mem.totalCandlesLit });
});

app.post('/api/memorials', (req, res) => {
  const { tokenSymbol, tokenName, rugYear, deathCause, eulogy, creator } = req.body;
  if (!tokenSymbol || !deathCause) {
    return res.status(400).json({ error: 'Missing memorial information' });
  }

  const newMem: CommunityMemorial = {
    id: `mem-${Date.now()}`,
    tokenSymbol,
    tokenName: tokenName || tokenSymbol,
    rugYear: rugYear || new Date().getFullYear(),
    deathCause,
    totalCandlesLit: 1,
    ripCount: 1,
    eulogy: eulogy || 'May your chart in heaven only go up and to the right.',
    creator: creator || 'Anonymous Mourner',
    timestamp: new Date().toISOString()
  };

  memorials.unshift(newMem);
  res.json(newMem);
});

// 7. Death Oracle
app.post('/api/oracle', (req, res) => {
  const { address, zodiacSign, degenScore } = req.body;
  const safeAddress = address || 'T_UNKNOWN_DEGEN';
  
  let seed = 0;
  for (let i = 0; i < safeAddress.length; i++) {
    seed = (seed * 19 + safeAddress.charCodeAt(i)) % 99999;
  }

  const causes = [
    'Aping into a 3-minute-old SunPump token after seeing an anime GIF on X',
    'Signing a malicious gasless permit transaction while sleep deprived at 3:45 AM',
    'Forgetting a 50x perpetual position right before Justin Sun announces an exchange maintenance window',
    'Sending 10,000 TRX to a Telegram bot pretending to be Justin Sun offering a 2x giveaway',
    'Trying to arbitrage a honeypot token on SunSwap and paying 99.9% slippage'
  ];

  const dangerTokens = ['CYBERPUMP', 'TRONCAT', 'MOONSUN', 'TRXINU', 'DEGEN69', 'REKTBOY'];

  const prophecy: DeathOracleResult = {
    deathDate: new Date(Date.now() + (seed % 180 + 14) * 86400000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    deathCause: causes[seed % causes.length],
    dangerToken: dangerTokens[seed % dangerTokens.length],
    predictedLossUsd: 1200 + (seed % 8800),
    survivalOdds: Math.max(3, 45 - Math.floor((degenScore || 50) * 0.4)),
    finalWords: `"The dev renounced ownership in voice chat, this one is different bro..."`,
    graveyardTombstone: `🪦 HERE SHALL REST ${safeAddress.slice(0, 6)}...${safeAddress.slice(-4)}\n"He saw the red candle, but believed it was just a healthy retracement."`,
    oraclePoem: `When ${zodiacSign || 'the stars'} align with Justin's tweet,\nA sudden dump shall bring defeat.\nRepent your bags, ignite the pyre,\nOr watch your savings drown in fire.`
  };

  res.json({ prophecy });
});

// 8. Arcade Endpoints
app.get('/api/arcade/config', (req, res) => {
  const config: ArcadeConfig = {
    feeTrx: 20, // 20 TRX to play
    revenueAddress: ARCADE_REVENUE_WALLET,
    demoCredits: 3
  };
  res.json(config);
});

app.post('/api/arcade/deposit', (req, res) => {
  const { walletAddress, game, txHash, isDemo } = req.body;
  if (!game) {
    return res.status(400).json({ error: 'Game identifier is required' });
  }

  // If real deposit or demo
  const creditsAwarded = isDemo ? 1 : 3; // 20 TRX buys 3 credits
  res.json({
    success: true,
    credits: creditsAwarded,
    revenueAddress: ARCADE_REVENUE_WALLET,
    message: isDemo ? 'Demo credit activated' : '20 TRX inserted! 3 credits loaded into cabinet.'
  });
});

app.get('/api/arcade/scores', (req, res) => {
  res.json({
    scores: arcadeScores,
    tronManScores: arcadeScores.filter(s => s.game === 'tron-man').sort((a, b) => b.score - a.score),
    x1RoidScores: arcadeScores.filter(s => s.game === 'x1-roid').sort((a, b) => b.score - a.score),
    footballAlienScores: arcadeScores.filter(s => s.game === 'football-alien').sort((a, b) => b.score - a.score)
  });
});

app.post('/api/arcade/scores', (req, res) => {
  const { game, player, walletAddress, score } = req.body;
  if (!game || !player || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid score submission payload' });
  }

  const newEntry: ArcadeScore = {
    id: `sc-${Date.now()}`,
    player: player.slice(0, 14).toUpperCase(),
    score: Math.floor(score),
    game,
    timestamp: new Date().toISOString(),
    walletAddress: walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : undefined
  };

  arcadeScores.push(newEntry);
  arcadeScores.sort((a, b) => b.score - a.score);

  res.json({
    success: true,
    newEntry,
    scores: arcadeScores.slice(0, 25)
  });
});

// 9. Cemetery Chat Endpoints
app.get('/api/chat', (req, res) => {
  res.json({ messages: chatMessages.slice(-50) });
});

app.post('/api/chat', (req, res) => {
  const { player, walletAddress, message, avatarSeed, rankBadge } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const safeMsg = message.trim().slice(0, 240);
  const newMsg: ChatMessage = {
    id: `chat-${Date.now()}`,
    player: (player || 'Anonymous Mourner').slice(0, 16),
    walletAddress: walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'TRX_DEGEN',
    message: safeMsg,
    avatarSeed: avatarSeed || 'skull',
    rankBadge: rankBadge || 'MOURNER',
    timestamp: new Date().toISOString()
  };

  chatMessages.push(newMsg);
  if (chatMessages.length > 200) {
    chatMessages.shift();
  }

  res.json({ success: true, message: newMsg });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`💀 TRON Autopsy & Incinerator Server active on port ${PORT}`);
  });
}

startServer();
