import type { ItemDef } from './types.js';

export const ITEMS: ItemDef[] = [
  {
    id: 'lens',
    name: 'Lens of Order',
    description: 'Life follows B3/S23 (classic).',
    ruleMod: 'B3/S23',
  },
  {
    id: 'chaos_seed',
    name: 'Chaos Seed',
    description: 'Birth on 2 or 3 neighbors — more growth.',
    ruleMod: 'B23/S36',
  },
  {
    id: 'heart_amulet',
    name: 'Heart Amulet',
    description: '+20 max HP.',
    hpBonus: 20,
  },
  {
    id: 'xp_gem',
    name: 'Scholar Gem',
    description: '1.25× XP gain.',
    xpMod: 1.25,
  },
  {
    id: 'still_life',
    name: 'Still Life',
    description: 'Survive on 2,3,4 — more stable patterns.',
    ruleMod: 'B3/S234',
  },
];

export function getItemById(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}

/** Pick a random item for room reward */
export function pickRandomItem(existingIds: string[]): ItemDef {
  const pool = ITEMS.filter((i) => !existingIds.includes(i.id));
  return pool[Math.floor(Math.random() * pool.length)] ?? ITEMS[0];
}
