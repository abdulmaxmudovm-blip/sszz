import { Obstacle, MapType } from '../types';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 600;

export function generateObstacles(mapType: MapType): Obstacle[] {
  const obstacles: Obstacle[] = [];
  let idCounter = 1;

  const addObstacle = (
    x: number,
    y: number,
    width: number,
    height: number,
    type: 'stone' | 'wood' | 'river' | 'bush'
  ) => {
    const maxHealth = type === 'wood' ? 100 : 999999;
    obstacles.push({
      id: `${type}_${idCounter++}`,
      x,
      y,
      width,
      height,
      type,
      health: maxHealth,
      maxHealth,
    });
  };

  // Border walls are simulated via physics boundaries, so we only generate interior obstacles

  switch (mapType) {
    case 'klassik':
      // Symmetric pillars and central block
      // Central stone block
      addObstacle(ARENA_WIDTH / 2 - 40, ARENA_HEIGHT / 2 - 40, 80, 80, 'stone');

      // Four symmetric blocks
      addObstacle(200, 150, 60, 60, 'stone');
      addObstacle(ARENA_WIDTH - 260, 150, 60, 60, 'stone');
      addObstacle(200, ARENA_HEIGHT - 210, 60, 60, 'stone');
      addObstacle(ARENA_WIDTH - 260, ARENA_HEIGHT - 210, 60, 60, 'stone');

      // Horizontal segments
      addObstacle(380, 100, 200, 30, 'wood');
      addObstacle(380, ARENA_HEIGHT - 130, 200, 30, 'wood');

      // Side bushes
      addObstacle(80, ARENA_HEIGHT / 2 - 40, 60, 80, 'bush');
      addObstacle(ARENA_WIDTH - 140, ARENA_HEIGHT / 2 - 40, 60, 80, 'bush');
      break;

    case 'labirint':
      // Inner maze walls - Stone
      // Top & Bottom vertical dividers
      addObstacle(160, 0, 40, 150, 'stone');
      addObstacle(ARENA_WIDTH - 200, 0, 40, 150, 'stone');
      addObstacle(160, ARENA_HEIGHT - 150, 40, 150, 'stone');
      addObstacle(ARENA_WIDTH - 200, ARENA_HEIGHT - 150, 40, 150, 'stone');

      // Center corridors
      addObstacle(320, 120, 40, 360, 'stone');
      addObstacle(ARENA_WIDTH - 360, 120, 40, 360, 'stone');

      // Horizontal central dividers
      addObstacle(160, ARENA_HEIGHT / 2 - 20, 160, 40, 'stone');
      addObstacle(ARENA_WIDTH - 320, ARENA_HEIGHT / 2 - 20, 160, 40, 'stone');
      addObstacle(ARENA_WIDTH / 2 - 100, ARENA_HEIGHT / 2 - 20, 200, 40, 'stone');

      // Destructible wood block caches
      addObstacle(ARENA_WIDTH / 2 - 25, 80, 50, 50, 'wood');
      addObstacle(ARENA_WIDTH / 2 - 25, ARENA_HEIGHT - 130, 50, 50, 'wood');
      addObstacle(80, ARENA_HEIGHT / 2 - 20, 40, 40, 'wood');
      addObstacle(ARENA_WIDTH - 120, ARENA_HEIGHT / 2 - 20, 40, 40, 'wood');
      break;

    case 'xarobalar':
      // Heavily destructible theme - Wood blocks galore + bushes for hiding
      // Center ring of wood blocks
      for (let i = -2; i <= 2; i++) {
        if (i !== 0) {
          // Left & Right lines of wood
          addObstacle(ARENA_WIDTH / 2 - 120, ARENA_HEIGHT / 2 + i * 50 - 25, 40, 40, 'wood');
          addObstacle(ARENA_WIDTH / 2 + 80, ARENA_HEIGHT / 2 + i * 50 - 25, 40, 40, 'wood');
        } else {
          // Center gap flanked by stone
          addObstacle(ARENA_WIDTH / 2 - 120, ARENA_HEIGHT / 2 - 25, 40, 40, 'stone');
          addObstacle(ARENA_WIDTH / 2 + 80, ARENA_HEIGHT / 2 - 25, 40, 40, 'stone');
        }
      }

      // Corners
      addObstacle(120, 100, 50, 50, 'wood');
      addObstacle(170, 100, 50, 50, 'wood');
      addObstacle(120, 150, 50, 50, 'stone');

      addObstacle(ARENA_WIDTH - 220, 100, 50, 50, 'wood');
      addObstacle(ARENA_WIDTH - 170, 100, 50, 50, 'wood');
      addObstacle(ARENA_WIDTH - 170, 150, 50, 50, 'stone');

      addObstacle(120, ARENA_HEIGHT - 200, 50, 50, 'stone');
      addObstacle(120, ARENA_HEIGHT - 150, 50, 50, 'wood');
      addObstacle(170, ARENA_HEIGHT - 150, 50, 50, 'wood');

      addObstacle(ARENA_WIDTH - 170, ARENA_HEIGHT - 200, 50, 50, 'stone');
      addObstacle(ARENA_WIDTH - 220, ARENA_HEIGHT - 150, 50, 50, 'wood');
      addObstacle(ARENA_WIDTH - 170, ARENA_HEIGHT - 150, 50, 50, 'wood');

      // Random small bushes in the wild lanes
      addObstacle(300, 80, 80, 40, 'bush');
      addObstacle(600, 80, 80, 40, 'bush');
      addObstacle(300, ARENA_HEIGHT - 120, 80, 40, 'bush');
      addObstacle(600, ARENA_HEIGHT - 120, 80, 40, 'bush');

      // Central river crossing points
      addObstacle(ARENA_WIDTH / 2 - 10, ARENA_HEIGHT / 2 - 100, 20, 200, 'river');
      break;

    case 'ochiq_maydon':
      // Open field layout. Massive crossfire potential.
      // Dynamic water canals (rivers) dividing regions
      addObstacle(ARENA_WIDTH / 2 - 250, 120, 150, 40, 'river');
      addObstacle(ARENA_WIDTH / 2 + 100, 120, 150, 40, 'river');
      addObstacle(ARENA_WIDTH / 2 - 250, ARENA_HEIGHT - 160, 150, 40, 'river');
      addObstacle(ARENA_WIDTH / 2 + 100, ARENA_HEIGHT - 160, 150, 40, 'river');

      // Center lake with a small wood crate floating
      addObstacle(ARENA_WIDTH / 2 - 50, ARENA_HEIGHT / 2 - 50, 100, 100, 'river');
      addObstacle(ARENA_WIDTH / 2 - 20, ARENA_HEIGHT / 2 - 20, 40, 40, 'wood');

      // Large strategic forest layers (Bushes)
      addObstacle(60, 200, 100, 200, 'bush');
      addObstacle(ARENA_WIDTH - 160, 200, 100, 200, 'bush');

      addObstacle(ARENA_WIDTH / 2 - 40, 30, 80, 60, 'bush');
      addObstacle(ARENA_WIDTH / 2 - 40, ARENA_HEIGHT - 90, 80, 60, 'bush');

      // Few stone cover walls near corners
      addObstacle(100, 80, 60, 30, 'stone');
      addObstacle(ARENA_WIDTH - 160, 80, 60, 30, 'stone');
      addObstacle(100, ARENA_HEIGHT - 110, 60, 30, 'stone');
      addObstacle(ARENA_WIDTH - 160, ARENA_HEIGHT - 110, 60, 30, 'stone');
      break;

    default:
      break;
  }

  return obstacles;
}
