import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Flame, 
  ExternalLink,
  Shield, 
  Zap,
  Target
} from 'lucide-react';
import { ArcadeScore } from '../../types';
import { submitArcadeScore } from '../../services/api';
import { FBA_CONTRACT_ADDRESS, SUNPUMP_BUY_URL } from '../FootballAlienPortal';

interface FootballAlienGameProps {
  onGameOver: (score: number) => void;
  walletAddress?: string;
  isTokenHolder?: boolean;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  hasShield: boolean;
  shieldTimer: number;
  laserSpread: boolean;
  spreadTimer: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  type: 'linebacker' | 'drone' | 'intercept';
  hp: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isBall: boolean;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'shield' | 'spread' | 'ball';
}

export const FootballAlienGame: React.FC<FootballAlienGameProps> = ({
  onGameOver,
  walletAddress,
  isTokenHolder = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [yards, setYards] = useState(0); // 0 to 100 yards
  const [touchdowns, setTouchdowns] = useState(0);
  const [lives, setLives] = useState(3);
  const [ammo, setAmmo] = useState(15);
  const [highScore, setHighScore] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playerName, setPlayerName] = useState('ALIEN_QB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [recentScores, setRecentScores] = useState<ArcadeScore[]>([]);
  const [showTouchdownBanner, setShowTouchdownBanner] = useState(false);
  const [bypassGate, setBypassGate] = useState(false);

  // Holder validation: must hold tokens or bypass in demo
  const hasAccess = isTokenHolder || bypassGate || !!walletAddress;

  // Refs for animation loop
  const gameStateRef = useRef({
    player: {
      x: 200,
      y: 480,
      width: 36,
      height: 48,
      speed: 5,
      hasShield: false,
      shieldTimer: 0,
      laserSpread: false,
      spreadTimer: 0
    } as Player,
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    powerups: [] as PowerUp[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    keys: {} as Record<string, boolean>,
    yardsTraveled: 0,
    fieldOffset: 0,
    lastShotTime: 0,
    enemySpawnTimer: 0,
    powerupSpawnTimer: 0
  });

  // Sound synthesis
  const playSound = useCallback((type: 'shoot' | 'tackle' | 'touchdown' | 'powerup') => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'tackle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'touchdown') {
        // Fanfare chord
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const fOsc = ctx.createOscillator();
          const fGain = ctx.createGain();
          fOsc.type = 'square';
          fOsc.frequency.value = freq;
          fOsc.connect(fGain);
          fGain.connect(ctx.destination);
          fGain.gain.setValueAtTime(0.1, now + idx * 0.08);
          fGain.gain.linearRampToValueAtTime(0, now + idx * 0.08 + 0.4);
          fOsc.start(now + idx * 0.08);
          fOsc.stop(now + idx * 0.08 + 0.4);
        });
      }
    } catch {
      // AudioContext unavailable
    }
  }, [audioEnabled]);

  // Start new game
  const startGame = () => {
    gameStateRef.current = {
      player: {
        x: 220,
        y: 480,
        width: 36,
        height: 48,
        speed: 5,
        hasShield: false,
        shieldTimer: 0,
        laserSpread: false,
        spreadTimer: 0
      },
      enemies: [],
      bullets: [],
      powerups: [],
      particles: [],
      keys: {},
      yardsTraveled: 0,
      fieldOffset: 0,
      lastShotTime: 0,
      enemySpawnTimer: 0,
      powerupSpawnTimer: 0
    };
    setScore(0);
    setYards(0);
    setLives(3);
    setAmmo(20);
    setHasSubmitted(false);
    setIsPlaying(true);
    setShowTouchdownBanner(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' && isPlaying) {
        e.preventDefault();
        fireLaser();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, ammo]);

  const fireLaser = () => {
    const now = Date.now();
    if (now - gameStateRef.current.lastShotTime < 180) return;
    if (ammo <= 0) return;

    const { player } = gameStateRef.current;
    gameStateRef.current.lastShotTime = now;
    setAmmo(prev => Math.max(0, prev - 1));
    playSound('shoot');

    if (player.laserSpread) {
      gameStateRef.current.bullets.push(
        { x: player.x + player.width / 2, y: player.y, vx: 0, vy: -10, isBall: false },
        { x: player.x + player.width / 2, y: player.y, vx: -3, vy: -9, isBall: false },
        { x: player.x + player.width / 2, y: player.y, vx: 3, vy: -9, isBall: false }
      );
    } else {
      gameStateRef.current.bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        vx: 0,
        vy: -11,
        isBall: true
      });
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = gameStateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#061a12';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Football Field Grid (Moving Turf)
      state.fieldOffset = (state.fieldOffset + 2) % 60;
      ctx.strokeStyle = '#0e3a29';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Yard Lines
      ctx.strokeStyle = '#1b5e3d';
      ctx.lineWidth = 2;
      for (let y = state.fieldOffset; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Hash marks & yard numbers
      ctx.fillStyle = '#22c55e40';
      ctx.font = '10px monospace';
      for (let y = state.fieldOffset; y < height; y += 60) {
        ctx.fillText('10', 10, y + 14);
        ctx.fillText('10', width - 24, y + 14);
      }

      if (isPlaying) {
        // Update Yards and Field Progress
        state.yardsTraveled += 0.08;
        const currentYard = Math.floor(state.yardsTraveled) % 100;
        setYards(currentYard);

        // Touchdown trigger at 100 yards
        if (Math.floor(state.yardsTraveled) >= 100 && currentYard === 0 && !showTouchdownBanner) {
          state.yardsTraveled = 0;
          setTouchdowns(prev => prev + 1);
          setScore(prev => prev + 7000);
          setAmmo(prev => prev + 10);
          setShowTouchdownBanner(true);
          playSound('touchdown');
          setTimeout(() => setShowTouchdownBanner(false), 2500);

          // Touchdown particles
          for (let i = 0; i < 40; i++) {
            state.particles.push({
              x: width / 2,
              y: height / 2,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 45,
              color: ['#10b981', '#34d399', '#facc15', '#a855f7'][Math.floor(Math.random() * 4)]
            });
          }
        }

        // Player Movement
        const { player, keys } = state;
        if (keys['arrowleft'] || keys['a']) player.x -= player.speed;
        if (keys['arrowright'] || keys['d']) player.x += player.speed;
        if (keys['arrowup'] || keys['w']) player.y -= player.speed;
        if (keys['arrowdown'] || keys['s']) player.y += player.speed;

        // Boundaries
        player.x = Math.max(10, Math.min(width - player.width - 10, player.x));
        player.y = Math.max(20, Math.min(height - player.height - 20, player.y));

        // Timers
        if (player.hasShield) {
          player.shieldTimer -= 1;
          if (player.shieldTimer <= 0) player.hasShield = false;
        }
        if (player.laserSpread) {
          player.spreadTimer -= 1;
          if (player.spreadTimer <= 0) player.laserSpread = false;
        }

        // Spawn Enemies
        state.enemySpawnTimer++;
        if (state.enemySpawnTimer > 40) {
          state.enemySpawnTimer = 0;
          const types: Enemy['type'][] = ['linebacker', 'drone', 'intercept'];
          const type = types[Math.floor(Math.random() * types.length)];
          state.enemies.push({
            id: Date.now() + Math.random(),
            x: Math.random() * (width - 40) + 20,
            y: -40,
            width: type === 'linebacker' ? 36 : 28,
            height: type === 'linebacker' ? 44 : 28,
            speedX: type === 'intercept' ? (Math.random() - 0.5) * 4 : 0,
            speedY: type === 'drone' ? 4.5 : 2.8,
            type,
            hp: type === 'linebacker' ? 2 : 1
          });
        }

        // Spawn Powerups
        state.powerupSpawnTimer++;
        if (state.powerupSpawnTimer > 280) {
          state.powerupSpawnTimer = 0;
          const ptypes: PowerUp['type'][] = ['shield', 'spread', 'ball'];
          state.powerups.push({
            id: Date.now(),
            x: Math.random() * (width - 50) + 25,
            y: -30,
            type: ptypes[Math.floor(Math.random() * ptypes.length)]
          });
        }

        // Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          if (b.y < -10 || b.x < 0 || b.x > width) {
            state.bullets.splice(i, 1);
          }
        }

        // Update Powerups
        for (let i = state.powerups.length - 1; i >= 0; i--) {
          const p = state.powerups[i];
          p.y += 2.2;

          // Pickup Collision
          if (
            player.x < p.x + 20 &&
            player.x + player.width > p.x &&
            player.y < p.y + 20 &&
            player.y + player.height > p.y
          ) {
            playSound('powerup');
            if (p.type === 'shield') {
              player.hasShield = true;
              player.shieldTimer = 350;
            } else if (p.type === 'spread') {
              player.laserSpread = true;
              player.spreadTimer = 300;
            } else if (p.type === 'ball') {
              setAmmo(prev => prev + 12);
            }
            setScore(prev => prev + 500);
            state.powerups.splice(i, 1);
            continue;
          }

          if (p.y > height + 20) {
            state.powerups.splice(i, 1);
          }
        }

        // Update Enemies
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          const e = state.enemies[i];
          e.y += e.speedY;
          e.x += e.speedX;

          // Wall bounce for interceptors
          if (e.x < 10 || e.x > width - e.width - 10) {
            e.speedX *= -1;
          }

          // Bullet Collision
          for (let j = state.bullets.length - 1; j >= 0; j--) {
            const b = state.bullets[j];
            if (
              b.x > e.x &&
              b.x < e.x + e.width &&
              b.y > e.y &&
              b.y < e.y + e.height
            ) {
              e.hp -= 1;
              state.bullets.splice(j, 1);

              // Hit particles
              for (let p = 0; p < 6; p++) {
                state.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  life: 20,
                  color: '#34d399'
                });
              }

              if (e.hp <= 0) {
                setScore(prev => prev + (e.type === 'linebacker' ? 400 : 250));
                state.enemies.splice(i, 1);
                break;
              }
            }
          }

          // Player Collision / Tackle
          if (
            player.x < e.x + e.width &&
            player.x + player.width > e.x &&
            player.y < e.y + e.height &&
            player.y + player.height > e.y
          ) {
            state.enemies.splice(i, 1);
            playSound('tackle');

            if (player.hasShield) {
              player.hasShield = false;
              // Shatter shield
              for (let p = 0; p < 15; p++) {
                state.particles.push({
                  x: player.x + player.width / 2,
                  y: player.y + player.height / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 25,
                  color: '#38bdf8'
                });
              }
            } else {
              setLives(prev => {
                const next = prev - 1;
                if (next <= 0) {
                  setIsPlaying(false);
                  onGameOver(score);
                }
                return next;
              });

              // Player damage flash
              for (let p = 0; p < 20; p++) {
                state.particles.push({
                  x: player.x + player.width / 2,
                  y: player.y + player.height / 2,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  life: 30,
                  color: '#ef4444'
                });
              }
            }
            continue;
          }

          // Offscreen
          if (e.y > height + 40) {
            state.enemies.splice(i, 1);
          }
        }
      }

      // 3. Draw Powerups
      state.powerups.forEach(p => {
        ctx.save();
        if (p.type === 'shield') {
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.fillText('🛡️', p.x - 6, p.y + 4);
        } else if (p.type === 'spread') {
          ctx.fillStyle = '#9333ea';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.fillText('⚡', p.x - 6, p.y + 4);
        } else {
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 12, 7, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px monospace';
          ctx.fillText('🏈', p.x - 6, p.y + 4);
        }
        ctx.restore();
      });

      // 4. Draw Bullets
      state.bullets.forEach(b => {
        ctx.save();
        if (b.isBall) {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.ellipse(b.x, b.y, 7, 4, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#22c55e';
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 8;
          ctx.fillRect(b.x - 2, b.y, 4, 12);
        }
        ctx.restore();
      });

      // 5. Draw Enemies
      state.enemies.forEach(e => {
        ctx.save();
        if (e.type === 'linebacker') {
          // Cyborg Linebacker
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          // Helmet
          ctx.fillStyle = '#f87171';
          ctx.fillRect(e.x + 4, e.y + 2, e.width - 8, 12);
          // Visor
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(e.x + 8, e.y + 6, e.width - 16, 4);
        } else if (e.type === 'drone') {
          // Defense Drone
          ctx.fillStyle = '#7c3aed';
          ctx.beginPath();
          ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(e.x + 6, e.y + 6, e.width - 12, e.height - 12);
        } else {
          // Interceptor
          ctx.fillStyle = '#0369a1';
          ctx.beginPath();
          ctx.moveTo(e.x + e.width / 2, e.y + e.height);
          ctx.lineTo(e.x, e.y);
          ctx.lineTo(e.x + e.width, e.y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      // 6. Draw Player (Alien QB)
      const p = state.player;
      ctx.save();

      // Shield Aura
      if (p.hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 28, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Alien Body / Jersey
      ctx.fillStyle = '#059669'; // Emerald Jersey
      ctx.fillRect(p.x, p.y + 16, p.width, p.height - 16);

      // Jersey number #00
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('00', p.x + 11, p.y + 34);

      // Alien Head
      ctx.fillStyle = '#86efac'; // Light green alien skin
      ctx.beginPath();
      ctx.ellipse(p.x + p.width / 2, p.y + 10, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Giant Alien Eyes
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.ellipse(p.x + p.width / 2 - 5, p.y + 9, 4, 6, -0.2, 0, Math.PI * 2);
      ctx.ellipse(p.x + p.width / 2 + 5, p.y + 9, 4, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
        if (pt.life <= 0) state.particles.splice(i, 1);
      }

      // Loop
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, showTouchdownBanner, playSound, score, onGameOver]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting || hasSubmitted) return;

    try {
      setIsSubmitting(true);
      const res = await submitArcadeScore({
        game: 'football-alien',
        player: playerName.trim().toUpperCase(),
        walletAddress,
        score
      });
      setHasSubmitted(true);
      if (res.scores) {
        setRecentScores(res.scores.filter(s => s.game === 'football-alien'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Game Header Bar */}
      <div className="w-full max-w-[500px] flex items-center justify-between px-4 py-2 bg-zinc-950/80 border border-emerald-500/30 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">👽🏈</span>
          <span className="text-xs font-mono font-bold text-emerald-400">ALIEN BLITZ</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-zinc-400">SCORE: <strong className="text-white">{score}</strong></span>
          <span className="text-emerald-400 font-bold">YARDS: {yards}/100</span>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="text-zinc-400 hover:text-white"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full max-w-[500px] aspect-[4/5] bg-black border-x-2 border-emerald-500/40 overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={450}
          height={560}
          className="w-full h-full block"
        />

        {/* In-Game HUD Overlays */}
        {isPlaying && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Lives */}
            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md border border-emerald-500/30">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`text-sm ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
                  💚
                </span>
              ))}
            </div>

            {/* Ammo */}
            <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md border border-emerald-500/30 text-xs font-mono text-amber-400">
              <Zap className="w-3.5 h-3.5" /> AMMO: {ammo}
            </div>

            {/* Touchdowns */}
            <div className="bg-black/60 px-2.5 py-1 rounded-md border border-emerald-500/30 text-xs font-mono text-emerald-300 font-bold">
              TD: {touchdowns}
            </div>
          </div>
        )}

        {/* Touchdown Banner */}
        {showTouchdownBanner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/70 backdrop-blur-sm animate-pulse pointer-events-none">
            <span className="text-5xl mb-2">🏈✨</span>
            <h2 className="text-3xl font-black text-lime-300 tracking-widest drop-shadow-lg">
              TOUCHDOWN!
            </h2>
            <p className="text-sm font-mono text-white mt-1">+7,000 PTS & AMMO RESTOCKED</p>
          </div>
        )}

        {/* Token Holder Lock Overlay */}
        {!hasAccess && (
          <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-3xl">
              👽
            </div>
            <h3 className="text-xl font-bold text-white">Token-Gated Galactic Bowl</h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              Alien Blitz requires holding <strong className="text-emerald-400">1,000 $FBA</strong> tokens in your TRON wallet, or activating a test pass.
            </p>
            <div className="space-y-2 w-full max-w-xs">
              <a
                href={SUNPUMP_BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Buy $FBA on SunPump <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setBypassGate(true)}
                className="w-full py-2 rounded-lg border border-zinc-700 hover:border-emerald-500/40 text-zinc-300 text-xs font-mono"
              >
                Free Demo Practice Pass
              </button>
            </div>
          </div>
        )}

        {/* Start / Game Over Screen */}
        {hasAccess && !isPlaying && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-5">
            {score > 0 ? (
              <div className="space-y-3">
                <span className="text-4xl">💀🏈</span>
                <h3 className="text-2xl font-black text-red-400">TACKLED & FLATTENED</h3>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono space-y-1">
                  <div>FINAL SCORE: <strong className="text-emerald-400 text-lg">{score}</strong></div>
                  <div>TOUCHDOWNS: <strong className="text-white">{touchdowns}</strong></div>
                </div>

                {!hasSubmitted ? (
                  <form onSubmit={handleSubmitScore} className="space-y-2 pt-2">
                    <input
                      type="text"
                      maxLength={12}
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      placeholder="CALLSIGN (MAX 12)"
                      className="w-full px-3 py-2 bg-zinc-950 border border-emerald-500/40 rounded-lg text-emerald-300 font-mono text-center text-sm focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs font-mono uppercase tracking-wider"
                    >
                      {isSubmitting ? 'Submitting...' : 'Post High Score'}
                    </button>
                  </form>
                ) : (
                  <div className="text-xs font-mono text-emerald-400">
                    ✓ Score recorded in the Intergalactic Hall!
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-5xl animate-bounce">👽🏈</div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  ALIEN BLITZ
                </h2>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Dodge cyborg defenders, fire plasma footballs with <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-emerald-300">Space</kbd>, and run 100 yards for the Touchdown!
                </p>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black uppercase tracking-wider text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
            >
              {score > 0 ? 'Play Again' : 'Kick Off'}
            </button>
          </div>
        )}
      </div>

      {/* Touch & Mobile Controls */}
      <div className="w-full max-w-[500px] p-3 bg-zinc-950/90 border border-emerald-500/30 rounded-b-2xl flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">WASD / Arrows</kbd>
          <span>Move QB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-300">SPACE</kbd>
          <span>Fire Plasma</span>
        </div>
      </div>
    </div>
  );
};
