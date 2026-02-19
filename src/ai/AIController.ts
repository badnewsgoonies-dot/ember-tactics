import { decideAbilityUse } from './AbilityAI';
import { getAIConfig, getDefaultPersonality } from './AIPersonality';
import { decideMovePosition } from './MovementAI';
import { rankTargets } from './ThreatAssessment';
import { selectTarget } from './TargetPriority';
import { getMovementRange } from '../grid/Pathfinding';
import type { TerrainType } from '../grid/TileTypes';
import type { UnitData } from '../units/Unit';
import { gridDistance } from '../utils/MathUtils';

// class AIController equivalent implemented as pure functions in this module.
export interface AIAction {
  unitId: string;
  moveToX: number;
  moveToY: number;
  actionType: 'attack' | 'ability' | 'wait';
  targetUnitId?: string;
  abilityName?: string;
  abilityTargetX?: number;
  abilityTargetY?: number;
}

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

function replaceUnit(units: UnitData[], nextUnit: UnitData): UnitData[] {
  return units.map((unit) => (unit.id === nextUnit.id ? nextUnit : unit));
}

function getUnitById(units: UnitData[], id: string): UnitData | undefined {
  return units.find((unit) => unit.id === id);
}

export function planAITurn(
  aiUnits: UnitData[],
  playerUnits: UnitData[],
  allUnits: UnitData[],
  grid: TerrainType[][]
): AIAction[] {
  let simulatedUnits = allUnits.map((unit) => ({ ...unit }));
  const livePlayerIds = new Set(playerUnits.filter((unit) => unit.isAlive).map((unit) => unit.id));

  const actionableUnits = aiUnits
    .filter((unit) => unit.isAlive && !unit.hasActed)
    .map((unit) => {
      const enemies = playerUnits.filter((enemy) => enemy.isAlive);
      const threats = rankTargets(unit, enemies, grid);
      const highestThreat = threats[0]?.score ?? -1;

      return {
        unit,
        highestThreat
      };
    })
    .sort((a, b) => b.highestThreat - a.highestThreat || b.unit.spd - a.unit.spd);

  const actions: AIAction[] = [];

  for (const entry of actionableUnits) {
    const currentUnit = getUnitById(simulatedUnits, entry.unit.id);
    if (!currentUnit || !currentUnit.isAlive || currentUnit.hasActed) {
      continue;
    }

    const personality = getDefaultPersonality(currentUnit.unitClass);
    const config = getAIConfig(personality);

    const currentEnemies = simulatedUnits.filter((unit) => unit.isAlive && livePlayerIds.has(unit.id));
    const nearestEnemyDistance = currentEnemies.reduce((min, enemy) => {
      return Math.min(min, gridDistance(currentUnit.gridX, currentUnit.gridY, enemy.gridX, enemy.gridY));
    }, Number.POSITIVE_INFINITY);

    const blockedTiles = new Set(
      simulatedUnits
        .filter((unit) => unit.isAlive && unit.id !== currentUnit.id)
        .map((unit) => tileKey(unit.gridX, unit.gridY))
    );

    const movementRange = getMovementRange(
      currentUnit.gridX,
      currentUnit.gridY,
      currentUnit.mov,
      grid,
      (x, y) => blockedTiles.has(tileKey(x, y))
    );

    const shouldEngage = config.aggroRange >= 99 || nearestEnemyDistance <= config.aggroRange;

    const selectedTarget = shouldEngage
      ? selectTarget(currentUnit, currentEnemies, grid, movementRange)
      : null;

    const moveDecision = decideMovePosition(
      currentUnit,
      selectedTarget?.targetUnit ?? null,
      simulatedUnits,
      grid,
      movementRange
    );

    const movedUnit: UnitData = {
      ...currentUnit,
      gridX: moveDecision.targetX,
      gridY: moveDecision.targetY,
      hasMoved: true
    };

    simulatedUnits = replaceUnit(simulatedUnits, movedUnit);

    const enemiesAfterMove = simulatedUnits.filter((unit) => unit.isAlive && livePlayerIds.has(unit.id));
    const attackFromCurrentTile = selectTarget(movedUnit, enemiesAfterMove, grid, [
      { x: movedUnit.gridX, y: movedUnit.gridY }
    ]);

    if (attackFromCurrentTile && attackFromCurrentTile.reason.startsWith('kill-shot')) {
      const actedUnit: UnitData = { ...movedUnit, hasActed: true };
      simulatedUnits = replaceUnit(simulatedUnits, actedUnit);

      actions.push({
        unitId: movedUnit.id,
        moveToX: movedUnit.gridX,
        moveToY: movedUnit.gridY,
        actionType: 'attack',
        targetUnitId: attackFromCurrentTile.targetId
      });

      continue;
    }

    const abilityDecision = decideAbilityUse(movedUnit, simulatedUnits, grid);

    if (abilityDecision) {
      const actedUnit: UnitData = { ...movedUnit, hasActed: true };
      simulatedUnits = replaceUnit(simulatedUnits, actedUnit);

      actions.push({
        unitId: movedUnit.id,
        moveToX: movedUnit.gridX,
        moveToY: movedUnit.gridY,
        actionType: 'ability',
        abilityName: abilityDecision.abilityName,
        abilityTargetX: abilityDecision.targetX,
        abilityTargetY: abilityDecision.targetY
      });

      continue;
    }

    const attackTarget = attackFromCurrentTile ??
      selectTarget(movedUnit, enemiesAfterMove, grid, [{ x: movedUnit.gridX, y: movedUnit.gridY }]);

    if (attackTarget) {
      const actedUnit: UnitData = { ...movedUnit, hasActed: true };
      simulatedUnits = replaceUnit(simulatedUnits, actedUnit);

      actions.push({
        unitId: movedUnit.id,
        moveToX: movedUnit.gridX,
        moveToY: movedUnit.gridY,
        actionType: 'attack',
        targetUnitId: attackTarget.targetId
      });

      continue;
    }

    const waitedUnit: UnitData = { ...movedUnit, hasActed: true };
    simulatedUnits = replaceUnit(simulatedUnits, waitedUnit);

    actions.push({
      unitId: movedUnit.id,
      moveToX: movedUnit.gridX,
      moveToY: movedUnit.gridY,
      actionType: 'wait'
    });
  }

  return actions;
}
