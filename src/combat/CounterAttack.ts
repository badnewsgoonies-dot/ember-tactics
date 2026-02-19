import { COMBAT_CONFIG } from '../config';
import type { TerrainType } from '../grid/TileTypes';
import type { UnitData } from '../units/Unit';
import { getClassDef } from '../units/UnitClasses';
import { gridDistance } from '../utils/MathUtils';
import { calcDamagePreview, type CombatResult } from './DamageCalculation';

export function canCounter(defender: UnitData, attackRange: number): boolean {
  if (!defender.isAlive) {
    return false;
  }

  return getClassDef(defender.unitClass).canCounter(attackRange);
}

export function getCounterDamagePreview(
  attacker: UnitData,
  defender: UnitData,
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType
): CombatResult | null {
  const attackRange = gridDistance(attacker.gridX, attacker.gridY, defender.gridX, defender.gridY);
  if (!canCounter(defender, attackRange)) {
    return null;
  }

  const preview = calcDamagePreview(defender, attacker, attackerTerrain);
  const nonCritDamage = Math.floor(preview.maxDamage / COMBAT_CONFIG.critMultiplier);
  const expectedOnHit =
    nonCritDamage * (1 - preview.critChance) + preview.maxDamage * preview.critChance;
  const damage = Math.floor(expectedOnHit * preview.hitChance);

  return {
    damage,
    hit: preview.hitChance >= 0.5,
    crit: false,
    hitChance: preview.hitChance,
    critChance: preview.critChance
  };
}
