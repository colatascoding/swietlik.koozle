# Świetlik Koozle

A roguelike where each room is a **Game of Life** grid. You draw the initial pattern, start the simulation, and when you’re ready you finish the room to earn XP and items. Character progression and items add RPG depth and can change how life evolves (e.g. different birth/survive rules).

## How to play

1. **Edit** — Click on the grid to place or remove cells (green = alive).
2. **Start life** — Run the classic Conway-style automaton. The room “comes alive” from your seed.
3. **Finish room** — Stop the simulation and collect your reward (XP + chance of an item).
4. **Next room** — Continue to a new room and repeat. Items you carry can change Game of Life rules or boost HP/XP.

## Run locally

Install dependencies and build, then open `dist/index.html` or use your dev server. Test the build yourself to confirm everything runs.

## Tech

- **Vite** + **TypeScript**
- Canvas 2D for the life grid
- Modular core: `gameOfLife`, `room`, `character`, `items`, `gameState`, `render`

## Ideas to expand

- Enemies or hazards that appear from certain life patterns
- Room objectives (e.g. “reach 100 living cells” or “stabilize within 20 steps”)
- Meta-progression (unlock new items or rules between runs)
- Permadeath run with multiple floors
