import type { CharacterStats, InventoryItem, ItemDef } from './types.js';

const BASE_HP = 100;
const XP_PER_LEVEL = 50;

export function createCharacter(): CharacterStats {
  return {
    maxHp: BASE_HP,
    hp: BASE_HP,
    level: 1,
    xp: 0,
    xpToNext: XP_PER_LEVEL,
  };
}

export function applyItemBonuses(stats: CharacterStats, inventory: InventoryItem[]): CharacterStats {
  let maxHp = stats.maxHp;
  let xpMod = 1;
  for (const { def, count } of inventory) {
    if (def.hpBonus) maxHp += def.hpBonus * count;
    if (def.xpMod) xpMod *= Math.pow(def.xpMod, count);
  }
  return {
    ...stats,
    maxHp,
    xpToNext: Math.floor(XP_PER_LEVEL * Math.pow(1.2, stats.level - 1) / xpMod),
  };
}

export function addXp(stats: CharacterStats, amount: number, inventory: InventoryItem[]): CharacterStats {
  let xp = stats.xp + amount;
  let level = stats.level;
  let xpToNext = Math.floor(XP_PER_LEVEL * Math.pow(1.2, level - 1));
  while (xp >= xpToNext) {
    xp -= xpToNext;
    level++;
    xpToNext = Math.floor(XP_PER_LEVEL * Math.pow(1.2, level - 1));
  }
  const next: CharacterStats = {
    ...stats,
    xp,
    level,
    xpToNext,
    maxHp: stats.maxHp + (level - stats.level) * 10,
  };
  return applyItemBonuses(next, inventory);
}

export function takeDamage(stats: CharacterStats, damage: number): CharacterStats {
  return {
    ...stats,
    hp: Math.max(0, stats.hp - damage),
  };
}

export function heal(stats: CharacterStats, amount: number): CharacterStats {
  return {
    ...stats,
    hp: Math.min(stats.maxHp, stats.hp + amount),
  };
}

export function getActiveRuleMod(inventory: InventoryItem[]): string | undefined {
  for (const { def } of inventory) {
    if (def.ruleMod) return def.ruleMod;
  }
  return undefined;
}
