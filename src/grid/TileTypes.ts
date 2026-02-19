import { TERRAIN_TABLE, type TerrainName, type TerrainData } from '../config';

export type TerrainType = TerrainName;

export function getTerrainData(terrain: TerrainType): TerrainData {
  return TERRAIN_TABLE[terrain];
}

export function isPassable(terrain: TerrainType): boolean {
  return TERRAIN_TABLE[terrain].passable;
}

export function getMoveCost(terrain: TerrainType): number {
  return TERRAIN_TABLE[terrain].moveCost;
}
