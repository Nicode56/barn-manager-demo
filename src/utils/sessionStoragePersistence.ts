const STORAGE_PREFIX = "farmApp:";

export function saveToStorage<T>(key: string, data: T): void {
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save "${key}" to sessionStorage`, err);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to load "${key}" from sessionStorage`, err);
    return null;
  }
}