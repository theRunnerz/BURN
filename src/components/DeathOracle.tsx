import React, { useState, useEffect } from 'react';
import { Skull, Flame, Moon, Sparkles, RefreshCw, Share2, Download, AlertTriangle, Ghost } from 'lucide-react';
import { DeathOracleResult } from '../types.js';
import { createDeathOracle } from '../services/api.js';

interface DeathOracleProps {
  currentAddress?: string;
  degenScore?: number;
}

// Spooky gothic chord & toll using Web Audio API
function playSpookyOrgan() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // D minor spooky triad chord: D3, F3, A3, C#4
    const freqs = [146.83, 174.61, 220.00, 277.18];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    });
  } catch {
    // AudioContext silenced
  }
}

export const DeathOracle: React.FC<DeathOracleProps> = ({
  currentAddress,
  degenScore = 88,
}) => {
  const [addressInput, setAddressInput] = useState(currentAddress || '');
  const [selectedSign, setSelectedSign] = useState('Scorpio');
  const [prophecy, setProphecy] = useState<DeathOracleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState({ days: 23, hours: 14, minutes: 32, seconds: 45 });

  // Countdown timer tick for spooky ambience
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInvokeOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = addressInput.trim();
    if (!cleanAddr) {
      setErrorMsg('Please enter a target TRON wallet address.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    playSpookyOrgan();

    try {
      const res = await createDeathOracle(cleanAddr, selectedSign, degenScore);
      const safeProphecy = { ...res.prophecy };
      if (safeProphecy.predictedDateOfDeath) {
        safeProphecy.predictedDateOfDeath = safeProphecy.predictedDateOfDeath.replace(/202[0-5]/g, '2026');
      }
      setProphecy(safeProphecy);
      if (res.prophecy.daysRemaining) {
        setCountdown({
          days: res.prophecy.daysRemaining,
          hours: Math.floor(Math.random() * 23),
          minutes: Math.floor(Math.random() * 59),
          seconds: 59,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'The Crypt Keeper refused to speak.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareProphecy = () => {
    if (!prophecy) return;
    const text = `🎃 The TRON Crypto Reaper has prophesied my wallet's demise:\n\n` +
      `💀 Predicted Date of Death: ${prophecy.predictedDateOfDeath}\n` +
      `⚰️ Manner: "${prophecy.mannerOfDeath.slice(0, 100)}..."\n` +
      `👻 Haunting Ghost: ${prophecy.hauntingSpirit}\n\n` +
      `Consult the Death Oracle at tronwalletautopsy.com #HalloweenCrypto #TRON`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-data uppercase text-rose-500 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-full shadow-lg shadow-rose-950/50">
          <Ghost className="w-3.5 h-3.5 animate-bounce text-rose-400" />
          <span>Halloween Special // The Haunted Crypt</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
          THE CRYPTO <span className="text-rose-600">REAPER ORACLE</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Look into the blood crystal. The Reaper calculates the exact date and manner of your portfolio's death.
        </p>
      </div>

      <div className="bg-zinc-900/95 border-2 border-rose-950 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden morgue-glow-red">
        {/* Cobwebs and decorative gothic elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none select-none text-8xl font-cinzel text-rose-500">
          ☠️
        </div>

        <form onSubmit={handleInvokeOracle} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono-data text-zinc-300 uppercase block mb-1.5">
                Wallet Destined For Judgment:
              </label>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Paste TRON address (e.g. T...)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono-data text-zinc-300 uppercase block mb-1.5">
                Zodiac Alignment:
              </label>
              <select
                value={selectedSign}
                onChange={(e) => setSelectedSign(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {['Aries ♈', 'Taurus ♉', 'Gemini ♊', 'Cancer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Scorpio ♏', 'Sagittarius ♐', 'Capricorn ♑', 'Aquarius ♒', 'Pisces ♓'].map((s) => (
                  <option key={s} value={s.split(' ')[0]}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/70 border border-rose-900 rounded-lg text-rose-300 text-xs font-mono-data">
              {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-500 text-white font-heading font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-rose-950/80 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Summoning The Grim Reaper...</span>
                </>
              ) : (
                <>
                  <Skull className="w-4 h-4" />
                  <span>Reveal Time of Death (Enter The Crypt)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Oracle Death Clock & Revelation */}
        {prophecy && (
          <div className="mt-8 pt-8 border-t border-rose-900/60 animate-in fade-in space-y-6">
            {/* The Death Countdown Clock */}
            <div className="bg-zinc-950 border-2 border-rose-600/80 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
              <span className="text-[11px] font-mono-data uppercase tracking-widest text-rose-400 font-bold block">
                ⏳ TIME REMAINING UNTIL PORTFOLIO FLATLINE
              </span>

              <div className="grid grid-cols-4 max-w-sm mx-auto gap-2 font-mono-data">
                <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-3xl font-heading font-black text-rose-500 block">{countdown.days}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Days</span>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-3xl font-heading font-black text-rose-500 block">{countdown.hours}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Hours</span>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-3xl font-heading font-black text-rose-500 block">{countdown.minutes}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Mins</span>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-3xl font-heading font-black text-rose-500 block">{countdown.seconds}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Secs</span>
                </div>
              </div>

              <div className="pt-2 text-xs font-mono-data text-zinc-400">
                Predicted Demise Date: <strong className="text-white">{prophecy.predictedDateOfDeath}</strong>
              </div>
            </div>

            {/* Manner of Death and Spooky Pathology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-mono-data text-xs uppercase tracking-wider">
                  <Skull className="w-4 h-4" />
                  <span>The Foretold Manner of Demise</span>
                </div>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed italic">
                  "{prophecy.mannerOfDeath}"
                </p>
              </div>

              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-mono-data text-xs uppercase tracking-wider">
                  <Ghost className="w-4 h-4" />
                  <span>The Haunting Apparition</span>
                </div>
                <p className="text-zinc-200 text-xs font-bold">
                  {prophecy.hauntingSpirit}
                </p>
                <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                  <span className="text-rose-400 font-bold block mb-0.5">The Crypt Curse:</span>
                  <p className="italic">"{prophecy.spookyCurse}"</p>
                </div>
              </div>
            </div>

            {/* Tombstone Epitaph Banner */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-data text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">
                  Ward-off Talisman:
                </span>
                <span className="text-emerald-400 font-bold">
                  {prophecy.survivalTalisman}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-zinc-500 block text-[10px]">Fear Index</span>
                  <span className="text-rose-500 font-bold text-base">{prophecy.fearScore}/100</span>
                </div>

                <button
                  onClick={handleShareProphecy}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Prophecy on X</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
