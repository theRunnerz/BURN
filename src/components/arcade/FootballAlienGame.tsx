import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundFX } from '../../utils/audio.js';
import { Trophy, RotateCcw, Volume2, VolumeX, Play, ShieldAlert, Zap, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ExternalLink, Lock } from 'lucide-react';
import { SUNPUMP_BUY_URL, FBA_CONTRACT_ADDRESS } from '../FootballAlienPortal.js';

interface FootballAlienGameProps {
  fbaBalance: number;
  onGameOver: (score: number) => void;
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

interface AlienPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  facing: 'up' | 'down' | 'left' | 'right';
  hasBall: boolean;
  powerupTime: number;
  invincibleTime: number;
}

interface Defender {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'crawler' | 'tank' | 'interceptor';
  color: string;
}

interface LaserBlaster {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface CollectibleItem {
  id: number;
  x: number;
  y: number;
  type: 'touchdown' | 'plasma_football' | 'laser_boost' | 'gravity_shield';
  points: number;
  label: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 560;

export const FootballAlienGame: React.FC<FootballAlienGameProps> = ({
  fbaBalance,
  onGameOver,
  walletAddress,
  onConnectWallet,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [touchdowns, setTouchdowns] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [yardLine, setYardLine] = useState(20);
  const [ammo, setAmmo] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [demoBypass, setDemoBypass] = useState(false);

  // Game internal state ref
  const gameStateRef = useRef<{
    player: AlienPlayer;
    defenders: Defender[];
    lasers: LaserBlaster[];
    items: CollectibleItem[];
    particles: Particle[];
    keys: { [key: string]: boolean };
    lastShotTime: number;
    score: number;
    touchdowns: number;
    yardLine: number;
    ammo: number;
    scrollOffset: number;
  }>({
    player: {
      x: CANVAS_WIDTH / 2 - 16,
      y: CANVAS_HEIGHT - 90,
      width: 32,
      height: 36,
      speed: 4.5,
      facing: 'up',
      hasBall: true,
      powerupTime: 0,
      invincibleTime: 0,
    },
    defenders: [],
    lasers: [],
    items: [],
    particles: [],
    keys: {},
    lastShotTime: 0,
    score: 0,
    touchdowns: 0,
    yardLine: 20,
    ammo: 15,
    scrollOffset: 0,
  });

  const hasAccess = fbaBalance >= 1000 || demoBypass;

  // Sound helper
  const playLaserSound = () => {
    if (isMuted) return;
    try {
      const ctx = (soundFX as any).ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  };

  const playTouchdownSound = () => {
    if (isMuted) return;
    try {
      const ctx = (soundFX as any).ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.2);
      });
    } catch {
      // Audio fallback
    }
  };

  const playHitSound = () => {
    if (isMuted) return;
    try {
      const ctx = (soundFX as any).ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio fallback
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling when playing
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && isPlaying) {
        e.preventDefault();
      }
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') {
        gameStateRef.current.keys['space'] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
      if (e.key === ' ') {
        gameStateRef.current.keys['space'] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Spawn defenders and items
  const spawnDefender = () => {
    const types: Array<'crawler' | 'tank' | 'interceptor'> = ['crawler', 'crawler', 'interceptor', 'tank'];
    const type = types[Math.floor(Math.random() * types.length)];
    let width = 28;
    let height = 30;
    let speed = 2.2 + Math.random() * 1.5;
    let color = '#ef4444'; // Red

    if (type === 'tank') {
      width = 38;
      height = 36;
      speed = 1.4;
      color = '#f97316'; // Orange
    } else if (type === 'interceptor') {
      width = 24;
      height = 26;
      speed = 3.6;
      color = '#a855f7'; // Purple
    }

    const x = Math.random() * (CANVAS_WIDTH - width - 40) + 20;
    gameStateRef.current.defenders.push({
      id: Date.now() + Math.random(),
      x,
      y: -height - 10,
      width,
      height,
      speed,
      type,
      color,
    });
  };

  const spawnCollectible = () => {
    const types: Array<'plasma_football' | 'laser_boost' | 'gravity_shield'> = [
      'plasma_football',
      'plasma_football',
      'laser_boost',
      'gravity_shield',
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (CANVAS_WIDTH - 60) + 30;

    let label = '🏈';
    let points = 250;
    if (type === 'laser_boost') {
      label = '⚡';
      points = 500;
    } else if (type === 'gravity_shield') {
      label = '🛡️';
      points = 750;
    }

    gameStateRef.current.items.push({
      id: Date.now() + Math.random(),
      x,
      y: -30,
      type,
      points,
      label,
    });
  };

  const startNewGame = useCallback(() => {
    if (!hasAccess) return;
    const state = gameStateRef.current;
    state.player = {
      x: CANVAS_WIDTH / 2 - 16,
      y: CANVAS_HEIGHT - 90,
      width: 32,
      height: 36,
      speed: 4.5,
      facing: 'up',
      hasBall: true,
      powerupTime: 0,
      invincibleTime: 60, // 1 sec spawn shield
    };
    state.defenders = [];
    state.lasers = [];
    state.items = [];
    state.particles = [];
    state.score = 0;
    state.touchdowns = 0;
    state.yardLine = 20;
    state.ammo = 20;
    state.scrollOffset = 0;

    setScore(0);
    setTouchdowns(0);
    setYardLine(20);
    setAmmo(20);
    setIsGameOver(false);
    setIsPlaying(true);
  }, [hasAccess]);

  // Main Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let spawnTimer = 0;
    let itemTimer = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;
      const { player, keys } = state;

      // 1. Player Movement
      let dx = 0;
      let dy = 0;
      if (keys['arrowleft'] || keys['a']) {
        dx -= player.speed;
        player.facing = 'left';
      }
      if (keys['arrowright'] || keys['d']) {
        dx += player.speed;
        player.facing = 'right';
      }
      if (keys['arrowup'] || keys['w']) {
        dy -= player.speed * 0.9;
        player.facing = 'up';
      }
      if (keys['arrowdown'] || keys['s']) {
        dy += player.speed * 0.8;
        player.facing = 'down';
      }

      player.x = Math.max(16, Math.min(CANVAS_WIDTH - player.width - 16, player.x + dx));
      player.y = Math.max(50, Math.min(CANVAS_HEIGHT - player.height - 20, player.y + dy));

      // Continuous yardage gain when running forward
      if (dy < 0 || keys['arrowup'] || keys['w']) {
        state.yardLine += 0.08;
      } else {
        state.yardLine += 0.03;
      }

      // Check for Endzone / Touchdown!
      if (state.yardLine >= 100 || player.y <= 65) {
        // Touchdown!
        state.touchdowns += 1;
        state.score += 7000;
        state.ammo = Math.min(50, state.ammo + 10);
        state.yardLine = 20;
        player.y = CANVAS_HEIGHT - 90;
        player.invincibleTime = 90; // 1.5s post touchdown protection
        playTouchdownSound();

        // Explosion of confetti particles
        for (let i = 0; i < 40; i++) {
          state.particles.push({
            x: CANVAS_WIDTH / 2,
            y: 70,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 60,
            maxLife: 60,
            color: ['#10b981', '#34d399', '#facc15', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 5)],
            size: Math.random() * 5 + 3,
          });
        }
      }

      // 2. Shooting Futuristic Plasma Footballs / Lasers
      const now = Date.now();
      if ((keys['space'] || keys['k'] || keys['j']) && now - state.lastShotTime > 180 && state.ammo > 0) {
        state.lastShotTime = now;
        state.ammo -= 1;
        playLaserSound();

        // Fire laser in facing direction or straight forward
        const vy = player.facing === 'down' ? 8 : -11;
        const vx = player.facing === 'left' ? -6 : player.facing === 'right' ? 6 : 0;

        state.lasers.push({
          x: player.x + player.width / 2,
          y: player.y + (vy < 0 ? 0 : player.height),
          vx,
          vy,
          life: 70,
        });

        // If player has laser boost powerup, fire spread shot
        if (player.powerupTime > 0) {
          state.lasers.push({
            x: player.x + player.width / 2,
            y: player.y,
            vx: vx - 3,
            vy: vy,
            life: 70,
          });
          state.lasers.push({
            x: player.x + player.width / 2,
            y: player.y,
            vx: vx + 3,
            vy: vy,
            life: 70,
          });
        }
      }

      // Update Powerups
      if (player.powerupTime > 0) player.powerupTime--;
      if (player.invincibleTime > 0) player.invincibleTime--;

      // 3. Update Lasers
      state.lasers.forEach(l => {
        l.x += l.vx;
        l.y += l.vy;
        l.life--;
      });
      state.lasers = state.lasers.filter(l => l.life > 0 && l.y > 0 && l.y < CANVAS_HEIGHT && l.x > 0 && l.x < CANVAS_WIDTH);

      // 4. Spawn & Update Defenders
      spawnTimer++;
      if (spawnTimer > Math.max(30, 75 - Math.floor(state.touchdowns * 6))) {
        spawnDefender();
        spawnTimer = 0;
      }

      itemTimer++;
      if (itemTimer > 180) {
        spawnCollectible();
        itemTimer = 0;
      }

      state.defenders.forEach(d => {
        d.y += d.speed;
        // Tracking logic for interceptors
        if (d.type === 'interceptor') {
          if (d.x < player.x) d.x += 1.1;
          else if (d.x > player.x) d.x -= 1.1;
        }
      });
      state.defenders = state.defenders.filter(d => d.y < CANVAS_HEIGHT + 50);

      // 5. Update Items
      state.items.forEach(it => {
        it.y += 2.0;
      });
      state.items = state.items.filter(it => it.y < CANVAS_HEIGHT + 30);

      // 6. Laser vs Defender Collisions
      state.lasers.forEach(laser => {
        state.defenders.forEach(def => {
          if (
            laser.x > def.x &&
            laser.x < def.x + def.width &&
            laser.y > def.y &&
            laser.y < def.y + def.height
          ) {
            laser.life = 0;
            def.y = CANVAS_HEIGHT + 100; // Mark for removal
            state.score += def.type === 'tank' ? 400 : def.type === 'interceptor' ? 300 : 150;

            // Spawn explosion particles
            for (let i = 0; i < 12; i++) {
              state.particles.push({
                x: def.x + def.width / 2,
                y: def.y + def.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30,
                maxLife: 30,
                color: def.color,
                size: Math.random() * 3 + 2,
              });
            }
          }
        });
      });

      // 7. Player vs Item Pickups
      state.items.forEach(item => {
        if (
          player.x < item.x + 24 &&
          player.x + player.width > item.x &&
          player.y < item.y + 24 &&
          player.y + player.height > item.y
        ) {
          state.score += item.points;
          item.y = CANVAS_HEIGHT + 100;

          if (item.type === 'plasma_football') {
            state.ammo = Math.min(50, state.ammo + 6);
          } else if (item.type === 'laser_boost') {
            player.powerupTime = 300; // 5 seconds of spread shot
          } else if (item.type === 'gravity_shield') {
            player.invincibleTime = 300; // 5 seconds of shield
          }

          // Sparkle particles
          for (let i = 0; i < 8; i++) {
            state.particles.push({
              x: player.x + player.width / 2,
              y: player.y + player.height / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 20,
              maxLife: 20,
              color: '#34d399',
              size: 3,
            });
          }
        }
      });

      // 8. Player vs Defender Collisions (Tackle / Game Over)
      if (player.invincibleTime <= 0) {
        state.defenders.forEach(def => {
          if (
            player.x + 6 < def.x + def.width &&
            player.x + player.width - 6 > def.x &&
            player.y + 6 < def.y + def.height &&
            player.y + player.height - 6 > def.y
          ) {
            // Tackle! Game over!
            playHitSound();
            setIsGameOver(true);
            setIsPlaying(false);
            onGameOver(Math.round(state.score));

            // Giant tackle particles
            for (let i = 0; i < 35; i++) {
              state.particles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 45,
                maxLife: 45,
                color: '#ef4444',
                size: 4,
              });
            }
          }
        });
      }

      // 9. Particles
      state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
      });
      state.particles = state.particles.filter(p => p.life > 0);

      // Synchronize HUD state
      setScore(Math.round(state.score));
      setTouchdowns(state.touchdowns);
      setYardLine(Math.floor(state.yardLine));
      setAmmo(state.ammo);
      setHighScore(prev => Math.max(prev, Math.round(state.score)));

      // 10. RENDER CANVAS
      renderCanvas(ctx, state);

      if (!isGameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isGameOver, onGameOver]);

  // Canvas drawing routine
  const renderCanvas = (
    ctx: CanvasRenderingContext2D,
    state: typeof gameStateRef.current
  ) => {
    // 1. Cosmic Turf Background
    ctx.fillStyle = '#051910';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Scrolling yard lines
    state.scrollOffset = (state.scrollOffset + 1.8) % 40;
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.5;

    for (let y = -40 + state.scrollOffset; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(16, y);
      ctx.lineTo(CANVAS_WIDTH - 16, y);
      ctx.stroke();

      // Yard numbers
      ctx.fillStyle = '#065f46';
      ctx.font = '10px monospace';
      ctx.fillText('10', 24, y - 4);
      ctx.fillText('10', CANVAS_WIDTH - 38, y - 4);
    }

    // Sidelines & Hash marks
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 0, CANVAS_WIDTH - 32, CANVAS_HEIGHT);

    // Endzone at top
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(16, 0, CANVAS_WIDTH - 32, 60);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ GALACTIC ENDZONE ★', CANVAS_WIDTH / 2, 38);
    ctx.textAlign = 'left';

    // 2. Render Collectibles
    state.items.forEach(it => {
      ctx.font = '22px serif';
      ctx.fillText(it.label, it.x, it.y + 18);
    });

    // 3. Render Lasers
    state.lasers.forEach(l => {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 4. Render Defenders (Alien Cyborg Linebackers)
    state.defenders.forEach(def => {
      ctx.fillStyle = def.color;
      ctx.shadowColor = def.color;
      ctx.shadowBlur = 6;

      // Body
      ctx.fillRect(def.x, def.y, def.width, def.height);
      ctx.shadowBlur = 0;

      // Visor / Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(def.x + 4, def.y + 6, def.width - 8, 4);

      // Spikes / Armor
      ctx.fillStyle = '#18181b';
      ctx.fillRect(def.x - 2, def.y + 12, 4, 10);
      ctx.fillRect(def.x + def.width - 2, def.y + 12, 4, 10);
    });

    // 5. Render Player (Football Alien QB)
    const { player } = state;
    const px = player.x;
    const py = player.y;

    // Invincible / Shield Glow
    if (player.invincibleTime > 0) {
      ctx.strokeStyle = player.invincibleTime % 10 < 5 ? '#38bdf8' : '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + player.width / 2, py + player.height / 2, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Alien Body (Lime Green)
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.ellipse(px + player.width / 2, py + 12, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Large Alien Black Eyes
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(px + 10, py + 10, 4, 7, -0.2, 0, Math.PI * 2);
    ctx.ellipse(px + 22, py + 10, 4, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Jersey (#00)
    ctx.fillStyle = '#065f46';
    ctx.fillRect(px + 4, py + 18, player.width - 8, 16);

    // Number
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FBA', px + 7, py + 29);

    // Football in hand
    if (player.hasBall) {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(px + player.width - 2, py + 22, 6, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Particles
    state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-xl mx-auto">
      {/* Game Header / HUD */}
      <div className="w-full bg-zinc-950 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-xl">
            👽🏈
          </div>
          <div>
            <h3 className="font-heading font-black text-sm text-white uppercase flex items-center gap-1.5">
              <span>Alien Blitz: Galactic Bowl</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono-data">
                1000 $FBA
              </span>
            </h3>
            <span className="text-xs font-mono-data text-emerald-400">
              Score: <strong className="text-white text-sm">{score.toLocaleString()}</strong> | Touchdowns: <strong className="text-lime-300">{touchdowns}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-data">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase">Ball Position</span>
            <span className="text-amber-300 font-bold">{yardLine} YD LINE</span>
          </div>

          <div className="text-right pl-2 border-l border-zinc-800">
            <span className="text-[10px] text-zinc-400 block uppercase">Plasma Ammo</span>
            <span className="text-cyan-400 font-bold">{ammo} ⚡</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container with Lock Overlay if balance < 1000 */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl bg-zinc-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-zinc-950"
        />

        {/* 1. Gated Locked Screen when under 1000 $FBA */}
        {!hasAccess && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border-2 border-amber-500/80 flex items-center justify-center text-amber-400 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-sm">
              <span className="text-xs font-mono-data text-amber-400 uppercase tracking-widest block font-bold">
                TOKEN-GATED ARCADE ACCESS
              </span>
              <h2 className="text-2xl font-black font-heading text-white uppercase">
                1,000 $FBA REQUIRED
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Alien Blitz is exclusively reserved for the <strong>Football Alien ($FBA)</strong> community. Hold at least 1,000 tokens in your connected TRON wallet to play.
              </p>
            </div>

            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl w-full max-w-xs text-xs font-mono-data text-zinc-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Your Holdings:</span>
                <span className="text-amber-400 font-bold">{fbaBalance.toLocaleString()} $FBA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Required:</span>
                <span className="text-emerald-400 font-bold">1,000 $FBA</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <a
                href={SUNPUMP_BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-black font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Buy $FBA on SunPump</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {!walletAddress && onConnectWallet && (
                <button
                  onClick={onConnectWallet}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono-data uppercase tracking-wider"
                >
                  Connect TronLink Wallet
                </button>
              )}

              {/* Testing / demo bypass for preview */}
              <button
                onClick={() => setDemoBypass(true)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono-data underline mt-1"
              >
                (Demo Holder Pass Preview)
              </button>
            </div>
          </div>
        )}

        {/* 2. Ready to Play Start Overlay */}
        {hasAccess && !isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/50">
              🏈
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono-data text-emerald-400 uppercase tracking-widest block font-bold">
                ✓ 1,000 $FBA HOLDER VERIFIED
              </span>
              <h2 className="text-3xl font-black font-heading text-white uppercase">
                ALIEN BLITZ
              </h2>
              <p className="text-xs text-zinc-300 max-w-xs">
                Sprint past alien cyborg defenders, shoot plasma balls with <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-emerald-400">Space</kbd>, and score touchdowns!
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-left font-mono-data text-[11px] text-zinc-300 max-w-xs space-y-1.5">
              <div>🎮 <strong className="text-emerald-400">Arrows / WASD:</strong> Move & Sprint</div>
              <div>⚡ <strong className="text-cyan-400">Spacebar / K:</strong> Fire Plasma Blaster</div>
              <div>🏈 <strong className="text-amber-400">Touchdown:</strong> +7,000 Pts & +10 Ammo</div>
            </div>

            <button
              onClick={startNewGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-black font-heading font-black text-sm uppercase tracking-wider flex items-center gap-2 active:scale-95 shadow-xl transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>KICK OFF MATCH</span>
            </button>
          </div>
        )}

        {/* 3. Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-950 border-2 border-rose-600 flex items-center justify-center text-2xl">
              💥
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono-data text-rose-500 uppercase tracking-widest block font-bold">
                TACKLED ON THE 40 YARD LINE!
              </span>
              <h2 className="text-3xl font-black font-heading text-white uppercase">
                TURNOVER ON DOWNS
              </h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full max-w-xs font-mono-data text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Final Score:</span>
                <span className="text-xl font-black text-emerald-400">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Cosmic Touchdowns:</span>
                <span className="text-lime-300 font-bold">{touchdowns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">High Score:</span>
                <span className="text-amber-300 font-bold">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startNewGame}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-black font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch / Mobile Control Pad */}
      <div className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl font-mono-data text-xs text-zinc-400 sm:hidden">
        <span>Controls:</span>
        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => { gameStateRef.current.keys['arrowleft'] = true; }}
            onTouchEnd={() => { gameStateRef.current.keys['arrowleft'] = false; }}
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg active:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onTouchStart={() => { gameStateRef.current.keys['arrowup'] = true; }}
            onTouchEnd={() => { gameStateRef.current.keys['arrowup'] = false; }}
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg active:bg-zinc-800"
          >
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
          <button
            onTouchStart={() => { gameStateRef.current.keys['arrowdown'] = true; }}
            onTouchEnd={() => { gameStateRef.current.keys['arrowdown'] = false; }}
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg active:bg-zinc-800"
          >
            <ArrowDown className="w-4 h-4 text-white" />
          </button>
          <button
            onTouchStart={() => { gameStateRef.current.keys['arrowright'] = true; }}
            onTouchEnd={() => { gameStateRef.current.keys['arrowright'] = false; }}
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg active:bg-zinc-800"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onTouchStart={() => { gameStateRef.current.keys['space'] = true; }}
            onTouchEnd={() => { gameStateRef.current.keys['space'] = false; }}
            className="px-4 py-3 bg-emerald-600 text-black font-bold rounded-lg active:bg-emerald-500"
          >
            ⚡ FIRE
          </button>
        </div>
      </div>
    </div>
  );
};
