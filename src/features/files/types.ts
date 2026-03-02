import type { FileEntityType, FileKind } from "@prisma/client";

export type { FileEntityType, FileKind };

export interface IStorageService {
  uploadFile(storagePath: string, buffer: Buffer, mimeType: string): Promise<void>;
  deleteFile(storagePath: string): Promise<void>;
  listFiles(prefix: string): Promise<{ key: string; size: number }[]>;
  getFileStream(storagePath: string): Promise<NodeJS.ReadableStream | null>;
  getAbsolutePath(storagePath: string): string;
}

export const ENTITY_TYPES = ["LISTING", "USER", "CLIENT", "DEAL", "OTHER"] as const;
export const FILE_KINDS = ["IMAGE", "PDF", "DOC", "OTHER"] as const;

/** Listing paths: uploads/workspaces/{workspaceId}/listings/{listingCode}/images/original|thumbs|pdf|attachments */
export function listingPath(workspaceId: string, listingCode: string, category: "images/original" | "images/thumbs" | "pdf" | "attachments", filename: string): string {
  return `workspaces/${workspaceId}/listings/${listingCode}/${category}/${filename}`;
}

/** User paths: uploads/workspaces/{workspaceId}/users/{userId}/images|pdf|docs */
export function userPath(workspaceId: string, userId: string, category: "images" | "pdf" | "docs", filename: string): string {
  return `workspaces/${workspaceId}/users/${userId}/${category}/${filename}`;
}
