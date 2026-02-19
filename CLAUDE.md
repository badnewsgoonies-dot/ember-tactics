# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start Vite dev server with HMR
pnpm build        # Type-check (tsc) + Vite production build
pnpm test         # Run all tests (vitest run)
pnpm preview      # Preview production build locally
```

Run a single test file:
```bash
npx vitest run src/__tests__/combat.test.ts
```

## Project Overview

Ember Tactics is a tactical RPG browser game built with **Phaser 3 + TypeScript + Vite**. It features a 15-level campaign with turn-based combat on a tile grid, 6 unit classes, AI opponents, and a save/load system.

## Architecture

### Pure Logic vs Phaser Rendering

The core architectural principle is **separation of pure game logic from Phaser rendering**. Pure logic modules are stateless functions that take data and return results — they don't depend on Phaser and are directly testable. Phaser scene classes handle rendering, input, and animation by calling into the pure logic layer.

**Pure logic** (in `src/grid/`, `src/combat/`, `src/units/`, `src/turn/TurnManager.ts`, `src/ai/`, `src/levels/`):
- `GridManager` — terrain grid state, bounds checking, coordinate conversion
- `Pathfinding` — A* algorithm, movement/attack range calculation
- `DamageCalculation` / `CombatSystem` — combat resolution with hit/crit/counter
- `AbilitySystem` + `AbilityDefs` — 8 abilities with cost, cooldown, AoE
- `TurnManager` — phase cycling (player → enemy → environment), unit completion
- `AIController` — decision loop: move → ability/attack → wait, with personality system
- `ObjectiveSystem` / `ReinforcementSystem` — win/loss conditions, enemy spawns

**Phaser scenes** (in `src/scenes/`):
- `BattleScene` — main gameplay orchestrator, integrates all systems (~42KB, largest file)
- `TitleScene` → `LevelSelectScene` → `DialogueScene` → `BattleScene` → `VictoryScene`/`DefeatScene`

### Data-Driven Design

Game entities are plain TypeScript interfaces/objects, not classes with behavior:
- `UnitData` — stats, position, team, status effects, movement/action flags
- `TerrainType[][]` — 2D grid with move cost, defense/evasion bonuses
- `LevelDef` — map data, unit placements, objectives, reinforcements, dialogue
- `AbilityDef` — cost, cooldown, range, AoE radius, damage/heal multipliers
- `StatusEffect` — type, duration, numeric modifiers

All unit class base stats and growth rates are in `src/config.ts` (`UNIT_STATS`). Combat formulas use `COMBAT_CONFIG` from the same file.

### Key Configuration

Grid: 15×10 tiles, 64px each (960×640 canvas). Defined in `src/config.ts`.

### Turn Flow

Each round cycles through three phases:
1. **Player Phase** — player/ally units take actions via `InputHandler` + `ActionMenu`
2. **Enemy Phase** — AI units execute via `AIController` (sorted by threat, then speed)
3. **Environment Phase** — fire terrain damage, status effect ticks

### AI System

AI personalities (Aggressive, Defensive, Support) in `src/ai/AIPersonality.ts` control aggro ranges and behavior. The AI simulates moves before committing (`AIController`), using `TargetPriority` and `ThreatAssessment` to score targets.

### Levels

Levels 1-5 maps in `src/levels/MapData.ts`. Levels 6-15 each have their own `level{N}-data.ts` file with both map and level definition. All level definitions collected in `src/levels/LevelDefs.ts`.

## Testing

Tests live in `src/__tests__/` (12 files, 89 tests). They test pure logic only — no Phaser mocking needed. Vitest globals are enabled so `describe`/`test`/`expect` don't need imports. Randomness in combat tests is controlled via `vi.spyOn(Math, 'random')`.

## TypeScript

Strict mode is enabled. `tsc` runs as type-check only (`noEmit: true`) — Vite handles bundling. Test files are excluded from `tsconfig.json`.
