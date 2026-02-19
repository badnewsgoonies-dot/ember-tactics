import type { SaveData } from './Serializer';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isValidSaveData(data: unknown): data is SaveData {
  if (!isObject(data)) {
    return false;
  }

  if (data.version !== 1 || typeof data.timestamp !== 'number') {
    return false;
  }

  if (!Array.isArray(data.levelProgress) || !Array.isArray(data.unitRoster)) {
    return false;
  }

  const validProgress = data.levelProgress.every((entry) => {
    if (!isObject(entry)) {
      return false;
    }

    return (
      typeof entry.levelId === 'number' &&
      typeof entry.unlocked === 'boolean' &&
      typeof entry.completed === 'boolean' &&
      typeof entry.stars === 'number' &&
      typeof entry.bestTurns === 'number'
    );
  });

  if (!validProgress) {
    return false;
  }

  return data.unitRoster.every((unit) => {
    if (!isObject(unit)) {
      return false;
    }

    return (
      typeof unit.name === 'string' &&
      typeof unit.unitClass === 'string' &&
      typeof unit.level === 'number' &&
      typeof unit.xp === 'number'
    );
  });
}

export function deserializeSaveData(json: string): SaveData | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return isValidSaveData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
