import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, RotateCcw, Swords, Heart, Shield, Zap, Flame, 
  ChevronRight, Trophy, Volume2, VolumeX, Home, Bomb,
  Gamepad, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair
} from 'lucide-react';
import { Tank, Bullet, PowerUp, Mine, Obstacle, Particle, MapType, GameConfig, PowerUpType } from '../types';
import { soundManager } from './SoundManager';
import { generateObstacles, ARENA_WIDTH, ARENA_HEIGHT } from './MapGenerator';

interface GameContainerProps {
  p1Name: string;
  p1Color: string;
  p2Name: string;
  p2Color: string;
  config: GameConfig;
  onReturnToMenu: () => void;
}

export default function GameContainer({
  p1Name,
  p1Color,
  p2Name,
  p2Color,
  config,
  onReturnToMenu
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [isPaused, setIsPaused] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [matchOver, setMatchOver] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundStatus, setRoundStatus] = useState<'countdown' | 'battle' | 'ended'>('countdown');
  const [countdownText, setCountdownText] = useState('3');
  const [p1Stats, setP1Stats] = useState({ shots: 0, hits: 0, minesPlaced: 0 });
  const [p2Stats, setP2Stats] = useState({ shots: 0, hits: 0, minesPlaced: 0 });

  // Sound mute indicator
  const [isMuted, setIsMuted] = useState(soundManager.getMute());
  const [showVirtualControllers, setShowVirtualControllers] = useState(true);

  // Input states (tracked via keydown/keyup on ref)
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const handleVirtualButtonPress = (player: 1 | 2, action: 'forward' | 'back' | 'left' | 'right' | 'shoot' | 'plantMine', isPressed: boolean) => {
    const p1IsMuhamadyusuf = p1Name.toLowerCase().includes('muhamadyusuf');
    const p2IsMuhamadyusuf = p2Name.toLowerCase().includes('muhamadyusuf');

    if (player === 1) {
      if (action === 'forward') {
        const key = p1IsMuhamadyusuf ? 'KeyF' : 'KeyW';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
      } else if (action === 'back') {
        const key = p1IsMuhamadyusuf ? 'KeyV' : 'KeyS';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
      } else if (action === 'left') {
        const key = p1IsMuhamadyusuf ? 'KeyC' : 'KeyA';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
      } else if (action === 'right') {
        const key = p1IsMuhamadyusuf ? 'KeyB' : 'KeyD';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
      } else if (action === 'shoot') {
        keysPressed.current['Space'] = isPressed;
      } else if (action === 'plantMine') {
        keysPressed.current['KeyQ'] = isPressed;
        keysPressed.current['keyq'] = isPressed;
      }
    } else {
      if (action === 'forward') {
        const key = p2IsMuhamadyusuf ? 'KeyF' : 'ArrowUp';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
        keysPressed.current['ArrowUp'] = isPressed;
      } else if (action === 'back') {
        const key = p2IsMuhamadyusuf ? 'KeyV' : 'ArrowDown';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
        keysPressed.current['ArrowDown'] = isPressed;
      } else if (action === 'left') {
        const key = p2IsMuhamadyusuf ? 'KeyC' : 'ArrowLeft';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
        keysPressed.current['ArrowLeft'] = isPressed;
      } else if (action === 'right') {
        const key = p2IsMuhamadyusuf ? 'KeyB' : 'ArrowRight';
        keysPressed.current[key] = isPressed;
        keysPressed.current[key.toLowerCase()] = isPressed;
        keysPressed.current['ArrowRight'] = isPressed;
      } else if (action === 'shoot') {
        const key = p2IsMuhamadyusuf ? 'Space' : 'Slash';
        keysPressed.current[key] = isPressed;
        if (!p2IsMuhamadyusuf) {
          keysPressed.current['/'] = isPressed;
          keysPressed.current['Key/'] = isPressed;
          keysPressed.current['Enter'] = isPressed;
        }
      } else if (action === 'plantMine') {
        const key = p2IsMuhamadyusuf ? 'KeyQ' : 'Period';
        keysPressed.current[key] = isPressed;
        if (!p2IsMuhamadyusuf) {
          keysPressed.current['.'] = isPressed;
          keysPressed.current['Key.'] = isPressed;
        }
      }
    }
  };

  const renderVirtualButton = (
    player: 1 | 2,
    action: 'forward' | 'back' | 'left' | 'right' | 'shoot' | 'plantMine',
    label: React.ReactNode,
    className: string,
    colorClass: string
  ) => {
    const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      handleVirtualButtonPress(player, action, true);
    };
    const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      handleVirtualButtonPress(player, action, false);
    };

    return (
      <button
        type="button"
        className={`select-none hover:brightness-110 active:scale-95 transition-all text-xs font-black rounded-xl flex items-center justify-center cursor-pointer ${className} ${colorClass}`}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        id={`v-btn-${player}-${action}`}
        style={{ touchAction: 'none' }}
      >
        {label}
      </button>
    );
  };

  // Game engine variables (using ref to avoid React state delay in high-speed render loops)
  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  
  const tanksRef = useRef<Tank[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const minesRef = useRef<Mine[]>([]);
  const powerupsRef = useRef<PowerUp[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Visual juicy items
  const shakeIntensity = useRef<number>(0);
  const roundFrames = useRef<number>(0);

  // Keyboard layout info to show
  // P1: W A S D / Space / Q
  // P2: Arrows / / / .

  // Canvas dimension scaling
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });

  // Set up resize observer to fit canvas beautifully inside container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Keep correct aspect ratio 960 / 600 = 1.6
        const targetRatio = 1.6;
        let newW = width;
        let newH = width / targetRatio;
        
        if (newH > height) {
          newH = height;
          newW = height * targetRatio;
        }

        // Apply fallback min size to avoid rendering bug
        setDimensions({
          width: Math.max(320, newW),
          height: Math.max(200, newH)
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Initialize round state
  const resetRound = (keepScores = true) => {
    if (!keepScores) {
      setScores({ p1: 0, p2: 0 });
      setRoundNumber(1);
      setWinner(null);
      setMatchOver(false);
      setP1Stats({ shots: 0, hits: 0, minesPlaced: 0 });
      setP2Stats({ shots: 0, hits: 0, minesPlaced: 0 });
    }

    setRoundStatus('countdown');
    setCountdownText('Tayyormisiz?');

    // Create symmetrical starting spots for Tanks
    // Player 1 on far left middle, Player 2 on far right middle
    tanksRef.current = [
      {
        id: 1,
        name: p1Name,
        x: 80,
        y: ARENA_HEIGHT / 2,
        angle: 0, // facing right
        turretAngle: 0,
        color: p1Color,
        health: 100,
        maxHealth: 100,
        speed: config.tankSpeed,
        isMoving: false,
        isRotatingCW: false,
        isRotatingCCW: false,
        isTurretRotatingCW: false,
        isTurretRotatingCCW: false,
        shootingCooldown: 0,
        maxCooldown: 30, // frames between shots (0.5 seconds)
        shieldTimeLeft: 0,
        speedTimeLeft: 0,
        doubleShootLeft: 0,
        minesCount: 1, // Start with 1 landmine
        isAlive: true,
        size: 18, // radius
        score: 0,
      },
      {
        id: 2,
        name: p2Name,
        x: ARENA_WIDTH - 80,
        y: ARENA_HEIGHT / 2,
        angle: Math.PI, // facing left
        turretAngle: Math.PI,
        color: p2Color,
        health: 100,
        maxHealth: 100,
        speed: config.tankSpeed,
        isMoving: false,
        isRotatingCW: false,
        isRotatingCCW: false,
        isTurretRotatingCW: false,
        isTurretRotatingCCW: false,
        shootingCooldown: 0,
        maxCooldown: 30,
        shieldTimeLeft: 0,
        speedTimeLeft: 0,
        doubleShootLeft: 0,
        minesCount: 1,
        isAlive: true,
        size: 18,
        score: 0,
      }
    ];

    bulletsRef.current = [];
    minesRef.current = [];
    powerupsRef.current = [];
    particlesRef.current = [];
    obstaclesRef.current = generateObstacles(config.mapType);

    // Initial spawning burst particles
    createExplosionParticles(80, ARENA_HEIGHT / 2, p1Color, 20);
    createExplosionParticles(ARENA_WIDTH - 80, ARENA_HEIGHT / 2, p2Color, 20);

    // Start 3 second countdown
    let count = 3;
    setCountdownText('3');
    soundManager.playMineArmed();

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = window.setInterval(() => {
      count--;
      if (count === 3) {
        setCountdownText('3');
        soundManager.playMineArmed();
      } else if (count === 2) {
        setCountdownText('2');
        soundManager.playMineArmed();
      } else if (count === 1) {
        setCountdownText('1');
        soundManager.playMineArmed();
      } else if (count === 0) {
        setCountdownText('JANG !');
        soundManager.playShot();
        setRoundStatus('battle');
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }
    }, 1000);
  };

  // Run on mount & round resets
  useEffect(() => {
    resetRound(false);

    // Register Keyboard Handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      keysPressed.current[e.code] = true;

      // Prevent scrolling with arrows and space keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '/', '.'].includes(e.code) || e.key === ' ') {
        e.preventDefault();
      }

      // Check Pause Key (Escape or 'p')
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        soundManager.playClick();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [p1Name, p2Name, p1Color, p2Color, config]);

  // Manage Spawn Timer for Power-ups
  useEffect(() => {
    if (roundStatus !== 'battle' || isPaused || matchOver) return;

    spawnTimerRef.current = window.setInterval(() => {
      spawnPowerup();
    }, config.powerupSpawnInterval);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [roundStatus, isPaused, matchOver]);

  // Handle game pausing
  const togglePause = () => {
    setIsPaused(!isPaused);
    soundManager.playClick();
  };

  // Toggle Mute
  const toggleMute = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.getMute());
    soundManager.playClick();
  };

  // Spawns a powerup in an open zone
  const spawnPowerup = () => {
    const powerUps: PowerUpType[] = ['health', 'speed', 'shield', 'damage', 'mine_count'];
    const type = powerUps[Math.floor(Math.random() * powerUps.length)];
    
    // Find open location free from obstacles & river zones
    let x = 0, y = 0, retries = 0, isValid = false;
    while (!isValid && retries < 50) {
      x = 100 + Math.random() * (ARENA_WIDTH - 200);
      y = 100 + Math.random() * (ARENA_HEIGHT - 200);
      retries++;
      
      // Check collision against obstacles
      let collides = false;
      for (const obs of obstaclesRef.current) {
        if (obs.type !== 'bush') { // Bushes are fine to hide powerups!
          // Add buffer radius around obstacle
          if (
            x + 15 > obs.x && x - 15 < obs.x + obs.width &&
            y + 15 > obs.y && y - 15 < obs.y + obs.height
          ) {
            collides = true;
            break;
          }
        }
      }
      if (!collides) isValid = true;
    }

    if (isValid) {
      powerupsRef.current.push({
        id: `powerup_${Date.now()}_${Math.random()}`,
        type,
        x,
        y,
        size: 14,
        pulseScale: 1,
        pulseInc: true
      });
      // Emmit sparkles around spawn point
      createExplosionParticles(x, y, '#38bdf8', 12, 'spark');
    }
  };

  // Particles generator helpers
  const createExplosionParticles = (
    x: number, y: number, color: string, count: number, 
    type: 'smoke' | 'spark' | 'dust' | 'fire' = 'fire'
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speedMultiplier = type === 'fire' ? 3.5 : type === 'spark' ? 5 : 1.5;
      const speed = (0.5 + Math.random() * 1.5) * speedMultiplier;
      
      particlesRef.current.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: type === 'smoke' ? (4 + Math.random() * 8) : (2 + Math.random() * 4),
        color,
        lifetime: 0,
        maxLifetime: type === 'smoke' ? (35 + Math.random() * 25) : (15 + Math.random() * 20),
        alpha: 1,
        type
      });
    }
  };

  const createTraceParticles = (x: number, y: number, color: string, type: 'smoke' | 'dust') => {
    particlesRef.current.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      size: type === 'smoke' ? (2 + Math.random() * 4) : (1.5 + Math.random() * 2),
      color,
      lifetime: 0,
      maxLifetime: type === 'smoke' ? (15 + Math.random() * 10) : (10 + Math.random() * 8),
      alpha: 0.6,
      type
    });
  };

  // Math Helper: Collison of circle vs AABB (Rectangle)
  const checkCircleAABB = (cx: number, cy: number, r: number, rx: number, ry: number, rw: number, rh: number) => {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    const distanceSq = dx * dx + dy * dy;
    
    return {
      collided: distanceSq < r * r,
      closestX,
      closestY,
      dx,
      dy,
      distance: Math.sqrt(distanceSq)
    };
  };

  // Main game logic loop
  const updatePhysics = () => {
    if (isPaused || roundStatus === 'countdown' || matchOver) return;

    roundFrames.current++;

    // Update Screenshake decay
    if (shakeIntensity.current > 0) {
      shakeIntensity.current *= 0.9;
      if (shakeIntensity.current < 0.2) shakeIntensity.current = 0;
    }

    const t1 = tanksRef.current[0];
    const t2 = tanksRef.current[1];

    // Handle Tank Inputs & Statuses
    const updateTank = (tank: Tank, keys: {
      left: boolean; right: boolean; forward: boolean; back: boolean; shoot: boolean; plantMine: boolean;
    }, opponent: Tank, statsSetter: React.Dispatch<React.SetStateAction<{ shots: number; hits: number; minesPlaced: number }>>) => {
      
      if (!tank.isAlive) return;

      // Unpack cooldowns
      if (tank.shootingCooldown > 0) tank.shootingCooldown--;
      if (tank.shieldTimeLeft > 0) tank.shieldTimeLeft--;
      if (tank.speedTimeLeft > 0) tank.speedTimeLeft--;

      // Active speeds depending on speed boost
      const currentSpeed = tank.speedTimeLeft > 0 ? tank.speed * 1.55 : tank.speed;
      const rotationSpeed = tank.speedTimeLeft > 0 ? 0.065 : 0.045; // slightly faster rot on speed boost

      // Tracks last coordinates to resolve collisions smoothly
      let oldX = tank.x;
      let oldY = tank.y;

      // Body rot
      if (keys.left) {
        tank.angle -= rotationSpeed;
        tank.turretAngle -= rotationSpeed; // follow base rotation
      }
      if (keys.right) {
        tank.angle += rotationSpeed;
        tank.turretAngle += rotationSpeed;
      }

      // Linear motion
      let isMoving = false;
      let dir = 0;
      if (keys.forward) {
        tank.x += Math.cos(tank.angle) * currentSpeed;
        tank.y += Math.sin(tank.angle) * currentSpeed;
        isMoving = true;
        dir = 1;
      } else if (keys.back) {
        // move backward slightly slower
        tank.x -= Math.cos(tank.angle) * currentSpeed * 0.55;
        tank.y -= Math.sin(tank.angle) * currentSpeed * 0.55;
        isMoving = true;
        dir = -1;
      }

      // Emit dirt smoke track particles when moving
      if (isMoving && roundFrames.current % 4 === 0) {
        const offsetAngle = tank.angle + Math.PI + (Math.random() - 0.5) * 0.5;
        const dustX = tank.x + Math.cos(offsetAngle) * tank.size;
        const dustY = tank.y + Math.sin(offsetAngle) * tank.size;
        createTraceParticles(dustX, dustY, tank.speedTimeLeft > 0 ? '#f59e0b' : '#64748b', 'dust');
      }

      // 1. Collision detection: Arena Boundaries
      if (tank.x - tank.size < 0) tank.x = tank.size;
      if (tank.x + tank.size > ARENA_WIDTH) tank.x = ARENA_WIDTH - tank.size;
      if (tank.y - tank.size < 0) tank.y = tank.size;
      if (tank.y + tank.size > ARENA_HEIGHT) tank.y = ARENA_HEIGHT - tank.size;

      // 2. Collision detection: Obstacles (Except Bushes where tanks reside underneath)
      for (const obs of obstaclesRef.current) {
        if (obs.type === 'bush') continue; // Skip leaf canopy hiding zones

        const collision = checkCircleAABB(tank.x, tank.y, tank.size, obs.x, obs.y, obs.width, obs.height);
        if (collision.collided) {
          // Push tank outside boundary based on overlap resolution
          const nx = collision.dx / (collision.distance || 1);
          const ny = collision.dy / (collision.distance || 1);
          const overlap = tank.size - collision.distance;

          // If standard separation is safe, resolve positionally.
          // In simple cases, just sliding along the wall works.
          if (collision.distance > 0.01) {
            tank.x += nx * overlap;
            tank.y += ny * overlap;
          } else {
            // Hard fallback to old coords
            tank.x = oldX;
            tank.y = oldY;
          }
        }
      }

      // 3. Collision detection: Opponent Tank (Don't pass through other tanks)
      if (opponent.isAlive) {
        const dx = tank.x - opponent.x;
        const dy = tank.y - opponent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = tank.size + opponent.size;
        if (dist < minDist) {
          // Symmetrical separation force
          const overlap = minDist - dist;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          tank.x += nx * overlap * 0.5;
          tank.y += ny * overlap * 0.5;
          opponent.x -= nx * overlap * 0.5;
          opponent.y -= ny * overlap * 0.5;
        }
      }

      // 4. Fire Gun action
      if (keys.shoot && tank.shootingCooldown === 0) {
        // Spawns shell
        const bulletSpeed = config.bulletSpeed * (tank.doubleShootLeft > 0 ? 1.25 : 1);
        const bulletDmg = tank.doubleShootLeft > 0 ? 35 : 20;
        
        // Spawn slightly outside barrel
        const barrelLen = tank.size + 10;
        const bx = tank.x + Math.cos(tank.turretAngle) * barrelLen;
        const by = tank.y + Math.sin(tank.turretAngle) * barrelLen;

        const bulletId = `b_${tank.id}_${Date.now()}_${Math.random()}`;
        bulletsRef.current.push({
          id: bulletId,
          ownerId: tank.id,
          x: bx,
          y: by,
          dx: Math.cos(tank.turretAngle) * bulletSpeed,
          dy: Math.sin(tank.turretAngle) * bulletSpeed,
          angle: tank.turretAngle,
          damage: bulletDmg,
          bounceCount: 0,
          maxBounce: 2, // Bullets bounce up to 2 times on solid stones! Extremely rich trickshot!
          size: 4,
          speed: bulletSpeed
        });

        // Stats tracking
        statsSetter(prev => ({ ...prev, shots: prev.shots + 1 }));

        // Flash visual emitter
        createExplosionParticles(bx, by, '#f97316', 5, 'fire');
        
        // Set cooldown: double fire makes reload ultra quick (12 frames instead of 30)
        tank.shootingCooldown = tank.doubleShootLeft > 0 ? 11 : tank.maxCooldown;
        if (tank.doubleShootLeft > 0) {
          tank.doubleShootLeft--;
        }

        // Sound FX
        soundManager.playShot();
      }

      // 5. Place Landmines
      if (keys.plantMine && tank.minesCount > 0) {
        // Place behind tank
        const rAngle = tank.angle + Math.PI;
        const mx = tank.x + Math.cos(rAngle) * (tank.size + 15);
        const my = tank.y + Math.sin(rAngle) * (tank.size + 15);

        // Keep mine bounds inside arena
        if (mx > 15 && mx < ARENA_WIDTH - 15 && my > 15 && my < ARENA_HEIGHT - 15) {
          minesRef.current.push({
            id: `mine_${tank.id}_${Date.now()}`,
            ownerId: tank.id,
            x: mx,
            y: my,
            size: 10,
            isArmed: false,
            armTimer: 45 // 45 frames to arm (~0.75 seconds)
          });

          tank.minesCount--;
          statsSetter(prev => ({ ...prev, minesPlaced: prev.minesPlaced + 1 }));
          soundManager.playMineArmed();
        }
      }
    };

    // Feed keyboard inputs to Players
    const keys = keysPressed.current;

    const p1IsMuhamadyusuf = p1Name.toLowerCase().includes('muhamadyusuf');
    const p2IsMuhamadyusuf = p2Name.toLowerCase().includes('muhamadyusuf');

    // Player 1 controls
    const p1Keys = {
      left: p1IsMuhamadyusuf
        ? !!(keys['KeyC'] || keys['keyc'] || keys['c'] || keys['C'])
        : !!(keys['KeyA'] || keys['keya']),
      right: p1IsMuhamadyusuf
        ? !!(keys['KeyB'] || keys['keyb'] || keys['b'] || keys['B'])
        : !!(keys['KeyD'] || keys['keyd']),
      forward: p1IsMuhamadyusuf
        ? !!(keys['KeyF'] || keys['keyf'] || keys['f'] || keys['F'])
        : !!(keys['KeyW'] || keys['keyw']),
      back: p1IsMuhamadyusuf
        ? !!(keys['KeyV'] || keys['keyv'] || keys['v'] || keys['V'])
        : !!(keys['KeyS'] || keys['keys']),
      shoot: !!keys['Space'],
      plantMine: !!(keys['KeyQ'] || keys['keyq']),
    };

    // Player 2 controls
    const p2Keys = {
      left: p2IsMuhamadyusuf
        ? !!(keys['KeyC'] || keys['keyc'] || keys['c'] || keys['C'])
        : !!keys['ArrowLeft'],
      right: p2IsMuhamadyusuf
        ? !!(keys['KeyB'] || keys['keyb'] || keys['b'] || keys['B'])
        : !!keys['ArrowRight'],
      forward: p2IsMuhamadyusuf
        ? !!(keys['KeyF'] || keys['keyf'] || keys['f'] || keys['F'])
        : !!keys['ArrowUp'],
      back: p2IsMuhamadyusuf
        ? !!(keys['KeyV'] || keys['keyv'] || keys['v'] || keys['V'])
        : !!keys['ArrowDown'],
      shoot: p2IsMuhamadyusuf
        ? !!keys['Space']
        : !!keys['Slash'] || !!keys['/'] || !!keys['Enter'],
      plantMine: p2IsMuhamadyusuf
        ? !!(keys['KeyQ'] || keys['keyq'])
        : !!keys['Period'] || !!keys['.'],
    };

    updateTank(t1, p1Keys, t2, setP1Stats);
    updateTank(t2, p2Keys, t1, setP2Stats);

    // Update Landmines
    minesRef.current.forEach((mine) => {
      if (!mine.isArmed) {
        mine.armTimer--;
        if (mine.armTimer <= 0) {
          mine.isArmed = true;
          // emit sweet small flash
          createExplosionParticles(mine.x, mine.y, '#ef4444', 4, 'spark');
        }
      }
    });

    // Update Bullets & Collisions
    const remainingBullets: Bullet[] = [];
    bulletsRef.current.forEach((bullet) => {
      let isDestroyed = false;

      // Update position
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;

      // Emit smoke tail
      if (roundFrames.current % 3 === 0) {
        createTraceParticles(bullet.x, bullet.y, 'rgba(148, 163, 184, 0.5)', 'smoke');
      }

      // Check bullet overlap with map boundaries/bouncing
      if (bullet.x - bullet.size < 0) {
        if (bullet.bounceCount < bullet.maxBounce) {
          bullet.x = bullet.size;
          bullet.dx = -bullet.dx;
          bullet.bounceCount++;
          soundManager.playHit();
          createExplosionParticles(bullet.x, bullet.y, '#94a3b8', 4, 'spark');
        } else {
          isDestroyed = true;
        }
      } else if (bullet.x + bullet.size > ARENA_WIDTH) {
        if (bullet.bounceCount < bullet.maxBounce) {
          bullet.x = ARENA_WIDTH - bullet.size;
          bullet.dx = -bullet.dx;
          bullet.bounceCount++;
          soundManager.playHit();
          createExplosionParticles(bullet.x, bullet.y, '#94a3b8', 4, 'spark');
        } else {
          isDestroyed = true;
        }
      }

      if (bullet.y - bullet.size < 0) {
        if (bullet.bounceCount < bullet.maxBounce) {
          bullet.y = bullet.size;
          bullet.dy = -bullet.dy;
          bullet.bounceCount++;
          soundManager.playHit();
          createExplosionParticles(bullet.x, bullet.y, '#94a3b8', 4, 'spark');
        } else {
          isDestroyed = true;
        }
      } else if (bullet.y + bullet.size > ARENA_HEIGHT) {
        if (bullet.bounceCount < bullet.maxBounce) {
          bullet.y = ARENA_HEIGHT - bullet.size;
          bullet.dy = -bullet.dy;
          bullet.bounceCount++;
          soundManager.playHit();
          createExplosionParticles(bullet.x, bullet.y, '#94a3b8', 4, 'spark');
        } else {
          isDestroyed = true;
        }
      }

      if (isDestroyed) {
        createExplosionParticles(bullet.x, bullet.y, '#64748b', 6, 'smoke');
        return;
      }

      // Bullet vs Obstacles Collision
      for (const obs of obstaclesRef.current) {
        if (obs.type === 'bush' || obs.type === 'river') continue; // Bullet travels transparently over rivers and bushes

        const collision = checkCircleAABB(bullet.x, bullet.y, bullet.size, obs.x, obs.y, obs.width, obs.height);
        if (collision.collided) {
          if (obs.type === 'wood') {
            // Wood crate absorb bullets, gets damage
            obs.health -= bullet.damage;
            isDestroyed = true;
            createExplosionParticles(bullet.x, bullet.y, '#b45309', 8, 'spark');
            soundManager.playHit();

            // Destroy wood block if health <= 0
            if (obs.health <= 0) {
              createExplosionParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#78350f', 15, 'smoke');
              createExplosionParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#d97706', 10, 'spark');
              shakeIntensity.current += 4;
              soundManager.playExplosion();
            }
          } else if (obs.type === 'stone') {
            // Stone walls cause bounce or destruction
            if (bullet.bounceCount < bullet.maxBounce) {
              // Deduce reflecting collision side normal vector
              const overlapX = (obs.width / 2 + bullet.size) - Math.abs(bullet.x - (obs.x + obs.width / 2));
              const overlapY = (obs.height / 2 + bullet.size) - Math.abs(bullet.y - (obs.y + obs.height / 2));

              if (overlapX < overlapY) {
                // Collided on Left or Right
                bullet.dx = -bullet.dx;
                bullet.x += bullet.dx > 0 ? overlapX : -overlapX;
              } else {
                // Collided on Top or Bottom
                bullet.dy = -bullet.dy;
                bullet.y += bullet.dy > 0 ? overlapY : -overlapY;
              }
              bullet.bounceCount++;
              soundManager.playHit();
              createExplosionParticles(bullet.x, bullet.y, '#f1f5f9', 6, 'spark');
            } else {
              isDestroyed = true;
            }
          }
          break;
        }
      }

      if (isDestroyed) {
        createExplosionParticles(bullet.x, bullet.y, '#64748b', 6, 'smoke');
        return;
      }

      // Bullet vs Tanks collision
      tanksRef.current.forEach((tank) => {
        if (!tank.isAlive || isDestroyed) return;

        // Prevent hitting friendly tank unless bounced off first or self-friendly fire (let's prevent immediate self fire)
        const dx = bullet.x - tank.x;
        const dy = bullet.y - tank.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < tank.size + bullet.size) {
          isDestroyed = true;

          // Check Shield Protection
          if (tank.shieldTimeLeft > 0) {
            // Deflect sparks around the blue shield ring!
            createExplosionParticles(bullet.x, bullet.y, '#38bdf8', 12, 'spark');
            soundManager.playHit();
            return;
          }

          // Trigger hit
          tank.health -= bullet.damage;
          
          // Stats check
          if (bullet.ownerId !== tank.id) {
            if (bullet.ownerId === 1) setP1Stats(prev => ({ ...prev, hits: prev.hits + 1 }));
            else setP2Stats(prev => ({ ...prev, hits: prev.hits + 1 }));
          }

          createExplosionParticles(bullet.x, bullet.y, tank.color, 12, 'fire');
          shakeIntensity.current += 6;
          soundManager.playHit();

          if (tank.health <= 0) {
            tank.health = 0;
            tank.isAlive = false;
            // Massive death detonation!
            createExplosionParticles(tank.x, tank.y, tank.color, 40, 'fire');
            createExplosionParticles(tank.x, tank.y, '#7f1d1d', 30, 'smoke');
            shakeIntensity.current += 20;
            soundManager.playExplosion();
            endRound(tank.id === 1 ? 2 : 1);
          }
        }
      });

      if (!isDestroyed) {
        remainingBullets.push(bullet);
      }
    });
    bulletsRef.current = remainingBullets;

    // Update Landmines & Stepping on them
    const activeMines: Mine[] = [];
    minesRef.current.forEach((mine) => {
      let isTripped = false;

      if (mine.isArmed) {
        // Check tanks
        for (const tank of tanksRef.current) {
          if (!tank.isAlive) continue;

          const dx = tank.x - mine.x;
          const dy = tank.y - mine.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < tank.size + 4) { // small buffer triggers mine
            isTripped = true;

            if (tank.shieldTimeLeft > 0) {
              createExplosionParticles(mine.x, mine.y, '#38bdf8', 25, 'smoke');
              soundManager.playHit();
            } else {
              // Deal heavy 45 Damage!
              tank.health -= 45;
              createExplosionParticles(mine.x, mine.y, '#dc2626', 35, 'fire');
              createExplosionParticles(mine.x, mine.y, '#451a03', 20, 'smoke');
              shakeIntensity.current += 15;
              soundManager.playExplosion();

              if (tank.health <= 0) {
                tank.health = 0;
                tank.isAlive = false;
                createExplosionParticles(tank.x, tank.y, tank.color, 40, 'fire');
                createExplosionParticles(tank.x, tank.y, '#7f1d1d', 30, 'smoke');
                shakeIntensity.current += 25;
                soundManager.playExplosion();
                endRound(tank.id === 1 ? 2 : 1);
              }
            }
            break; // only detonates once
          }
        }
      }

      if (!isTripped) {
        activeMines.push(mine);
      }
    });
    minesRef.current = activeMines;

    // Tank vs PowerUps
    const remainingPowerups: PowerUp[] = [];
    powerupsRef.current.forEach((pup) => {
      let collected = false;

      for (const tank of tanksRef.current) {
        if (!tank.isAlive) continue;

        const dx = tank.x - pup.x;
        const dy = tank.y - pup.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < tank.size + pup.size) {
          collected = true;

          // Apply powerup
          switch (pup.type) {
            case 'health':
              tank.health = Math.min(tank.maxHealth, tank.health + 40);
              createExplosionParticles(pup.x, pup.y, '#10b981', 15, 'smoke');
              break;
            case 'speed':
              tank.speedTimeLeft = 450; // ~7.5 seconds at 60fps
              createExplosionParticles(pup.x, pup.y, '#f59e0b', 15, 'spark');
              break;
            case 'shield':
              tank.shieldTimeLeft = 360; // 6 seconds at 60fps
              createExplosionParticles(pup.x, pup.y, '#38bdf8', 15, 'spark');
              break;
            case 'damage':
              tank.doubleShootLeft = 5; // next 5 shots have high punch
              createExplosionParticles(pup.x, pup.y, '#a855f7', 15, 'spark');
              break;
            case 'mine_count':
              tank.minesCount += 2; // add 2 landmines
              createExplosionParticles(pup.x, pup.y, '#ef4444', 15, 'spark');
              break;
          }

          soundManager.playPowerup();
          break;
        }
      }

      if (!collected) {
        // Animate pulsing size visually
        if (pup.pulseInc) {
          pup.pulseScale += 0.015;
          if (pup.pulseScale >= 1.25) pup.pulseInc = false;
        } else {
          pup.pulseScale -= 0.015;
          if (pup.pulseScale <= 0.85) pup.pulseInc = true;
        }
        remainingPowerups.push(pup);
      }
    });
    powerupsRef.current = remainingPowerups;

    // Update Particles
    particlesRef.current.forEach((p) => {
      p.lifetime++;
      p.x += p.dx;
      p.y += p.dy;
      
      // Decelerate smoke
      if (p.type === 'smoke') {
        p.dx *= 0.98;
        p.dy *= 0.98;
        p.size += 0.15; // expanding puffy smoke
      }
      p.alpha = 1 - (p.lifetime / p.maxLifetime);
    });
    particlesRef.current = particlesRef.current.filter(p => p.lifetime < p.maxLifetime);

    // Filter out destroyed wood logs obstacles
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.type !== 'wood' || obs.health > 0);
  };

  // Run on round termination
  const endRound = (winningId: 1 | 2) => {
    setRoundStatus('ended');

    // Update Scores
    const updatedScores = { ...scores };
    if (winningId === 1) updatedScores.p1 += 1;
    else updatedScores.p2 += 1;
    setScores(updatedScores);

    // Check if tournament match points match
    if (updatedScores.p1 >= config.scoreLimit) {
      setWinner(1);
      setMatchOver(true);
    } else if (updatedScores.p2 >= config.scoreLimit) {
      setWinner(2);
      setMatchOver(true);
    } else {
      // Prompt for next round automatically after 3 seconds
      setTimeout(() => {
        setRoundNumber(prev => prev + 1);
        resetRound(true);
      }, 3000);
    }
  };

  // Canvas Drawing routines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Crisp Sizing Optimization
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.floor(dimensions.width * dpr);
    const targetH = Math.floor(dimensions.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    let frameId = 0;

    const render = () => {
      // 1. Run physics update
      updatePhysics();

      // 2. Clear & Reset state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Implement Screen shake matrix offsets!
      if (shakeIntensity.current > 0) {
        const dx = (Math.random() - 0.5) * shakeIntensity.current;
        const dy = (Math.random() - 0.5) * shakeIntensity.current;
        ctx.translate(dx, dy);
      }

      // Draw inside standardized virtual coordinates: 960x600 size
      const scaleX = canvas.width / ARENA_WIDTH;
      const scaleY = canvas.height / ARENA_HEIGHT;
      ctx.scale(scaleX, scaleY);

      // --- DRAW BACKGROUND ---
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Neon-slate dual ambient tech grid
      const gridSize = 40;
      for (let x = 0; x < ARENA_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.strokeStyle = x % 120 === 0 ? 'rgba(6, 182, 212, 0.12)' : 'rgba(30, 41, 59, 0.3)';
        ctx.lineWidth = x % 120 === 0 ? 1.5 : 0.8;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < ARENA_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.strokeStyle = y % 120 === 0 ? 'rgba(6, 182, 212, 0.12)' : 'rgba(30, 41, 59, 0.3)';
        ctx.lineWidth = y % 120 === 0 ? 1.5 : 0.8;
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_WIDTH, y);
        ctx.stroke();
      }

      // Grid Intersect Laser Beacons (tactical dots)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      for (let x = 120; x < ARENA_WIDTH; x += 120) {
        for (let y = 120; y < ARENA_HEIGHT; y += 120) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- DRAW RIVERS ---
      obstaclesRef.current.forEach(obs => {
        if (obs.type === 'river') {
          // Dark riverbed
          ctx.fillStyle = '#082f49'; // sky-950
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Water base volumetric gradient
          const riverGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
          riverGrad.addColorStop(0, '#0c4a6e'); // sky-900
          riverGrad.addColorStop(0.5, '#0369a1'); // sky-700
          riverGrad.addColorStop(1, '#0c4a6e');
          ctx.fillStyle = riverGrad;
          ctx.fillRect(obs.x + 1, obs.y + 1, obs.width - 2, obs.height - 2);
          
          // Smooth sine-wave flowing currents
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 1.5;
          const animOffset = (roundFrames.current * 0.7) % 30;
          
          ctx.save();
          // Clip elements to fit river frame
          ctx.beginPath();
          ctx.rect(obs.x, obs.y, obs.width, obs.height);
          ctx.clip();
          
          for (let py = obs.y - 30; py < obs.y + obs.height + 30; py += 30) {
            ctx.beginPath();
            const currentY = py + animOffset;
            ctx.moveTo(obs.x, currentY);
            for (let px = obs.x; px <= obs.x + obs.width; px += 15) {
              const sineOffset = Math.sin((px + roundFrames.current * 2) * 0.04) * 3.5;
              ctx.lineTo(px, currentY + sineOffset);
            }
            ctx.stroke();
          }
          ctx.restore();
        }
      });

      // --- DRAW POWERUPS ---
      powerupsRef.current.forEach(pup => {
        ctx.save();
        ctx.translate(pup.x, pup.y);
        ctx.scale(pup.pulseScale, pup.pulseScale);

        // Ambient glowing halo ring
        const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, pup.size * 1.8);
        let glowColor = 'rgba(56, 189, 248, 0.15)'; // Blue fallback
        let innerColor = '#38bdf8';
        let keyChar = '';

        if (pup.type === 'health') {
          glowColor = 'rgba(16, 185, 129, 0.25)';
          innerColor = '#10b981';
          keyChar = '♥';
        } else if (pup.type === 'speed') {
          glowColor = 'rgba(245, 158, 11, 0.25)';
          innerColor = '#f59e0b';
          keyChar = '⚡';
        } else if (pup.type === 'shield') {
          glowColor = 'rgba(56, 189, 248, 0.25)';
          innerColor = '#38bdf8';
          keyChar = '🛡';
        } else if (pup.type === 'damage') {
          glowColor = 'rgba(168, 85, 247, 0.25)';
          innerColor = '#a855f7';
          keyChar = '⚔';
        } else if (pup.type === 'mine_count') {
          glowColor = 'rgba(239, 68, 68, 0.25)';
          innerColor = '#ef4444';
          keyChar = '✺';
        }

        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(0.5, glowColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, pup.size * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Core white circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, pup.size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = innerColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Symbol
        ctx.fillStyle = innerColor;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(keyChar, 0, 0);

        ctx.restore();
      });

      // --- DRAW LANMines ---
      minesRef.current.forEach((mine) => {
        ctx.save();
        ctx.translate(mine.x, mine.y);

        // Outer pulsing hazard circle for armed mines
        if (mine.isArmed) {
          const pulseRad = mine.size * 2.2 + Math.sin(roundFrames.current / 4) * 2;
          ctx.strokeStyle = roundFrames.current % 18 < 9 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.05)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, pulseRad, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw 4 security metallic frame bracket anchors
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i + Math.PI / 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * (mine.size + 2.5), Math.sin(angle) * (mine.size + 2.5));
          ctx.stroke();
        }

        // Core central plating casing
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.beginPath();
        ctx.arc(0, 0, mine.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner micro-core
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, mine.size * 0.52, 0, Math.PI * 2);
        ctx.fill();

        // Arm blinking warning signal (flashes red when armed, gold when arming)
        let ledColor = '#e2e8f0';
        if (mine.isArmed) {
          ledColor = roundFrames.current % 18 < 9 ? '#ef4444' : '#300808';
        } else {
          ledColor = roundFrames.current % 12 < 6 ? '#f97316' : '#9a3412';
        }
        
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 6;
        
        ctx.fillStyle = ledColor;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // --- DRAW BULLETS ---
      bulletsRef.current.forEach((bullet) => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);

        const blColor = bullet.ownerId === 1 ? p1Color : p2Color;

        // Glowing thermal rocket trail gradient
        const trailLength = 16;
        const trailGrad = ctx.createLinearGradient(0, 0, -Math.cos(bullet.angle) * trailLength, -Math.sin(bullet.angle) * trailLength);
        trailGrad.addColorStop(0, blColor);
        trailGrad.addColorStop(0.5, `${blColor}99`);
        trailGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.moveTo(0, 0);
        ctx.lineTo(-Math.cos(bullet.angle) * trailLength, -Math.sin(bullet.angle) * trailLength);
        ctx.stroke();

        // Outer bullet light dispersion halo
        const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, bullet.size * 3.0);
        glow.addColorStop(0, '#ffffff');
        glow.addColorStop(0.25, blColor);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, bullet.size * 3.0, 0, Math.PI * 2);
        ctx.fill();

        // Pure white high-energy bullet nucleus core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, bullet.size * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Helper to check if a point is inside a bush overlay
      const isPointInBush = (px: number, py: number) => {
        let count = 0;
        obstaclesRef.current.forEach(obs => {
          if (obs.type === 'bush') {
            if (px >= obs.x && px <= obs.x + obs.width && py >= obs.y && py <= obs.y + obs.height) {
              count++;
            }
          }
        });
        return count > 0;
      };

      // --- DRAW TANKS ---
      tanksRef.current.forEach((tank) => {
        if (!tank.isAlive) return;

        // Is tank fully hidden under the shrub canopy?
        const tankUnderBush = isPointInBush(tank.x, tank.y);
        ctx.save();
        
        // Hide tank nicely inside bushes (semi transparent)
        if (tankUnderBush) {
          ctx.globalAlpha = 0.28;
        }

        ctx.translate(tank.x, tank.y);

        // Check motion states
        const isCurrentlyMoving = tank.isMoving || tank.isRotatingCW || tank.isRotatingCCW;
        const treadOffset = isCurrentlyMoving ? (roundFrames.current * 1.5) % 10 : 0;

        // --- DRAW ANIMATED MECHANICAL TRACKS (ROTATES WITH BODY HULL) ---
        ctx.save();
        ctx.rotate(tank.angle);

        // Under track support shields
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-tank.size - 2, -tank.size, tank.size * 2 + 4, 6);
        ctx.fillRect(-tank.size - 2, tank.size - 6, tank.size * 2 + 4, 6);

        // Draw segmented animated tread link elements
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let tx = -tank.size - 2; tx <= tank.size + 2; tx += 5) {
          const slideX = tx + (isCurrentlyMoving ? treadOffset : 0);
          if (slideX >= -tank.size - 2 && slideX <= tank.size + 2) {
            // Left link marks
            ctx.moveTo(slideX, -tank.size);
            ctx.lineTo(slideX, -tank.size + 6);
            // Right link marks
            ctx.moveTo(slideX, tank.size - 6);
            ctx.lineTo(slideX, tank.size);
          }
        }
        ctx.stroke();

        // --- DRAW FACETED MILITARY ARMOR HULL ---
        ctx.fillStyle = tank.color;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        // Octagonal futuristic aggressive body chassis shape
        ctx.moveTo(tank.size - 2, -6);
        ctx.lineTo(tank.size - 6, -tank.size + 3);
        ctx.lineTo(-tank.size + 5, -tank.size + 3);
        ctx.lineTo(-tank.size + 1, -6);
        ctx.lineTo(-tank.size + 1, 6);
        ctx.lineTo(-tank.size + 5, tank.size - 3);
        ctx.lineTo(tank.size - 6, tank.size - 3);
        ctx.lineTo(tank.size - 2, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Back exhaust thermal vents details (flickering exhausts)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-tank.size + 2, -6, 3, 12);
        ctx.fillStyle = roundFrames.current % 10 < 5 ? '#f97316' : '#ea580c';
        ctx.fillRect(-tank.size - 1, -4, 2, 2);
        ctx.fillRect(-tank.size - 1, 2, 2, 2);

        // Body Chassis highlight strip
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.beginPath();
        ctx.arc(0, 0, tank.size * 0.44, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        ctx.restore(); // Restore hull angle

        // --- DRAW TURRET SYSTEM (INDEPENDENT ROTATION) ---
        ctx.save();
        ctx.rotate(tank.turretAngle);

        // Gun barrel recoil
        const recoil = tank.shootingCooldown > 20 ? 4 : 0;
        const barrelLength = tank.size + 13 - recoil;
        
        ctx.fillStyle = '#475569'; // steel bar
        ctx.fillRect(0, -3.2, barrelLength, 6.4);

        // Embedded glowing energy focus conduit inside barrel
        ctx.strokeStyle = tank.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(3, 0);
        ctx.lineTo(barrelLength - 3.5, 0);
        ctx.stroke();

        // Muzzle heavy brake tip
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(barrelLength - 3, -4.2, 3, 8.4);

        // Turret Center dome cap
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, tank.size * 0.56, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = tank.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Laser turret guidance laser glowing spot
        ctx.fillStyle = tank.color;
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // Restore turret angle

        // --- DRAW SHIELD FORCE FIELD GLOBE ---
        if (tank.shieldTimeLeft > 0) {
          ctx.save();
          const pulseRadius = tank.size * (1.4 + Math.sin(roundFrames.current / 5) * 0.08);
          
          // Radial force volume gradient
          const shieldGrad = ctx.createRadialGradient(0, 0, tank.size * 0.75, 0, 0, pulseRadius);
          shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.0)');
          shieldGrad.addColorStop(0.82, 'rgba(56, 189, 248, 0.13)');
          shieldGrad.addColorStop(1, 'rgba(56, 189, 248, 0.38)');
          
          ctx.fillStyle = shieldGrad;
          ctx.beginPath();
          ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
          ctx.fill();

          // High tech outer neon border
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Rotating tactical battery energy nodes
          ctx.rotate(roundFrames.current * 0.022);
          ctx.fillStyle = '#bae6fd';
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
            ctx.beginPath();
            ctx.arc(pulseRadius * Math.cos(angle), pulseRadius * Math.sin(angle), 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // --- DRAW JET THRUSTER SPEED EXHAUST EFFECTS ---
        if (tank.speedTimeLeft > 0 && isCurrentlyMoving) {
          ctx.save();
          ctx.rotate(tank.angle);
          
          ctx.fillStyle = 'rgba(234, 179, 8, 0.42)';
          ctx.beginPath();
          ctx.moveTo(-tank.size - 2, -4);
          ctx.lineTo(-tank.size - 13 - (Math.random() * 8), 0);
          ctx.lineTo(-tank.size - 2, 4);
          ctx.closePath();
          ctx.fill();
          
          // Additional speed spark needles
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-tank.size - 3, -2);
          ctx.lineTo(-tank.size - 19 - (Math.random() * 6), -3);
          ctx.moveTo(-tank.size - 3, 2);
          ctx.lineTo(-tank.size - 19 - (Math.random() * 6), 3);
          ctx.stroke();
          
          ctx.restore();
        }

        ctx.restore(); // Restore overall transforms

        // Draw Health-Bar AND Tactical HUD statistics directly above the tank
        ctx.save();
        ctx.translate(tank.x, tank.y - tank.size - 17);
        
        // Shadow panel bounding box
        const barW = 44;
        const barH = 5;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(-barW / 2, 0, barW, barH);

        const healthRatio = tank.health / tank.maxHealth;
        let hpColor = '#10b981'; // Green
        if (healthRatio < 0.35) hpColor = '#f43f5e'; // Red rose-500
        else if (healthRatio < 0.65) hpColor = '#f59e0b'; // Gold amber-500

        ctx.fillStyle = hpColor;
        ctx.fillRect(-barW / 2, 0, barW * healthRatio, barH);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-barW / 2, 0, barW, barH);

        // Tactical support tags
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        
        let subText = `MINE: ${tank.minesCount}`;
        if (tank.doubleShootLeft > 0) {
          subText = `⚡ COMP: x${tank.doubleShootLeft}`;
        }
        ctx.fillText(subText, 0, -5);

        // Beautiful name card tag with outline glow
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9.5px sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(tank.name, 0, -14);

        ctx.restore();
      });

      // --- DRAW SOLID OBSTACLES (STONE & WOOD & BUSH) ---
      obstaclesRef.current.forEach((obs) => {
        if (obs.type === 'stone') {
          // Futuristic cyber barrier (stone)
          ctx.fillStyle = '#0f172a'; // dark metallic core
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Slate front panel
          ctx.fillStyle = '#1e293b'; 
          ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);

          // Electric neon-cyan grid channels
          ctx.strokeStyle = '#06b6d4'; // cyan-500
          ctx.lineWidth = 1;
          ctx.strokeRect(obs.x + 3, obs.y + 3, obs.width - 6, obs.height - 6);

          // Embedded frame links lines
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
          ctx.beginPath();
          ctx.moveTo(obs.x + 6, obs.y + 6);
          ctx.lineTo(obs.x + obs.width - 6, obs.y + obs.height - 6);
          ctx.moveTo(obs.x + obs.width - 6, obs.y + 6);
          ctx.lineTo(obs.x + 6, obs.y + obs.height - 6);
          ctx.stroke();

          // Cyan core block
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(obs.x + obs.width / 2 - 4, obs.y + obs.height / 2 - 4, 8, 8);
          ctx.strokeStyle = '#06b6d4';
          ctx.strokeRect(obs.x + obs.width / 2 - 4, obs.y + obs.height / 2 - 4, 8, 8);

          // Tough outer safety border
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        } else if (obs.type === 'wood') {
          // Procedurally styled military destructible wood crate
          ctx.fillStyle = '#78350f'; // rich mahogany brown
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Inner horizontal wood grain fibers
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let gy = obs.y + 4; gy < obs.y + obs.height; gy += 6) {
            ctx.moveTo(obs.x + 2, gy);
            ctx.lineTo(obs.x + obs.width - 2, gy);
          }
          ctx.stroke();

          // High contrast structural box borders
          ctx.strokeStyle = '#b45309'; // gold-700
          ctx.lineWidth = 1.5;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // X support struts
          ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.moveTo(obs.x + obs.width, obs.y);
          ctx.lineTo(obs.x, obs.y + obs.height);
          ctx.stroke();

          // Double frame margin inset
          ctx.strokeRect(obs.x + 3, obs.y + 3, obs.width - 6, obs.height - 6);

          // Structural bronze heavy rivet screws
          ctx.fillStyle = '#451a03';
          const rivets = [
            { rx: obs.x + 4, ry: obs.y + 4 },
            { rx: obs.x + obs.width - 4, ry: obs.y + 4 },
            { rx: obs.x + 4, ry: obs.y + obs.height - 4 },
            { rx: obs.x + obs.width - 4, ry: obs.y + obs.height - 4 }
          ];
          rivets.forEach(riv => {
            ctx.beginPath();
            ctx.arc(riv.rx, riv.ry, 1.2, 0, Math.PI * 2);
            ctx.fill();
          });

          // Jagged fracture cracks based on damage stats!
          const dmgPct = 1 - (obs.health / obs.maxHealth);
          if (dmgPct > 0.05) {
            ctx.strokeStyle = 'rgba(0,0,0,0.85)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            
            // Major jagged split lines
            ctx.moveTo(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5);
            ctx.lineTo(obs.x + obs.width * 0.18, obs.y + obs.height * 0.32);
            
            if (dmgPct > 0.38) {
              ctx.moveTo(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5);
              ctx.lineTo(obs.x + obs.width * 0.78, obs.y + obs.height * 0.68);
              ctx.lineTo(obs.x + obs.width * 0.88, obs.y + obs.height * 0.42);
            }
            if (dmgPct > 0.7) {
              ctx.moveTo(obs.x + obs.width * 0.12, obs.y + obs.height * 0.78);
              ctx.lineTo(obs.x + obs.width * 0.38, obs.y + obs.height * 0.48);
              ctx.lineTo(obs.x + obs.width * 0.68, obs.y + obs.height * 0.88);
            }
            ctx.stroke();
          }

        } else if (obs.type === 'bush') {
          // Beautiful foliage leaf design
          ctx.save();
          // Vibrantly thick leafy base
          ctx.fillStyle = 'rgba(16, 185, 129, 0.78)'; // emerald-500
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          
          // Clip rendering to box boundary
          ctx.beginPath();
          ctx.rect(obs.x, obs.y, obs.width, obs.height);
          ctx.clip();
          
          // Render multiple nested breathing sub clusters
          ctx.fillStyle = 'rgba(4, 120, 87, 0.45)'; // dark forest green
          for (let lx = obs.x + 8; lx < obs.x + obs.width; lx += 20) {
            for (let ly = obs.y + 8; ly < obs.y + obs.height; ly += 20) {
              const leafBreathe = Math.sin((roundFrames.current / 12) + lx + ly) * 1.5;
              ctx.beginPath();
              ctx.arc(lx, ly, 10 + leafBreathe, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          
          // High concentration glow dots inside
          ctx.fillStyle = 'rgba(110, 231, 183, 0.22)';
          for (let lx = obs.x + 18; lx < obs.x + obs.width - 5; lx += 35) {
            for (let ly = obs.y + 18; ly < obs.y + obs.height - 5; ly += 35) {
              ctx.beginPath();
              ctx.arc(lx, ly, 5.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Foliage outer security line
          ctx.strokeStyle = '#065f46';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
          ctx.restore();
        }
      });

      // --- DRAW PARTICLES ---
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- DRAW ROUND STATE HUD NOTIFIERS ---
      if (roundStatus === 'countdown') {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

        ctx.font = 'black 54px Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.fillText(countdownText, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 20);

        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`RAUND: ${roundNumber}`, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 30);
        ctx.restore();
      } else if (roundStatus === 'ended' && !matchOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

        ctx.font = 'black 38px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(245,158,11,0.5)';

        const roundWinner = tanksRef.current[0].isAlive ? tanksRef.current[0] : tanksRef.current[1];
        ctx.fillText(`${roundWinner.name} G'ALABA QILDI !`, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 10);
        ctx.font = 'medium 14px monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText("Keling keyingi raundni boshlaylik...", ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 30);
        ctx.restore();
      }

      ctx.restore(); // reverse screenshakes
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [roundStatus, isPaused, matchOver, scores, roundNumber, dimensions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-3 md:p-6 select-none font-sans overflow-y-auto relative">
      {/* Background neon grid effect of the active battlefield */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1.5px,transparent_1.5px),linear-gradient(to_bottom,#0f172a_1.5px,transparent_1.5px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none opacity-40 z-0"></div>
      
      {/* HUD Header Bar */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-2xl relative z-40">
        {/* Holographic Border Corner Ornaments */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-700 rounded-tl-md"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-700 rounded-tr-md"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-700 rounded-bl-md"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-700 rounded-br-md"></div>

        {/* P1 Profile Indicator - Emerald Green Themes */}
        <div className="flex items-center gap-3.5 p-2 px-3 border border-emerald-500/10 rounded-xl bg-slate-950/40 relative min-w-[200px] hover:border-emerald-500/20 transition-all">
          <div className="absolute top-1 right-2 font-mono text-[9px] text-emerald-400/40">CHAP_PORT</div>
          <div className="w-3.5 h-10 rounded-md shadow-lg" style={{ backgroundColor: p1Color, boxShadow: `0 0 10px ${p1Color}bb` }}></div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-400">PLAYER ONE</div>
            <div className="text-sm font-black text-white leading-tight uppercase tracking-tight">{p1Name}</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
              OCHKO: <span className="text-white font-display text-xs font-black">{scores.p1}</span>
            </div>
          </div>
        </div>

        {/* Versus Indicator & Round */}
        <div className="flex flex-col items-center justify-center py-1 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-850 font-display text-xs text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
            <Swords className="w-3.5 h-3.5 animate-pulse text-sky-450" /> RAUND <span className="font-black text-white font-display text-sm">{roundNumber}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-1.5 font-mono tracking-wider uppercase">
            G'ALABA LIMITI: <span className="text-slate-300 font-bold">{config.scoreLimit} BALL</span>
          </div>
        </div>

        {/* P2 Profile Indicator - Crimson Red Themes */}
        <div className="flex items-center gap-3.5 p-2 px-3 border border-rose-500/10 rounded-xl bg-slate-950/40 relative min-w-[200px] md:flex-row-reverse text-right hover:border-rose-500/20 transition-all">
          <div className="absolute top-1 left-2 font-mono text-[9px] text-rose-400/40">ONG_PORT</div>
          <div className="w-3.5 h-10 rounded-md shadow-lg" style={{ backgroundColor: p2Color, boxShadow: `0 0 10px ${p2Color}bb` }}></div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-400">PLAYER TWO</div>
            <div className="text-sm font-black text-white leading-tight uppercase tracking-tight">{p2Name}</div>
            <div className="text-[10px] font-mono text-rose-405 mt-1 flex items-center gap-1.5 md:flex-row-reverse justify-end font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-405 shadow-[0_0_8px_#f43f5e] animate-pulse"></span>
              OCHKO: <span className="text-white font-display text-xs font-black">{scores.p2}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Play Arena Card */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-center relative z-25">
        
        {/* Glowing Background Ring Behind Battlefield */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full bg-sky-500/5 blur-[100px] pointer-events-none z-0"></div>

        <div 
          ref={containerRef} 
          className="w-full flex items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden z-20"
          style={{ minHeight: '350px' }}
        >
          {/* Outer Cyber Tactical Bracket Lines */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-sky-500/40 pointer-events-none"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-sky-500/40 pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-sky-500/40 pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-sky-500/40 pointer-events-none"></div>

          {/* Main Rendering Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              display: 'block'
            }}
            className="rounded-xl border border-slate-950 bg-slate-950 shadow-inner relative z-10"
          />

          {/* Pause overlay Screen */}
          {isPaused && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md">
              <div className="text-center space-y-4 p-7 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl max-w-xs w-full mx-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-600"></div>
                <Pause className="w-10 h-10 text-sky-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-display font-black tracking-widest text-slate-100 uppercase">O'YIN TO'XTATILDI</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Jang maydonidagi ishtirokchilar va telemetriya to'xtatildi.</p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={togglePause}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-display font-black tracking-widest text-xs transition-transform transform active:scale-95 duration-100 cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                  >
                    DAVOM ETISH
                  </button>
                  <button
                    onClick={onReturnToMenu}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 font-bold text-xs border border-slate-800 rounded-lg transition duration-200 cursor-pointer"
                  >
                    MENUGA QAYTISH
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tournament Match-Over Overlay */}
          {matchOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xl">
              <div className="text-center space-y-6 p-8 bg-slate-950/90 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full mx-4 relative">
                {/* Neon Top Accent Line */}
                <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                
                <div>
                  <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-display text-[10px] rounded-full uppercase tracking-widest font-black">
                    Turnir Golibi Ma'lum Bo'ldi!
                  </div>
                  <h3 className="text-2xl font-display font-black text-slate-100 mt-3.5 tracking-wide uppercase">
                    {winner === 1 ? p1Name : p2Name}
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono tracking-widest uppercase mt-1 font-bold">G'ALABA TASDIQLANDI ! 🎉</p>
                </div>

                {/* Final stats card visualizer with premium table grids */}
                <div className="bg-slate-900/80 border border-slate-800/60 p-4 rounded-xl text-left space-y-3 font-mono text-[11px] relative">
                  <div className="absolute top-1 right-2 text-[8px] text-slate-600 font-mono">CODE_STATS</div>
                  <div className="grid grid-cols-3 text-slate-500 font-black border-b border-slate-850 pb-2 uppercase tracking-wider">
                    <span>Statistika</span>
                    <span className="text-emerald-400 text-center">{p1Name}</span>
                    <span className="text-rose-450 text-right">{p2Name}</span>
                  </div>

                  <div className="grid grid-cols-3 text-slate-300">
                    <span>Ochkolar:</span>
                    <span className="text-center text-white font-bold">{scores.p1}</span>
                    <span className="text-right text-white font-bold">{scores.p2}</span>
                  </div>

                  <div className="grid grid-cols-3 text-slate-300">
                    <span>Otilgan o'qlar:</span>
                    <span className="text-center">{p1Stats.shots} SEC</span>
                    <span className="text-right">{p2Stats.shots} SEC</span>
                  </div>

                  <div className="grid grid-cols-3 text-slate-300">
                    <span>Nishonga tegish:</span>
                    <span className="text-center text-emerald-400">{p1Stats.hits}</span>
                    <span className="text-right text-rose-400">{p2Stats.hits}</span>
                  </div>

                  <div className="grid grid-cols-3 text-slate-300">
                    <span>Minalar qo'yildi:</span>
                    <span className="text-center">{p1Stats.minesPlaced}</span>
                    <span className="text-right">{p2Stats.minesPlaced}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => resetRound(false)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-550 hover:from-emerald-600 hover:to-sky-600 text-slate-950 font-display font-black tracking-widest text-[11px] uppercase transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    QAYTA JANG !
                  </button>
                  <button
                    onClick={onReturnToMenu}
                    className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold border border-slate-800 text-xs transition duration-200 cursor-pointer uppercase"
                  >
                    MENU
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* On-Screen Virtual Controllers */}
      {showVirtualControllers && (
        <div className="w-full max-w-5xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 z-30 relative select-none">
          {/* Player 1 Controller (Emerald Theme) */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-4 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Corner styling lines */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/40"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/40"></div>
            
            {/* Left Column: Player Title & Directives */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">PLAYER 1 ON-SCREEN</span>
              <span className="text-sm font-black text-white uppercase tracking-tight mt-0.5">{p1Name} (WASD)</span>
              <div className="flex gap-1.5 mt-2">
                <span className="px-1.5 py-0.5 text-[9px] bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 font-bold rounded">LIVE</span>
                <span className="px-1.5 py-0.5 text-[9px] bg-slate-950/80 border border-slate-800 text-slate-400 font-bold rounded">TOUCH / CLICK</span>
              </div>
            </div>

            {/* Right Column: D-PAD and ACTIONS side-by-side */}
            <div className="flex items-center gap-6">
              {/* Movement D-PAD (Cross Grid Layout) */}
              <div className="grid grid-cols-3 gap-1.5 w-[114px] h-[114px]">
                <div></div>
                {renderVirtualButton(1, 'forward', <ArrowUp className="w-4 h-4 text-emerald-400" />, 'w-9 h-9 border border-emerald-500/30 bg-emerald-950/20 active:bg-emerald-500/30', 'shadow-[0_0_8px_rgba(16,185,129,0.15)]')}
                <div></div>

                {renderVirtualButton(1, 'left', <ArrowLeft className="w-4 h-4 text-emerald-400" />, 'w-9 h-9 border border-emerald-500/30 bg-emerald-950/20 active:bg-emerald-500/30', 'shadow-[0_0_8px_rgba(16,185,129,0.15)]')}
                <div className="w-9 h-9 flex items-center justify-center bg-slate-950/40 border border-slate-850 rounded-lg text-slate-600 text-[10px] font-bold font-mono">P1</div>
                {renderVirtualButton(1, 'right', <ArrowRight className="w-4 h-4 text-emerald-400" />, 'w-9 h-9 border border-emerald-500/30 bg-emerald-950/20 active:bg-emerald-500/30', 'shadow-[0_0_8px_rgba(16,185,129,0.15)]')}

                <div></div>
                {renderVirtualButton(1, 'back', <ArrowDown className="w-4 h-4 text-emerald-400" />, 'w-9 h-9 border border-emerald-500/30 bg-emerald-950/20 active:bg-emerald-500/30', 'shadow-[0_0_8px_rgba(16,185,129,0.15)]')}
                <div></div>
              </div>

              {/* Action Buttons (Shoot & Mine) */}
              <div className="flex flex-col gap-2">
                {/* Shoot Button */}
                {renderVirtualButton(
                  1, 
                  'shoot', 
                  <div className="flex items-center gap-1 px-2.5 py-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-slate-950" />
                    <span className="text-[10px] font-black uppercase text-slate-950">OTISH</span>
                  </div>, 
                  'h-8.5 w-24 border border-emerald-555 bg-emerald-400 hover:bg-emerald-500 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
                  ''
                )}
                {/* Mine Button */}
                {renderVirtualButton(
                  1, 
                  'plantMine', 
                  <div className="flex items-center gap-1 px-2.5 py-1.5">
                    <Bomb className="w-3 h-3 text-emerald-405" />
                    <span className="text-[9px] font-bold uppercase text-emerald-405">MINA</span>
                  </div>, 
                  'h-8 w-24 border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-950 active:bg-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
                  ''
                )}
              </div>
            </div>
          </div>

          {/* Player 2 Controller (Crimson Theme) */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-rose-500/20 p-4 shadow-[0_0_20px_rgba(244,63,94,0.05)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Corner styling lines */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-rose-500/40"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-rose-500/40"></div>
            
            {/* Left Column: Player Title & Directives */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-widest text-rose-450 font-bold uppercase">PLAYER 2 ON-SCREEN</span>
              <span className="text-sm font-black text-white uppercase tracking-tight mt-0.5">{p2Name} (Arrows)</span>
              <div className="flex gap-1.5 mt-2">
                <span className="px-1.5 py-0.5 text-[9px] bg-rose-950/50 border border-rose-800/40 text-rose-300 font-bold rounded">LIVE</span>
                <span className="px-1.5 py-0.5 text-[9px] bg-slate-950/80 border border-slate-800 text-slate-400 font-bold rounded">TOUCH / CLICK</span>
              </div>
            </div>

            {/* Right Column: D-PAD and ACTIONS side-by-side */}
            <div className="flex items-center gap-6">
              {/* Movement D-PAD (Cross Grid Layout) */}
              <div className="grid grid-cols-3 gap-1.5 w-[114px] h-[114px]">
                <div></div>
                {renderVirtualButton(2, 'forward', <ArrowUp className="w-4 h-4 text-rose-455" />, 'w-9 h-9 border border-rose-500/30 bg-rose-950/20 active:bg-rose-500/30', 'shadow-[0_0_8px_rgba(244,63,94,0.15)]')}
                <div></div>

                {renderVirtualButton(2, 'left', <ArrowLeft className="w-4 h-4 text-rose-455" />, 'w-9 h-9 border border-rose-500/30 bg-rose-950/20 active:bg-rose-500/30', 'shadow-[0_0_8px_rgba(244,63,94,0.15)]')}
                <div className="w-9 h-9 flex items-center justify-center bg-slate-950/40 border border-slate-850 rounded-lg text-slate-600 text-[10px] font-bold font-mono">P2</div>
                {renderVirtualButton(2, 'right', <ArrowRight className="w-4 h-4 text-rose-455" />, 'w-9 h-9 border border-rose-500/30 bg-rose-950/20 active:bg-rose-500/30', 'shadow-[0_0_8px_rgba(244,63,94,0.15)]')}

                <div></div>
                {renderVirtualButton(2, 'back', <ArrowDown className="w-4 h-4 text-rose-455" />, 'w-9 h-9 border border-rose-500/30 bg-rose-950/20 active:bg-rose-500/30', 'shadow-[0_0_8px_rgba(244,63,94,0.15)]')}
                <div></div>
              </div>

              {/* Action Buttons (Shoot & Mine) */}
              <div className="flex flex-col gap-2">
                {/* Shoot Button */}
                {renderVirtualButton(
                  2, 
                  'shoot', 
                  <div className="flex items-center gap-1 px-2.5 py-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-slate-950" />
                    <span className="text-[10px] font-black uppercase text-slate-950">OTISH</span>
                  </div>, 
                  'h-8.5 w-24 border border-rose-555 bg-rose-400 hover:bg-rose-500 active:scale-95 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
                  ''
                )}
                {/* Mine Button */}
                {renderVirtualButton(
                  2, 
                  'plantMine', 
                  <div className="flex items-center gap-1 px-2.5 py-1.5">
                    <Bomb className="w-3 h-3 text-rose-455" />
                    <span className="text-[9px] font-bold uppercase text-rose-455">MINA</span>
                  </div>, 
                  'h-8 w-24 border border-rose-500/30 bg-rose-950/40 hover:bg-rose-950 active:bg-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]',
                  ''
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-game quick controller menu panel */}
      <div className="w-full max-w-5xl mx-auto mt-5 grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-slate-900/30 backdrop-blur-xl p-4 rounded-xl border border-slate-800/50 z-30 relative shadow-lg">
        {/* Player 1 Keys Info (Emerald theme) */}
        <div className="text-[11px] text-slate-400 font-mono flex flex-wrap items-center gap-1.5">
          <span className="text-emerald-400 font-display font-bold uppercase tracking-wider text-[10px]">P1 CONTROL:</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-200 font-bold border border-slate-850">
            {p1Name.toLowerCase().includes('muhamadyusuf') ? 'C, B, F, V' : 'W, A, S, D'}
          </span>
          <span>OTISH:</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-200 font-bold border border-slate-850">SPACE</span>
          <span>MINA:</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-200 font-bold border border-slate-850">Q</span>
        </div>

        {/* Center Actions Cluster */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={togglePause}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-sky-500/50 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center"
            title="O'yinni vaqtinchaga to'xtatish"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-white text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-sky-400" />}
          </button>
          
          <button
            onClick={() => resetRound(true)}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center"
            title="Raundni qayta yuklash"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          </button>

          <button
            onClick={toggleMute}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center"
            title="Muzikani vaqtinchaga to'xtatish"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          <button
            onClick={() => setShowVirtualControllers(prev => !prev)}
            className={`p-2 bg-slate-950 border ${showVirtualControllers ? 'border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'} rounded-lg cursor-pointer transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center`}
            title="Ekrandagi boshqaruv tugmalarini ko'rsatish/yashirish"
          >
            <Gamepad className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReturnToMenu}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-all duration-200 active:scale-95 flex items-center gap-1 px-3 text-xs font-mono font-bold uppercase tracking-wider"
            title="Bosh sahifaga chiqish"
          >
            <Home className="w-3 h-3 text-slate-400" /> BOSH SAHIFA
          </button>
        </div>

        {/* Player 2 Keys Info (Rose theme) */}
        <div className="text-[11px] text-slate-400 font-mono flex flex-wrap items-center justify-end gap-1.5 text-right">
          <span className="text-rose-400 font-display font-bold uppercase tracking-wider text-[10px]">P2 CONTROL:</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-200 font-bold border border-slate-850">
            {p2Name.toLowerCase().includes('muhamadyusuf') ? 'C, B, F, V' : '↑, ↓, ←, →'}
          </span>
          <span>OTISH:</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-200 font-bold border border-slate-850">
            {p2Name.toLowerCase().includes('muhamadyusuf') ? 'SPACE' : '/'}
          </span>
          <span>MINA:</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-200 font-bold border border-slate-850">
            {p2Name.toLowerCase().includes('muhamadyusuf') ? 'Q' : '.'}
          </span>
        </div>
      </div>
    </div>
  );
}
