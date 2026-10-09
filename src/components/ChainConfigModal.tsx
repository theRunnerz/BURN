import React, { useState } from 'react';
import { Settings, Check, RefreshCw, Cpu, Layers, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { ChainConfig } from '../types.js';
import { updateChainConfig } from '../services/api.js';

interface ChainConfigModalProps {
  currentChain: string;
  chainConfig: ChainConfig;
  availableChains: Array<{ id: string; name: string; active: boolean }>;
  onConfigUpdated: (newConfig: ChainConfig, chainId: string) => void;
}

export const ChainConfigModal: React.FC<ChainConfigModalProps> = ({
  currentChain,
  chainConfig,
  availableChains,
  onConfigUpdated,
}) => {
  const [selectedChain, setSelectedChain] = useState(currentChain);
  const [burnTokenSymbol, setBurnTokenSymbol] = useState(chainConfig.burnTokenSymbol);
  const [requiredBurnAmount, setRequiredBurnAmount] = useState(chainConfig.requiredBurnAmount);
  const [burnAddress, setBurnAddress] = useState(chainConfig.burnAddress);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateChainConfig(selectedChain, {
        burnTokenSymbol,
        requiredBurnAmount: Number(requiredBurnAmount),
        burnAddress,
      });
      onConfigUpdated(res.config, res.activeChain);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-data uppercase text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
          <Layers className="w-3.5 h-3.5 text-rose-500" />
          <span>Modular Blockchain Adapter Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
          CHAIN & <span className="text-rose-500">BURN CONFIG</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          The forensic engine is fully decoupled from the chain layer. Configure TRC-20 burn targets now, or preview seamless deployment to X1.
        </p>
      </div>

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-6">
        {/* Architecture Pipeline Visualizer */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono-data text-xs">
          <span className="text-zinc-400 uppercase text-[10px] block mb-2">
            Decoupled Modular Architecture Pipeline
          </span>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex-1 w-full">
              <span className="text-zinc-400 block text-[10px]">1. Ingestion</span>
              <span className="font-bold text-zinc-200">Public TRON Wallet</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 hidden md:block" />
            <div className="p-3 bg-zinc-900 rounded-lg border border-rose-900/40 flex-1 w-full">
              <span className="text-rose-400 block text-[10px]">2. AI Engine</span>
              <span className="font-bold text-rose-300">Gemini 3.8 Forensic Roast</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 hidden md:block" />
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex-1 w-full">
              <span className="text-amber-400 block text-[10px]">3. Modular Adapter</span>
              <span className="font-bold text-amber-300">{chainConfig.chainName}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 hidden md:block" />
            <div className="p-3 bg-zinc-900 rounded-lg border border-red-900/40 flex-1 w-full">
              <span className="text-red-400 block text-[10px]">4. Deflation Mechanic</span>
              <span className="font-bold text-red-300">🔥 Permanent Burn</span>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono-data text-zinc-300 uppercase block mb-1.5">
                Active Blockchain Adapter:
              </label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {availableChains.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.id === 'tron' ? '(Production Target)' : '(Future Bridge)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono-data text-zinc-300 uppercase block mb-1.5">
                Burn Token Symbol:
              </label>
              <input
                type="text"
                value={burnTokenSymbol}
                onChange={(e) => setBurnTokenSymbol(e.target.value)}
                placeholder="AUTOPSY"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono-data text-zinc-300 uppercase block mb-1.5">
                Required Token Burn Amount:
              </label>
              <input
                type="number"
                value={requiredBurnAmount}
                onChange={(e) => setRequiredBurnAmount(Number(e.target.value))}
                placeholder="10000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono-data text-zinc-300 uppercase block mb-1.5">
                Designated Burn Address:
              </label>
              <input
                type="text"
                value={burnAddress}
                onChange={(e) => setBurnAddress(e.target.value)}
                placeholder="T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 font-mono-data text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold uppercase tracking-wider text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Settings className="w-3.5 h-3.5" />
                  <span>Save Adapter Settings</span>
                </>
              )}
            </button>

            {saveSuccess && (
              <span className="text-xs font-mono-data text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Configuration successfully applied to backend</span>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
