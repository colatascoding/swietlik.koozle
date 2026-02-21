import type { RoomState } from './room.js';
import type { MobDef } from './types.js';
import { countAlive } from './gameOfLife.js';
import { MOB_TYPES, pickRandomMobs } from './mobs.js';

export interface ScenarioBonus {
  bonusItems: number;
  bonusMobs: MobDef[];
  /** Short labels for UI (e.g. "Stable", "Long run") */
  reasons: string[];
}

/** Evaluate completed room and return extra items/mobs from specific scenarios. */
export function getScenarioBonuses(room: RoomState): ScenarioBonus {
  const reasons: string[] = [];
  let bonusItems = 0;
  const bonusMobs: MobDef[] = [];

  if (room.stable) {
    bonusItems += 1;
    reasons.push('Stable');
  }

  if (room.stepCount >= 15) {
    bonusItems += 1;
    reasons.push('Long run');
  }

  const alive = countAlive(room.grid);
  if (alive >= 12) {
    bonusMobs.push(...pickRandomMobs(2));
    reasons.push('Crowded');
  }

  const distinctTypes = new Set<number>();
  const rows = room.grid.length;
  const cols = room.grid[0]?.length ?? 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (room.grid[r][c] === 1) {
        const idx = room.mobGrid[r]?.[c] ?? -1;
        if (idx >= 0) distinctTypes.add(idx);
      }
    }
  }
  if (distinctTypes.size >= 4) {
    bonusItems += 1;
    reasons.push('Variety');
  }

  return { bonusItems, bonusMobs, reasons };
}
