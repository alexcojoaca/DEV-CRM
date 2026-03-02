import path from "path";
import fs from "fs/promises";
import type { IStorageService } from "./types";
import { createSupabaseStorageService } from "./supabaseStorage";

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR || "uploads";
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

function resolvePath(storagePath: string): string {
  const base = getUploadDir();
  const resolved = path.resolve(base, storagePath);
  if (!resolved.startsWith(base)) {
    throw new Error("Invalid storage path");
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
      if (!dir.startsWith(base)) return [];
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
 * Storage: doar Supabase (bucket). Fără salvare locală pe disc.
 * Necesar: STORAGE_BACKEND=supabase, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_STORAGE_BUCKET.
 */
export function getStorageService(): IStorageService {
  if (defaultInstance) return defaultInstance;
  const backend = process.env.STORAGE_BACKEND;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "crm-files";

  if (backend === "supabase" && url && key) {
    defaultInstance = createSupabaseStorageService();
    return defaultInstance;
  }

  throw new Error(
    "Storage nu e configurat. Setează în .env: STORAGE_BACKEND=supabase, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY și (opțional) SUPABASE_STORAGE_BUCKET=crm-files. Nu folosim stocare locală."
  );
}
