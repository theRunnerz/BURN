import { GoogleGenAI, Type } from '@google/genai';
import { AutopsyScores, PathologyFinding, WalletData } from './types.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface GeminiAutopsyResult {
  scores: AutopsyScores;
  causeOfDeath: string;
  doctorsDiagnosis: string;
  coronersNote: string;
  pathologyFindings: PathologyFinding[];
  longestHeldBaggage: string;
  toxicHolding: string;
  rxPrescription: string;
  toxicQuote: string;
}

export async function generateAutopsyWithGemini(wallet: WalletData): Promise<GeminiAutopsyResult> {
  // If API key is not configured, fallback gracefully to our heuristic morgue coroner engine
  if (!process.env.GEMINI_API_KEY) {
    console.log('No GEMINI_API_KEY present in environment. Generating autopsy via algorithmic morgue coroner.');
    return generateHeuristicAutopsy(wallet);
  }

  try {
    const prompt = `
You are the Chief Forensic Crypto Coroner at the TRON Morgue (Department of Necrotic Bags & Terminal FOMO).
Examine this patient's public TRON wallet blockchain forensics and deliver a brutally funny, clinically cynical, dark-comedy medical autopsy.

WALLET FORENSICS REPORT:
- Public Address: ${wallet.address}
- TRX Balance: ${wallet.trxBalance.toLocaleString()} TRX (~$${wallet.trxUsdValue.toLocaleString()})
- Total Portfolio Value: ~$${wallet.totalUsdEstimate.toLocaleString()}
- Wallet Age: ${wallet.walletAgeDays} days (${(wallet.walletAgeDays / 365).toFixed(1)} years)
- Lifetime Transactions: ${wallet.transactionCount}
- DeFi / SunSwap Interactions: ${wallet.defiInteractionsCount}
- Token Holdings (${wallet.tokens.length} assets):
${wallet.tokens.map(t => `  * ${t.symbol} (${t.name}): ${t.balance.toLocaleString()} | ~$${t.usdValueEstimate || 0} (${t.percentageOfPortfolio}% of bag)${t.isMemeToken ? ' [MEME]' : ''}`).join('\n')}
- Largest Incoming Tx: ${wallet.largestIncomingTx ? `${wallet.largestIncomingTx.amount} ${wallet.largestIncomingTx.symbol} on ${wallet.largestIncomingTx.date}` : 'None recorded'}
- Largest Outgoing Tx: ${wallet.largestOutgoingTx ? `${wallet.largestOutgoingTx.amount} ${wallet.largestOutgoingTx.symbol} on ${wallet.largestOutgoingTx.date}` : 'None recorded'}

DIAGNOSTIC GUIDELINES:
1. "DEGEN SCORE" (0-100): High if holding many obscure meme tokens, SunPump tokens, or high tx velocity.
2. "DIAMOND HANDS SCORE" (0-100): High if wallet holds dead coins for years without selling or refuses to cut losses.
3. "FINANCIAL IQ" (0-100): Satirical metric. Usually between 4 and 45 unless they are an omniscient whale holding only USDT.
4. "RUG SURVIVAL SCORE" (0-100): Reflects whether they've been rugged by SunPump honeypots.
5. "DIVERSIFICATION SCORE" (0-100): Low if 90%+ is one dead meme coin or only TRX.
6. "CAUSE OF DEATH": A punchy, hilarious 1-sentence coroner declaration (e.g. "Bought the dip that kept dipping until it breached the Earth's mantle" or "Purchased 45 dog derivatives on SunPump at 4:17 AM").
7. "DOCTORS DIAGNOSIS": 2-3 detailed paragraphs of dark, witty forensic crypto pathology prose analyzing their bag decisions.
8. "CORONERS NOTE": 1-2 sentence teaser for the free preliminary report.
9. "PATHOLOGY FINDINGS": 3-4 medical conditions (e.g. "Acute FOMO Embolism", "Necrotic Bag Syndrome", "SunPump Delirium").
10. "RX PRESCRIPTION": A ridiculous medical prescription to treat their portfolio condition.
11. "TOXIC QUOTE": A memorable, shareable 6-12 word roast for an autopsy certificate banner.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            degenScore: { type: Type.INTEGER, description: 'Score 0 to 100' },
            diamondHandsScore: { type: Type.INTEGER, description: 'Score 0 to 100' },
            financialIq: { type: Type.INTEGER, description: 'Score 0 to 100' },
            rugSurvivalScore: { type: Type.INTEGER, description: 'Score 0 to 100' },
            diversificationScore: { type: Type.INTEGER, description: 'Score 0 to 100' },
            causeOfDeath: { type: Type.STRING },
            doctorsDiagnosis: { type: Type.STRING },
            coronersNote: { type: Type.STRING },
            longestHeldBaggage: { type: Type.STRING },
            toxicHolding: { type: Type.STRING },
            rxPrescription: { type: Type.STRING },
            toxicQuote: { type: Type.STRING },
            pathologyFindings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  condition: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['MILD', 'SEVERE', 'TERMINAL'] },
                  description: { type: Type.STRING },
                },
                required: ['condition', 'severity', 'description'],
              },
            },
          },
          required: [
            'degenScore',
            'diamondHandsScore',
            'financialIq',
            'rugSurvivalScore',
            'diversificationScore',
            'causeOfDeath',
            'doctorsDiagnosis',
            'coronersNote',
            'longestHeldBaggage',
            'toxicHolding',
            'rxPrescription',
            'toxicQuote',
            'pathologyFindings',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as any;

    return {
      scores: {
        degenScore: Math.min(100, Math.max(0, parsed.degenScore ?? 75)),
        diamondHandsScore: Math.min(100, Math.max(0, parsed.diamondHandsScore ?? 50)),
        financialIq: Math.min(100, Math.max(0, parsed.financialIq ?? 18)),
        rugSurvivalScore: Math.min(100, Math.max(0, parsed.rugSurvivalScore ?? 45)),
        diversificationScore: Math.min(100, Math.max(0, parsed.diversificationScore ?? 25)),
      },
      causeOfDeath: parsed.causeOfDeath || 'Acute liquidity drainage induced by SunPump adrenaline addiction.',
      doctorsDiagnosis: parsed.doctorsDiagnosis || 'Patient presented with catastrophic bag distention and severe refusal to set stop losses.',
      coronersNote: parsed.coronersNote || 'Preliminary autopsy reveals terminal memecoin toxicity in the lower wallet cavity.',
      longestHeldBaggage: parsed.longestHeldBaggage || (wallet.tokens[0]?.symbol || 'TRX'),
      toxicHolding: parsed.toxicHolding || (wallet.tokens.find(t => t.isMemeToken)?.symbol || 'SUNDOG'),
      rxPrescription: parsed.rxPrescription || 'Cease SunSwap access immediately; touch organic grass 3 times daily before meals.',
      toxicQuote: parsed.toxicQuote || '"Bought the dip. The dip bought a shovel."',
      pathologyFindings: Array.isArray(parsed.pathologyFindings) && parsed.pathologyFindings.length > 0
        ? parsed.pathologyFindings
        : [
            { condition: 'Terminal Bagholding', severity: 'TERMINAL', description: 'Subject has held zero-liquidity tokens across multiple halving cycles.' },
            { condition: 'Acute SunPump Sepsis', severity: 'SEVERE', description: 'Rapid onset of canine-themed token accumulation.' },
          ],
    };
  } catch (error) {
    console.error('Gemini autopsy generation error, falling back to heuristic autopsy:', error);
    return generateHeuristicAutopsy(wallet);
  }
}

// Algorithmic forensic generator ensures reliable humor even during network drops
function generateHeuristicAutopsy(wallet: WalletData): GeminiAutopsyResult {
  const memeCount = wallet.tokens.filter(t => t.isMemeToken).length;
  const isWhale = wallet.totalUsdEstimate > 100000;
  const isBroke = wallet.totalUsdEstimate < 100;
  const hasOldAge = wallet.walletAgeDays > 1000;

  let degen = 40 + memeCount * 12 + (wallet.defiInteractionsCount > 50 ? 25 : 5);
  if (isWhale) degen = Math.min(degen, 78);
  degen = Math.min(99, Math.max(15, degen));

  const diamond = hasOldAge ? 92 : Math.min(95, 30 + Math.floor(wallet.walletAgeDays / 15));
  const financialIq = isBroke ? 8 : (isWhale ? 42 : Math.max(4, 70 - memeCount * 14));
  const rugSurvival = memeCount > 3 ? 32 : (wallet.transactionCount > 100 ? 68 : 50);
  const diversification = Math.min(95, Math.max(10, wallet.tokens.length * 15));

  let cause = '';
  let quote = '';
  if (memeCount >= 3) {
    cause = `Purchased ${memeCount} separate dog derivatives on SunPump and watched liquidity evaporate at 3:42 AM.`;
    quote = '"Just one 100x will fix my entire bloodline."';
  } else if (isBroke) {
    cause = 'Exhausted life savings paying TRON energy fees to claim $0.14 worth of airdropped spam tokens.';
    quote = '"I am not down bad, I am just early."';
  } else if (isWhale) {
    cause = 'Suffocated beneath 14 million TRX while attempting to arbitrage SunSwap liquidity pools.';
    quote = '"Liquidity was never an exit strategy."';
  } else {
    cause = 'Bought the dip. The dip kept dipping until it breached the Earth’s molten mantle.';
    quote = '"HODL until the heat death of the universe."';
  }

  const toxic = wallet.tokens.find(t => t.isMemeToken)?.symbol || (wallet.tokens[1]?.symbol || 'UNKNOWN_TRC20');
  const longest = wallet.tokens[0]?.symbol || 'TRX';

  return {
    scores: {
      degenScore: degen,
      diamondHandsScore: diamond,
      financialIq,
      rugSurvivalScore: rugSurvival,
      diversificationScore: diversification,
    },
    causeOfDeath: cause,
    doctorsDiagnosis: `Upon opening the ledger cavity of patient ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}, the surgical team noted severe arterial congestion caused by ${wallet.tokens.length} distinct token clogs. The portfolio exhibits advanced stages of terminal diamond-hand rigor mortis: assets that have dropped 94% are still being cradled like newborn infants. The patient was evidently exposed to high-radiation SunPump hype cycles without protective stop-loss gear.\n\nMicroscopic examination of recent transactions reveals an obsession with high-velocity meme trades. The central wallet chamber shows zero remaining dopamine receptors, while the TRX reserves are barely maintaining vital signs against relentless energy burn.`,
    coronersNote: `Coroner Note: ${memeCount > 0 ? `${memeCount} necrotic meme bags detected.` : 'Severe portfolio flatline.'} Degen score elevated to critical thresholds. Full pathology locked pending official token burn.`,
    longestHeldBaggage: longest,
    toxicHolding: toxic,
    rxPrescription: 'Cease all TRON blockchain transactions immediately. Disconnect TronLink. Delete Telegram. Walk outside and touch un-tokenized grass.',
    toxicQuote: quote,
    pathologyFindings: [
      {
        condition: memeCount > 2 ? 'Acute SunPump Sepsis' : 'Incurable Bag Necrosis',
        severity: memeCount > 2 ? 'TERMINAL' : 'SEVERE',
        description: `Holding ${memeCount} speculative meme tokens with irreversible depreciation.`,
      },
      {
        condition: 'Terminal Diamond Hands',
        severity: diamond > 80 ? 'TERMINAL' : 'MILD',
        description: 'Complete inability of the central nervous system to click the "Sell" button.',
      },
      {
        condition: 'Deficit of Financial Sanity',
        severity: financialIq < 20 ? 'SEVERE' : 'MILD',
        description: `Measured Financial IQ of ${financialIq}/100 indicates prolonged exposure to crypto Twitter influencers.`,
      },
    ],
  };
}
