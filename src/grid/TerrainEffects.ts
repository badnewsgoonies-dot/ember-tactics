import { TERRAIN_TABLE } from '../config';
import type { TerrainType } from './TileTypes';

export function getDefenseBonus(terrain: TerrainType): number {
  return TERRAIN_TABLE[terrain].defBonus;
}

export function getEvasionBonus(terrain: TerrainType): number {
  return TERRAIN_TABLE[terrain].evaBonus;
}

export function getTerrainSpecial(terrain: TerrainType): string | null {
  return TERRAIN_TABLE[terrain].special ?? null;
}

export function applyTerrainToRange(
  terrain: TerrainType,
  baseMinRange: number,
  baseMaxRange: number,
  unitClass: string
): [number, number] {
  const normalizedClass = unitClass.toLowerCase();
  let minRange = baseMinRange;
  let maxRange = baseMaxRange;

  if (terrain === 'Forest' && normalizedClass === 'archer') {
    maxRange = Math.max(minRange, maxRange - 1);
  }

  if (terrain === 'Hill' && baseMaxRange > 1) {
    maxRange += 1;
  }

  minRange = Math.max(1, minRange);
  maxRange = Math.max(minRange, maxRange);

  return [minRange, maxRange];
}

export function getFireDamage(): number {
  return 5;
}
