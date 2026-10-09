import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundFX } from '../../utils/audio.js';
import { Trophy, RotateCcw, Volume2, VolumeX, Play, Zap, ArrowLeft, ArrowRight, ArrowUp, Crosshair, Coins } from 'lucide-react';

interface X1roidGameProps {
  credits: number;
  onUseCredit: () => void;
  onInsertCoinPrompt: () => void;
  onGameOver: (score: number) => void;
  walletAddress?: string | null;
}

interface Point {
  x: number;
  y: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  points: Point[];
  size: 'big' | 'medium' | 'small';
  label: string;
  rotation: number;
  vRot: number;
}

const WIDTH = 480;
const HEIGHT = 460;

const ASTEROID_LABELS = ['$RUG', '$DEAD', '$PUMP', '💀', '$SUN', '$MEME', '🔻', '$BEAR'];

export const X1roidGame: React.FC<X1roidGameProps> = ({
  credits,
  onUseCredit,
  onInsertCoinPrompt,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(28500);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Mutable Game State Ref for 60fps Loop
  const stateRef = useRef<{
    ship: {
      x: number;
      y: number;
      angle: number;
      vx: number;
      vy: number;
      radius: number;
      thrusting: boolean;
      rotatingLeft: boolean;
      rotatingRight: boolean;
      invincibleTimer: number;
    };
    bullets: Bullet[];
    asteroids: Asteroid[];
    particles: Particle[];
    waveNumber: number;
    lastFireTime: number;
    score: number;
    lives: number;
    highScore: number;
  }>({
    ship: {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      angle: -Math.PI / 2,
      vx: 0,
      vy: 0,
      radius: 12,
      thrusting: false,
      rotatingLeft: false,
      rotatingRight: false,
      invincibleTimer: 60,
    },
    bullets: [],
    asteroids: [],
    particles: [],
    waveNumber: 1,
    lastFireTime: 0,
    score: 0,
    lives: 3,
    highScore: 28500,
  });

  const createAsteroid = (x: number, y: number, size: 'big' | 'medium' | 'small'): Asteroid => {
    let radius = size === 'big' ? 36 : size === 'medium' ? 22 : 12;
    const vertexCount = Math.floor(Math.random() * 4) + 8;
    const points: Point[] = [];

    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const variation = (Math.random() * 0.4 + 0.8) * radius;
      points.push({
        x: Math.cos(angle) * variation,
        y: Math.sin(angle) * variation,
      });
    }

    const speed = size === 'big' ? 1.0 : size === 'medium' ? 1.8 : 2.6;
    const dirAngle = Math.random() * Math.PI * 2;
    const label = ASTEROID_LABELS[Math.floor(Math.random() * ASTEROID_LABELS.length)];

    return {
      x,
      y,
      vx: Math.cos(dirAngle) * speed,
      vy: Math.sin(dirAngle) * speed,
      radius,
      points,
      size,
      label,
      rotation: 0,
      vRot: (Math.random() - 0.5) * 0.04,
    };
  };

  const spawnWave = useCallback((waveNum: number) => {
    const asteroids: Asteroid[] = [];
    const count = 3 + waveNum * 2;

    for (let i = 0; i < count; i++) {
      // Spawn at canvas perimeter away from ship center
      let ax = Math.random() < 0.5 ? Math.random() * 60 : WIDTH - Math.random() * 60;
      let ay = Math.random() * HEIGHT;
      if (Math.random() < 0.5) {
        ax = Math.random() * WIDTH;
        ay = Math.random() < 0.5 ? Math.random() * 60 : HEIGHT - Math.random() * 60;
      }
      asteroids.push(createAsteroid(ax, ay, 'big'));
    }

    stateRef.current.asteroids = asteroids;
    stateRef.current.waveNumber = waveNum;
  }, []);

  const addScore = useCallback((pts: number) => {
    stateRef.current.score += pts;
    const newScore = stateRef.current.score;
    setScore(newScore);
    if (newScore > stateRef.current.highScore) {
      stateRef.current.highScore = newScore;
      setHighScore(newScore);
    }
  }, []);

  const handleStartGame = () => {
    if (credits <= 0) {
      onInsertCoinPrompt();
      return;
    }
    onUseCredit();
    setScore(0);
    setLives(3);
    setWave(1);
    setIsGameOver(false);

    stateRef.current = {
      ship: {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        angle: -Math.PI / 2,
        vx: 0,
        vy: 0,
        radius: 12,
        thrusting: false,
        rotatingLeft: false,
        rotatingRight: false,
        invincibleTimer: 80,
      },
      bullets: [],
      asteroids: [],
      particles: [],
      waveNumber: 1,
      lastFireTime: 0,
      score: 0,
      lives: 3,
      highScore: stateRef.current.highScore,
    };

    spawnWave(1);
    setIsPlaying(true);
    soundFX.playPowerUpSound();
  };

  const fireLaser = () => {
    if (!isPlaying) return;
    const now = performance.now();
    if (now - stateRef.current.lastFireTime < 160) return;
    stateRef.current.lastFireTime = now;

    const ship = stateRef.current.ship;
    const bulletSpeed = 7.5;
    const noseX = ship.x + Math.cos(ship.angle) * (ship.radius + 4);
    const noseY = ship.y + Math.sin(ship.angle) * (ship.radius + 4);

    stateRef.current.bullets.push({
      x: noseX,
      y: noseY,
      vx: Math.cos(ship.angle) * bulletSpeed + ship.vx * 0.4,
      vy: Math.sin(ship.angle) * bulletSpeed + ship.vy * 0.4,
      life: 45,
    });

    soundFX.playLaserSound();
  };

  const hyperspaceJump = () => {
    if (!isPlaying) return;
    const ship = stateRef.current.ship;
    ship.x = Math.random() * (WIDTH - 80) + 40;
    ship.y = Math.random() * (HEIGHT - 80) + 40;
    ship.vx = 0;
    ship.vy = 0;
    ship.invincibleTimer = 60;
    soundFX.playEatGhostSound();
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const ship = stateRef.current.ship;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        ship.rotatingLeft = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        ship.rotatingRight = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        ship.thrusting = true;
        soundFX.playThrustSound();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        fireLaser();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        hyperspaceJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const ship = stateRef.current.ship;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        ship.rotatingLeft = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        ship.rotatingRight = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        ship.thrusting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // 60FPS Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = stateRef.current;
      const ship = state.ship;

      // 1. Update Ship
      if (ship.rotatingLeft) ship.angle -= 0.07;
      if (ship.rotatingRight) ship.angle += 0.07;

      if (ship.thrusting) {
        const thrustAcc = 0.16;
        ship.vx += Math.cos(ship.angle) * thrustAcc;
        ship.vy += Math.sin(ship.angle) * thrustAcc;

        // Exhaust particle
        const tailX = ship.x - Math.cos(ship.angle) * ship.radius;
        const tailY = ship.y - Math.sin(ship.angle) * ship.radius;
        state.particles.push({
          x: tailX,
          y: tailY,
          vx: -Math.cos(ship.angle) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
          vy: -Math.sin(ship.angle) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
          life: 15,
          maxLife: 15,
          color: Math.random() < 0.5 ? '#f59e0b' : '#ef4444',
        });
      }

      // Space friction
      ship.vx *= 0.985;
      ship.vy *= 0.985;
      ship.x += ship.vx;
      ship.y += ship.vy;

      // Wrap edges
      if (ship.x < 0) ship.x = WIDTH;
      if (ship.x > WIDTH) ship.x = 0;
      if (ship.y < 0) ship.y = HEIGHT;
      if (ship.y > HEIGHT) ship.y = 0;

      if (ship.invincibleTimer > 0) ship.invincibleTimer--;

      // 2. Update Bullets
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        // Screen wrap
        if (b.x < 0) b.x = WIDTH;
        if (b.x > WIDTH) b.x = 0;
        if (b.y < 0) b.y = HEIGHT;
        if (b.y > HEIGHT) b.y = 0;

        if (b.life <= 0) {
          state.bullets.splice(i, 1);
        }
      }

      // 3. Update Asteroids
      for (let i = 0; i < state.asteroids.length; i++) {
        const a = state.asteroids[i];
        a.x += a.vx;
        a.y += a.vy;
        a.rotation += a.vRot;

        if (a.x < -a.radius) a.x = WIDTH + a.radius;
        if (a.x > WIDTH + a.radius) a.x = -a.radius;
        if (a.y < -a.radius) a.y = HEIGHT + a.radius;
        if (a.y > HEIGHT + a.radius) a.y = -a.radius;
      }

      // 4. Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // 5. Bullet-Asteroid Collisions
      for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
        const bullet = state.bullets[bi];
        for (let ai = state.asteroids.length - 1; ai >= 0; ai--) {
          const ast = state.asteroids[ai];
          const dist = Math.hypot(bullet.x - ast.x, bullet.y - ast.y);

          if (dist < ast.radius) {
            // Remove bullet
            state.bullets.splice(bi, 1);

            // Explosive particles
            for (let pi = 0; pi < 12; pi++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpeed = Math.random() * 3 + 1;
              state.particles.push({
                x: ast.x,
                y: ast.y,
                vx: Math.cos(pAngle) * pSpeed,
                vy: Math.sin(pAngle) * pSpeed,
                life: 20,
                maxLife: 20,
                color: ast.size === 'big' ? '#ef4444' : ast.size === 'medium' ? '#f59e0b' : '#38bdf8',
              });
            }

            // Split asteroid or destroy
            if (ast.size === 'big') {
              soundFX.playExplosionSound(true);
              addScore(20);
              state.asteroids.push(createAsteroid(ast.x, ast.y, 'medium'));
              state.asteroids.push(createAsteroid(ast.x, ast.y, 'medium'));
            } else if (ast.size === 'medium') {
              soundFX.playExplosionSound(false);
              addScore(50);
              state.asteroids.push(createAsteroid(ast.x, ast.y, 'small'));
              state.asteroids.push(createAsteroid(ast.x, ast.y, 'small'));
            } else {
              soundFX.playExplosionSound(false);
              addScore(100);
            }

            state.asteroids.splice(ai, 1);
            break;
          }
        }
      }

      // 6. Check Wave Cleared
      if (state.asteroids.length === 0) {
        state.waveNumber += 1;
        const nextWave = state.waveNumber;
        setWave(nextWave);
        spawnWave(nextWave);
        soundFX.playPowerUpSound();
        addScore(500);
      }

      // 7. Ship-Asteroid Collisions
      if (ship.invincibleTimer <= 0) {
        for (let ai = 0; ai < state.asteroids.length; ai++) {
          const ast = state.asteroids[ai];
          const dist = Math.hypot(ship.x - ast.x, ship.y - ast.y);

          if (dist < ship.radius + ast.radius - 4) {
            // Ship destroyed!
            soundFX.playGameOverSound();

            for (let pi = 0; pi < 24; pi++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpeed = Math.random() * 4 + 1;
              state.particles.push({
                x: ship.x,
                y: ship.y,
                vx: Math.cos(pAngle) * pSpeed,
                vy: Math.sin(pAngle) * pSpeed,
                life: 30,
                maxLife: 30,
                color: '#ef4444',
              });
            }

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
              // Reset ship position
              ship.x = WIDTH / 2;
              ship.y = HEIGHT / 2;
              ship.vx = 0;
              ship.vy = 0;
              ship.angle = -Math.PI / 2;
              ship.invincibleTimer = 90;
            }
            break;
          }
        }
      }

      // --- RENDERING ---
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Starfield dots
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 35; i++) {
        const sx = (i * 73) % WIDTH;
        const sy = (i * 97) % HEIGHT;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Asteroids
      state.asteroids.forEach(ast => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rotation);

        ctx.strokeStyle = ast.size === 'big' ? '#ef4444' : ast.size === 'medium' ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.fillStyle = '#0f172a';

        ctx.beginPath();
        ast.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw meme label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = ast.size === 'big' ? 'bold 11px monospace' : ast.size === 'medium' ? '9px monospace' : '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ast.label, 0, 0);

        ctx.restore();
      });

      // Draw Bullets
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      state.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Draw Ship
      if (ship.invincibleTimer % 8 < 5) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        ctx.strokeStyle = '#06b6d4';
        ctx.fillStyle = '#082f49';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;

        // Sleek X1 Starfighter polygon
        ctx.beginPath();
        ctx.moveTo(ship.radius + 4, 0); // Nose
        ctx.lineTo(-ship.radius, -ship.radius * 0.85); // Left wing
        ctx.lineTo(-ship.radius * 0.5, 0); // Center notch
        ctx.lineTo(-ship.radius, ship.radius * 0.85); // Right wing
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Cockpit
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(2, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, onGameOver, spawnWave, addScore]);

  return (
    <div className="flex flex-col items-center">
      {/* Top HUD */}
      <div className="w-full max-w-[480px] flex items-center justify-between px-3 py-2 bg-zinc-950/80 border-b border-zinc-800 text-xs font-mono-data mb-3 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">SCORE:</span>
          <span className="text-cyan-400 font-bold text-sm tracking-wider">{score.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-400">HI:</span>
          <span className="text-zinc-200 font-bold">{highScore.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">WAVE:</span>
          <span className="text-purple-400 font-bold">{wave}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400">SHIELDS:</span>
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <span key={i} className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-500/50" />
          ))}
        </div>

        <button
          onClick={() => {
            setIsMuted(!isMuted);
            soundFX.isMuted = !isMuted;
          }}
          className="text-zinc-400 hover:text-zinc-200"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>
      </div>

      {/* Retro Canvas */}
      <div className="relative border-4 border-zinc-800 rounded-lg overflow-hidden bg-black shadow-2xl shadow-cyan-950/40">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
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
                  OBLITERATED!
                </h3>
                <p className="text-xs text-zinc-300 font-mono-data">
                  Final Score: <span className="text-cyan-400 font-bold text-base">{score.toLocaleString()}</span>
                </p>
                <p className="text-[11px] text-zinc-400 font-mono-data max-w-xs">
                  {score > highScore ? '🎉 NEW X1ROID HIGH SCORE!' : 'Dead meme asteroids crushed your shields. Insert 0.25 TRX to replay!'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-2.5 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase text-xs tracking-wider flex items-center gap-2 mx-auto shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Play Again ({credits} Credit{credits === 1 ? '' : 's'})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in max-w-xs">
                <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950/80 border border-cyan-500 flex items-center justify-center text-cyan-400 text-2xl shadow-lg shadow-cyan-500/30">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl font-black text-cyan-400 tracking-wider font-heading uppercase">
                    X1ROID
                  </h3>
                  <p className="text-xs text-zinc-300 font-mono-data mt-1">
                    Classic Vector Space Combat with Dead Meme Asteroids
                  </p>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 text-[11px] text-zinc-300 font-mono-data text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Big Asteroids: 20 pts (splits in 2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Medium Asteroids: 50 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Small Asteroids: 100 pts</span>
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full py-2.5 px-4 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START X1ROID ({credits} Credits)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* On-Screen Mobile Touch Controls */}
      <div className="w-full max-w-[480px] mt-4 flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => { stateRef.current.ship.rotatingLeft = true; }}
            onPointerUp={() => { stateRef.current.ship.rotatingLeft = false; }}
            className="w-11 h-11 rounded-lg bg-zinc-800 active:bg-cyan-600 flex items-center justify-center text-zinc-200"
            title="Rotate Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onPointerDown={() => { stateRef.current.ship.rotatingRight = true; }}
            onPointerUp={() => { stateRef.current.ship.rotatingRight = false; }}
            className="w-11 h-11 rounded-lg bg-zinc-800 active:bg-cyan-600 flex items-center justify-center text-zinc-200"
            title="Rotate Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onPointerDown={() => {
              stateRef.current.ship.thrusting = true;
              soundFX.playThrustSound();
            }}
            onPointerUp={() => { stateRef.current.ship.thrusting = false; }}
            className="w-11 h-11 rounded-lg bg-zinc-800 active:bg-amber-600 flex items-center justify-center text-zinc-200"
            title="Thrust"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={hyperspaceJump}
            className="px-3 py-2.5 rounded-lg bg-purple-950/80 border border-purple-800 hover:bg-purple-900 active:scale-95 text-[10px] font-mono-data text-purple-300 font-bold"
            title="Hyperspace Jump"
          >
            <Zap className="w-3.5 h-3.5 mx-auto mb-0.5" />
            WARP
          </button>
          <button
            onClick={fireLaser}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-xs font-mono-data text-black font-black flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
          >
            <Crosshair className="w-4 h-4" />
            FIRE
          </button>
        </div>
      </div>
    </div>
  );
};
