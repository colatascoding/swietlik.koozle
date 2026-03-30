# Game codebase review — external architect handoff

**Audit scope:** Read-only scan of repository `swietlik-koozle` as of review date. **No code was modified.**

**Critical correction:** This repository is **not** a Phaser.js game. It is a **vanilla TypeScript** application using **HTML5 Canvas 2D** for the grid, **Vite** for bundling, and **imperative DOM** for UI. Sections below that reference Phaser are answered as **N/A** with the actual stack described where relevant.

---

## 1. Project Overview (name, one-liner, key stats table)

| Field | Value |
|--------|--------|
| **Package name** | `swietlik-koozle` |
| **Title (HTML)** | Świetlik Koozle — Life & Rooms |
| **One-liner** | Roguelike-style room progression where each room is a cellular-automaton grid with typed “mob” cells, step-by-step simulation, and RPG-style character/inventory. |
| **Game engine** | None (Canvas 2D + DOM). **Phaser: not present.** |
| **Language** | TypeScript (strict) |
| **Bundler** | Vite ~6 |
| **Runtime deps (production)** | **None** in `package.json` (only devDependencies: TypeScript, Vite) |
| **Approx. built output size** | ~28 KB total under `dist/` (single small JS + CSS + HTML; no binary assets in tree) |

---

## 2. Directory Structure (tree output)

Two levels deep (source and config only; `node_modules` omitted).

```
swietlik-koozle/
├── dist/                 # Vite build output (generated)
│   ├── index.html
│   └── assets/           # hashed JS + CSS bundles
├── docs/                 # documentation (this file)
├── src/
│   ├── main.ts           # App bootstrap, DOM, canvas, buttons
│   ├── main.css
│   ├── gameState.ts
│   ├── gameOfLife.ts
│   ├── room.ts
│   ├── render.ts
│   ├── character.ts
│   ├── items.ts
│   ├── mobs.ts
│   ├── scenarios.ts
│   └── types.ts
├── index.html            # Dev / Vite entry HTML
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

**Notes:** `public/` is configured in Vite (`publicDir: 'public'`) but **no `public/` directory or assets** were present at audit time. No `README` required for this deliverable.

---

## 3. Tech Stack (table: tool, version, purpose)

| Tool | Version (package.json) | Purpose |
|------|-------------------------|---------|
| **Vite** | ~6.0.0 | Dev server, production bundle, ES modules |
| **TypeScript** | ~5.6.0 | Type-checking (`tsc -b` before build); `noEmit: true`, Vite emits JS |
| **Browser APIs** | — | Canvas 2D, DOM, `MouseEvent`, `window` |

**Engine requirements:** Modern browser with ES modules and Canvas 2D. No WebGL requirement for core gameplay.

---

## 4. Phaser Configuration

**Not applicable.** There is no `phaser` dependency, no `Phaser.Game` config, and no Phaser bootstrapping.

**Actual “game loop” host:** `index.html` loads `/src/main.ts` (dev) or bundled script (prod). `main.ts` creates a `<canvas>`, attaches listeners, and drives updates via **button clicks** and **manual “Step”** (no requestAnimationFrame game loop for simulation; redraw on user actions and resize).

---

## 5. Scene Graph (table: scene name, file path, description)

**Not applicable — Phaser scenes do not exist.**

**Logical UI / state flow (single-page app):** one implicit “screen” with sidebar panels and a canvas. No scene class files.

| Logical unit | File path | Description |
|--------------|-----------|-------------|
| Application shell & UI | `src/main.ts` | Builds layout, wires buttons (Start life, Step, Finish, Next room), canvas click-to-edit, sidebar rebuilds, resize. |
| Global play state | `src/gameState.ts` | `GameState`: rooms array, current room index, character, inventory, `lastEncounter`. |
| Room + grid lifecycle | `src/room.ts` | `RoomState`: grid, mob grid, phase (edit / alive / complete), changes left, stability flag. |
| Cellular automaton | `src/gameOfLife.ts` | Rules parsing, `stepWithMobs`, walls, equality checks, pregenerated grid. |
| Drawing | `src/render.ts` | Canvas draw + hit testing for cells. |
| Character / items | `src/character.ts`, `src/items.ts` | Stats, XP, item modifiers. |
| Mob definitions | `src/mobs.ts` | Mob types, colors, behaviors text, encounter from grid. |
| Scenario bonuses | `src/scenarios.ts` | Bonus items/mobs from room conditions at reward time. |
| Shared types | `src/types.ts` | Cell, stats, item/mob interfaces. |

---

## 6. State & Persistence

| Mechanism | Present? | Details |
|-----------|----------|---------|
| **In-memory state** | Yes | Module-level `let state: GameState` and `selectedPlaceMobIndex` in `main.ts`; updated on user actions. |
| **Phaser registry** | No | N/A |
| **localStorage / sessionStorage** | **No** | Grep over `src/` found no usage. |
| **IndexedDB / cookies** | **No** | Not found. |
| **URL / query state** | **No** | Not used. |

**Implication:** Progress is **lost on full page reload**. No multi-session persistence unless added later.

---

## 7. Input Methods

| Input | Used? | Where configured |
|-------|-------|------------------|
| **Mouse** | Yes | `canvas` `click` → cell toggle (edit phase); button `onclick` handlers in `main.ts`. |
| **Touch** | **Unclear / passive** | No separate touch handlers; mobile may work via synthetic click events depending on browser (not explicitly tested in this audit). |
| **Keyboard** | **No** | No `keydown` / keyboard listeners found in `src/`. |
| **Gamepad** | **No** | Not present. |

---

## 8. Asset Pipeline

| Aspect | Finding |
|--------|---------|
| **Image / texture assets** | **None** in repo. All visuals are Canvas-filled rectangles and CSS. |
| **Audio** | **None** — no `Audio`, Howler, or Phaser sound loader. |
| **Fonts** | System / `Segoe UI` stack in CSS only; no font files. |
| **Loader** | No preloader scene; no asset manifest. |
| **Vite `public/`** | Configured but empty / missing at audit time. |

---

## 9. Build & Output

| Question | Answer |
|----------|--------|
| **Build command** | `npm run build` → `tsc -b && vite build` |
| **Output layout** | `dist/index.html` + `dist/assets/index-*.js` + `dist/assets/index-*.css` (hashed filenames). |
| **Single HTML** | Entry is one HTML file that references bundled assets (not a single inlined file). |
| **Dev server** | `npm run dev` runs `vite`. **Default port: 5173** (Vite default; not overridden in `vite.config.ts`). |
| **Preview** | `vite preview` serves `dist` (default port often 4173 unless configured). |
| **Env vars / dev vs prod** | No `.env` files found in repo root; `vite.config.ts` has no `define` or mode-specific branches. |

**Approximate total asset size:** Built `dist/` ~**28 KB** total (no images/audio). Source is code-only.

**file:// / static hosting:** Production build uses **relative** asset paths in generated HTML (typical Vite output), so it can be opened from a **static file server** or many static hosts. Opening `index.html` directly as `file://` may fail for ES module imports depending on browser security rules — **use a local static server or `vite preview` for reliable behavior.**

---

## 10. Game Design Summary

| Topic | Summary |
|-------|---------|
| **Genre** | Hybrid: **cellular automaton puzzle / roguelike room** with light **RPG** (HP, level, XP, inventory). |
| **Core loop** | Enter room with pregenerated wall-bordered grid → spend limited edits (optional mob type selection) → **Start life** → advance **step-by-step** → **Finish** → encounter resolves from live cells (+ scenario bonuses) → **Next room** adds another room. |
| **Complexity** | **Single-session** in current code (no saves). **Progression** across rooms within one load (rooms list, character growth, items). |
| **Scoring** | **No discrete score.** Progression via **XP**, **level**, and **HP**; encounter damage reduces HP. |
| **Levels** | **Procedural chain of rooms** (not a fixed level map file); effectively **endless** until player stops or HP hits 0 (`phase: 'dead'`). |
| **Session length** | Highly variable; minutes per room depending on stepping and reading UI. No enforced timer. |

---

## 11. Integration Readiness Assessment

| Criterion | Assessment |
|-----------|------------|
| **Launch via `index.html` without server-side app** | **Partially.** Needs either static hosting or `file://` with caveats above. No backend required. |
| **Clean exit / reset without reload** | **Not implemented.** State lives in module scope; there is no exposed `reset()` or menu to reinitialize `GameState`. A launcher would need **full page reload** or **future API** to replace state. |
| **Hook before boot for `window.launcher = { reportScore, exitGame }`** | **Possible today:** inject a script **before** the bundle in `index.html`, or wrap bootstrap. Current code does **not** read any global launcher API. |
| **Reporting scores to external API** | **No score concept.** Would require defining a metric (e.g. rooms cleared, XP, level) and calling `fetch`/postMessage from `giveRoomReward` or `main.ts` after room transitions. |
| **Hardcoded URLs / external APIs** | **None found** in `src/` (no `fetch`, no hardcoded http(s) URLs in audited files). |
| **Offline / local-file** | **Works offline** in principle (no network deps in code). CORS only matters if you add API calls later. |
| **iframe embed** | Likely **fine** for same-origin or static embed; no `X-Frame-Options` set by app (hosting layer may add). No fullscreen API audited. |

---

## 12. Risks & Concerns (anything that would complicate external management or Pi deployment)

1. **Mislabeling as Phaser:** External docs or launchers assuming Phaser APIs will not apply; integration must target **DOM + Canvas + bundled ES module**.
2. **No persistence:** Raspberry Pi kiosks or launchers expecting resume/playtime tracking need **explicit save/load** or IPC.
3. **No programmatic reset:** Hard to integrate with a parent shell that wants “new game” without reload unless code is extended.
4. **Touch / keyboard:** Pi touchscreen may work via clicks; **no dedicated keyboard** controls for accessibility or arcade buttons.
5. **CSP / module:** Strict Content-Security-Policy on parent page must allow **inline hashes** or **nonce** only if modified; default Vite build uses external script files (good for CSP `script-src` with host allowlist).
6. **Dead state:** `phase: 'dead'` exists in types but **no recovery UI** was verified in this audit — confirm whether player is stuck until reload.
7. **Asset growth:** If images/audio are added later, `public/` or `import` pipeline should be documented; currently zero binary weight.
8. **Vite hashed assets:** Launchers linking to old filenames must use **`index.html`** as the single stable entry, not hardcoded JS names.

---

*End of review.*
