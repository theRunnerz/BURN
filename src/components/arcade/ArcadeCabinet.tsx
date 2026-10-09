import React, { useEffect, useState, useCallback } from 'react';
import { TronManGame } from './TronManGame.js';
import { X1roidGame } from './X1roidGame.js';
import { soundFX } from '../../utils/audio.js';
import { depositArcadeQuarter, fetchArcadeScores, submitArcadeScore } from '../../services/api.js';
import { sendTrxTransaction } from '../../services/tronWallet.js';
import { ArcadeScore } from '../../types.js';
import { Coins, Trophy, Sparkles, AlertCircle, Copy, Check, ExternalLink, Gamepad2, Volume2, VolumeX, MessageSquare } from 'lucide-react';

interface ArcadeCabinetProps {
  walletAddress: string | null;
  onOpenChat: () => void;
}

const ARCADE_REVENUE_ADDRESS = 'TENXRknaJG3acTjdm9pLzLrPHahZLgHygP';
const COIN_PRICE_TRX = 0.25;

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({
  walletAddress,
  onOpenChat,
}) => {
  const [activeGame, setActiveGame] = useState<'tron-man' | 'x1-roid'>('tron-man');
  const [credits, setCredits] = useState<number>(1); // Start with 1 complimentary demo credit!
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [scores, setScores] = useState<ArcadeScore[]>([]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [lastFinishedScore, setLastFinishedScore] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState(
    walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'DegenPlayer'
  );
  const [isMuted, setIsMuted] = useState(false);

  // Load scores on mount
  useEffect(() => {
    fetchArcadeScores()
      .then(res => setScores(res.scores))
      .catch(err => console.warn('Scores load notice:', err));
  }, []);

  const handleCopyRevenueAddress = () => {
    navigator.clipboard.writeText(ARCADE_REVENUE_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Deposit 0.25 TRX via TronLink
  const handleTronLinkDeposit = async () => {
    setIsDepositing(true);
    setDepositError(null);
    setDepositStatus('Requesting TronLink 0.25 TRX coin transfer...');

    try {
      const res = await sendTrxTransaction(ARCADE_REVENUE_ADDRESS, COIN_PRICE_TRX);
      if (res.success) {
        soundFX.playCoinSound();
        setCredits(prev => prev + 1);
        setDepositStatus('0.25 TRX confirmed on ledger! 1 Arcade credit added.');

        // Notify server
        await depositArcadeQuarter({
          walletAddress: walletAddress || undefined,
          game: activeGame,
          txHash: res.txHash,
          isDemo: false,
        });

        setTimeout(() => setDepositStatus(null), 3500);
      }
    } catch (err: any) {
      if (err.isUserDeclined) {
        setDepositError('Coin deposit was cancelled in wallet.');
      } else {
        setDepositError(err.message || 'Deposit failed. You can use the Free Test Quarter below.');
      }
    } finally {
      setIsDepositing(false);
    }
  };

  // Instant demo coin drop
  const handleDemoQuarterDeposit = async () => {
    soundFX.playCoinSound();
    setCredits(prev => prev + 1);
    setDepositStatus('🪙 Test Quarter dropped! +1 Game Credit');
    setDepositError(null);

    try {
      await depositArcadeQuarter({
        walletAddress: walletAddress || undefined,
        game: activeGame,
        isDemo: true,
      });
    } catch (err) {
      // ignore
    }

    setTimeout(() => setDepositStatus(null), 2500);
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setLastFinishedScore(finalScore);
  }, []);

  const handleSubmitScore = async () => {
    if (lastFinishedScore === null) return;
    setIsSubmittingScore(true);
    try {
      const res = await submitArcadeScore({
        game: activeGame,
        player: playerName,
        walletAddress: walletAddress || undefined,
        score: lastFinishedScore,
      });
      if (res.scores) {
        setScores(res.scores);
      }
      setLastFinishedScore(null);
    } catch (err: any) {
      console.error('Score submit error:', err);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const currentLeaderboard = scores
    .filter(s => s.game === activeGame)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Arcade Marquee Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-cyan-950/40 to-zinc-950 border border-cyan-800/60 p-6 shadow-2xl morgue-glow-cyan">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 text-xs font-mono-data">
              <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
              <span>RETRO COIN-OP REVENUE MACHINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-wider text-white uppercase flex items-center justify-center md:justify-start gap-3">
              <span>TRON REKT ARCADE</span>
              <span className="text-sm px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono-data">
                0.25 TRX / PLAY
              </span>
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl">
              Burn excess energy and conquer the high scores. All 0.25 TRX arcade deposits go directly to our community revenue address.
            </p>
          </div>

          {/* Credits Display & Coin Door */}
          <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-4 flex flex-col items-center gap-3 min-w-[240px] shadow-lg">
            <div className="text-center">
              <span className="text-[10px] font-mono-data text-zinc-400 uppercase tracking-widest block">
                MACHINE CREDITS
              </span>
              <div className="text-3xl font-black font-mono-data text-yellow-400 tracking-wider">
                {credits > 0 ? (
                  `${credits} CREDIT${credits === 1 ? '' : 'S'}`
                ) : (
                  <span className="text-rose-500 animate-pulse text-xl">INSERT COIN</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleTronLinkDeposit}
                disabled={isDepositing}
                className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{isDepositing ? 'Signing...' : 'Drop 0.25 TRX'}</span>
              </button>

              <button
                onClick={handleDemoQuarterDeposit}
                className="py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono-data flex items-center justify-center gap-1 border border-zinc-700"
                title="Insert complimentary test quarter"
              >
                <span>Free Coin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Community Revenue Destination Notice */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono-data text-zinc-400">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-zinc-400">Arcade Revenue Vault:</span>
            <code className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              {ARCADE_REVENUE_ADDRESS}
            </code>
            <button
              onClick={handleCopyRevenueAddress}
              className="text-zinc-400 hover:text-white p-1"
              title="Copy revenue address"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`https://tronscan.org/#/address/${ARCADE_REVENUE_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>TronScan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 underline font-mono-data"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Join Degen Chat Room</span>
          </button>
        </div>

        {/* Deposit Messages */}
        {depositStatus && (
          <div className="mt-3 p-2 bg-emerald-950/70 border border-emerald-700/60 rounded text-xs text-emerald-300 font-mono-data text-center animate-fade-in">
            {depositStatus}
          </div>
        )}
        {depositError && (
          <div className="mt-3 p-2 bg-rose-950/70 border border-rose-800/60 rounded text-xs text-rose-300 font-mono-data text-center animate-fade-in">
            {depositError}
          </div>
        )}
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveGame('tron-man')}
            className={`px-4 py-2 rounded-lg font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeGame === 'tron-man'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <span className="text-base">🕹️</span>
            <span>TRON MAN (Pac-Man)</span>
          </button>

          <button
            onClick={() => setActiveGame('x1-roid')}
            className={`px-4 py-2 rounded-lg font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeGame === 'x1-roid'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <span className="text-base">🚀</span>
            <span>X1ROID (Asteroids)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              soundFX.isMuted = !isMuted;
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono-data text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isMuted ? 'Muted' : 'Retro Audio'}</span>
          </button>
        </div>
      </div>

      {/* Main Game Screen & High Scores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 3 cols: Arcade Game Canvas */}
        <div className="lg:col-span-3 flex justify-center bg-zinc-950/60 p-4 sm:p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-sm shadow-xl">
          {activeGame === 'tron-man' ? (
            <TronManGame
              credits={credits}
              onUseCredit={() => setCredits(c => Math.max(0, c - 1))}
              onInsertCoinPrompt={handleTronLinkDeposit}
              onGameOver={handleGameOver}
              walletAddress={walletAddress}
            />
          ) : (
            <X1roidGame
              credits={credits}
              onUseCredit={() => setCredits(c => Math.max(0, c - 1))}
              onInsertCoinPrompt={handleTronLinkDeposit}
              onGameOver={handleGameOver}
              walletAddress={walletAddress}
            />
          )}
        </div>

        {/* Right 1 col: Cabinet Side Panel & High Scores */}
        <div className="space-y-6">
          {/* Submit High Score Box if Game Over with points */}
          {lastFinishedScore !== null && lastFinishedScore > 0 && (
            <div className="p-4 bg-yellow-950/40 border border-yellow-700/60 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-yellow-400 text-xs font-mono-data font-bold">
                <Trophy className="w-4 h-4" />
                <span>SUBMIT YOUR SCORE</span>
              </div>
              <p className="text-xs text-zinc-300 font-mono-data">
                You earned <strong className="text-yellow-400 text-sm">{lastFinishedScore.toLocaleString()}</strong> pts!
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Enter arcade callsign"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs font-mono-data text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={handleSubmitScore}
                  disabled={isSubmittingScore}
                  className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded font-mono-data disabled:opacity-50"
                >
                  {isSubmittingScore ? 'Posting...' : 'Post to Leaderboard'}
                </button>
              </div>
            </div>
          )}

          {/* High Scores Leaderboard */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-heading font-black tracking-wider uppercase">
                <Trophy className="w-4 h-4" />
                <span>{activeGame === 'tron-man' ? 'Tron Man' : 'X1roid'} Hall of Fame</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono-data">TOP 5</span>
            </div>

            <div className="space-y-2.5">
              {currentLeaderboard.length > 0 ? (
                currentLeaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs font-mono-data p-2 rounded bg-zinc-900/60 border border-zinc-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        idx === 1 ? 'bg-zinc-700/40 text-zinc-300' :
                        idx === 2 ? 'bg-amber-900/30 text-amber-600' : 'text-zinc-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-zinc-200 font-medium truncate max-w-[90px]">{item.player}</span>
                    </div>
                    <span className="text-amber-400 font-bold">{item.score.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 font-mono-data text-center py-4">No high scores registered yet.</p>
              )}
            </div>
          </div>

          {/* Machine Specs & Instructions */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono-data space-y-2.5 text-zinc-300">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block tracking-wider">
              ARCADE MECHANICS
            </span>
            <ul className="space-y-1.5 text-[11px] text-zinc-400 list-disc list-inside">
              <li>Each 0.25 TRX payment grants 1 Game Credit.</li>
              <li>Revenues support TRON Wallet Autopsy infrastructure.</li>
              <li>Keyboard: Arrow keys / WASD / Spacebar.</li>
              <li>Touch & mobile buttons enabled beneath the canvas.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
