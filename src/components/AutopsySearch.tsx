import React, { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, Wallet } from 'lucide-react';

interface AutopsySearchProps {
  onAnalyze: (address: string) => void;
  isLoading: boolean;
  connectedWallet: string | null;
  onDisconnect?: () => void;
}

export const AutopsySearch: React.FC<AutopsySearchProps> = ({
  onAnalyze,
  isLoading,
  connectedWallet,
  onDisconnect,
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [inputError, setInputError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = addressInput.trim();
    if (!clean) {
      setInputError('Please enter a TRON public wallet address (starts with T).');
      return;
    }
    if (!clean.startsWith('T') || clean.length !== 34) {
      setInputError('TRON addresses must start with "T" and contain 34 characters.');
      return;
    }
    setInputError('');
    onAnalyze(clean);
  };

  const handleUseConnected = () => {
    if (connectedWallet) {
      setAddressInput(connectedWallet);
      setInputError('');
      onAnalyze(connectedWallet);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Biohazard / Forensic Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-rose-400 bg-rose-950/40 border border-rose-900/60 px-3 py-1 rounded-full mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Forensic Pathology Unit // TRON Mainnet
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black tracking-tight text-white mb-3">
          TRON WALLET <span className="text-rose-500">AUTOPSY</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-normal">
          Unflinching medical diagnosis for necrotic bags, terminal dip-buying, and severe meme coin poisoning on TRON.
        </p>

        {/* EKG Line */}
        <div className="w-48 mx-auto my-4 h-6 text-rose-600/70 overflow-hidden">
          <svg viewBox="0 0 500 50" className="w-full h-full stroke-current fill-none stroke-[3]">
            <path
              d="M 0 25 L 140 25 L 160 5 L 180 45 L 200 15 L 220 35 L 240 25 L 500 25"
              className="animate-ekg"
            />
          </svg>
        </div>
      </div>

      {/* Main Search Box */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden morgue-glow-red">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-900 via-rose-500 to-amber-600" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  setInputError('');
                }}
                placeholder="Paste public TRON address (e.g. T...)"
                disabled={isLoading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 font-mono-data text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all disabled:opacity-50"
              />
              {addressInput && (
                <button
                  type="button"
                  onClick={() => setAddressInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-heading font-bold uppercase tracking-wider text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Examining Vitals...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Begin Autopsy</span>
                </>
              )}
            </button>
          </div>

          {inputError && (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono-data bg-rose-950/30 p-2 rounded border border-rose-900/50">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{inputError}</span>
            </div>
          )}

          {connectedWallet && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-data text-zinc-400 bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                TronLink Connected: {connectedWallet.slice(0, 8)}...{connectedWallet.slice(-6)}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleUseConnected}
                  className="text-rose-400 hover:underline flex items-center gap-1 font-sans font-medium cursor-pointer"
                >
                  Inspect Connected Wallet <ArrowRight className="w-3 h-3" />
                </button>
                {onDisconnect && (
                  <button
                    type="button"
                    onClick={onDisconnect}
                    className="text-zinc-500 hover:text-rose-400 text-[11px] font-sans underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Non-Custodial Safety Disclaimer */}
        <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-zinc-300">100% Non-Custodial & Read-Only:</strong> We inspect public blockchain records only. We will never ask for, hold, or accept private keys or recovery seeds.
          </span>
        </div>
      </div>
    </div>
  );
};
