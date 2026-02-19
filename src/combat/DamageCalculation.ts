import { COMBAT_CONFIG } from '../config';
import { getDefenseBonus, getEvasionBonus } from '../grid/TerrainEffects';
import type { TerrainType } from '../grid/TileTypes';
import { getEffectiveStats, type UnitData } from '../units/Unit';
import { clamp } from '../utils/MathUtils';

export interface CombatResult {
  damage: number;
  hit: boolean;
  crit: boolean;
  hitChance: number;
  critChance: number;
}

interface DamageParts {
  baseDamage: number;
  hitChance: number;
  critChance: number;
}

function getDamageParts(
  attacker: UnitData,
  defender: UnitData,
  terrainType: TerrainType,
  abilityMultiplier?: number,
  ignoreTerrainDef?: boolean
): DamageParts {
  const attackerEffective = getEffectiveStats(attacker);
  const defenderEffective = getEffectiveStats(defender);
  const terrainDefBonus = ignoreTerrainDef ? 0 : getDefenseBonus(terrainType);
  const terrainEva = getEvasionBonus(terrainType);

  const raw = attackerEffective.atk - defenderEffective.def - terrainDefBonus;
  const baseDamage = Math.max(1, raw);
  const hitChance = clamp(
    COMBAT_CONFIG.baseHitChance +
      (attackerEffective.spd - defenderEffective.spd) * COMBAT_CONFIG.spdHitMod -
      terrainEva -
      defenderEffective.eva,
    0.05,
    0.99
  );
  const critChance = clamp(attackerEffective.spd * COMBAT_CONFIG.critSpdMod, 0.01, 0.5);

  const scaledDamage =
    typeof abilityMultiplier === 'number' ? Math.floor(baseDamage * abilityMultiplier) : baseDamage;

  return {
    baseDamage: Math.max(0, scaledDamage),
    hitChance,
    critChance
  };
}

export function calcDamage(
  attacker: UnitData,
  defender: UnitData,
  terrainType: TerrainType,
  abilityMultiplier?: number,
  ignoreTerrainDef?: boolean
): CombatResult {
  const { baseDamage, hitChance, critChance } = getDamageParts(
    attacker,
    defender,
    terrainType,
    abilityMultiplier,
    ignoreTerrainDef
  );

  const hit = Math.random() < hitChance;
  if (!hit) {
    return {
      damage: 0,
      hit: false,
      crit: false,
      hitChance,
      critChance
    };
  }

  const crit = Math.random() < critChance;
  const damage = crit ? Math.floor(baseDamage * COMBAT_CONFIG.critMultiplier) : baseDamage;

  return {
    damage,
    hit: true,
    crit,
    hitChance,
    critChance
  };
}

export function calcDamagePreview(
  attacker: UnitData,
  defender: UnitData,
  terrainType: TerrainType,
  abilityMultiplier?: number,
  ignoreTerrainDef?: boolean
): { minDamage: number; maxDamage: number; hitChance: number; critChance: number } {
  const { baseDamage, hitChance, critChance } = getDamageParts(
    attacker,
    defender,
    terrainType,
    abilityMultiplier,
    ignoreTerrainDef
  );

  return {
    minDamage: 0,
    maxDamage: Math.floor(baseDamage * COMBAT_CONFIG.critMultiplier),
    hitChance,
    critChance
  };
}
