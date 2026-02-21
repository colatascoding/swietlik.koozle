import type { CharacterStats, InventoryItem, MobDef } from './types.js';
import type { RoomState } from './room.js';
import { createCharacter, takeDamage, addXp, applyItemBonuses } from './character.js';
import { createRoom } from './room.js';
import { getActiveRuleMod } from './character.js';
import { pickRandomItem, getItemById } from './items.js';
import { mobsFromGrid, MOB_TYPES } from './mobs.js';

export interface GameState {
  phase: 'playing' | 'dead' | 'victory';
  rooms: RoomState[];
  currentRoomIndex: number;
  character: CharacterStats;
  inventory: InventoryItem[];
  /** Last mob encounter (for UI); set when finishing a room and going to next */
  lastEncounter?: { mobs: MobDef[]; damage: number; xp: number };
}

export function createGameState(): GameState {
  const inventory: InventoryItem[] = [];
  const ruleMod = getActiveRuleMod(inventory);
  return {
    phase: 'playing',
    rooms: [createRoom('0', ruleMod)],
    currentRoomIndex: 0,
    character: createCharacter(),
    inventory,
  };
}

export function getCurrentRoom(state: GameState): RoomState {
  if (state.rooms.length === 0) throw new Error('No rooms in state');
  return state.rooms[state.currentRoomIndex] ?? state.rooms[0];
}

export function addRoom(state: GameState): GameState {
  const ruleMod = getActiveRuleMod(state.inventory);
  const nextRooms = [...state.rooms, createRoom(String(state.rooms.length), ruleMod)];
  return { ...state, rooms: nextRooms, currentRoomIndex: nextRooms.length - 1 };
}

export function addItem(state: GameState, itemId: string, count: number = 1): GameState {
  if (count < 1) return state;
  const def = getItemById(itemId);
  if (!def) return state;
  const inv = [...state.inventory];
  const idx = inv.findIndex((i) => i.def.id === itemId);
  if (idx >= 0) inv[idx] = { ...inv[idx], count: inv[idx].count + count };
  else inv.push({ def, count });
  return { ...state, inventory: inv };
}

/** Add a random new item to inventory (room reward) */
export function addRandomItem(state: GameState): GameState {
  const existingIds = state.inventory.map((i) => i.def.id);
  const def = pickRandomItem(existingIds);
  return addItem(state, def.id, 1);
}

export function applyCharacterDamage(state: GameState, damage: number): GameState {
  const character = takeDamage(state.character, damage);
  return {
    ...state,
    character,
    phase: character.hp <= 0 ? 'dead' : state.phase,
  };
}

/** Apply mob encounter from the completed room's pixels (grid + mobGrid), then room XP and maybe item. */
export function giveRoomReward(
  state: GameState,
  roomXp: number,
  maybeItem: boolean,
  completedRoom: RoomState
): GameState {
  const mobs = mobsFromGrid(completedRoom.grid, completedRoom.mobGrid, MOB_TYPES);
  const damage = mobs.reduce((s, m) => s + m.damage, 0);
  const mobXp = mobs.reduce((s, m) => s + m.xpReward, 0);

  let next: GameState = {
    ...state,
    character: takeDamage(state.character, damage),
    lastEncounter: { mobs, damage, xp: mobXp },
  };
  next.phase = next.character.hp <= 0 ? 'dead' : state.phase;
  next.character = addXp(next.character, roomXp + mobXp, next.inventory);
  next.character = applyItemBonuses(next.character, next.inventory);
  if (maybeItem && Math.random() < 0.4) next = addRandomItem(next);
  return next;
}
