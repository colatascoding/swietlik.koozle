import type { Grid2D, RoomPhase } from './types.js';

const CELL_COLOR_ALIVE = '#7ee8a8';
const CELL_COLOR_DEAD = '#0d0f14';
const GRID_LINE = '#1e232e';
const EDIT_OVERLAY = 'rgba(126, 232, 168, 0.15)';

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  grid: Grid2D,
  phase: RoomPhase,
  cellW: number,
  cellH: number,
  drawGridLines: boolean
): void {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  ctx.fillStyle = CELL_COLOR_DEAD;
  ctx.fillRect(0, 0, cols * cellW, rows * cellH);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;
      if (grid[r][c] === 1) {
        ctx.fillStyle = CELL_COLOR_ALIVE;
        ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
      }
    }
  }

  if (drawGridLines) {
    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 1;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(cols * cellW, r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, rows * cellH);
      ctx.stroke();
    }
  }

  if (phase === 'edit') {
    ctx.fillStyle = EDIT_OVERLAY;
    ctx.fillRect(0, 0, cols * cellW, rows * cellH);
  }
}

export function fitGridInCanvas(
  canvas: HTMLCanvasElement,
  rows: number,
  cols: number,
  maxCellSize: number = 20
): { cellW: number; cellH: number; offsetX: number; offsetY: number } {
  const w = canvas.width;
  const h = canvas.height;
  const colsSafe = Math.max(1, cols);
  const rowsSafe = Math.max(1, rows);
  const cellW = Math.max(1, Math.min(maxCellSize, Math.floor(w / colsSafe), Math.floor(h / rowsSafe)));
  const cellH = cellW;
  const totalW = cols * cellW;
  const totalH = rows * cellH;
  return {
    cellW,
    cellH,
    offsetX: (w - totalW) / 2,
    offsetY: (h - totalH) / 2,
  };
}

export function hitTest(
  offsetX: number,
  offsetY: number,
  cellW: number,
  cellH: number,
  rows: number,
  cols: number,
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): { row: number; col: number } | null {
  if (cellW <= 0 || cellH <= 0) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX - offsetX;
  const y = (clientY - rect.top) * scaleY - offsetY;
  const col = Math.floor(x / cellW);
  const row = Math.floor(y / cellH);
  if (row >= 0 && row < rows && col >= 0 && col < cols) return { row, col };
  return null;
}
