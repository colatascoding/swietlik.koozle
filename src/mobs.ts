import type { MobDef } from './types.js';

export const MOB_TYPES: MobDef[] = [
  { id: 'slime', name: 'Slime', damage: 2, xpReward: 5 },
  { id: 'phantom', name: 'Phantom', damage: 4, xpReward: 10 },
  { id: 'blob', name: 'Blob', damage: 3, xpReward: 7 },
  { id: 'spore', name: 'Spore', damage: 1, xpReward: 4 },
  { id: 'shifter', name: 'Shifter', damage: 5, xpReward: 12 },
  { id: 'glider', name: 'Glider', damage: 3, xpReward: 8 },
  { id: 'pulsar', name: 'Pulsar', damage: 6, xpReward: 15 },
  { id: 'eater', name: 'Eater', damage: 5, xpReward: 11 },
  { id: 'loaf', name: 'Loaf', damage: 2, xpReward: 6 },
  { id: 'beehive', name: 'Beehive', damage: 4, xpReward: 9 },
  { id: 'toad', name: 'Toad', damage: 4, xpReward: 10 },
  { id: 'pentomino', name: 'Pentomino', damage: 7, xpReward: 18 },
];

export function getMobById(id: string): MobDef | undefined {
  return MOB_TYPES.find((m) => m.id === id);
}

/** Pick N random mobs for a room encounter (can repeat). */
export function pickRandomMobs(count: number): MobDef[] {
  const result: MobDef[] = [];
  for (let i = 0; i < count; i++) {
    result.push(MOB_TYPES[Math.floor(Math.random() * MOB_TYPES.length)]!);
  }
  return result;
}

/** Roll 1–3 mobs for a room based on room index (later rooms = more mobs). */
export function rollMobsForRoom(roomIndex: number): MobDef[] {
  const count = Math.min(3, 1 + Math.floor(roomIndex / 2) + (Math.random() < 0.4 ? 1 : 0));
  return pickRandomMobs(Math.max(1, count));
}
