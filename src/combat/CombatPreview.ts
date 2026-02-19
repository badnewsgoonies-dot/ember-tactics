import { COMBAT_CONFIG } from '../config';
import type { TerrainType } from '../grid/TileTypes';
import type { UnitData } from '../units/Unit';
import { gridDistance } from '../utils/MathUtils';
import { canCounter } from './CounterAttack';
import { calcDamagePreview } from './DamageCalculation';

export interface PreviewData {
  attackerName: string;
  defenderName: string;
  attackerHp: number;
  defenderHp: number;
  estimatedDamage: number;
  hitChance: number;
  critChance: number;
  canCounter: boolean;
  counterDamage: number;
  counterHitChance: number;
}

function estimateExpectedDamage(preview: {
  minDamage: number;
  maxDamage: number;
  hitChance: number;
  critChance: number;
}): number {
  const nonCritDamage = Math.floor(preview.maxDamage / COMBAT_CONFIG.critMultiplier);
  const expectedOnHit = nonCritDamage * (1 - preview.critChance) + preview.maxDamage * preview.critChance;
  return Math.floor(expectedOnHit * preview.hitChance);
}

export class CombatPreview {
  static getPreview = getCombatPreview;
}

export function getCombatPreview(
  attacker: UnitData,
  defender: UnitData,
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType,
  abilityMultiplier?: number,
  ignoreTerrainDef?: boolean
): PreviewData {
  const attackPreview = calcDamagePreview(
    attacker,
    defender,
    defenderTerrain,
    abilityMultiplier,
    ignoreTerrainDef
  );
  const attackRange = gridDistance(attacker.gridX, attacker.gridY, defender.gridX, defender.gridY);
  const defenderCanCounter = canCounter(defender, attackRange);

  let counterDamage = 0;
  let counterHitChance = 0;

  if (defenderCanCounter) {
    const counterPreview = calcDamagePreview(defender, attacker, attackerTerrain);
    counterDamage = estimateExpectedDamage(counterPreview);
    counterHitChance = counterPreview.hitChance;
  }

  return {
    attackerName: attacker.name,
    defenderName: defender.name,
    attackerHp: attacker.currentHp,
    defenderHp: defender.currentHp,
    estimatedDamage: estimateExpectedDamage(attackPreview),
    hitChance: attackPreview.hitChance,
    critChance: attackPreview.critChance,
    canCounter: defenderCanCounter,
    counterDamage,
    counterHitChance
  };
}
