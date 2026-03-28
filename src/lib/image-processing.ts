/**
 * Client-side image processing utilities.
 *
 * - HEIC/HEIF → JPEG conversion   (via lazy-loaded `heic-to`)
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
 * Uses `heic-to`'s `isHeic` for reliable byte-level detection,
 * with MIME type and extension checks as a synchronous fast-path.
 */
export async function isHeicFile(file: File): Promise<boolean> {
  // Fast-path: trusted MIME type
  if (HEIC_MIME_TYPES.has(file.type.toLowerCase())) return true;

  // Fast-path: extension check for octet-stream / empty MIME
  if (!file.type || file.type === "application/octet-stream") {
    if (HEIC_EXTENSIONS.has(getExtension(file.name))) return true;
  }

  // Some files have correct extension but wrong MIME
  if (HEIC_EXTENSIONS.has(getExtension(file.name))) return true;

  // Deep check: byte-level detection via heic-to
  try {
    const { isHeic } = await import("heic-to");
    return await isHeic(file);
  } catch {
    return false;
  }
}

// ─── HEIC → JPEG conversion ─────────────────────────────────

/**
 * Convert a HEIC/HEIF file to JPEG.
 *
 * Uses `heic-to` — loaded lazily only when a HEIC file is actually selected.
 *
 * @returns A new `File` with `.jpg` extension and `image/jpeg` type.
 * @throws If the HEIC/HEIF file cannot be parsed or converted.
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const { heicTo } = await import("heic-to");

    const blob = await heicTo({
      blob: file,
      type: "image/jpeg",
      quality: 0.92,
    });

    // Validate the blob was actually created
    if (!blob || blob.size === 0) {
      throw new Error("HEIC conversion produced an empty or invalid file");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("Could not parse") ||
      errorMessage.includes("Invalid") ||
      errorMessage.includes("HEIF") ||
      errorMessage.includes("HEIC")
    ) {
      throw new Error(
        `Failed to convert HEIC/HEIF file: The file may be corrupted or in an unsupported format. (${errorMessage})`
      );
    }

    throw new Error(`Failed to convert HEIC/HEIF file: ${errorMessage}`);
  }
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
 * - Skips compression entirely if the file is already under 1 MB.
 *
 * @returns The compressed `File`, or the original if compression was skipped.
 */
export async function compressImage(
  file: File,
  options?: CompressImageOptions
): Promise<File> {
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
 *
 * @throws If HEIC conversion fails in an unrecoverable way
 */
export async function processImageFile(
  file: File,
  compressOptions?: CompressImageOptions
): Promise<File> {
  let processed = file;

  // Step 1: HEIC conversion
  if (await isHeicFile(processed)) {
    try {
      processed = await convertHeicToJpeg(processed);
    } catch (error) {
      console.error(
        `[Image Processing] HEIC conversion failed for ${file.name}:`,
        error
      );

      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(
        `[HEIC Conversion Error] ${message}. Please try a different image or ensure the file is not corrupted.`
      );
    }
  }

  // Step 2: Compression (only for image types)
  if (processed.type.startsWith("image/")) {
    try {
      processed = await compressImage(processed, compressOptions);
    } catch (error) {
      console.warn(
        `[Image Processing] Compression failed for ${processed.name}, using uncompressed:`,
        error
      );
    }
  }

  return processed;
}