import { GoogleGenAI, Type } from '@google/genai';
import { DeathOracleResult } from './types.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function generateFuneralEulogy(deadTokens: string[], burialType: string, address: string) {
  const tokenListStr = deadTokens.join(', ') || 'Unknown Shitcoins';
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Write a short, hilarious, satirical crypto funeral eulogy for the following dead bags: ${tokenListStr}.
Burial method: ${burialType}.
Wallet: ${address.slice(0, 6)}...${address.slice(-4)}.
Style: High solemn church melodrama mixed with crypto degenerate grief. Keep it to 2 humorous paragraphs, ending with an epitaph quote.`,
      });
      if (response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn('Funeral eulogy AI call fallback:', e);
    }
  }

  return `Brothers, degens, and liquidity providers: We gather today in solemn mourning to commit ${tokenListStr} to the digital earth.\n\n` +
    `Born in the euphoric green candles of late-night Telegram calls, and struck down before the first audit could even begin, these bags gave everything they had—namely, 99.8% of their market value. As we administer the ${burialType}, we pray that no more TRX shall be wasted attempting to resurrect what is already dead.\n\n` +
    `"Here lies hope. May their liquidity rest in peace while their chart lies flat in eternal rest."`;
}

export async function generateWalletHoroscope(address: string, zodiacSign: string, degenScore: number) {
  const cleanSign = zodiacSign || 'Scorpio';
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an astrologer who predicts crypto destinies based on astrological signs and public blockchain wallets.
User Zodiac Sign: ${cleanSign}
Wallet: ${address}
Degen Score: ${degenScore}/100

Generate a funny, personalized 4-part crypto horoscope for a ${cleanSign}:
1. Astrological Alignment & Elemental Affinity (e.g. "Fire sign driven by burning TRX energy", "Water sign drowning in memecoin tears")
2. The Cycle Prophecy (2 funny, specific sentences about their trading habits and what the stars foretell)
3. Celestial Warning (e.g., what to avoid on SunSwap/SunPump during this moon phase)
4. Lucky & Unlucky Crypto Omens`,
      });
      if (response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn('Horoscope AI call fallback:', e);
    }
  }

  return `🌟 ASTROLOGICAL ALIGNMENT: ${cleanSign.toUpperCase()} with SunPump Ascendant in the 8th House of Margin Liquidation.\n\n` +
    `🔮 THE PROPHECY: As a ${cleanSign}, your celestial impulse to double-down on 90% drops is reaching peak lunar alignment. The planets predict an irresistible urge to ape into an unverified canine meme contract at 3:17 AM on a Sunday.\n\n` +
    `⚠️ CELESTIAL WARNING: Mars is currently in retrograde slippage. Do not approve unlimited contract spend to anonymous telegram bots claiming to have Justin Sun's private WhatsApp.\n\n` +
    `🍀 LUCKY TOKEN: TRX\n` +
    `☠️ UNLUCKY OMEN: Any whitepaper written in under 15 minutes that uses the word "Revolutionary" more than four times.`;
}

export async function generateDeathOracleProphecy(address: string, zodiacSign: string, degenScore: number): Promise<DeathOracleResult> {
  const currentYear = 2026;
  const currentTimestamp = Date.now();
  const daysUntilHalloween2026 = 23; // Oct 8, 2026 to Oct 31, 2026

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the Grim Crypt Keeper of the TRON Blockchain. 
A crypto degen has entered the Haunted Halloween Sepulcher seeking to know when and how their wallet will die.
Wallet Address: ${address}
Zodiac Sign: ${zodiacSign || 'Scorpio'}
Degen Score: ${degenScore}/100

TEMPORAL ANCHOR (CRITICAL):
- Today is October 8, ${currentYear}.
- The predicted date of death MUST BE A FUTURE DATE strictly on or after October 31, ${currentYear} (e.g., "October 31, ${currentYear} at 03:33 AM (Hour of the SunPump Witch)" or a date in ${currentYear + 1}).
- DO NOT under any circumstances output past years (2025, 2024, etc.). All predictions must be in the FUTURE relative to October ${currentYear}.
- "daysRemaining" MUST be a positive integer between 13 and 365 days into the future.

Generate a spooky, dark-comedy Halloween death prediction for their portfolio.
Respond with JSON matching the schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictedDateOfDeath: { type: Type.STRING, description: `A spooky future date strictly in ${currentYear} or ${currentYear + 1}, e.g. "October 31, ${currentYear} at 03:42 AM (Midnight of the Blood Moon)"` },
              daysRemaining: { type: Type.INTEGER, description: 'Positive number of days remaining into the future, between 13 and 365' },
              mannerOfDeath: { type: Type.STRING, description: 'Hilarious, spooky description of how their portfolio meets its demise' },
              cryptKeeperEpitaph: { type: Type.STRING, description: 'Short 2-sentence rhyming or gothic tombstone epitaph' },
              spookyCurse: { type: Type.STRING, description: 'A chilling curse placed upon their private keys' },
              hauntingSpirit: { type: Type.STRING, description: 'Name of the dead meme coin apparition that will haunt their dreams' },
              survivalTalisman: { type: Type.STRING, description: 'A ridiculous superstitious talisman to ward off the bear market grim reaper' },
              fearScore: { type: Type.INTEGER, description: 'Fear score between 66 and 100' }
            },
            required: [
              'predictedDateOfDeath',
              'daysRemaining',
              'mannerOfDeath',
              'cryptKeeperEpitaph',
              'spookyCurse',
              'hauntingSpirit',
              'survivalTalisman',
              'fearScore'
            ]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.mannerOfDeath) {
        // Hard guarantee: Ensure date can NEVER be in the past
        let cleanDate = parsed.predictedDateOfDeath || '';
        // Replace any past years 2020-2025 with currentYear (2026) or 2027
        cleanDate = cleanDate.replace(/202[0-5]/g, String(currentYear));

        const days = Math.max(13, Math.min(365, parsed.daysRemaining || daysUntilHalloween2026));

        // If the date string doesn't include 2026 or 2027, format based on daysRemaining
        if (!cleanDate.includes(String(currentYear)) && !cleanDate.includes(String(currentYear + 1))) {
          const futureDate = new Date(currentTimestamp + days * 86400000);
          cleanDate = `${futureDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at 03:33 AM (Hour of the Blood Moon)`;
        }

        parsed.predictedDateOfDeath = cleanDate;
        parsed.daysRemaining = days;
        return parsed;
      }
    } catch (e) {
      console.warn('Death oracle AI generation fallback:', e);
    }
  }

  // Algorithmic spooky death prediction fallback (Always future)
  const days = Math.max(13, Math.min(180, 100 - degenScore + daysUntilHalloween2026));
  const futureDate = new Date(currentTimestamp + days * 86400000);
  const formattedDate = `${futureDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at 03:42 UTC (The Witching Hour)`;

  return {
    predictedDateOfDeath: formattedDate,
    daysRemaining: days,
    mannerOfDeath: `Smothered in a bottomless liquidity vortex after mistaking a malicious Halloween honeypot token for a 10,000x multiplier. Witnesses report hearing faint whisperings of "WAGMI" before the account balance vanished into thin air.`,
    cryptKeeperEpitaph: `Here lies a degen who bought every dip,\nUntil the Grim Reaper tightened his grip.`,
    spookyCurse: `Thou shalt never again witness a green 4-hour candle on any chart thou gaze upon after midnight.`,
    hauntingSpirit: `The Spectral Ghost of Dead SunPump Tokens Past`,
    survivalTalisman: `A physical hardware wallet sprinkled with holy water and buried under an oak tree during the full moon.`,
    fearScore: Math.min(99, Math.max(70, degenScore + 10))
  };
}
