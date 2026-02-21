import type { Grid2D, RoomPhase } from './types.js';
import { createGrid, step, toggleCell } from './gameOfLife.js';

const DEFAULT_ROWS = 12;
const DEFAULT_COLS = 12;

export interface RoomState {
  id: string;
  grid: Grid2D;
  phase: RoomPhase;
  /** Current step count while phase === 'alive' */
  stepCount: number;
  /** Rule modifier from items (e.g. B3/S23) */
  ruleMod?: string;
}

export function createRoom(id: string, ruleMod?: string): RoomState {
  return {
    id,
    grid: createGrid(DEFAULT_ROWS, DEFAULT_COLS),
    phase: 'edit',
    stepCount: 0,
    ruleMod,
  };
}

export function roomToggleCell(room: RoomState, row: number, col: number): RoomState {
  if (room.phase !== 'edit') return room;
  return {
    ...room,
    grid: toggleCell(room.grid, row, col),
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
  return {
    ...room,
    grid: step(room.grid, room.ruleMod),
    stepCount: room.stepCount + 1,
  };
}

/** Mark room complete (e.g. after N steps or when player chooses to leave) */
export function roomComplete(room: RoomState): RoomState {
  return { ...room, phase: 'complete' };
}

export function getRoomGridSize(room: RoomState) {
  return { rows: room.grid.length, cols: room.grid[0]?.length ?? 0 };
}
