import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public");

const cache = new Map<string, { width: number; height: number }>();

export async function getImageSize(imagePath: string): Promise<{ width: number; height: number }> {
  if (cache.has(imagePath)) return cache.get(imagePath)!;
  const abs = path.join(PUBLIC_DIR, imagePath.replace(/^\//, ""));
  try {
    const meta = await sharp(abs).metadata();
    const dims = { width: meta.width ?? 1200, height: meta.height ?? 630 };
    cache.set(imagePath, dims);
    return dims;
  } catch {
    return { width: 1200, height: 630 };
  }
}
