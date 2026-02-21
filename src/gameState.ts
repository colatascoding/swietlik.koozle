import type { CharacterStats, InventoryItem } from './types.js';
import type { RoomState } from './room.js';
import { createCharacter, takeDamage, addXp, applyItemBonuses } from './character.js';
import { createRoom } from './room.js';
import { getActiveRuleMod } from './character.js';
import { pickRandomItem, getItemById } from './items.js';

export interface GameState {
  phase: 'playing' | 'dead' | 'victory';
  rooms: RoomState[];
  currentRoomIndex: number;
  character: CharacterStats;
  inventory: InventoryItem[];
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
  return state.rooms[state.currentRoomIndex] ?? state.rooms[0];
}

export function addRoom(state: GameState): GameState {
  const ruleMod = getActiveRuleMod(state.inventory);
  const nextRooms = [...state.rooms, createRoom(String(state.rooms.length), ruleMod)];
  return { ...state, rooms: nextRooms, currentRoomIndex: nextRooms.length - 1 };
}

export function addItem(state: GameState, itemId: string, count: number = 1): GameState {
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

export function giveRoomReward(state: GameState, xp: number, maybeItem: boolean): GameState {
  let next: GameState = {
    ...state,
    character: addXp(state.character, xp, state.inventory),
  };
  next.character = applyItemBonuses(next.character, next.inventory);
  if (maybeItem && Math.random() < 0.4) next = addRandomItem(next);
  return next;
}
