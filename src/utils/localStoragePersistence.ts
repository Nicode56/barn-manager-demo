const STORAGE_PREFIX = "farmApp:";

export function saveToStorage<T>(key: string, data: T): void {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save "${key}" to localStorage`, err);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to load "${key}" from localStorage`, err);
    return null;
  }
}