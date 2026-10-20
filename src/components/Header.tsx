import React, { useState } from 'react';
import { Flame, Skull, Trophy, Sparkles, Gamepad2, MessageSquareQuote, Copy, Check } from 'lucide-react';
import { FBA_CONTRACT_ADDRESS } from './FootballAlienPortal';

interface HeaderProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  activeTab: 'autopsy' | 'burn' | 'hall' | 'leaderboard' | 'memorials' | 'oracle' | 'arcade' | 'chat' | 'football-alien';
  setActiveTab: (tab: 'autopsy' | 'burn' | 'hall' | 'leaderboard' | 'memorials' | 'oracle' | 'arcade' | 'chat' | 'football-alien') => void;
  ashesBalance: number;
}

export const Header: React.FC<HeaderProps> = ({
  walletAddress,
  onConnectWallet,
  activeTab,
  setActiveTab,
  ashesBalance,
}) => {
  const [copiedFBA, setCopiedFBA] = useState(false);

  const handleCopyFBA = () => {
    navigator.clipboard.writeText(FBA_CONTRACT_ADDRESS);
    setCopiedFBA(true);
    setTimeout(() => setCopiedFBA(false), 2000);
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar with Branding & Wallet */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('autopsy')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 p-0.5 shadow-lg shadow-red-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Skull className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black tracking-wider text-white text-lg">TRON</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-red-950 text-red-400 border border-red-800/50">
                AUTOPSY & FURNACE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight">THE SUNPUMP CEMETERY & INCINERATOR</p>
          </div>
        </div>

        {/* Right side stats + Wallet */}
        <div className="flex items-center space-x-3">
          {/* Football Alien Quick Copy / Link */}
          <button
            onClick={handleCopyFBA}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-400 text-xs font-mono transition-all"
            title="Click to copy $FBA Contract Address"
          >
            <span>👽🏈</span>
            <span className="font-bold">$FBA</span>
            {copiedFBA ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-emerald-500" />}
          </button>

          {/* Ashes Balance Tag */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-zinc-400">Ashes:</span>
            <span className="text-orange-400 font-bold">{ashesBalance.toLocaleString()} $ASHES</span>
          </div>

          {/* Connect Button */}
          <button
            onClick={onConnectWallet}
            className="px-4 py-2 rounded-xl text-xs font-mono tracking-wide font-semibold transition-all duration-200 border border-red-500/40 bg-gradient-to-r from-red-950/50 to-zinc-900 text-red-300 hover:border-red-400 hover:text-white hover:shadow-lg hover:shadow-red-950/40"
          >
            {walletAddress ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{`${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}`}</span>
              </span>
            ) : (
              'Connect TRON Wallet'
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-900 flex space-x-1 overflow-x-auto no-scrollbar py-2">
        <button
          onClick={() => setActiveTab('football-alien')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
            activeTab === 'football-alien'
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-950/40'
              : 'border-emerald-900/40 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-950/30'
          }`}
        >
          <span>👽🏈</span>
          <span>Football Alien$</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">NEW</span>
        </button>

        <button
          onClick={() => setActiveTab('autopsy')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'autopsy'
              ? 'bg-red-950/60 border border-red-700/50 text-red-300 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Skull className="w-3.5 h-3.5" />
          <span>Autopsy</span>
        </button>

        <button
          onClick={() => setActiveTab('burn')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'burn'
              ? 'bg-orange-950/60 border border-orange-700/50 text-orange-300 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Incinerator & Mint</span>
        </button>

        <button
          onClick={() => setActiveTab('arcade')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'arcade'
              ? 'bg-purple-950/60 border border-purple-700/50 text-purple-300 font-semibold shadow-md shadow-purple-950/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Tron Arcade (20 TRX)</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'chat'
              ? 'bg-amber-950/60 border border-amber-700/50 text-amber-300 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
          <span>Cemetery Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('hall')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'hall'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Hall of the Dead</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Burn Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('memorials')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'memorials'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <span>🪦</span>
          <span>Community Memorials</span>
        </button>

        <button
          onClick={() => setActiveTab('oracle')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
            activeTab === 'oracle'
              ? 'bg-purple-950/60 border border-purple-700/50 text-purple-300 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <span>🔮</span>
          <span>Death Oracle</span>
        </button>
      </div>
    </header>
  );
};
