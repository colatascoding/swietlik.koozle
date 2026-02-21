import type { MobDef, Grid2D } from './types.js';

/** Mob types: used as pixels (color + ruleMod) and for encounters (damage + xpReward). */
export const MOB_TYPES: MobDef[] = [
  {
    id: 'slime',
    name: 'Slime',
    color: '#7ee8a8',
    damage: 2,
    xpReward: 5,
    ruleMod: 'B3/S23',
    behavior: 'Born when exactly 3 neighbors. Survives with 2 or 3; else dies of loneliness or overcrowding.',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    color: '#8ea4e8',
    damage: 4,
    xpReward: 10,
    ruleMod: 'B2/S',
    behavior: 'Appears with only 2 neighbors. Survives with 2; very fragile and spreads in sparse areas.',
  },
  {
    id: 'blob',
    name: 'Blob',
    color: '#c87ee8',
    damage: 3,
    xpReward: 7,
    ruleMod: 'B34/S34',
    behavior: 'Born with 3 or 4 neighbors. Survives with 3 or 4. Loves crowded spots; forms dense clusters.',
  },
  {
    id: 'spore',
    name: 'Spore',
    color: '#e8d87e',
    damage: 1,
    xpReward: 4,
    ruleMod: 'B36/S23',
    behavior: 'Spawns with 3 or 6 neighbors. Survives with 2 or 3. Can pop up in busy or hexagonal patterns.',
  },
  {
    id: 'glider',
    name: 'Glider',
    color: '#7ee8e8',
    damage: 3,
    xpReward: 8,
    ruleMod: 'B3/S23',
    behavior: 'Classic rules: birth on 3, survive on 2 or 3. Can form shapes that drift across the grid.',
  },
  {
    id: 'pulsar',
    name: 'Pulsar',
    color: '#e89a7e',
    damage: 6,
    xpReward: 15,
    ruleMod: 'B3/S234',
    behavior: 'Born with 3 neighbors. Survives with 2, 3, or 4. More tolerant—often forms stable, oscillating patterns.',
  },
  {
    id: 'shifter',
    name: 'Shifter',
    color: '#e87ec8',
    damage: 5,
    xpReward: 12,
    ruleMod: 'B23/S36',
    behavior: 'Born with 2 or 3 neighbors. Survives with 3, 4, 5, or 6. Grows fast and thrives in dense neighborhoods.',
  },
  {
    id: 'eater',
    name: 'Eater',
    color: '#5a9a6e',
    damage: 5,
    xpReward: 11,
    ruleMod: 'B3/S23',
    behavior: 'Standard rules. Often part of structures that absorb or block other patterns.',
  },
  {
    id: 'loaf',
    name: 'Loaf',
    color: '#a88a5a',
    damage: 2,
    xpReward: 6,
    ruleMod: 'B3/S23',
    behavior: 'Classic birth/survive. Forms compact still lifes that don’t change.',
  },
  {
    id: 'beehive',
    name: 'Beehive',
    color: '#e8c87e',
    damage: 4,
    xpReward: 9,
    ruleMod: 'B3/S234',
    behavior: 'Birth on 3, survives with 2–4 neighbors. Tends to settle into stable hexagonal blobs.',
  },
  {
    id: 'toad',
    name: 'Toad',
    color: '#7eb8e8',
    damage: 4,
    xpReward: 10,
    ruleMod: 'B3/S23',
    behavior: 'Classic rules. Often appears in oscillating patterns that flip every step.',
  },
  {
    id: 'pentomino',
    name: 'Pentomino',
    color: '#e87e7e',
    damage: 7,
    xpReward: 18,
    ruleMod: 'B3/S23',
    behavior: 'Standard birth/survive. Small seed that can explode into long-lived, chaotic growth.',
  },
];

/** Number of mob types that appear as pixels in the grid (first N). */
export const PIXEL_MOB_COUNT = 6;

export function getMobById(id: string): MobDef | undefined {
  return MOB_TYPES.find((m) => m.id === id);
}

export function getMobByIndex(index: number): MobDef | undefined {
  return MOB_TYPES[index];
}

/** Pick a random mob type index for pixel (0..PIXEL_MOB_COUNT-1). */
export function randomPixelMobIndex(): number {
  return Math.floor(Math.random() * PIXEL_MOB_COUNT);
}

/** Build encounter list from grid + mobGrid: one mob per live cell (by type). */
export function mobsFromGrid(
  grid: Grid2D,
  mobGrid: number[][],
  mobTypes: MobDef[]
): MobDef[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const list: MobDef[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;
      const idx = mobGrid[r]?.[c] ?? 0;
      const mob = mobTypes[idx];
      if (mob) list.push(mob);
    }
  }
  return list;
}
