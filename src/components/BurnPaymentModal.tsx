import React, { useState } from 'react';
import { X, Flame, ShieldAlert, ArrowRight, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, Zap, Info, Sparkles } from 'lucide-react';
import { ChainConfig } from '../types.js';
import { executeBurnTransactionViaWallet } from '../services/tronWallet.js';

interface BurnPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  autopsyId: string;
  walletAddress: string;
  chainConfig: ChainConfig;
  onBurnVerified: (txHash: string, burnAmount?: number, burnTokenSymbol?: string) => Promise<void>;
}

// Retro arcade coin drop sound effect using Web Audio API
function playCoinSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // High cheerful arcade two-tone coin ding: B5 -> E6
    osc1.frequency.setValueAtTime(987.77, ctx.currentTime);
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);

    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime);
    osc2.frequency.setValueAtTime(1760.00, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext silenced or not yet interacted
  }
}

export const BurnPaymentModal: React.FC<BurnPaymentModalProps> = ({
  isOpen,
  onClose,
  autopsyId,
  walletAddress,
  chainConfig,
  onBurnVerified,
}) => {
  const [activeMethod, setActiveMethod] = useState<'quarter' | 'manual' | 'demo'>('quarter');
  const [manualTxHash, setManualTxHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDroppingCoin, setIsDroppingCoin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [wasDeclinedByUser, setWasDeclinedByUser] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyBurnAddress = () => {
    navigator.clipboard.writeText(chainConfig.burnAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 1. Drop a Quarter (0.25 TRX) into the Slot
  const handleDropQuarter = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setWasDeclinedByUser(false);
    setIsDroppingCoin(true);

    playCoinSound();

    try {
      // 0.25 TRX burn transfer (250,000 SUN) to the black hole address
      const tx = await executeBurnTransactionViaWallet(
        chainConfig.burnAddress,
        0.25
      );

      // Verify on backend
      await onBurnVerified(tx.txHash, 0.25, 'TRX');
      onClose();
    } catch (err: any) {
      const isDeclined = err?.isUserDeclined || /declined|rejected|cancelled|denied/i.test(err?.message || String(err));
      if (isDeclined) {
        console.info('User opted not to confirm in TronLink.');
        setWasDeclinedByUser(true);
      } else {
        console.warn('Transaction status:', err?.message || err);
        setErrorMsg(err.message || 'Transaction could not be completed.');
      }
    } finally {
      setIsProcessing(false);
      setIsDroppingCoin(false);
    }
  };

  // 2. Manual TxHash Verification
  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHash = manualTxHash.trim();
    if (!cleanHash) {
      setErrorMsg('Please enter the TRON transaction hash (TxID).');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setWasDeclinedByUser(false);
    try {
      await onBurnVerified(cleanHash, 0.25, 'TRX');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify burn on TRON ledger.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Instant Free Demo Quarter
  const handleDemoQuarter = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setWasDeclinedByUser(false);
    setIsDroppingCoin(true);
    playCoinSound();

    try {
      const demoHash = `demo_burn_${Math.random().toString(16).substring(2, 10)}${Date.now()}`;
      await onBurnVerified(demoHash, 0.25, 'TRX');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo burn test failed.');
    } finally {
      setIsProcessing(false);
      setIsDroppingCoin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border-2 border-zinc-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Arcade Cabinet Top Header */}
        <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-rose-950 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/30 text-sm">
              🪙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-white uppercase tracking-wider">
                  Morgue Coin-Op Machine
                </h3>
                <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase animate-pulse">
                  1 Credit = 0.25 TRX
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono-data">
                Drop 1 TRON Quarter to reveal diagnosis & mint card
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Arcade Coin Slot Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Method Selector */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => { setActiveMethod('quarter'); setErrorMsg(''); setWasDeclinedByUser(false); }}
              className={`flex-1 py-2 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMethod === 'quarter' ? 'bg-amber-500 text-black font-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🪙 Drop 0.25 TRX Quarter</span>
            </button>
            <button
              onClick={() => { setActiveMethod('demo'); setErrorMsg(''); setWasDeclinedByUser(false); }}
              className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeMethod === 'demo' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Demo Quarter</span>
            </button>
            <button
              onClick={() => { setActiveMethod('manual'); setErrorMsg(''); setWasDeclinedByUser(false); }}
              className={`px-3 py-2 rounded-md transition-colors cursor-pointer text-[11px] ${
                activeMethod === 'manual' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              TxID
            </button>
          </div>

          {/* Interactive Coin Slot Mechanism */}
          {activeMethod === 'quarter' && (
            <div className="bg-zinc-950 rounded-2xl p-5 border-2 border-zinc-800 text-center relative overflow-hidden space-y-4">
              {/* Flashing Arcade Text */}
              <div className="flex items-center justify-between text-[11px] font-mono-data text-zinc-400 border-b border-zinc-800/80 pb-2">
                <span className="text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  INSERT 1 QUARTER
                </span>
                <span className="text-zinc-400">COST: 0.25 TRX (~$0.06)</span>
              </div>

              {/* The 3D Digital Quarter Graphic */}
              <div className="py-2 flex flex-col items-center justify-center">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-4 border-amber-300 shadow-xl shadow-amber-500/20 flex flex-col items-center justify-center text-zinc-950 select-none cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isDroppingCoin ? 'translate-y-8 opacity-0 scale-50 transition-all duration-300' : ''
                  }`}
                  onClick={!isProcessing ? handleDropQuarter : undefined}
                  title="Click to drop quarter"
                >
                  <span className="text-lg">💀</span>
                  <span className="font-heading font-black text-xs uppercase tracking-tighter leading-none mt-1">
                    0.25 TRX
                  </span>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-800">
                    QUARTER
                  </span>
                </div>

                <span className="text-[10px] text-zinc-400 mt-2 font-mono-data">
                  *Click coin or button below to drop into the slot
                </span>
              </div>

              {/* The Coin Slot Graphic */}
              <div className="max-w-xs mx-auto bg-zinc-900 border-2 border-zinc-700 rounded-xl p-3 shadow-inner">
                <div className="w-32 h-2.5 mx-auto bg-black rounded-full border border-zinc-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] mb-2" />
                <span className="text-[10px] font-mono-data font-bold text-amber-400/90 tracking-widest uppercase">
                  ↓ COIN RETURN / BURN DESTINATION: T9yD...Wwb ↓
                </span>
              </div>

              {/* Push Action Button */}
              <button
                onClick={handleDropQuarter}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Inserting Quarter (0.25 TRX)...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">🪙</span>
                    <span>Drop 0.25 TRX Quarter in Slot</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* User Declined Notice */}
          {wasDeclinedByUser && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Quarter insertion canceled in wallet</span>
              </div>
              <p className="text-[11px] text-zinc-300 pl-6">
                No TRX was spent. You can still test the complete autopsy and mint your card using the free arcade token!
              </p>
              <div className="pl-6 pt-1">
                <button
                  type="button"
                  onClick={handleDemoQuarter}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-heading font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Use Free Arcade Token</span>
                </button>
              </div>
            </div>
          )}

          {/* Free Arcade Token / Demo Quarter */}
          {activeMethod === 'demo' && (
            <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border-2 border-purple-500/50 flex flex-col items-center justify-center text-purple-300 shadow-md">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-white text-sm uppercase">
                  Free House Token (Zero Cost)
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Enjoy a complimentary diagnostic token on the house. Fully unlocks the diagnosis, scores, and downloadable card without wallet gas.
                </p>
              </div>

              <button
                onClick={handleDemoQuarter}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-heading font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/60 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inserting House Token...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Drop Free Token (Instant Unlock)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Manual TxID Verification */}
          {activeMethod === 'manual' && (
            <form onSubmit={handleManualVerify} className="space-y-3 pt-1">
              <p className="text-xs text-zinc-400">
                Already sent 0.25 TRX to the burn address? Paste your 64-character TRON transaction hash (TxID):
              </p>

              <input
                type="text"
                value={manualTxHash}
                onChange={(e) => setManualTxHash(e.target.value)}
                placeholder="Paste TxID (e.g. 5f9b4c09d3810a918a221f...)"
                disabled={isProcessing}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 font-mono-data text-xs focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-heading font-bold uppercase tracking-wider text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with TRON Ledger...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verify Transaction Hash</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Burn Address Details */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-[11px] font-mono-data text-zinc-400 flex items-center justify-between">
            <span className="truncate mr-2">
              Black Hole Burn Address: <span className="text-zinc-200">{chainConfig.burnAddress.slice(0, 8)}...{chainConfig.burnAddress.slice(-6)}</span>
            </span>
            <button
              type="button"
              onClick={handleCopyBurnAddress}
              className="text-amber-400 hover:text-amber-300 shrink-0 flex items-center gap-1 font-sans cursor-pointer"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/50 border border-rose-900 rounded-lg text-rose-300 text-xs font-mono-data">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
