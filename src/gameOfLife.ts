import type { Grid2D, Cell } from './types.js';

const DEFAULT_BIRTH = [3];
const DEFAULT_SURVIVE = [2, 3];

/** Wall cell value; walls are fixed and do not participate in GoL */
export const WALL = 2 as Cell;

/** Parse rule string like "B3/S23" or "birth3 survive23" into birth/survive counts */
export function parseRule(ruleMod?: string): { birth: number[]; survive: number[] } {
  if (!ruleMod) return { birth: DEFAULT_BIRTH, survive: DEFAULT_SURVIVE };
  const birth: number[] = [];
  const survive: number[] = [];
  const bMatch = ruleMod.toLowerCase().match(/b(\d+)|birth\s*(\d+)/);
  const sMatch = ruleMod.toLowerCase().match(/s(\d+)|survive\s*(\d+)/);
  if (bMatch) {
    const s = bMatch[1] ?? bMatch[2] ?? '3';
    birth.push(...s.split('').map(Number));
  } else birth.push(...DEFAULT_BIRTH);
  if (sMatch) {
    const s = sMatch[1] ?? sMatch[2] ?? '23';
    survive.push(...s.split('').map(Number));
  } else survive.push(...DEFAULT_SURVIVE);
  return { birth, survive };
}

/** Count live neighbors (8-neighborhood). Walls block; only alive (1) counts. No wrapping at edges. */
function countNeighbors(grid: Grid2D, row: number, col: number): number {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      if (grid[r][c] === 1) count += 1;
    }
  }
  return count;
}

/** Collect mob type indices of live neighbors (for birth type assignment). */
function neighborMobIndices(
  mobGrid: number[][],
  grid: Grid2D,
  row: number,
  col: number
): number[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      if (grid[r][c] === 1) {
        const idx = mobGrid[r]?.[c] ?? -1;
        if (idx >= 0) out.push(idx);
      }
    }
  }
  return out;
}

/** One step of Game of Life with optional custom birth/survive rules */
export function step(
  grid: Grid2D,
  ruleMod?: string
): Grid2D {
  const { birth, survive } = parseRule(ruleMod);
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const next: Grid2D = grid.map((row) => [...row] as Cell[]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === WALL) {
        next[r][c] = WALL;
        continue;
      }
      const n = countNeighbors(grid, r, c);
      const alive = grid[r][c] === 1;
      if (alive) {
        next[r][c] = survive.includes(n) ? (1 as Cell) : (0 as Cell);
      } else {
        next[r][c] = birth.includes(n) ? (1 as Cell) : (0 as Cell);
      }
    }
  }
  return next;
}

export interface MobTypeLike {
  ruleMod?: string;
}

/** One step with per-cell mob types: each live cell uses its mob's ruleMod for survive; birth uses global rule and inherits type from neighbors. */
export function stepWithMobs(
  grid: Grid2D,
  mobGrid: number[][],
  mobTypes: MobTypeLike[],
  globalRuleMod?: string
): { grid: Grid2D; mobGrid: number[][] } {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const next: Grid2D = grid.map((r) => [...r] as Cell[]);
  const nextMob: number[][] = mobGrid.map((r) => [...r]);

  const globalRule = parseRule(globalRuleMod);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === WALL) {
        next[r][c] = WALL;
        nextMob[r][c] = -1;
        continue;
      }
      const n = countNeighbors(grid, r, c);
      const alive = grid[r][c] === 1;
      const mobIdx = mobGrid[r]?.[c] ?? -1;
      const cellRule = mobIdx >= 0 ? parseRule(mobTypes[mobIdx]?.ruleMod) : globalRule;

      if (alive) {
        const survives = cellRule.survive.includes(n);
        next[r][c] = survives ? (1 as Cell) : (0 as Cell);
        nextMob[r][c] = survives ? mobIdx : -1;
      } else {
        const born = globalRule.birth.includes(n);
        next[r][c] = born ? (1 as Cell) : (0 as Cell);
        if (born) {
          const neighbors = neighborMobIndices(mobGrid, grid, r, c);
          nextMob[r][c] =
            neighbors.length > 0
              ? neighbors[Math.floor(Math.random() * neighbors.length)]!
              : -1;
          if (nextMob[r][c] < 0) nextMob[r][c] = 0;
        } else {
          nextMob[r][c] = -1;
        }
      }
    }
  }
  return { grid: next, mobGrid: nextMob };
}

/** Create empty grid */
export function createGrid(rows: number, cols: number): Grid2D {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0 as Cell));
}

/** Create a grid with walls on the border and a random pattern in the interior. */
export function createPregeneratedGrid(rows: number, cols: number, fillRatio: number = 0.25): Grid2D {
  const grid = createGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isWall = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      grid[r][c] = isWall ? WALL : (Math.random() < fillRatio ? 1 : 0) as Cell;
    }
  }
  return grid;
}

/** Toggle cell at (row, col). Walls cannot be toggled. */
export function toggleCell(grid: Grid2D, row: number, col: number): Grid2D {
  if (grid[row]?.[col] === WALL) return grid;
  const next = grid.map((r) => [...r] as Cell[]);
  if (next[row]?.[col] !== undefined) {
    next[row][col] = (1 - next[row][col]) as Cell;
  }
  return next;
}

/** Count live cells (excludes walls) */
export function countAlive(grid: Grid2D): number {
  return grid.flat().reduce<number>((a, c) => a + (c === 1 ? 1 : 0), 0);
}

/** True if both grids have the same dimensions and cell values */
export function gridsEqual(a: Grid2D, b: Grid2D): boolean {
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  if (b.length !== rows || (b[0]?.length ?? 0) !== cols) return false;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}
