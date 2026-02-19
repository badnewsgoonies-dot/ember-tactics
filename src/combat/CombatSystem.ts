import type { TerrainType } from '../grid/TileTypes';
import { damageUnit, type UnitData } from '../units/Unit';
import { getClassDef } from '../units/UnitClasses';
import { gridDistance } from '../utils/MathUtils';
import { calcDamage, type CombatResult } from './DamageCalculation';

export interface CombatEvent {
  attackerId: string;
  defenderId: string;
  result: CombatResult;
  counterResult?: CombatResult;
}

export function resolveCombat(
  attacker: UnitData,
  defender: UnitData,
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType,
  abilityMultiplier?: number,
  ignoreTerrainDef?: boolean
): CombatEvent {
  const result = calcDamage(attacker, defender, defenderTerrain, abilityMultiplier, ignoreTerrainDef);
  const damagedDefender = damageUnit(defender, result.damage);

  const attackRange = gridDistance(attacker.gridX, attacker.gridY, defender.gridX, defender.gridY);
  const defenderCanCounter = getClassDef(defender.unitClass).canCounter(attackRange);

  let counterResult: CombatResult | undefined;
  if (damagedDefender.isAlive && defenderCanCounter) {
    counterResult = calcDamage(damagedDefender, attacker, attackerTerrain);
    damageUnit(attacker, counterResult.damage);
  }

  return {
    attackerId: attacker.id,
    defenderId: defender.id,
    result,
    counterResult
  };
}
