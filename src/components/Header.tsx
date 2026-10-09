import React from 'react';
import { Skull, Flame, Activity, ShieldAlert, Sparkles, Trophy, Settings, Wallet, CheckCircle2, ChevronRight, LogOut } from 'lucide-react';

interface HeaderProps {
  activeTab: 'autopsy' | 'funeral' | 'horoscope' | 'rugs' | 'leaderboard' | 'oracle' | 'arcade' | 'chat' | 'config';
  setActiveTab: (tab: 'autopsy' | 'funeral' | 'horoscope' | 'rugs' | 'leaderboard' | 'oracle' | 'arcade' | 'chat' | 'config') => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isConnecting: boolean;
  chainName: string;
  isTronLinkInstalled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  isConnecting,
  chainName,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-rose-950/60 border border-rose-600/40 flex items-center justify-center text-rose-500 shadow-sm shadow-rose-950/50">
            <Skull className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-black tracking-wider text-zinc-100 uppercase">
                TRON Wallet Autopsy
              </span>
              <span className="text-[10px] uppercase font-mono-data px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300">
                Morgue v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 italic font-serif">Your bags. Our diagnosis.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-1 text-xs font-medium bg-zinc-900/60 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('autopsy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'autopsy'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Autopsy</span>
          </button>

          <button
            onClick={() => setActiveTab('funeral')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'funeral'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Bag Funeral</span>
          </button>

          <button
            onClick={() => setActiveTab('horoscope')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'horoscope'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Horoscope</span>
          </button>

          <button
            onClick={() => setActiveTab('rugs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'rugs'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
            <span>Rug Detector</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('oracle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'oracle'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="text-red-300 font-bold">Death Oracle</span>
            <span className="text-[9px] px-1 bg-red-950 border border-red-800 text-red-400 rounded">🎃</span>
          </button>

          <button
            onClick={() => setActiveTab('arcade')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'arcade'
                ? 'bg-yellow-500 text-black font-bold shadow-sm'
                : 'text-amber-400 hover:text-amber-200 hover:bg-zinc-800/50'
            }`}
          >
            <span className="text-xs">🕹️</span>
            <span>Arcade</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60">0.25 TRX</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <span className="text-xs">💬</span>
            <span>Crypt Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all ${
              activeTab === 'config'
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="Chain & Burn Config"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </nav>

        {/* Right side: Wallet connect & Chain indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono-data text-zinc-400 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{chainName}</span>
          </div>

          {walletAddress ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 border border-emerald-900/60 text-emerald-400 text-xs font-mono-data">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {walletAddress.slice(0, 5)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={onDisconnectWallet}
                title="Disconnect Wallet"
                className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shadow-sm shadow-rose-900/40 disabled:opacity-60 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Detecting...' : 'Connect TronLink'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
