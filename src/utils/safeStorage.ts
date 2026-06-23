// Safe in-memory fallback for localStorage in sandbox iframe restrictions
let safeStorageState: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] getItem failed for key "${key}"`, e);
    }
    return key in safeStorageState ? safeStorageState[key] : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[safeStorage] setItem failed for key "${key}"`, e);
    }
    safeStorageState[key] = String(value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[safeStorage] removeItem failed for key "${key}"`, e);
    }
    delete safeStorageState[key];
  },

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn("[safeStorage] clear failed", e);
    }
    safeStorageState = {};
  }
};
