import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundFX } from '../../utils/audio.js';
import { Trophy, RotateCcw, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Coins } from 'lucide-react';

interface TronManGameProps {
  credits: number;
  onUseCredit: () => void;
  onInsertCoinPrompt: () => void;
  onGameOver: (score: number) => void;
  walletAddress?: string | null;
}

// 19 x 21 standard retro grid
const COLS = 19;
const ROWS = 21;
const CELL_SIZE = 20; // 380 x 420 canvas

// 0: empty, 1: wall, 2: dot (energy bit), 3: power pellet (green candle), 4: ghost house
const INITIAL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface Ghost {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  scared: boolean;
  eaten: boolean;
  baseColor: string;
}

export const TronManGame: React.FC<TronManGameProps> = ({
  credits,
  onUseCredit,
  onInsertCoinPrompt,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(14800);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Game internal mutable state stored in ref for 60fps loop
  const gameStateRef = useRef<{
    map: number[][];
    playerX: number;
    playerY: number;
    playerDirX: number;
    playerDirY: number;
    nextDirX: number;
    nextDirY: number;
    mouthAngle: number;
    mouthDir: number;
    ghosts: Ghost[];
    frightTimer: number;
    chompAlt: boolean;
    dotsRemaining: number;
    bonusItem: { x: number; y: number; active: boolean; symbol: string } | null;
    score: number;
    lives: number;
    highScore: number;
  }>({
    map: JSON.parse(JSON.stringify(INITIAL_MAP)),
    playerX: 9,
    playerY: 16,
    playerDirX: 0,
    playerDirY: 0,
    nextDirX: 0,
    nextDirY: 0,
    mouthAngle: 0.2,
    mouthDir: 1,
    ghosts: [],
    frightTimer: 0,
    chompAlt: false,
    dotsRemaining: 0,
    bonusItem: null,
    score: 0,
    lives: 3,
    highScore: 14800,
  });

  const addScore = useCallback((pts: number) => {
    gameStateRef.current.score += pts;
    const newScore = gameStateRef.current.score;
    setScore(newScore);
    if (newScore > gameStateRef.current.highScore) {
      gameStateRef.current.highScore = newScore;
      setHighScore(newScore);
    }
  }, []);

  const initGameMap = useCallback(() => {
    const mapCopy = JSON.parse(JSON.stringify(INITIAL_MAP));
    let dots = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (mapCopy[r][c] === 2 || mapCopy[r][c] === 3) dots++;
      }
    }

    const ghosts: Ghost[] = [
      { id: 'blinky', name: 'BEAR MARKET', color: '#ef4444', baseColor: '#ef4444', x: 9, y: 7, dirX: 1, dirY: 0, scared: false, eaten: false },
      { id: 'pinky', name: 'LIQUIDATOR', color: '#ec4899', baseColor: '#ec4899', x: 8, y: 10, dirX: 0, dirY: -1, scared: false, eaten: false },
      { id: 'inky', name: 'RUG PULL', color: '#06b6d4', baseColor: '#06b6d4', x: 9, y: 10, dirX: 0, dirY: -1, scared: false, eaten: false },
      { id: 'clyde', name: 'GARY / SEC', color: '#f97316', baseColor: '#f97316', x: 10, y: 10, dirX: -1, dirY: 0, scared: false, eaten: false },
    ];

    gameStateRef.current = {
      ...gameStateRef.current,
      map: mapCopy,
      playerX: 9,
      playerY: 16,
      playerDirX: 0,
      playerDirY: 0,
      nextDirX: 0,
      nextDirY: 0,
      mouthAngle: 0.2,
      mouthDir: 1,
      ghosts,
      frightTimer: 0,
      chompAlt: false,
      dotsRemaining: dots,
      bonusItem: { x: 9, y: 12, active: true, symbol: 'TRX' },
    };
  }, []);

  const handleStartGame = () => {
    if (credits <= 0) {
      onInsertCoinPrompt();
      return;
    }
    onUseCredit();
    gameStateRef.current.score = 0;
    gameStateRef.current.lives = 3;
    initGameMap();
    setScore(0);
    setLives(3);
    setWave(1);
    setIsGameOver(false);
    setIsPlaying(true);
    soundFX.playPowerUpSound();
  };

  const setDirection = (dx: number, dy: number) => {
    gameStateRef.current.nextDirX = dx;
    gameStateRef.current.nextDirY = dy;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setDirection(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setDirection(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setDirection(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setDirection(1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Main 60fps Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let lastTick = performance.now();
    const tickInterval = 110; // Speed of movement

    const isWalkable = (c: number, r: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
      const cell = gameStateRef.current.map[r][c];
      return cell !== 1 && cell !== 4; // Not a wall or ghost spawn cage
    };

    const loop = (now: number) => {
      animationFrameId = requestAnimationFrame(loop);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = gameStateRef.current;

      // Update positions on interval
      if (now - lastTick > tickInterval) {
        lastTick = now;

        // Try applying queued direction
        if (isWalkable(Math.round(state.playerX + state.nextDirX), Math.round(state.playerY + state.nextDirY))) {
          state.playerDirX = state.nextDirX;
          state.playerDirY = state.nextDirY;
        }

        // Move Player
        const nextX = state.playerX + state.playerDirX;
        const nextY = state.playerY + state.playerDirY;

        // Screen wrap (tunnels)
        let resolvedX = nextX;
        if (resolvedX < 0) resolvedX = COLS - 1;
        if (resolvedX >= COLS) resolvedX = 0;

        if (isWalkable(Math.round(resolvedX), Math.round(nextY))) {
          state.playerX = resolvedX;
          state.playerY = nextY;

          // Mouth animation
          state.mouthAngle += 0.15 * state.mouthDir;
          if (state.mouthAngle > 0.45) state.mouthDir = -1;
          if (state.mouthAngle < 0.05) state.mouthDir = 1;

          // Check pellet eating
          const currentCell = state.map[Math.round(state.playerY)][Math.round(state.playerX)];
          if (currentCell === 2) {
            // Energy bit
            state.map[Math.round(state.playerY)][Math.round(state.playerX)] = 0;
            state.dotsRemaining--;
            addScore(10);
            state.chompAlt = !state.chompAlt;
            soundFX.playChompSound(state.chompAlt);
          } else if (currentCell === 3) {
            // Power Core / Green Candle
            state.map[Math.round(state.playerY)][Math.round(state.playerX)] = 0;
            state.dotsRemaining--;
            state.frightTimer = 55; // ~6 seconds
            state.ghosts.forEach(g => {
              if (!g.eaten) g.scared = true;
            });
            addScore(50);
            soundFX.playPowerUpSound();
          }

          // Bonus item
          if (state.bonusItem?.active && Math.round(state.playerX) === state.bonusItem.x && Math.round(state.playerY) === state.bonusItem.y) {
            state.bonusItem.active = false;
            addScore(300);
            soundFX.playEatGhostSound();
          }

          // Check if board cleared
          if (state.dotsRemaining <= 0) {
            setWave(w => w + 1);
            addScore(1000);
            initGameMap();
            soundFX.playPowerUpSound();
          }
        }

        // Update Fright timer
        if (state.frightTimer > 0) {
          state.frightTimer--;
          if (state.frightTimer === 0) {
            state.ghosts.forEach(g => {
              g.scared = false;
              g.eaten = false;
            });
          }
        }

        // Move Ghosts
        state.ghosts.forEach(ghost => {
          const possibleDirs = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
          ].filter(d => {
            // Don't reverse immediately
            if (d.x === -ghost.dirX && d.y === -ghost.dirY) return false;
            const targetX = ghost.x + d.x;
            const targetY = ghost.y + d.y;
            if (targetY < 0 || targetY >= ROWS || targetX < 0 || targetX >= COLS) return false;
            const cell = state.map[targetY][targetX];
            return cell !== 1;
          });

          if (possibleDirs.length > 0) {
            // Intelligent or scared direction pick
            let chosenDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];

            if (!ghost.scared && Math.random() < 0.65) {
              // Bias towards player
              possibleDirs.sort((a, b) => {
                const distA = Math.hypot((ghost.x + a.x) - state.playerX, (ghost.y + a.y) - state.playerY);
                const distB = Math.hypot((ghost.x + b.x) - state.playerX, (ghost.y + b.y) - state.playerY);
                return distA - distB;
              });
              chosenDir = possibleDirs[0];
            }

            ghost.dirX = chosenDir.x;
            ghost.dirY = chosenDir.y;
            ghost.x += ghost.dirX;
            ghost.y += ghost.dirY;
          }

          // Check collision with player
          const dist = Math.hypot(ghost.x - state.playerX, ghost.y - state.playerY);
          if (dist < 0.8) {
            if (ghost.scared && !ghost.eaten) {
              // Eat ghost!
              ghost.eaten = true;
              ghost.scared = false;
              ghost.x = 9;
              ghost.y = 10;
              addScore(250);
              soundFX.playEatGhostSound();
            } else if (!ghost.eaten) {
              // Player dies
              soundFX.playGameOverSound();
              state.lives -= 1;
              const remainingLives = state.lives;
              setLives(remainingLives);

              if (remainingLives <= 0) {
                setIsPlaying(false);
                setIsGameOver(true);
                const finalScore = state.score;
                setTimeout(() => {
                  onGameOver(finalScore);
                }, 0);
              } else {
                // Reset player position
                state.playerX = 9;
                state.playerY = 16;
                state.playerDirX = 0;
                state.playerDirY = 0;
                state.nextDirX = 0;
                state.nextDirY = 0;
              }
            }
          }
        });
      }

      // --- RENDERING ---
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid / Circuit Walls
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = state.map[r][c];
          const px = c * CELL_SIZE;
          const py = r * CELL_SIZE;

          if (cell === 1) {
            // Neon cyan/blue circuit wall
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          } else if (cell === 2) {
            // Energy bit (dot)
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (cell === 3) {
            // Power core (Green Candle Pill)
            const pulse = (Math.sin(now * 0.008) + 1) * 1.5;
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, 5 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (cell === 4) {
            // Ghost house gate
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 2, py + 8, CELL_SIZE - 4, 4);
          }
        }
      }

      // Draw Bonus Item in center
      if (state.bonusItem?.active) {
        const bx = state.bonusItem.x * CELL_SIZE + CELL_SIZE / 2;
        const by = state.bonusItem.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TRX', bx, by);
      }

      // Draw Tron Man
      const playerPx = state.playerX * CELL_SIZE + CELL_SIZE / 2;
      const playerPy = state.playerY * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE / 2 - 2;

      let rotation = 0;
      if (state.playerDirX === 1) rotation = 0;
      else if (state.playerDirX === -1) rotation = Math.PI;
      else if (state.playerDirY === 1) rotation = Math.PI / 2;
      else if (state.playerDirY === -1) rotation = -Math.PI / 2;

      ctx.save();
      ctx.translate(playerPx, playerPy);
      ctx.rotate(rotation);

      // Yellow neon Tron Man
      ctx.fillStyle = '#eab308';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, radius, state.mouthAngle * Math.PI, (2 - state.mouthAngle) * Math.PI);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Draw Ghosts
      state.ghosts.forEach(ghost => {
        const gx = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const gy = ghost.y * CELL_SIZE + CELL_SIZE / 2;

        ctx.save();
        ctx.translate(gx, gy);

        let gColor = ghost.baseColor;
        if (ghost.scared) {
          // Flashing blue/white in last seconds of fright
          const flash = state.frightTimer < 15 && Math.floor(now / 150) % 2 === 0;
          gColor = flash ? '#ffffff' : '#3b82f6';
        }

        ctx.fillStyle = gColor;
        ctx.shadowColor = gColor;
        ctx.shadowBlur = 6;

        // Dome top
        ctx.beginPath();
        ctx.arc(0, -2, radius - 1, Math.PI, 0, false);
        // Tentacle skirt
        ctx.lineTo(radius - 1, radius);
        ctx.lineTo(radius / 2, radius - 3);
        ctx.lineTo(0, radius);
        ctx.lineTo(-radius / 2, radius - 3);
        ctx.lineTo(-radius + 1, radius);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3, -3, 2.5, 0, Math.PI * 2);
        ctx.arc(3, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Pupils looking in direction
        ctx.fillStyle = ghost.scared ? '#ef4444' : '#0f172a';
        const eyeOffX = ghost.dirX * 1.2;
        const eyeOffY = ghost.dirY * 1.2;
        ctx.beginPath();
        ctx.arc(-3 + eyeOffX, -3 + eyeOffY, 1.2, 0, Math.PI * 2);
        ctx.arc(3 + eyeOffX, -3 + eyeOffY, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, onGameOver, initGameMap, addScore]);

  return (
    <div className="flex flex-col items-center">
      {/* Top Game HUD */}
      <div className="w-full max-w-[420px] flex items-center justify-between px-3 py-2 bg-zinc-950/80 border-b border-zinc-800 text-xs font-mono-data mb-3 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">SCORE:</span>
          <span className="text-yellow-400 font-bold text-sm tracking-wider">{score.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-400">HI:</span>
          <span className="text-zinc-200 font-bold">{highScore.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400">LIVES:</span>
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <span key={i} className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm shadow-yellow-500/50" />
          ))}
        </div>

        <button
          onClick={() => {
            setIsMuted(!isMuted);
            soundFX.isMuted = !isMuted;
          }}
          className="text-zinc-400 hover:text-zinc-200"
          title="Toggle Audio"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>
      </div>

      {/* Canvas Container with Retro Bezel */}
      <div className="relative border-4 border-zinc-800 rounded-lg overflow-hidden bg-black shadow-2xl shadow-cyan-950/40">
        <canvas
          ref={canvasRef}
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
          className="block"
        />

        {/* Start / Game Over Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            {isGameOver ? (
              <div className="space-y-4 animate-fade-in">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-500">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-rose-500 tracking-wider font-heading uppercase">
                  LIQUIDATED!
                </h3>
                <p className="text-xs text-zinc-300 font-mono-data">
                  Final Score: <span className="text-yellow-400 font-bold text-base">{score.toLocaleString()}</span>
                </p>
                <p className="text-[11px] text-zinc-400 font-mono-data max-w-xs">
                  {score > highScore ? '🎉 NEW ARCADE HIGH SCORE!' : 'The bears ate your margin. Deposit 0.25 TRX to replay!'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-2.5 rounded-md bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black uppercase text-xs tracking-wider flex items-center gap-2 mx-auto shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Play Again ({credits} Credit{credits === 1 ? '' : 's'})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in max-w-xs">
                <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950/80 border border-cyan-500 flex items-center justify-center text-yellow-400 text-2xl shadow-lg shadow-cyan-500/30">
                  🕹️
                </div>
                <div>
                  <h3 className="text-xl font-black text-yellow-400 tracking-wider font-heading uppercase">
                    TRON MAN
                  </h3>
                  <p className="text-xs text-cyan-300 font-mono-data mt-1">
                    Eat energy pellets & devour Bear Market ghosts!
                  </p>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 text-[11px] text-zinc-300 font-mono-data text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>Yellow dots: 10 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Green Candles: Bull Run (+50 pts)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Devour vulnerable bears (+250 pts)</span>
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full py-2.5 px-4 rounded-md bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30 active:scale-95 transition-transform"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START TRON MAN ({credits} Credits)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* On-Screen Mobile / Touch Virtual Arcade Controls */}
      <div className="w-full max-w-[380px] mt-4 flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="text-[11px] font-mono-data text-zinc-400">
          <p className="font-semibold text-zinc-300">CONTROLS</p>
          <p className="text-[10px] text-zinc-400">Arrow Keys or WASD</p>
        </div>

        {/* Mini D-Pad */}
        <div className="grid grid-cols-3 gap-1 w-28 h-28 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          <div />
          <button
            onClick={() => setDirection(0, -1)}
            className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-zinc-200"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div />
          <button
            onClick={() => setDirection(-1, 0)}
            className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-zinc-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center bg-zinc-950 rounded text-[9px] text-zinc-400">
            TRON
          </div>
          <button
            onClick={() => setDirection(1, 0)}
            className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-zinc-200"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div />
          <button
            onClick={() => setDirection(0, 1)}
            className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-600 rounded text-zinc-200"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};
