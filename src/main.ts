import type { GameState } from './gameState.js';
import {
  createGameState,
  getCurrentRoom,
  addRoom,
  giveRoomReward,
} from './gameState.js';
import type { RoomState } from './room.js';
import {
  roomToggleCell,
  roomStartAlive,
  roomTick,
  roomComplete,
  getRoomGridSize,
} from './room.js';
import { renderGrid, fitGridInCanvas, hitTest } from './render.js';
import { applyItemBonuses } from './character.js';
import { MOB_TYPES } from './mobs.js';

// --- State
let state: GameState = createGameState();
let layout: { cellW: number; cellH: number; offsetX: number; offsetY: number } = {
  cellW: 12,
  cellH: 12,
  offsetX: 0,
  offsetY: 0,
};
let golInterval: number | null = null;
const GOL_MS = 120;

// --- DOM
const app = document.getElementById('app')!;
const roomCanvas = document.createElement('canvas');
roomCanvas.id = 'roomCanvas';
const header = document.createElement('header');
header.className = 'header';
const sidebar = document.createElement('aside');
sidebar.className = 'sidebar';

function buildHeader(): void {
  header.innerHTML = '';
  const title = document.createElement('h1');
  title.textContent = 'Świetlik Koozle';
  const roomLabel = document.createElement('span');
  roomLabel.className = 'muted';
  roomLabel.textContent = `Room ${state.currentRoomIndex + 1} / ${state.rooms.length}`;
  roomLabel.style.color = 'var(--muted)';
  header.append(title, roomLabel);
}

function buildSidebar(): void {
  const room = getCurrentRoom(state);
  const { rows, cols } = getRoomGridSize(room);

  sidebar.innerHTML = '';

  const statusPanel = document.createElement('div');
  statusPanel.className = 'panel';
  const statusDiv = document.createElement('div');
  statusDiv.className = `room-status ${room.phase}${room.stable ? ' stable' : ''}`;
  statusDiv.textContent =
    room.phase === 'edit'
      ? `Changes left: ${room.changesLeft}. Toggle cells, then start life.`
      : room.phase === 'alive'
        ? room.stable
          ? `Life stable — no change (step ${room.stepCount}). Finish to collect reward.`
          : `Life running — step ${room.stepCount}`
        : 'Room complete — go to next';
  statusPanel.appendChild(statusDiv);

  const btnWrap = document.createElement('div');
  btnWrap.style.marginTop = '0.75rem';
  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-block';
  startBtn.textContent = room.phase === 'edit' ? 'Start life' : room.phase === 'alive' ? 'Running…' : 'Next room';
  startBtn.disabled = room.phase === 'alive';
  startBtn.onclick = () => {
    const current = getCurrentRoom(state);
    if (current.phase === 'edit') {
      updateRoom(roomStartAlive(current));
      startGOL();
    } else if (current.phase === 'complete') {
      state = giveRoomReward(state, 15 + current.stepCount, true, current);
      state = addRoom(state);
      updateRoom(getCurrentRoom(state));
      stopGOL();
      buildHeader();
      buildSidebar();
      paint();
    }
  };
  const completeBtn = document.createElement('button');
  completeBtn.className = 'btn btn-block';
  completeBtn.textContent = 'Finish room & get reward';
  completeBtn.style.marginTop = '0.5rem';
  completeBtn.disabled = room.phase !== 'alive';
  completeBtn.onclick = () => {
    const current = getCurrentRoom(state);
    if (current.phase === 'alive') {
      stopGOL();
      updateRoom(roomComplete(current));
      buildSidebar();
      paint();
    }
  };
  btnWrap.append(startBtn, completeBtn);
  statusPanel.append(btnWrap);
  sidebar.appendChild(statusPanel);

  if (state.lastEncounter && state.lastEncounter.mobs.length > 0) {
    const encPanel = document.createElement('div');
    encPanel.className = 'panel encounter-panel';
    const names = state.lastEncounter.mobs.map((m) => m.name).join(', ');
    encPanel.innerHTML = `
      <h3>Last encounter</h3>
      <p class="encounter-text">Defeated: ${names}</p>
      <p class="encounter-text">+${state.lastEncounter.xp} XP · Took ${state.lastEncounter.damage} damage</p>
    `;
    sidebar.appendChild(encPanel);
  }

  const charPanel = document.createElement('div');
  charPanel.className = 'panel';
  const c = applyItemBonuses(state.character, state.inventory);
  charPanel.innerHTML = `
    <h3>Character</h3>
    <div class="stat-row"><span>Level</span><span>${c.level}</span></div>
    <div class="stat-row"><span>XP</span><span>${c.xp} / ${c.xpToNext}</span></div>
    <div class="stat-row"><span>HP</span><span>${state.character.hp} / ${c.maxHp}</span></div>
    <div class="health-bar"><div class="health-fill" style="width: ${c.maxHp > 0 ? (100 * state.character.hp) / c.maxHp : 0}%"></div></div>
  `;
  sidebar.appendChild(charPanel);

  const invPanel = document.createElement('div');
  invPanel.className = 'panel';
  invPanel.innerHTML = '<h3>Inventory</h3>';
  const invList = document.createElement('ul');
  invList.className = 'inventory-list';
  if (state.inventory.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No items yet. Complete rooms for rewards.';
    li.style.color = 'var(--muted)';
    invList.appendChild(li);
  } else {
    for (const { def, count } of state.inventory) {
      const li = document.createElement('li');
      li.textContent = `${def.name}${count > 1 ? ` ×${count}` : ''}`;
      li.title = def.description;
      invList.appendChild(li);
    }
  }
  invPanel.appendChild(invList);
  sidebar.appendChild(invPanel);

  const legendPanel = document.createElement('div');
  legendPanel.className = 'panel legend-panel';
  const legendTitle = document.createElement('h3');
  legendTitle.textContent = 'Mob legend';
  legendTitle.title = 'Creatures you may meet in the grid';
  legendPanel.appendChild(legendTitle);
  const legendList = document.createElement('ul');
  legendList.className = 'legend-list';
  for (const mob of MOB_TYPES) {
    const li = document.createElement('li');
    li.className = 'legend-entry';
    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.backgroundColor = mob.color;
    const content = document.createElement('div');
    content.className = 'legend-content';
    const label = document.createElement('span');
    label.className = 'legend-label';
    label.textContent = `${mob.name} (${mob.damage} dmg · ${mob.xpReward} XP)`;
    const behavior = document.createElement('p');
    behavior.className = 'legend-behavior';
    behavior.textContent = mob.behavior;
    content.append(label, behavior);
    li.append(swatch, content);
    legendList.appendChild(li);
  }
  legendPanel.appendChild(legendList);
  sidebar.appendChild(legendPanel);
}

function updateRoom(room: RoomState): void {
  const rooms = [...state.rooms];
  rooms[state.currentRoomIndex] = room;
  state = { ...state, rooms };
}

function startGOL(): void {
  stopGOL();
  golInterval = window.setInterval(() => {
    const room = getCurrentRoom(state);
    if (room.phase !== 'alive') return;
    const next = roomTick(room);
    updateRoom(next);
    buildSidebar();
    paint();
    if (next.stable) stopGOL();
  }, GOL_MS);
}

function stopGOL(): void {
  if (golInterval != null) {
    clearInterval(golInterval);
    golInterval = null;
  }
}

function paint(): void {
  const room = getCurrentRoom(state);
  const { rows, cols } = getRoomGridSize(room);
  const ctx = roomCanvas.getContext('2d')!;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, roomCanvas.width, roomCanvas.height);
  ctx.restore();
  ctx.save();
  ctx.translate(layout.offsetX, layout.offsetY);
  renderGrid(
    ctx,
    room.grid,
    room.mobGrid,
    MOB_TYPES,
    room.phase,
    layout.cellW,
    layout.cellH,
    room.phase === 'edit' || layout.cellW >= 14
  );
  ctx.restore();
}

function resize(): void {
  const wrap = roomCanvas.parentElement!;
  const rect = wrap.getBoundingClientRect();
  const room = getCurrentRoom(state);
  const { rows, cols } = getRoomGridSize(room);
  roomCanvas.width = rect.width;
  roomCanvas.height = rect.height;
  layout = fitGridInCanvas(roomCanvas, rows, cols, 22);
  paint();
}

function onCanvasClick(e: MouseEvent): void {
  const room = getCurrentRoom(state);
  if (room.phase !== 'edit' || room.changesLeft < 1) return;
  const { rows, cols } = getRoomGridSize(room);
  const hit = hitTest(
    layout.offsetX,
    layout.offsetY,
    layout.cellW,
    layout.cellH,
    rows,
    cols,
    e.clientX,
    e.clientY,
    roomCanvas
  );
  if (hit) {
    updateRoom(roomToggleCell(room, hit.row, hit.col));
    paint();
  }
}

// --- Mount
const layoutDiv = document.createElement('div');
layoutDiv.className = 'game-layout';
const canvasWrap = document.createElement('div');
canvasWrap.className = 'room-canvas-wrap';
canvasWrap.appendChild(roomCanvas);
layoutDiv.appendChild(header);
layoutDiv.appendChild(canvasWrap);
layoutDiv.appendChild(sidebar);
app.appendChild(layoutDiv);

buildHeader();
buildSidebar();
resize();
paint();

roomCanvas.addEventListener('click', onCanvasClick);
window.addEventListener('resize', resize);
