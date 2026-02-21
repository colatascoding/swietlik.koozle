/** Grid cell: 0 = dead, 1 = alive */
export type Cell = 0 | 1;

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
