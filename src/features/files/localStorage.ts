import path from "path";
import fs from "fs/promises";
import type { IStorageService } from "./types";
import { createSupabaseStorageService } from "./supabaseStorage";

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR || "uploads";
  const base = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  return path.resolve(base);
}

function resolvePath(storagePath: string): string {
  const base = getUploadDir();
  const resolved = path.resolve(base, storagePath);
  // Protecție path traversal: fișierul trebuie să fie sub UPLOAD_DIR
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error("Invalid storage path (outside upload root)");
  }
  return resolved;
}

export function createLocalStorageService(): IStorageService {
  return {
    async uploadFile(storagePath: string, buffer: Buffer, _mimeType: string): Promise<void> {
      const fullPath = resolvePath(storagePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, buffer);
    },

    async deleteFile(storagePath: string): Promise<void> {
      const fullPath = resolvePath(storagePath);
      await fs.unlink(fullPath).catch((e) => {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      });
    },

    async listFiles(prefix: string): Promise<{ key: string; size: number }[]> {
      const base = getUploadDir();
      const dir = path.resolve(base, prefix);
      if (!dir.startsWith(base + path.sep)) return [];
      const out: { key: string; size: number }[] = [];
      async function walk(d: string, relPrefix: string) {
        let entries: { name: string }[];
        try {
          entries = await fs.readdir(d, { withFileTypes: true }).then((e) => e as { name: string }[]);
        } catch {
          return;
        }
        for (const e of entries) {
          const full = path.join(d, e.name);
          const rel = path.join(relPrefix, e.name);
          const stat = await fs.stat(full).catch(() => null);
          if (!stat) continue;
          if (stat.isDirectory()) await walk(full, rel);
          else out.push({ key: rel.replace(/\\/g, "/"), size: stat.size });
        }
      }
      await walk(dir, prefix);
      return out;
    },

    async getFileStream(storagePath: string): Promise<NodeJS.ReadableStream | null> {
      const fullPath = resolvePath(storagePath);
      const { createReadStream } = await import("fs");
      const { stat } = await import("fs/promises");
      const exists = await stat(fullPath).then(() => true).catch(() => false);
      if (!exists) return null;
      return createReadStream(fullPath);
    },

    getAbsolutePath(storagePath: string): string {
      return resolvePath(storagePath);
    },
  };
}

let defaultInstance: IStorageService | null = null;

/**
 * Selectează backend-ul de storage:
 * - STORAGE_BACKEND=supabase + env-uri complete → Supabase
 * - STORAGE_BACKEND=local sau (în development) Supabase neconfigurat → local (UPLOAD_DIR)
 * - În production, dacă STORAGE_BACKEND=supabase dar env-urile lipsesc → eroare clară.
 */
export function getStorageService(): IStorageService {
  if (defaultInstance) return defaultInstance;

  const backendEnv = process.env.STORAGE_BACKEND;
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProd = nodeEnv === "production";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const backend: "local" | "supabase" =
    backendEnv === "supabase" || backendEnv === "local"
      ? (backendEnv as "local" | "supabase")
      : isProd
        ? "supabase"
        : "local";

  if (backend === "supabase") {
    if (supabaseUrl && supabaseKey) {
      defaultInstance = createSupabaseStorageService();
      return defaultInstance;
    }

    if (isProd) {
      throw new Error(
        "Supabase storage backend este selectat, dar variabilele NEXT_PUBLIC_SUPABASE_URL și SUPABASE_SERVICE_ROLE_KEY nu sunt configurate. " +
          "Configurează-le corect sau setează STORAGE_BACKEND=local pentru a folosi stocarea locală (UPLOAD_DIR)."
      );
    }

    console.warn(
      "[storage] STORAGE_BACKEND=supabase dar Supabase nu este configurat complet în development. Se folosește fallback pe stocare locală (UPLOAD_DIR)."
    );
  }

  defaultInstance = createLocalStorageService();
  return defaultInstance;
}
