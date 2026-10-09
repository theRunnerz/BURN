import React, { useState } from 'react';
import { Sparkles, Compass, Moon, Sun, RefreshCw, Share2 } from 'lucide-react';
import { createWalletHoroscope } from '../services/api.js';

interface WalletHoroscopeProps {
  currentAddress?: string;
  degenScore?: number;
}

interface ZodiacSignInfo {
  id: string;
  name: string;
  symbol: string;
  dates: string;
  element: string;
  cryptoArchetype: string;
}

const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  { id: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire', cryptoArchetype: 'The Market Order Impulser' },
  { id: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', cryptoArchetype: 'The Stubborn 7-Year Bagholder' },
  { id: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air', cryptoArchetype: 'The Dual-Wallet Sybil Farmer' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', cryptoArchetype: 'The Emotionally Attached HODLer' },
  { id: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire', cryptoArchetype: 'The PnL Screenshot Flexer' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', cryptoArchetype: 'The Spreadsheet Over-Analyzer' },
  { id: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air', cryptoArchetype: 'The Indecisive Stop-Loss Canceler' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', cryptoArchetype: 'The Vengeful Revenge Trader' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire', cryptoArchetype: 'The Blind Moonboy Believer' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', cryptoArchetype: 'The Bear Market Hardened Miser' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air', cryptoArchetype: 'The Experimental Shitcoin Alchemist' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', cryptoArchetype: 'The Delusional WAGMI Dreamer' },
];

export const WalletHoroscope: React.FC<WalletHoroscopeProps> = ({
  currentAddress,
  degenScore = 75,
}) => {
  const [addressInput, setAddressInput] = useState(currentAddress || '');
  const [selectedSign, setSelectedSign] = useState<string>('scorpio');
  const [horoscope, setHoroscope] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeSignData = ZODIAC_SIGNS.find((s) => s.id === selectedSign) || ZODIAC_SIGNS[7];

  const handleConsultStars = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = addressInput.trim();
    if (!cleanAddr) {
      setErrorMsg('Please enter or connect a TRON wallet address.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await createWalletHoroscope(cleanAddr, activeSignData.name, degenScore);
      setHoroscope(res.horoscope);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to align celestial constellations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareHoroscope = () => {
    const text = `🔮 My TRON Wallet Horoscope (${activeSignData.name} ${activeSignData.symbol}):\n` +
      `Archetype: "${activeSignData.cryptoArchetype}"\n\n` +
      `Read your wallet's celestial crypto prophecy at tronwalletautopsy.com #TRON #CryptoHoroscope`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-data uppercase text-purple-400 bg-purple-950/40 border border-purple-900/60 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Celestial Blockchain Astrometry</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
          WALLET <span className="text-purple-400">HOROSCOPE</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Select your astrological sign and pair it with your public TRON wallet for an unqualified AI cycle prophecy.
        </p>
      </div>

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-6">
        <form onSubmit={handleConsultStars} className="space-y-6">
          {/* Wallet Address Input */}
          <div>
            <label className="text-xs font-mono-data text-zinc-300 uppercase block mb-1.5">
              Target Wallet Address:
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Paste TRON address (e.g. T...)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* 12 Zodiac Sign Grid Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono-data text-zinc-300 uppercase">
                Choose Your Astrological Sign:
              </label>
              <span className="text-xs font-mono-data text-purple-400 font-bold">
                Selected: {activeSignData.name} ({activeSignData.symbol}) · {activeSignData.cryptoArchetype}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {ZODIAC_SIGNS.map((sign) => {
                const isSelected = selectedSign === sign.id;
                return (
                  <button
                    key={sign.id}
                    type="button"
                    onClick={() => setSelectedSign(sign.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-900/30'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{sign.symbol}</span>
                      <span className={`text-[9px] font-mono-data uppercase px-1 rounded ${
                        sign.element === 'Fire' ? 'text-rose-400' :
                        sign.element === 'Water' ? 'text-cyan-400' :
                        sign.element === 'Air' ? 'text-purple-300' : 'text-emerald-400'
                      }`}>
                        {sign.element}
                      </span>
                    </div>
                    <span className="text-xs font-bold block text-zinc-200">{sign.name}</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1">{sign.cryptoArchetype}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/50 border border-rose-900 rounded-lg text-rose-300 text-xs font-mono-data">
              {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-heading font-black uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/80 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Aligning Planetary Orbits for {activeSignData.name}...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Cast Celestial Prophecy ({activeSignData.name} {activeSignData.symbol})</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prophecy Output */}
        {horoscope && (
          <div className="mt-8 pt-6 border-t border-zinc-800 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Cosmic Reading for {activeSignData.name} ({activeSignData.symbol})
              </span>

              <button
                onClick={handleShareHoroscope}
                className="text-xs text-purple-300 hover:text-white font-mono-data flex items-center gap-1.5 cursor-pointer bg-purple-950/60 border border-purple-900 px-3 py-1.5 rounded-lg"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Reading</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 bg-zinc-950 border-2 border-purple-900/60 rounded-2xl text-zinc-200 text-sm leading-relaxed whitespace-pre-line font-sans relative overflow-hidden shadow-2xl">
              <div className="absolute top-2 right-4 text-purple-600/20 text-6xl select-none font-cinzel">
                {activeSignData.symbol}
              </div>
              {horoscope}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
