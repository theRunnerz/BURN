import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Coins, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Flame, 
  Share2, 
  Sparkles,
  Info
} from 'lucide-react';
import { ArcadeScore, ArcadeConfig } from '../../types';
import { fetchArcadeConfig, depositArcadeQuarter, fetchArcadeScores } from '../../services/api';
import { TronManGame } from './TronManGame';
import { X1RoidGame } from './X1RoidGame';
import { FootballAlienGame } from './FootballAlienGame';

interface ArcadeCabinetProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  defaultGame?: 'tron-man' | 'x1-roid' | 'football-alien';
}

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({
  walletAddress,
  onConnectWallet,
  defaultGame = 'tron-man'
}) => {
  const [selectedGame, setSelectedGame] = useState<'tron-man' | 'x1-roid' | 'football-alien'>(defaultGame);
  const [credits, setCredits] = useState<number>(3); // 3 demo credits default
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [arcadeConfig, setArcadeConfig] = useState<ArcadeConfig | null>(null);
  const [scores, setScores] = useState<ArcadeScore[]>([]);
  const [lastGameScore, setLastGameScore] = useState<number | null>(null);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositMsg, setDepositMsg] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    fetchArcadeConfig().then(setArcadeConfig).catch(console.error);
    fetchArcadeScores().then(res => setScores(res.scores)).catch(console.error);
  }, []);

  const handleInsertCoin = async (isDemo: boolean = false) => {
    try {
      setIsDepositing(true);
      setDepositMsg(null);
      const res = await depositArcadeQuarter({
        walletAddress: walletAddress || undefined,
        game: selectedGame,
        isDemo
      });
      setCredits(prev => prev + res.credits);
      setDepositMsg(isDemo ? '🎟️ Demo quarter accepted! 1 credit added.' : '🪙 20 TRX deposited! 3 credits added to machine.');
      setTimeout(() => setDepositMsg(null), 4000);
    } catch (err: any) {
      setDepositMsg(err.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleStartGame = () => {
    if (credits <= 0) return;
    setCredits(prev => prev - 1);
    setIsPlaying(true);
  };

  const handleGameOver = async (finalScore: number) => {
    setIsPlaying(false);
    setLastGameScore(finalScore);
    const res = await fetchArcadeScores();
    setScores(res.scores);
  };

  const shareScoreOnX = (scoreVal: number) => {
    const text = `Just hit a score of ${scoreVal.toLocaleString()} in the ${
      selectedGame === 'football-alien' ? 'Football Alien$ Galactic Bowl' : (selectedGame === 'tron-man' ? 'TRON-MAN' : 'X1-ROID')
    } retro arcade cabinet on the TRON SunPump Cemetery! 🕹️💀\n\nBurn dead tokens & play:`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Arcade Header Marquee */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950/70 via-black to-zinc-950 p-6 md:p-8 shadow-2xl shadow-purple-950/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 animate-pulse" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> RETRO TRON ARCADE
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
              <span>CYBER</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                QUARTER
              </span>
              <span>CABINET</span>
            </h1>
            <p className="text-sm font-mono text-zinc-400">
              Drop 20 TRX to play classic on-chain style arcade titles. 100% of proceeds fund the $ASHES funeral furnace & FBA buybacks.
            </p>
          </div>

          {/* Credits Counter & Insert Coin Box */}
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 w-full md:w-auto min-w-[260px]">
            <div className="flex items-center justify-between w-full text-xs font-mono">
              <span className="text-zinc-400">CREDITS REMAINING:</span>
              <span className="text-2xl font-black text-amber-400 font-mono tracking-wider">{credits}</span>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => handleInsertCoin(false)}
                disabled={isDepositing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Coins className="w-4 h-4" />
                INSERT 20 TRX
              </button>
              <button
                onClick={() => handleInsertCoin(true)}
                disabled={isDepositing}
                className="px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-xs disabled:opacity-50"
                title="Free demo coin for practice"
              >
                DEMO
              </button>
            </div>

            {depositMsg && (
              <div className="text-[11px] font-mono text-emerald-400 text-center animate-fade-in">
                {depositMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Selection Marquee Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Game 1: Football Alien */}
        <button
          onClick={() => { setSelectedGame('football-alien'); setIsPlaying(false); }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedGame === 'football-alien'
              ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
              : 'border-zinc-800 bg-zinc-950/70 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">👽🏈</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              FEATURED
            </span>
          </div>
          <div className="font-bold text-white text-base">Alien Blitz: Galactic Bowl</div>
          <div className="text-xs text-zinc-400 font-mono mt-1">
            Shoot plasma footballs, dodge cyborg linebackers & score 100-yard touchdowns!
          </div>
        </button>

        {/* Game 2: Tron-Man */}
        <button
          onClick={() => { setSelectedGame('tron-man'); setIsPlaying(false); }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedGame === 'tron-man'
              ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
              : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🕹️🟡</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              PAC-STYLE
            </span>
          </div>
          <div className="font-bold text-white text-base">Tron-Man Neon Maze</div>
          <div className="text-xs text-zinc-400 font-mono mt-1">
            Eat energy wafers, dodge red candle ghosts, and grab the Justin Sun mega pellet!
          </div>
        </button>

        {/* Game 3: X1-Roid */}
        <button
          onClick={() => { setSelectedGame('x1-roid'); setIsPlaying(false); }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedGame === 'x1-roid'
              ? 'border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
              : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🚀🪨</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
              ASTEROIDS
            </span>
          </div>
          <div className="font-bold text-white text-base">X1-Roid Debris Blaster</div>
          <div className="text-xs text-zinc-400 font-mono mt-1">
            Blast flying rugpull boulders and honeypot debris with high-frequency photon lasers!
          </div>
        </button>
      </div>

      {/* Main Cabinet Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Screen and Play Controls */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full rounded-3xl border-4 border-zinc-800 bg-zinc-950 p-4 md:p-6 shadow-2xl relative">
            <div className="absolute top-2 left-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              CRT RASTER MATRIX 60HZ
            </div>

            {/* Game Screen Canvas */}
            <div className="w-full flex justify-center py-2">
              {selectedGame === 'football-alien' ? (
                <FootballAlienGame
                  onGameOver={handleGameOver}
                  walletAddress={walletAddress || undefined}
                  isTokenHolder={true}
                />
              ) : selectedGame === 'tron-man' ? (
                <TronManGame
                  isPlaying={isPlaying}
                  onGameOver={handleGameOver}
                  walletAddress={walletAddress || undefined}
                  onStartGame={handleStartGame}
                  credits={credits}
                />
              ) : (
                <X1RoidGame
                  isPlaying={isPlaying}
                  onGameOver={handleGameOver}
                  walletAddress={walletAddress || undefined}
                  onStartGame={handleStartGame}
                  credits={credits}
                />
              )}
            </div>

            {/* Cabinet Controls Bar */}
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/50" />
                <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-md shadow-yellow-500/50" />
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-md shadow-green-500/50" />
                <span className="text-xs font-mono text-zinc-500 ml-2">HI-DEF CONTROLS READY</span>
              </div>

              {lastGameScore !== null && (
                <button
                  onClick={() => shareScoreOnX(lastGameScore)}
                  className="px-4 py-2 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/40 text-[#1DA1F2] text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Brag Score on X
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: High Scores Leaderboard & Rules */}
        <div className="lg:col-span-4 space-y-6">
          {/* High Scores Card */}
          <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
                <Trophy className="w-4 h-4" />
                <span>TOP PLAYERS</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {selectedGame.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              {scores
                .filter(s => s.game === selectedGame)
                .slice(0, 7)
                .map((sc, i) => (
                  <div
                    key={sc.id || i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 font-mono text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
                        #{i + 1}
                      </span>
                      <span className="text-white font-semibold truncate max-w-[110px]">{sc.player}</span>
                    </div>
                    <span className="text-amber-400 font-bold">{sc.score.toLocaleString()}</span>
                  </div>
                ))}

              {scores.filter(s => s.game === selectedGame).length === 0 && (
                <div className="text-xs font-mono text-zinc-500 py-6 text-center">
                  No records logged yet. Be the first high scorer!
                </div>
              )}
            </div>
          </div>

          {/* Revenue & Burn Transparency Box */}
          <div className="p-5 rounded-2xl border border-orange-500/20 bg-orange-950/10 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <Flame className="w-4 h-4" />
              <span>ARCADE REVENUE BURN POLICY</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Every 20 TRX deposited goes into the verified incinerator smart contract to buy back dead tokens and fund the prize pool.
            </p>
            <div className="pt-2 border-t border-orange-500/20 flex justify-between items-center text-[10px] text-zinc-500">
              <span>Smart Contract:</span>
              <span className="text-orange-400 truncate max-w-[140px]">
                {arcadeConfig?.revenueAddress || 'TNW5ABkp3v4jfeDo1vRVjxa3gtnoxP3DBN'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
