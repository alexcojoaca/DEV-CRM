import { createClient } from "@supabase/supabase-js";
import { Readable } from "stream";
import type { IStorageService } from "./types";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "crm-files";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase Storage");
  }
  return createClient(url, key);
}

export function createSupabaseStorageService(): IStorageService {
  return {
    async uploadFile(storagePath: string, buffer: Buffer, mimeType: string): Promise<void> {
      const supabase = getSupabase();
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });
      if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    },

    async deleteFile(storagePath: string): Promise<void> {
      const supabase = getSupabase();
      await supabase.storage.from(BUCKET).remove([storagePath]);
    },

    async listFiles(prefix: string): Promise<{ key: string; size: number }[]> {
      const supabase = getSupabase();
      const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
      if (error) return [];
      const out: { key: string; size: number }[] = [];
      for (const item of data) {
        const size = (item as { size?: number }).size ?? item.metadata?.size;
        if (item.name && size != null) {
          out.push({ key: `${prefix}/${item.name}`.replace(/\/+/g, "/"), size });
        }
      }
      return out;
    },

    async getFileStream(storagePath: string): Promise<NodeJS.ReadableStream | null> {
      const supabase = getSupabase();
      const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
      if (error || !data) return null;
      const buf = Buffer.from(await data.arrayBuffer());
      return Readable.from(buf);
    },

    getAbsolutePath(storagePath: string): string {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url) return "";
      return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    },
  };
}
