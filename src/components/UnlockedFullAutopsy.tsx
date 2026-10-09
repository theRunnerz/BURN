import React from 'react';
import { Skull, AlertTriangle, FileText, CheckCircle2, Flame, HeartCrack, Stethoscope, Pill, ExternalLink } from 'lucide-react';
import { AutopsyReport, ChainConfig } from '../types.js';
import { AutopsyShareCard } from './AutopsyShareCard.js';

interface UnlockedFullAutopsyProps {
  report: AutopsyReport;
  chainConfig: ChainConfig;
}

export const UnlockedFullAutopsy: React.FC<UnlockedFullAutopsyProps> = ({
  report,
  chainConfig,
}) => {
  const { scores, walletData, pathologyFindings } = report;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Proof of Burn Verification Banner */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold uppercase tracking-wider text-emerald-300">
                Full Autopsy Report Unlocked
              </span>
              <span className="text-[10px] uppercase font-mono-data px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200">
                Burn Verified
              </span>
            </div>
            <p className="text-zinc-300 font-mono-data text-[11px] mt-0.5">
              Coin dropped: {report.burnAmount ? `${report.burnAmount} ${report.burnTokenSymbol || 'TRX'}` : '0.25 TRX (1 TRON Quarter)'} burned to {chainConfig.burnAddress.slice(0, 8)}...
            </p>
          </div>
        </div>

        {report.burnTxHash && (
          <a
            href={`${chainConfig.explorerBaseUrl}${report.burnTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono-data text-xs underline"
          >
            <span>Tx: {report.burnTxHash.slice(0, 10)}...</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Cause of Death Highlight Banner */}
      <div className="bg-zinc-950 border-2 border-rose-600/70 rounded-xl p-6 relative overflow-hidden morgue-glow-red">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-rose-500 font-mono-data uppercase text-xs tracking-wider">
            <Skull className="w-4 h-4" />
            <span>Official Coroner Ruling // Cause of Death</span>
          </div>
          <div className="coroner-stamp text-xs">
            DECEASED
          </div>
        </div>

        <blockquote className="text-2xl sm:text-3xl font-heading font-black text-white italic tracking-wide mb-3">
          "{report.causeOfDeath}"
        </blockquote>

        <p className="text-xs font-mono-data text-zinc-400 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
          <span>Patient Wallet: {report.address}</span>
          <span>Examined on TRON Mainnet</span>
        </p>
      </div>

      {/* The 5 Key Diagnostic Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
        {/* Degen */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase font-mono-data text-zinc-400">Degen Score</span>
          <div className="my-2">
            <span className="text-4xl font-heading font-black text-rose-500">
              {scores.degenScore}
            </span>
            <span className="text-zinc-500 text-xs">/100</span>
          </div>
          <span className="text-[11px] text-zinc-400">🦍 High-Risk FOMO</span>
        </div>

        {/* Diamond Hands */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase font-mono-data text-zinc-400">Diamond Hands</span>
          <div className="my-2">
            <span className="text-4xl font-heading font-black text-cyan-400">
              {scores.diamondHandsScore}
            </span>
            <span className="text-zinc-500 text-xs">/100</span>
          </div>
          <span className="text-[11px] text-zinc-400">💎 Refusal to Sell</span>
        </div>

        {/* Financial IQ */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase font-mono-data text-zinc-400">Financial IQ</span>
          <div className="my-2">
            <span className="text-4xl font-heading font-black text-amber-400">
              {scores.financialIq}
            </span>
            <span className="text-zinc-500 text-xs">/100</span>
          </div>
          <span className="text-[11px] text-zinc-400">🧠 Terminal Delusion</span>
        </div>

        {/* Rug Survival */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase font-mono-data text-zinc-400">Rug Survival</span>
          <div className="my-2">
            <span className="text-4xl font-heading font-black text-purple-400">
              {scores.rugSurvivalScore}
            </span>
            <span className="text-zinc-500 text-xs">/100</span>
          </div>
          <span className="text-[11px] text-zinc-400">☠️ Scam Resistance</span>
        </div>

        {/* Diversification */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] uppercase font-mono-data text-zinc-400">Diversification</span>
          <div className="my-2">
            <span className="text-4xl font-heading font-black text-emerald-400">
              {scores.diversificationScore}
            </span>
            <span className="text-zinc-500 text-xs">/100</span>
          </div>
          <span className="text-[11px] text-zinc-400">📊 Spread Quality</span>
        </div>
      </div>

      {/* Doctor's Forensic Diagnosis Report */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-mono-data uppercase text-xs tracking-wider border-b border-zinc-800 pb-3">
          <Stethoscope className="w-4 h-4" />
          <span>Chief Coroner's Clinical Examination Findings</span>
        </div>

        <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-sans">
          {report.doctorsDiagnosis}
        </div>

        {/* Pathology Highlights */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <span className="text-xs uppercase font-mono-data text-zinc-400 block">
            Confirmed Pathological Conditions:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pathologyFindings.map((p, i) => (
              <div key={i} className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-200">{p.condition}</span>
                  <span
                    className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${
                      p.severity === 'TERMINAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : p.severity === 'SEVERE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {p.severity}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription & Toxic Assets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800">
            <span className="text-xs font-mono-data text-rose-400 flex items-center gap-1.5 mb-1">
              <Pill className="w-3.5 h-3.5" />
              Doctor's Prescription (Rx):
            </span>
            <p className="text-xs text-zinc-300 italic">
              "{report.rxPrescription}"
            </p>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800">
            <span className="text-xs font-mono-data text-amber-400 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Most Lethal Holding:
            </span>
            <p className="text-xs text-zinc-300">
              <strong className="text-white">{report.toxicHolding}</strong> — Longest held bag: <strong className="text-white">{report.longestHeldBaggage}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Shareable Autopsy Card & Growth Engine */}
      <AutopsyShareCard report={report} chainConfig={chainConfig} />
    </div>
  );
};
