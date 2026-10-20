import React, { useState } from 'react';
import { ExternalLink, Rocket, ShieldCheck, Flame, Trophy, Coins, Gamepad2, Sparkles, Check, Copy } from 'lucide-react';

interface FootballAlienPortalProps {
  onPlayExclusiveGame: () => void;
  fbaBalance: number;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export const FBA_CONTRACT_ADDRESS = 'TNW5ABkp3v4jfeDo1vRVjxa3gtnoxP3DBN';
export const SUNPUMP_BUY_URL = 'https://sunpump.meme/token/TNW5ABkp3v4jfeDo1vRVjxa3gtnoxP3DBN';

export const FootballAlienPortal: React.FC<FootballAlienPortalProps> = ({
  onPlayExclusiveGame,
  fbaBalance,
  walletAddress,
  onConnectWallet,
}) => {
  const [copiedContract, setCopiedContract] = useState(false);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(FBA_CONTRACT_ADDRESS);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const hasAccess = fbaBalance >= 1000;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Hero Intergalactic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-emerald-950/40 to-black border-2 border-emerald-500/60 p-6 sm:p-10 shadow-2xl morgue-glow-emerald">
        {/* Glow & grid overlay */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-mono-data tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Official Tokenized Galactic League • TRON SunPump</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight text-white uppercase leading-none">
              FOOTBALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-cyan-400">ALIEN$</span>
              <span className="block text-2xl sm:text-3xl font-mono-data text-emerald-300 font-bold mt-1">($FBALIEN)</span>
            </h1>

            <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-sans">
              <strong>FootballAlien$ (FBALIEN$)</strong> is a meme token powering an intergalactic football game where alien athletes compete with futuristic weapons. Collect, upgrade, and battle with FootballAlien$ NFTs. Earn tokens through gameplay, staking, and community challenges!
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-zinc-900/80 border border-emerald-900/60 rounded-xl p-3 text-center">
                <span className="text-[10px] text-zinc-400 font-mono-data uppercase block">Token Symbol</span>
                <span className="text-emerald-400 font-black font-mono-data text-base">FBALIEN$</span>
              </div>
              <div className="bg-zinc-900/80 border border-emerald-900/60 rounded-xl p-3 text-center">
                <span className="text-[10px] text-zinc-400 font-mono-data uppercase block">Network</span>
                <span className="text-cyan-400 font-black font-mono-data text-base">TRON (TRC20)</span>
              </div>
              <div className="bg-zinc-900/80 border border-emerald-900/60 rounded-xl p-3 text-center">
                <span className="text-[10px] text-zinc-400 font-mono-data uppercase block">Arcade Access</span>
                <span className="text-amber-400 font-black font-mono-data text-base">Hold 1,000 $FBA</span>
              </div>
              <div className="bg-zinc-900/80 border border-emerald-900/60 rounded-xl p-3 text-center">
                <span className="text-[10px] text-zinc-400 font-mono-data uppercase block">Platform</span>
                <span className="text-lime-400 font-black font-mono-data text-base">SunPump.meme</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href={SUNPUMP_BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-600 hover:from-emerald-400 hover:to-lime-300 text-black font-heading font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-95 transition-all group"
              >
                <Rocket className="w-5 h-5 text-black group-hover:-translate-y-0.5 transition-transform" />
                <span>BUY NOW ON SUNPUMP</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
              </a>

              <button
                onClick={onPlayExclusiveGame}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/40 font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                <span>Launch Arcade Game</span>
                {hasAccess ? (
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-mono-data border border-emerald-600/40">
                    UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded font-mono-data border border-amber-600/40">
                    1000 $FBA
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Token Card / Holder Gate Status */}
          <div className="w-full lg:w-96 bg-zinc-950/90 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👽🏈</span>
                <div>
                  <h3 className="font-heading font-black text-sm text-white uppercase">Alien Pass Status</h3>
                  <span className="text-[10px] font-mono-data text-zinc-400">ARCADE VIP GATEWAY</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-mono-data font-bold border ${
                hasAccess
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}>
                {hasAccess ? 'ACCESS GRANTED' : 'LOCKED'}
              </span>
            </div>

            {/* Wallet & Balance Display */}
            <div className="space-y-3 font-mono-data text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Your Wallet:</span>
                {walletAddress ? (
                  <span className="text-emerald-400 font-bold">
                    {walletAddress.slice(0, 5)}...{walletAddress.slice(-4)}
                  </span>
                ) : (
                  <button
                    onClick={onConnectWallet}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Connect TronLink
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[11px] text-zinc-400 uppercase">Your $FBA Token Holdings</span>
                <span className="text-3xl font-black text-emerald-300 font-mono-data">
                  {fbaBalance.toLocaleString()} <span className="text-sm font-normal text-zinc-400">$FBA</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  {hasAccess
                    ? '🎉 You hold 1,000+ $FBA! Arcade is fully unlocked.'
                    : `Need ${(1000 - fbaBalance).toLocaleString()} more $FBA to play Alien Blitz.`}
                </span>
              </div>
            </div>

            {/* Contract Address Section */}
            <div className="space-y-1.5 font-mono-data text-xs">
              <span className="text-zinc-400 text-[11px] uppercase block">Contract Address:</span>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[11px]">
                <code className="text-emerald-400 font-bold truncate flex-1">{FBA_CONTRACT_ADDRESS}</code>
                <button
                  onClick={handleCopyContract}
                  className="text-zinc-400 hover:text-white shrink-0 p-1 rounded hover:bg-zinc-800 transition-colors"
                  title="Copy contract address"
                >
                  {copiedContract ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <a
              href={SUNPUMP_BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider font-mono-data flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Get 1000 $FBA on SunPump</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-600/50 flex items-center justify-center text-2xl">
            🏈⚡
          </div>
          <h3 className="text-xl font-black font-heading tracking-wide text-white uppercase">
            Intergalactic Football
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Alien athletes armed with futuristic plasma cannons, gravitational shields, and antimatter footballs battle for cosmic supremacy in zero-gravity arenas.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-600/50 flex items-center justify-center text-2xl">
            👾🧬
          </div>
          <h3 className="text-xl font-black font-heading tracking-wide text-white uppercase">
            Alien Athletes & NFTs
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Collect, upgrade, and customize alien quarterbacks and cybernetic rushers. Equip rare laser cleats, sonic helmets, and deploy unique alien blitz formations.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-950/70 border border-amber-600/50 flex items-center justify-center text-2xl">
            🕹️💎
          </div>
          <h3 className="text-xl font-black font-heading tracking-wide text-white uppercase">
            Play-To-Earn & Staking
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Earn $FBALIEN tokens through high-scoring arcade blitzes, seasonal tournament brackets, and community meme challenges powered by the TRON blockchain.
          </p>
        </div>
      </div>

      {/* Arcade Exclusive Game Callout */}
      <div className="bg-gradient-to-r from-zinc-950 via-emerald-950/60 to-zinc-950 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono-data text-amber-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>EXCLUSIVE TOKEN-GATED GAME</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-heading text-white uppercase">
            Alien Blitz: Galactic Bowl 🕹️🏈
          </h3>
          <p className="text-sm text-zinc-300 max-w-xl">
            Dodge interstellar defenders, fire plasma blaster spirals, and score cosmic touchdowns! Only unlocked for holders of <strong>1,000 $FBALIEN</strong>.
          </p>
        </div>

        <button
          onClick={onPlayExclusiveGame}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-black font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 active:scale-95 shadow-lg shadow-emerald-950/80 transition-all"
        >
          <Gamepad2 className="w-5 h-5 text-black" />
          <span>{hasAccess ? 'Play Alien Blitz Now' : 'Check Access & Play'}</span>
        </button>
      </div>
    </div>
  );
};
