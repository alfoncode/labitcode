#!/usr/bin/env node

/**
 * Image optimization CLI for labitcode.com
 *
 * Converts input images to 16:9 aspect ratio WebP format and places them
 * in the public/images directory.
 *
 * Usage:
 *   node optimize-image.mjs <input-path> [output-slug-or-filename] [options]
 *
 * Options:
 *   --width <number>   Target width in px (default: 1280)
 *   --height <number>  Target height in px (default: 720)
 *   --quality <number> WebP quality 1-100 (default: 85)
 *
 * Examples:
 *   node optimize-image.mjs ./raw-hero.png cloudflare-kitesurf-hero
 *   node optimize-image.mjs ./diagram.jpg sdd-workflow-lifecycle --width 1024 --height 576
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const PUBLIC_IMAGES_DIR = path.join(REPO_ROOT, "public/images");

function printHelp() {
  console.log(`
Usage:
  node optimize-image.mjs <input-path> [output-slug-or-name] [options]

Options:
  --width <px>     Target width (default: 1280)
  --height <px>    Target height (default: 720, enforcing 16:9)
  --quality <1-100> WebP compression quality (default: 85)
  -h, --help       Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const inputPath = path.resolve(process.cwd(), args[0]);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Input file does not exist: ${inputPath}`);
    process.exit(1);
  }

  // Parse positional and flag arguments
  let outputArg = null;
  let targetWidth = 1280;
  let targetHeight = 720;
  let quality = 85;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--width" && args[i + 1]) {
      targetWidth = parseInt(args[++i], 10);
    } else if (arg === "--height" && args[i + 1]) {
      targetHeight = parseInt(args[++i], 10);
    } else if (arg === "--quality" && args[i + 1]) {
      quality = parseInt(args[++i], 10);
    } else if (!arg.startsWith("--") && !outputArg) {
      outputArg = arg;
    }
  }

  // Determine output filename
  let outputFilename;
  if (outputArg) {
    outputFilename = outputArg.endsWith(".webp") ? outputArg : `${outputArg}.webp`;
  } else {
    const parsed = path.parse(inputPath);
    outputFilename = `${parsed.name}.webp`;
  }

  const outputPath = path.isAbsolute(outputFilename)
    ? outputFilename
    : path.join(PUBLIC_IMAGES_DIR, path.basename(outputFilename));

  // Ensure public/images directory exists
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  }

  console.log(`🖼️  Processing image: ${path.basename(inputPath)}`);
  console.log(`🎯 Target resolution: ${targetWidth}x${targetHeight} (16:9, WebP q=${quality})`);

  try {
    const originalMeta = await sharp(inputPath).metadata();
    const originalSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: "cover",
        position: "center",
      })
      .webp({
        quality,
        effort: 6,
      })
      .toFile(outputPath);

    const newSize = fs.statSync(outputPath).size;
    const ratio = (targetWidth / targetHeight).toFixed(2);
    const reduction =
      originalSize > 0 ? (((originalSize - newSize) / originalSize) * 100).toFixed(1) : "0";

    console.log(`✅ Success! Created: ${outputPath}`);
    console.log(`   Dimensions: ${targetWidth}x${targetHeight} (aspect ratio: ${ratio})`);
    console.log(`   Size: ${(newSize / 1024).toFixed(1)} KB (reduction: ${reduction}%)`);
  } catch (err) {
    console.error(`❌ Failed to process image:`, err);
    process.exit(1);
  }
}

main();
