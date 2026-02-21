/** Grid cell: 0 = dead, 1 = alive, 2 = wall (fixed, not affected by Game of Life) */
export type Cell = 0 | 1 | 2;

export type Grid2D = Cell[][];

export interface Point {
  x: number;
  y: number;
}

export type RoomPhase = 'edit' | 'alive' | 'complete';

export interface CharacterStats {
  maxHp: number;
  hp: number;
  level: number;
  xp: number;
  xpToNext: number;
}

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  /** Modifier to GoL: e.g. "birth3" = birth on 3 neighbors (default), "survive23" */
  ruleMod?: string;
  /** Flat HP bonus when carried */
  hpBonus?: number;
  /** XP gain multiplier (e.g. 1.2 = +20%) */
  xpMod?: number;
}

export interface InventoryItem {
  def: ItemDef;
  count: number;
}

export interface MobDef {
  id: string;
  name: string;
  /** Hex color for this mob when drawn as a pixel */
  color: string;
  /** Damage dealt to player when encountered */
  damage: number;
  /** XP granted when defeated */
  xpReward: number;
  /** Optional GoL rule for this mob type (e.g. "B3/S23"). If set, this mob uses different birth/survive. */
  ruleMod?: string;
}
