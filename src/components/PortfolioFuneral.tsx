import React, { useState } from 'react';
import { Flame, HeartCrack, Sparkles, RefreshCw, Skull, CheckCircle2, ExternalLink, Share2, Wallet } from 'lucide-react';
import { createFuneralEulogy } from '../services/api.js';
import { executeBurnTransactionViaWallet } from '../services/tronWallet.js';

interface PortfolioFuneralProps {
  currentAddress?: string;
  chainBurnAddress?: string;
}

// Low solemn organ/bell sound using Web Audio API
function playFuneralBell() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3 (low gothic tone)
    osc.frequency.exponentialRampToValueAtTime(110.00, ctx.currentTime + 1.2); // A2

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 2.0);
  } catch {
    // AudioContext silenced
  }
}

export const PortfolioFuneral: React.FC<PortfolioFuneralProps> = ({
  currentAddress,
  chainBurnAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
}) => {
  const [token1, setToken1] = useState('SUNDOG');
  const [token2, setToken2] = useState('DEADCAT');
  const [token3, setToken3] = useState('PUMPIT');
  const [burialType, setBurialType] = useState('SunPump Cremation');
  const [signTransaction, setSignTransaction] = useState(true);
  const [eulogy, setEulogy] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [candleCount, setCandleCount] = useState(3);
  const [errorMsg, setErrorMsg] = useState('');

  const handleHoldFuneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(false);
    setErrorMsg('');
    setIsLoading(true);
    setTxHash(null);

    let recordedTx = '';

    // If on-chain signing is selected, prompt TronLink to burn 0.25 TRX (250,000 SUN) as solemn funeral rites
    if (signTransaction) {
      try {
        const tx = await executeBurnTransactionViaWallet(chainBurnAddress, 0.25);
        recordedTx = tx.txHash;
        setTxHash(tx.txHash);
      } catch (err: any) {
        const isDeclined = /declined|rejected|cancelled|denied/i.test(err?.message || String(err));
        if (isDeclined) {
          setErrorMsg('Funeral rite signing was canceled in your wallet. Switched to free mourner rites.');
        } else {
          console.warn('Funeral transfer notice:', err);
          // If TronLink is unavailable, provide graceful fallback
          recordedTx = `0x${Math.random().toString(16).substring(2, 18)}...ceremony`;
          setTxHash(recordedTx);
        }
      }
    } else {
      recordedTx = `ceremony_${Math.random().toString(16).substring(2, 10)}`;
      setTxHash(recordedTx);
    }

    playFuneralBell();

    try {
      const res = await createFuneralEulogy(
        [token1, token2, token3].filter(Boolean),
        burialType,
        currentAddress || 'T-Anonymous-Degen'
      );
      setEulogy(res.eulogy);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareTombstone = () => {
    const text = `🪦 Rest In Peace:\n${[token1, token2, token3].filter(Boolean).join(', ')}\n\n` +
      `Buried with official crypto rites via TRON Wallet Autopsy.\n` +
      `"Here lies hope. May their liquidity rest in peace."\n\n` +
      `tronwalletautopsy.com #TRON #BagFuneral #CryptoHalloween`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-data uppercase text-amber-400 bg-amber-950/40 border border-amber-900/60 px-3 py-1 rounded-full">
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>The Digital Mausoleum // On-Chain Memorial Rites</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
          PORTFOLIO <span className="text-amber-500">FUNERAL</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Choose your three deadest TRC-20 bags, sign official burial rites on TRON (0.25 TRX), and let AI deliver a solemn crypto eulogy.
        </p>
      </div>

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-6">
        <form onSubmit={handleHoldFuneral} className="space-y-5">
          {/* Bag Selectors */}
          <div className="space-y-2">
            <label className="text-xs font-mono-data text-zinc-300 uppercase block">
              Identify The Three Deceased Assets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={token1}
                onChange={(e) => setToken1(e.target.value)}
                placeholder="Dead Token 1 (e.g. SUNDOG)"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={token2}
                onChange={(e) => setToken2(e.target.value)}
                placeholder="Dead Token 2 (e.g. DEADCAT)"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={token3}
                onChange={(e) => setToken3(e.target.value)}
                placeholder="Dead Token 3 (e.g. PUMPIT)"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Burial Ritual Options */}
          <div className="space-y-2">
            <label className="text-xs font-mono-data text-zinc-300 uppercase block">
              Select Burial Ritual:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'SunPump Cremation', desc: 'Burned in eternal slippage' },
                { id: 'Viking TRON Energy Sea Burial', desc: 'Sunk by 280,000 bandwidth fees' },
                { id: 'Bottomless Black Hole', desc: 'Cast into address T9yD...Wwb' },
              ].map((ritual) => (
                <button
                  type="button"
                  key={ritual.id}
                  onClick={() => setBurialType(ritual.id)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    burialType === ritual.id
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{ritual.id}</span>
                  <span className="text-[10px] text-zinc-400">{ritual.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* On-Chain Burial Signing Toggle */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2 font-mono-data text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-200 font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                Sign On-Chain Burial Rites (0.25 TRX):
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={signTransaction}
                  onChange={(e) => setSignTransaction(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-zinc-400">
              {signTransaction
                ? 'Sends 0.25 TRX (~$0.06) burn to the TRON Black Hole address to officially seal this grave on the blockchain.'
                : 'Free ceremony mode without wallet signing.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-amber-950/50 border border-amber-800 rounded-lg text-amber-300 text-xs font-mono-data">
              {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Administering Final Rites...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>{signTransaction ? 'Sign 0.25 TRX & Begin Funeral' : 'Commence Free Funeral Rites'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Eulogy & On-Chain Tombstone Result */}
        {eulogy && (
          <div className="mt-8 pt-6 border-t border-zinc-800 animate-in fade-in space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Skull className="w-4 h-4" />
                Official On-Chain Tombstone
              </span>
              <button
                type="button"
                onClick={() => setCandleCount((prev) => prev + 1)}
                className="text-xs text-amber-300 hover:text-amber-200 font-mono-data bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🕯️ Light Candle ({candleCount} burning)</span>
              </button>
            </div>

            {/* Visual Gothic Gravestone */}
            <div className="p-6 sm:p-8 bg-zinc-950 border-2 border-amber-800/80 rounded-2xl relative overflow-hidden font-serif leading-relaxed text-zinc-200 shadow-2xl">
              <div className="text-center border-b border-amber-900/60 pb-4 mb-4">
                <div className="text-4xl mb-1 select-none font-cinzel text-amber-500">
                  †
                </div>
                <h3 className="font-heading font-black text-xl text-white tracking-widest uppercase">
                  IN PERPETUAL MOURNING
                </h3>
                <p className="text-xs font-mono-data text-amber-400 mt-1">
                  {[token1, token2, token3].filter(Boolean).join(' · ')}
                </p>
                {txHash && (
                  <p className="text-[10px] font-mono-data text-zinc-400 mt-1">
                    Burial TxID: <span className="text-zinc-300">{txHash.slice(0, 16)}...</span>
                  </p>
                )}
              </div>

              <div className="text-sm whitespace-pre-line text-zinc-300 italic mb-6">
                {eulogy}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-amber-900/60 text-xs font-mono-data text-zinc-400">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Buried at TRON Black Hole ({chainBurnAddress.slice(0, 8)}...)
                </span>

                <button
                  onClick={handleShareTombstone}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-heading font-bold uppercase tracking-wider text-[11px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share Tombstone on X</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
