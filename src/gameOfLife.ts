import type { Grid2D, Cell } from './types.js';

const DEFAULT_BIRTH = [3];
const DEFAULT_SURVIVE = [2, 3];

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

/** Count live neighbors (8-neighborhood). Wraps at edges. */
function countNeighbors(grid: Grid2D, row: number, col: number): number {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = (row + dr + rows) % rows;
      const c = (col + dc + cols) % cols;
      count += grid[r][c];
    }
  }
  return count;
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

/** Create empty grid */
export function createGrid(rows: number, cols: number): Grid2D {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0 as Cell));
}

/** Toggle cell at (row, col) */
export function toggleCell(grid: Grid2D, row: number, col: number): Grid2D {
  const next = grid.map((r) => [...r] as Cell[]);
  if (next[row]?.[col] !== undefined) {
    next[row][col] = (1 - next[row][col]) as Cell;
  }
  return next;
}

/** Count live cells */
export function countAlive(grid: Grid2D): number {
  return grid.flat().reduce<number>((a, c) => a + c, 0);
}
