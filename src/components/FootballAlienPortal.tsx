import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  ExternalLink, 
  ShieldCheck, 
  Gamepad2, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Rocket, 
  Radio
} from 'lucide-react';

export const FBA_CONTRACT_ADDRESS = 'TNW5ABkp3v4jfeDo1vRVjxa3gtnoxP3DBN';
export const SUNPUMP_BUY_URL = 'https://sunpump.meme/token/TNW5ABkp3v4jfeDo1vRVjxa3gtnoxP3DBN';

interface FootballAlienPortalProps {
  walletAddress: string | null;
  onLaunchGame: () => void;
}

export const FootballAlienPortal: React.FC<FootballAlienPortalProps> = ({
  walletAddress,
  onLaunchGame,
}) => {
  const [copied, setCopied] = useState(false);
  const [demoPassActive, setDemoPassActive] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FBA_CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-purple-950/40 p-8 md:p-12 shadow-2xl shadow-emerald-950/30">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-wider uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Official TRON SunPump Meme Token
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
                <span>FOOTBALL</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-green-500">
                  ALIEN$
                </span>
                <span className="text-3xl md:text-4xl">👽🏈</span>
              </h1>
              <p className="text-lg md:text-xl font-mono text-emerald-300/90 tracking-wide">
                Ticker: <span className="text-white font-bold">$FBA</span> | Intergalactic Gridiron Warfare
              </p>
            </div>

            <p className="text-zinc-300 leading-relaxed text-base md:text-lg max-w-2xl">
              <strong className="text-emerald-400">FootballAlien$ (FBALIEN$)</strong> is a meme token powering an intergalactic football game where alien athletes compete with futuristic weapons. Collect, upgrade, and battle with FootballAlien$ NFTs. Earn tokens through gameplay, staking, and community challenges!
            </p>

            {/* Contract Bar */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-black/60 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> TRON Contract Address (TRC-20)
                </span>
                <span className="text-zinc-500">SunPump Verified</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-zinc-900/90 rounded-lg border border-zinc-800 text-emerald-300 font-mono text-xs sm:text-sm truncate selection:bg-emerald-500 selection:text-black">
                  {FBA_CONTRACT_ADDRESS}
                </code>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={SUNPUMP_BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black tracking-wider uppercase text-sm md:text-base flex items-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
              >
                <Rocket className="w-5 h-5 text-black" />
                Buy Now on SunPump
                <ExternalLink className="w-4 h-4 text-black/70" />
              </a>

              <button
                onClick={onLaunchGame}
                className="px-8 py-4 rounded-xl border-2 border-emerald-500/60 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 font-bold tracking-wider text-sm md:text-base flex items-center gap-2.5 transition-all hover:scale-105"
              >
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                Play Alien Blitz Game
              </button>
            </div>
          </div>

          {/* Right side Holographic Badge Card */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-3xl border-2 border-emerald-500/30 bg-zinc-950/80 p-6 backdrop-blur-md shadow-2xl relative group hover:border-emerald-500/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-3xl pointer-events-none" />

              {/* Alien Avatar Art Box */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-purple-950 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-7xl mb-3 animate-bounce">👽</div>
                <div className="text-3xl font-black text-white tracking-widest">ALIEN #00</div>
                <div className="text-xs font-mono text-emerald-400 mt-1 uppercase tracking-widest">
                  Intergalactic QB1
                </div>
                <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                  Plasma Cannon Loaded
                </div>
              </div>

              {/* Live Token Gating Pass */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Arcade Holder Gate:</span>
                  <span className="text-emerald-400 font-bold">1,000 $FBA</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Connected Wallet:</span>
                    <span className="text-white truncate max-w-[120px]">
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Pass Status:</span>
                    <span className={demoPassActive || walletAddress ? "text-emerald-400 flex items-center gap-1 font-bold" : "text-amber-400"}>
                      <Sparkles className="w-3 h-3" />
                      {demoPassActive ? "DEMO PASS ACTIVE" : (walletAddress ? "HOLDER VIP VERIFIED" : "CONNECT OR USE DEMO")}
                    </span>
                  </div>
                </div>

                {!walletAddress && !demoPassActive && (
                  <button
                    onClick={() => setDemoPassActive(true)}
                    className="w-full py-2.5 rounded-lg border border-dashed border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-mono transition-all"
                  >
                    Activate VIP Demo Holder Pass
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 hover:border-emerald-500/40 transition-all space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Intergalactic Football Arcade</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Dodge defense droids, shoot plasma blasts downfield, and sprint 100 cosmic yards for the ultimate 7,000-point touchdown.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 hover:border-purple-500/40 transition-all space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">NFT Battles & Upgrades</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Upgrade your alien athlete's speed, laser artillery, and gravity shields with token staking and seasonal tournament pools.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 hover:border-red-500/40 transition-all space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Continuous Burn & Buybacks</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Arcade fees and game credits contribute directly to buybacks and community burns, reducing supply across TRON.
          </p>
        </div>
      </div>

      {/* Game Spotlight Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-zinc-950 to-zinc-950 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            Featured Token-Gated Game
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Alien Blitz: Galactic Bowl
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl">
            Control the alien QB on the neon gridiron. Blast linebacker cyborgs, collect football powerups, and cross the goal line for interstellar glory!
          </p>
        </div>
        <button
          onClick={onLaunchGame}
          className="whitespace-nowrap px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black uppercase tracking-wider text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Gamepad2 className="w-5 h-5 text-black" />
          Launch Alien Blitz Now
        </button>
      </div>
    </div>
  );
};
