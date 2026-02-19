import { createUnit, type UnitData } from './Unit';
import type { UnitClass } from './UnitClasses';

export function createPlayerUnit(
  id: string,
  name: string,
  unitClass: UnitClass,
  level: number,
  gridX: number,
  gridY: number
): UnitData {
  return createUnit(id, name, unitClass, 'player', level, gridX, gridY);
}

export function createEnemyUnit(
  id: string,
  name: string,
  unitClass: UnitClass,
  level: number,
  gridX: number,
  gridY: number
): UnitData {
  return createUnit(id, name, unitClass, 'enemy', level, gridX, gridY);
}

export function createAllyUnit(
  id: string,
  name: string,
  unitClass: UnitClass,
  level: number,
  gridX: number,
  gridY: number
): UnitData {
  return createUnit(id, name, unitClass, 'ally', level, gridX, gridY);
}

export function createBossUnit(
  id: string,
  name: string,
  unitClass: UnitClass,
  level: number,
  gridX: number,
  gridY: number
): UnitData {
  const base = createEnemyUnit(id, name, unitClass, level, gridX, gridY);
  const maxHp = base.maxHp * 3;

  return {
    ...base,
    maxHp,
    currentHp: maxHp,
    atk: base.atk * 2,
    def: base.def * 2,
    spd: base.spd * 2,
    eva: base.eva * 2
  };
}
