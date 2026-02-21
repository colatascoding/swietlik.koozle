import type { Grid2D, RoomPhase } from './types.js';
import { createPregeneratedGrid, stepWithMobs, toggleCell, gridsEqual, WALL } from './gameOfLife.js';
import { MOB_TYPES, PIXEL_MOB_COUNT, randomPixelMobIndex } from './mobs.js';

const DEFAULT_ROWS = 12;
const DEFAULT_COLS = 12;

/** Mob type index per cell (-1 = dead/wall). Same dimensions as grid. */
export type MobGrid = number[][];

/** Number of cell toggles the player can make before starting life (1–3 per room) */
export const MIN_CHANGES = 1;
export const MAX_CHANGES = 3;

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function createMobGridForGrid(grid: Grid2D): MobGrid {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const mobGrid: MobGrid = Array.from({ length: rows }, () => Array(cols).fill(-1));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) mobGrid[r][c] = randomPixelMobIndex();
    }
  }
  return mobGrid;
}

export interface RoomState {
  id: string;
  grid: Grid2D;
  /** Mob type index per cell; -1 for dead/wall. Same size as grid. */
  mobGrid: MobGrid;
  phase: RoomPhase;
  stepCount: number;
  ruleMod?: string;
  changesLeft: number;
  stable?: boolean;
}

export function createRoom(id: string, ruleMod?: string): RoomState {
  const grid = createPregeneratedGrid(DEFAULT_ROWS, DEFAULT_COLS);
  return {
    id,
    grid,
    mobGrid: createMobGridForGrid(grid),
    phase: 'edit',
    stepCount: 0,
    ruleMod,
    changesLeft: randomInt(MIN_CHANGES, MAX_CHANGES),
  };
}

export function roomToggleCell(room: RoomState, row: number, col: number): RoomState {
  if (room.phase !== 'edit' || room.changesLeft < 1) return room;
  if (room.grid[row]?.[col] === WALL) return room;
  const newGrid = toggleCell(room.grid, row, col);
  const newMobGrid = room.mobGrid.map((rowArr) => [...rowArr]);
  if (newGrid[row][col] === 1) newMobGrid[row][col] = randomPixelMobIndex();
  else newMobGrid[row][col] = -1;
  return {
    ...room,
    grid: newGrid,
    mobGrid: newMobGrid,
    changesLeft: room.changesLeft - 1,
  };
}

export function roomStartAlive(room: RoomState): RoomState {
  if (room.phase !== 'edit') return room;
  return {
    ...room,
    phase: 'alive',
    stepCount: 0,
  };
}

export function roomTick(room: RoomState): RoomState {
  if (room.phase !== 'alive') return room;
  const { grid: nextGrid, mobGrid: nextMobGrid } = stepWithMobs(
    room.grid,
    room.mobGrid,
    MOB_TYPES,
    room.ruleMod
  );
  const stable = gridsEqual(room.grid, nextGrid);
  return {
    ...room,
    grid: nextGrid,
    mobGrid: nextMobGrid,
    stepCount: room.stepCount + 1,
    stable,
  };
}

/** Mark room complete (e.g. after N steps or when player chooses to leave) */
export function roomComplete(room: RoomState): RoomState {
  return { ...room, phase: 'complete' };
}

export function getRoomGridSize(room: RoomState) {
  return { rows: room.grid.length, cols: room.grid[0]?.length ?? 0 };
}
