import type { UnitData } from '../units/Unit';
import { getClassDef } from '../units/UnitClasses';

export function xpForDamage(damageDealt: number, defenderLevel: number): number {
  const safeDamage = Math.max(0, Math.floor(damageDealt));
  const levelBonus = Math.max(0, defenderLevel - 1) * 0.1;
  return Math.max(1, Math.floor(safeDamage * (1 + levelBonus)));
}

export function xpForKill(defenderLevel: number, attackerLevel: number): number {
  const baseXp = 20 + Math.max(1, defenderLevel) * 5;
  const levelDelta = defenderLevel - attackerLevel;
  const deltaBonus = levelDelta >= 0 ? levelDelta * 8 : levelDelta * 3;
  return Math.max(5, Math.floor(baseXp + deltaBonus));
}

export function xpToNextLevel(currentLevel: number): number {
  return 100 * Math.max(1, Math.floor(currentLevel));
}

export function applyLevelUp(unit: UnitData): UnitData {
  if (unit.level >= 10) {
    return {
      ...unit,
      level: 10
    };
  }

  const classDef = getClassDef(unit.unitClass);
  const hpGain = classDef.growthHp;
  const atkGain = classDef.growthAtk;
  const defGain = classDef.growthDef;
  const spdGain = classDef.growthSpd;

  const newMaxHp = unit.maxHp + hpGain;

  return {
    ...unit,
    level: unit.level + 1,
    maxHp: newMaxHp,
    currentHp: Math.min(newMaxHp, unit.currentHp + hpGain),
    atk: unit.atk + atkGain,
    def: unit.def + defGain,
    spd: unit.spd + spdGain
  };
}

export function checkLevelUp(unit: UnitData): { leveled: boolean; newUnit: UnitData } {
  if (unit.level >= 10) {
    return {
      leveled: false,
      newUnit: {
        ...unit,
        level: 10
      }
    };
  }

  let next = { ...unit };
  let leveled = false;

  while (next.level < 10) {
    const neededXp = xpToNextLevel(next.level);
    if (next.xp < neededXp) {
      break;
    }

    next = {
      ...next,
      xp: next.xp - neededXp
    };
    next = applyLevelUp(next);
    leveled = true;
  }

  return {
    leveled,
    newUnit: next
  };
}
