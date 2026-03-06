"use client";

export type WorkspaceId = string | null;

export type JsonReviver = (key: string, value: unknown) => unknown;

export const dateReviver: JsonReviver = (_key, value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
};

interface WorkspaceStorageOptions<T> {
  prefix: string;
  /** Cheie fallback când workspaceId este null/undefined. Implicit: `${prefix}no_workspace`. */
  noWorkspaceKey?: string;
  /** Cheie globală veche pentru migrare (opțional). */
  legacyGlobalKey?: string;
  reviver?: JsonReviver;
  normalize?: (item: unknown) => T;
}

export function getWorkspaceStorageKey(prefix: string, workspaceId: WorkspaceId, noWorkspaceKey?: string): string {
  if (!workspaceId) {
    return noWorkspaceKey ?? `${prefix}no_workspace`;
  }
  return `${prefix}${workspaceId}`;
}

export function createWorkspaceLocalStorage<T>(options: WorkspaceStorageOptions<T>) {
  const { prefix, noWorkspaceKey, legacyGlobalKey, reviver = dateReviver, normalize } = options;

  function load(workspaceId: WorkspaceId): T[] {
    if (typeof window === "undefined") return [];
    const key = getWorkspaceStorageKey(prefix, workspaceId, noWorkspaceKey);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw, reviver) as T[];
        const list = Array.isArray(parsed) ? parsed : [];
        return normalize ? list.map((item) => normalize(item)) : list;
      }

      // Migrare simplă de la o cheie globală veche, dacă este definită.
      if (legacyGlobalKey) {
        const legacy = localStorage.getItem(legacyGlobalKey);
        if (!legacy) return [];
        const legacyParsed = JSON.parse(legacy, reviver) as T[];
        const legacyList = Array.isArray(legacyParsed) ? legacyParsed : [];
        const list = normalize ? legacyList.map((item) => normalize(item)) : legacyList;
        if (list.length > 0) {
          localStorage.setItem(key, JSON.stringify(list));
        }
        localStorage.removeItem(legacyGlobalKey);
        return list;
      }

      return [];
    } catch {
      return [];
    }
  }

  function save(workspaceId: WorkspaceId, list: T[]): void {
    if (typeof window === "undefined") return;
    const key = getWorkspaceStorageKey(prefix, workspaceId, noWorkspaceKey);
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  return { load, save };
}

