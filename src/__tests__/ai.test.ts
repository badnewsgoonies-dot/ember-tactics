import { describe, expect, test } from 'vitest';
import { decideAbilityUse } from '../ai/AbilityAI';
import { planAITurn } from '../ai/AIController';
import { decideMovePosition } from '../ai/MovementAI';
import { selectTarget } from '../ai/TargetPriority';
import { getMovementRange } from '../grid/Pathfinding';
import type { TerrainType } from '../grid/TileTypes';
import { createUnit, type UnitData } from '../units/Unit';
import { gridDistance } from '../utils/MathUtils';

function makeGrid(cols = 8, rows = 8, fill: TerrainType = 'Plains'): TerrainType[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

function withHp(unit: UnitData, hp: number): UnitData {
  return {
    ...unit,
    currentHp: hp,
    isAlive: hp > 0
  };
}

describe('AI behavior', () => {
  test('Kill shot priority', () => {
    const grid = makeGrid();
    const aiArcher = createUnit('ai-archer', 'AI Archer', 'Archer', 'enemy', 1, 1, 1);
    const playerMage = withHp(createUnit('p-mage', 'Player Mage', 'Mage', 'player', 1, 3, 1), 1);

    const actions = planAITurn([aiArcher], [playerMage], [aiArcher, playerMage], grid);

    expect(actions).toHaveLength(1);
    expect(actions[0]?.actionType).toBe('attack');
    expect(actions[0]?.targetUnitId).toBe(playerMage.id);
  });

  test('Healer priority', () => {
    const grid = makeGrid();
    const aiKnight = createUnit('ai-knight', 'AI Knight', 'Knight', 'enemy', 1, 1, 1);
    const playerHealer = createUnit('p-healer', 'Player Healer', 'Healer', 'player', 1, 2, 1);
    const playerKnight = createUnit('p-knight', 'Player Knight', 'Knight', 'player', 1, 1, 2);

    const actions = planAITurn(
      [aiKnight],
      [playerHealer, playerKnight],
      [aiKnight, playerHealer, playerKnight],
      grid
    );

    expect(actions[0]?.actionType).toBe('attack');
    expect(actions[0]?.targetUnitId).toBe(playerHealer.id);
  });

  test('Never waste turn on kill', () => {
    const grid = makeGrid();
    const aiKnight = createUnit('ai-knight', 'AI Knight', 'Knight', 'enemy', 1, 1, 1);
    const playerMage = withHp(createUnit('p-mage', 'Player Mage', 'Mage', 'player', 1, 2, 1), 1);

    const actions = planAITurn([aiKnight], [playerMage], [aiKnight, playerMage], grid);

    expect(actions[0]?.actionType).toBe('attack');
    expect(actions[0]?.targetUnitId).toBe(playerMage.id);
  });

  test('AI healer heals wounded ally', () => {
    const grid = makeGrid();
    const aiHealer = createUnit('ai-healer', 'AI Healer', 'Healer', 'enemy', 1, 1, 1);
    const allyKnight = withHp(createUnit('ally-knight', 'Ally Knight', 'Knight', 'enemy', 1, 2, 1), 5);
    const playerKnight = createUnit('p-knight', 'Player Knight', 'Knight', 'player', 1, 7, 7);

    const actions = planAITurn([aiHealer], [playerKnight], [aiHealer, allyKnight, playerKnight], grid);

    expect(actions[0]?.actionType).toBe('ability');
    expect(actions[0]?.abilityName).toBe('Heal');
    expect(actions[0]?.abilityTargetX).toBe(allyKnight.gridX);
    expect(actions[0]?.abilityTargetY).toBe(allyKnight.gridY);
  });

  test('Ranged units prefer max range', () => {
    const grid = makeGrid();
    const aiArcher = createUnit('ai-archer', 'AI Archer', 'Archer', 'enemy', 1, 1, 1);
    const playerKnight = createUnit('p-knight', 'Player Knight', 'Knight', 'player', 1, 5, 1);
    const isBlocked = (x: number, y: number): boolean => x === playerKnight.gridX && y === playerKnight.gridY;

    const movementRange = getMovementRange(aiArcher.gridX, aiArcher.gridY, aiArcher.mov, grid, isBlocked);
    const decision = decideMovePosition(
      aiArcher,
      playerKnight,
      [aiArcher, playerKnight],
      grid,
      movementRange
    );

    expect(gridDistance(decision.targetX, decision.targetY, playerKnight.gridX, playerKnight.gridY)).toBe(3);
  });

  test('Wounded retreat', () => {
    const grid = makeGrid();
    const aiKnight = withHp(createUnit('ai-knight', 'AI Knight', 'Knight', 'enemy', 1, 2, 2), 6);
    const allyKnight = createUnit('ally-knight', 'Ally Knight', 'Knight', 'enemy', 1, 1, 2);
    const playerCavalier = createUnit('p-cav', 'Player Cavalier', 'Cavalier', 'player', 1, 3, 2);

    const blocked = new Set<string>([
      `${allyKnight.gridX},${allyKnight.gridY}`,
      `${playerCavalier.gridX},${playerCavalier.gridY}`
    ]);
    const movementRange = getMovementRange(aiKnight.gridX, aiKnight.gridY, aiKnight.mov, grid, (x, y) => {
      return blocked.has(`${x},${y}`);
    });

    const decision = decideMovePosition(
      aiKnight,
      playerCavalier,
      [aiKnight, allyKnight, playerCavalier],
      grid,
      movementRange
    );

    const startDistance = gridDistance(aiKnight.gridX, aiKnight.gridY, playerCavalier.gridX, playerCavalier.gridY);
    const endDistance = gridDistance(decision.targetX, decision.targetY, playerCavalier.gridX, playerCavalier.gridY);

    expect(endDistance).toBeGreaterThan(startDistance);
    expect(decision.reason).toContain('retreat');
  });

  test('AoE on 2+ targets', () => {
    const grid = makeGrid();
    const aiMage = createUnit('ai-mage', 'AI Mage', 'Mage', 'enemy', 1, 2, 2);
    const player1 = createUnit('p1', 'Player One', 'Knight', 'player', 1, 4, 2);
    const player2 = createUnit('p2', 'Player Two', 'Archer', 'player', 1, 4, 3);

    const clusteredDecision = decideAbilityUse(aiMage, [aiMage, player1, player2], grid);
    const singleDecision = decideAbilityUse(aiMage, [aiMage, player1], grid);

    expect(clusteredDecision?.abilityName).toBe('Fireball');
    expect(singleDecision).toBeNull();
  });

  test('Squishy target over tank', () => {
    const grid = makeGrid();
    const aiKnight = createUnit('ai-knight', 'AI Knight', 'Knight', 'enemy', 1, 1, 1);
    const playerMage = createUnit('p-mage', 'Player Mage', 'Mage', 'player', 1, 2, 1);
    const playerTank = createUnit('p-tank', 'Player Tank', 'Knight', 'player', 1, 1, 2);

    const target = selectTarget(aiKnight, [playerMage, playerTank], grid, [{ x: 1, y: 1 }]);

    expect(target?.targetId).toBe(playerMage.id);
  });
});
