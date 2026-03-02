import sharp from "sharp";

const SM_SIZE = 200;
const MD_SIZE = 600;

/** basePath: storage-relative path (e.g. workspaces/xx/listings/yy/images/thumbs). getAbsolutePath is used to resolve. */
export async function generateImageThumbnails(
  buffer: Buffer,
  basePathStorageRelative: string,
  getAbsolutePath: (p: string) => string,
  ext: string
): Promise<{ sm: string; md: string }> {
  const uuid = crypto.randomUUID();
  const smRel = `${basePathStorageRelative}/${uuid}_sm.${ext}`;
  const mdRel = `${basePathStorageRelative}/${uuid}_md.${ext}`;
  const image = sharp(buffer);
  await Promise.all([
    image.clone().resize(SM_SIZE).toFile(getAbsolutePath(smRel)),
    image.clone().resize(MD_SIZE).toFile(getAbsolutePath(mdRel)),
  ]);
  return { sm: smRel, md: mdRel };
}

export async function getImageThumbnailBuffer(buffer: Buffer, size: "sm" | "md"): Promise<Buffer> {
  const s = size === "sm" ? SM_SIZE : MD_SIZE;
  return sharp(buffer).resize(s).toBuffer();
}
