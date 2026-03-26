/**
 * Client-side image processing utilities.
 *
 * - HEIC/HEIF → JPEG conversion   (via lazy-loaded `heic2any` WASM)
 * - Image compression / resize     (via lazy-loaded `browser-image-compression`)
 *
 * Both libraries are dynamically imported so they don't inflate the main bundle.
 */

// ─── HEIC detection ──────────────────────────────────────────

const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

/**
 * Detect whether a File is HEIC/HEIF.
 *
 * Checks both the MIME type and the file extension because
 * iOS sometimes reports `application/octet-stream` or even
 * an empty string for HEIC files.
 */
export function isHeicFile(file: File): boolean {
  if (HEIC_MIME_TYPES.has(file.type.toLowerCase())) return true;

  // Fallback: extension-based check for octet-stream / empty MIME
  if (!file.type || file.type === "application/octet-stream") {
    return HEIC_EXTENSIONS.has(getExtension(file.name));
  }

  // Some files have correct extension but wrong MIME
  return HEIC_EXTENSIONS.has(getExtension(file.name));
}

// ─── HEIC → JPEG conversion ─────────────────────────────────

/**
 * Convert a HEIC/HEIF file to JPEG.
 *
 * Uses `heic2any` which is a ~1.5 MB WASM library — loaded lazily
 * only when a HEIC file is actually selected.
 *
 * @returns A new `File` with `.jpg` extension and `image/jpeg` type.
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;

  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });

  // heic2any may return a single Blob or an array (for multi-image HEIC)
  const blob = Array.isArray(result) ? result[0] : result;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

// ─── Image compression ──────────────────────────────────────

export interface CompressImageOptions {
  /** Maximum output size in MB. @default 4 */
  maxSizeMB?: number;
  /** Maximum width or height in px. @default 1920 */
  maxWidthOrHeight?: number;
  /** Use a Web Worker for non-blocking compression. @default true */
  useWebWorker?: boolean;
}

const COMPRESSION_DEFAULTS: Required<CompressImageOptions> = {
  maxSizeMB: 4,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

/** Files smaller than this skip compression (re-encoding may increase size). */
const SKIP_COMPRESSION_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1 MB

/**
 * Compress an image file using `browser-image-compression`.
 *
 * - Resizes to at most `maxWidthOrHeight` on the longest axis.
 * - Targets `maxSizeMB` output size.
 * - Skips compression entirely if the file is already under 1 MB
 *   (re-encoding small files often increases size).
 *
 * @returns The compressed `File`, or the original if compression was skipped.
 */
export async function compressImage(
  file: File,
  options?: CompressImageOptions
): Promise<File> {
  // Skip compression for small files — re-encoding can increase size
  if (file.size <= SKIP_COMPRESSION_THRESHOLD_BYTES) {
    return file;
  }

  const opts = { ...COMPRESSION_DEFAULTS, ...options };

  const imageCompression = (await import("browser-image-compression")).default;

  const compressed = await imageCompression(file, {
    maxSizeMB: opts.maxSizeMB,
    maxWidthOrHeight: opts.maxWidthOrHeight,
    useWebWorker: opts.useWebWorker,
    fileType: "image/jpeg",
  });

  // browser-image-compression returns a File, but ensure lastModified is preserved
  return new File([compressed], compressed.name, {
    type: compressed.type,
    lastModified: file.lastModified,
  });
}

// ─── Orchestrator ────────────────────────────────────────────

/**
 * Process a single image file:
 * 1. If HEIC/HEIF → convert to JPEG
 * 2. If image is larger than threshold → compress / resize
 *
 * Returns the processed `File` ready for upload.
 * Non-image files pass through unchanged.
 */
export async function processImageFile(
  file: File,
  compressOptions?: CompressImageOptions
): Promise<File> {
  let processed = file;

  // Step 1: HEIC conversion
  if (isHeicFile(processed)) {
    processed = await convertHeicToJpeg(processed);
  }

  // Step 2: Compression (only for image types)
  if (processed.type.startsWith("image/")) {
    processed = await compressImage(processed, compressOptions);
  }

  return processed;
}
