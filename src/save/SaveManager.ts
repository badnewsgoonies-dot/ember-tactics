import { deserializeSaveData } from './Deserializer';
import type { SaveData } from './Serializer';

export const SAVE_KEY = 'ember_tactics_save';

export function saveGame(data: SaveData): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(SAVE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    return deserializeSaveData(raw);
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore environments where localStorage is unavailable.
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}
