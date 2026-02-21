import type { Grid2D, RoomPhase } from './types.js';
import { createPregeneratedGrid, step, toggleCell, gridsEqual } from './gameOfLife.js';

const DEFAULT_ROWS = 12;
const DEFAULT_COLS = 12;

/** Number of cell toggles the player can make before starting life (1–3 per room) */
export const MIN_CHANGES = 1;
export const MAX_CHANGES = 3;

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export interface RoomState {
  id: string;
  grid: Grid2D;
  phase: RoomPhase;
  /** Current step count while phase === 'alive' */
  stepCount: number;
  /** Rule modifier from items (e.g. B3/S23) */
  ruleMod?: string;
  /** Toggles left in edit phase (1–3). Each click consumes one. */
  changesLeft: number;
  /** True when the grid did not change after the last step (still life). */
  stable?: boolean;
}

export function createRoom(id: string, ruleMod?: string): RoomState {
  return {
    id,
    grid: createPregeneratedGrid(DEFAULT_ROWS, DEFAULT_COLS),
    phase: 'edit',
    stepCount: 0,
    ruleMod,
    changesLeft: randomInt(MIN_CHANGES, MAX_CHANGES),
  };
}

export function roomToggleCell(room: RoomState, row: number, col: number): RoomState {
  if (room.phase !== 'edit' || room.changesLeft < 1) return room;
  return {
    ...room,
    grid: toggleCell(room.grid, row, col),
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
  const nextGrid = step(room.grid, room.ruleMod);
  const stable = gridsEqual(room.grid, nextGrid);
  return {
    ...room,
    grid: nextGrid,
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
