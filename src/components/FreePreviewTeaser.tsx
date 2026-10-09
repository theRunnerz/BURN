import React from 'react';
import { Lock, Flame, AlertOctagon, Skull, TrendingUp, History, Coins, ArrowRight, EyeOff } from 'lucide-react';
import { AutopsyReport, ChainConfig } from '../types.js';

interface FreePreviewTeaserProps {
  report: AutopsyReport;
  chainConfig: ChainConfig;
  onOpenBurnModal: () => void;
}

export const FreePreviewTeaser: React.FC<FreePreviewTeaserProps> = ({
  report,
  chainConfig,
  onOpenBurnModal,
}) => {
  const { scores, walletData, coronersNote } = report;

  const getDegenTier = (score: number) => {
    if (score >= 90) return { label: 'APEX TERMINAL DEGEN', color: 'text-rose-500', emoji: '🦍' };
    if (score >= 70) return { label: 'ACUTE SUNPUMP ADDICT', color: 'text-amber-500', emoji: '🐕' };
    if (score >= 40) return { label: 'MILD BAGHOLDER', color: 'text-yellow-400', emoji: '📉' };
    return { label: 'ALMOST SANE CIVILIAN', color: 'text-emerald-400', emoji: '🧘' };
  };

  const degenTier = getDegenTier(scores.degenScore);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Coroner Case Status Tag */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-500">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono-data text-rose-400 tracking-wider">
                Preliminary Forensic Examination Completed
              </span>
              <span className="text-[10px] uppercase font-mono-data px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Free Preview
              </span>
            </div>
            <p className="text-xs font-mono-data text-zinc-300">
              Subject: {report.address}
            </p>
          </div>
        </div>
        <div className="text-right sm:text-right w-full sm:w-auto">
          <span className="text-[11px] font-mono-data text-zinc-400 block">Coroner Case Ref:</span>
          <span className="text-xs font-mono-data text-zinc-300">{report.id.slice(0, 18)}...</span>
        </div>
      </div>

      {/* Free Scores Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Degen Score Card */}
        <div className="bg-zinc-900/90 border border-rose-900/40 rounded-xl p-5 relative overflow-hidden morgue-glow-red">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono-data text-zinc-400">Primary Vital Sign</span>
            <span className="text-xs font-mono-data text-rose-400 flex items-center gap-1">
              <span>Verified Metric</span>
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-5xl sm:text-6xl font-heading font-black text-white">
              {scores.degenScore}
            </span>
            <span className="text-zinc-500 font-mono-data text-xl">/ 100</span>
            <span className="text-3xl ml-auto">{degenTier.emoji}</span>
          </div>

          <div className="mb-4">
            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-full transition-all duration-1000"
                style={{ width: `${scores.degenScore}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400 font-mono-data">Morgue Classification:</span>
            <span className={`font-mono-data font-bold ${degenTier.color}`}>
              {degenTier.label}
            </span>
          </div>
        </div>

        {/* Rug Survival & Preliminary Note */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono-data text-zinc-400">Rug Survival Index</span>
              <span className="text-xs font-mono-data text-zinc-400">☠️ Scam Resistance</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-heading font-bold text-white">
                {scores.rugSurvivalScore}
              </span>
              <span className="text-zinc-500 font-mono-data text-sm">/ 100</span>
            </div>

            <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 mb-4">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${scores.rugSurvivalScore}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
            <span className="text-[11px] font-mono-data text-rose-400 block mb-1">
              Preliminary Coroner Note:
            </span>
            <p className="text-xs text-zinc-300 italic">
              "{coronersNote}"
            </p>
          </div>
        </div>
      </div>

      {/* Public Ledger Evidence (Free Data) */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-xs uppercase font-mono-data text-zinc-400 mb-3 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-zinc-400" />
          Public Ledger Records Uncovered ({walletData.tokens.length} Assets)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <span className="text-zinc-400 block text-[11px]">TRX Balance</span>
            <span className="font-mono-data font-semibold text-zinc-100 text-sm">
              {walletData.trxBalance.toLocaleString()} TRX
            </span>
            <span className="text-zinc-400 block text-[10px]">~${walletData.trxUsdValue.toLocaleString()}</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <span className="text-zinc-400 block text-[11px]">Est. Portfolio Value</span>
            <span className="font-mono-data font-semibold text-zinc-100 text-sm">
              ~${walletData.totalUsdEstimate.toLocaleString()}
            </span>
            <span className="text-zinc-400 block text-[10px]">{walletData.tokens.length} tokens detected</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <span className="text-zinc-400 block text-[11px]">Lifetime Transactions</span>
            <span className="font-mono-data font-semibold text-zinc-100 text-sm">
              {walletData.transactionCount.toLocaleString()}
            </span>
            <span className="text-zinc-400 block text-[10px]">{walletData.defiInteractionsCount} DeFi swaps</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <span className="text-zinc-400 block text-[11px]">Wallet Longevity</span>
            <span className="font-mono-data font-semibold text-zinc-100 text-sm">
              {walletData.walletAgeDays} Days
            </span>
            <span className="text-zinc-400 block text-[10px]">~{(walletData.walletAgeDays / 365).toFixed(1)} years</span>
          </div>
        </div>

        {/* Top Bag preview */}
        <div className="flex flex-wrap gap-2 text-xs font-mono-data">
          {walletData.tokens.slice(0, 5).map((tok) => (
            <div key={tok.symbol} className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
              <span className="font-bold text-zinc-100">{tok.symbol}</span>
              <span className="text-zinc-400">({tok.percentageOfPortfolio}%)</span>
              {tok.isMemeToken && <span className="text-[9px] text-amber-400">MEME</span>}
            </div>
          ))}
          {walletData.tokens.length > 5 && (
            <div className="px-2 py-1 text-zinc-400 text-xs">
              +{walletData.tokens.length - 5} more bags...
            </div>
          )}
        </div>
      </div>

      {/* 🔒 LOCKED FULL AUTOPSY BANNER */}
      <div className="relative bg-zinc-950 border-2 border-dashed border-rose-900/60 rounded-xl p-6 sm:p-8 overflow-hidden text-center">
        {/* Blurred background mockup */}
        <div className="absolute inset-0 opacity-20 pointer-events-none select-none filter blur-sm flex flex-col justify-around p-8">
          <div className="h-6 bg-zinc-700 w-3/4 mx-auto rounded" />
          <div className="h-4 bg-zinc-700 w-full rounded" />
          <div className="h-4 bg-zinc-700 w-5/6 mx-auto rounded" />
          <div className="h-8 bg-zinc-700 w-1/2 mx-auto rounded" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-950 border border-rose-600/50 flex items-center justify-center text-rose-500 mx-auto shadow-xl shadow-rose-950/80">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs uppercase font-mono-data text-rose-400 tracking-widest block mb-1">
              Confidential Medical Dossier
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
              FULL WALLET AUTOPSY LOCKED
            </h3>
            <p className="text-zinc-300 text-sm mt-2">
              Your wallet has secrets. The complete coroner examination report, satirical Doctor's Diagnosis, pathology findings, and downloadable viral Autopsy Card are sealed.
            </p>
          </div>

          {/* Pricing & Burn Mechanic Callout */}
          <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-left text-xs font-mono-data text-zinc-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Unlock Fee:</span>
              <span className="font-bold text-amber-400 text-sm flex items-center gap-1">
                <span>🪙 0.25 TRX</span>
                <span className="text-zinc-400 text-xs font-normal">(1 TRON Quarter · ~$0.06)</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Coin Destination:</span>
              <span className="truncate max-w-[200px]" title={chainConfig.burnAddress}>
                🔥 TRON Black Hole ({chainConfig.burnAddress.slice(0, 6)}...{chainConfig.burnAddress.slice(-4)})
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
              *Dropping a quarter burns 0.25 TRX on-chain to unlock your Doctor's Diagnosis & Autopsy Card.
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenBurnModal}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-heading font-black uppercase tracking-wider text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20 mx-auto"
            >
              <span className="text-base">🪙</span>
              <span>Drop 0.25 TRX Quarter to Unlock Full Autopsy</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-400">
            Supports 1-click TronLink quarter drop, manual TxID, or free instant house token mode.
          </p>
        </div>
      </div>
    </div>
  );
};
