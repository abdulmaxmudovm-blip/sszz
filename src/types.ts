export type PowerUpType = 'health' | 'speed' | 'shield' | 'damage' | 'mine_count';

export interface Position {
  x: number;
  y: number;
}

export interface PlayerStats {
  id: 1 | 2;
  name: string;
  color: string;
  score: number;
  wins: number;
  losses: number;
  shotsFired: number;
  accuracy: number;
  hits: number;
}

export interface Tank {
  id: 1 | 2;
  name: string;
  x: number;
  y: number;
  angle: number; // in radians
  turretAngle: number; // in radians
  color: string;
  health: number;
  maxHealth: number;
  speed: number;
  isMoving: boolean;
  isRotatingCW: boolean;
  isRotatingCCW: boolean;
  isTurretRotatingCW: boolean;
  isTurretRotatingCCW: boolean;
  shootingCooldown: number; // current frames left to wait
  maxCooldown: number; // frames between shots
  shieldTimeLeft: number; // frames left for shield powerup
  speedTimeLeft: number; // frames left for speed powerup
  doubleShootLeft: number; // shots remaining with double/rapid fire
  minesCount: number; // remaining mines to plant
  isAlive: boolean;
  size: number;
  score: number;
}

export interface Bullet {
  id: string;
  ownerId: 1 | 2;
  x: number;
  y: number;
  dx: number;
  dy: number;
  angle: number;
  damage: number;
  bounceCount: number;
  maxBounce: number;
  size: number;
  speed: number;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  size: number;
  pulseScale: number;
  pulseInc: boolean;
}

export interface Mine {
  id: string;
  ownerId: 1 | 2;
  x: number;
  y: number;
  size: number;
  isArmed: boolean;
  armTimer: number; // in frames
}

export type ObstacleType = 'stone' | 'wood' | 'river' | 'bush';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  health: number; // wood is destructible
  maxHealth: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  lifetime: number; // frames
  maxLifetime: number;
  alpha: number;
  type: 'smoke' | 'spark' | 'dust' | 'fire' | 'shield_effect';
}

export type MapType = 'klassik' | 'labirint' | 'xarobalar' | 'ochiq_maydon';

export interface GameConfig {
  scoreLimit: number;
  mapType: MapType;
  powerupSpawnInterval: number; // millisecond or seconds
  soundVolume: number;
  tankSpeed: number;
  bulletSpeed: number;
}
