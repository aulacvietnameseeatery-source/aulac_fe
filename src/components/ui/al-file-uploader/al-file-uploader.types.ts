/**
 * ALFileUploader — types
 *
 * A general-purpose, controlled file-upload component with support for:
 * - Displaying existing (persisted) files with delete callback
 * - Queuing new (pending) files before upload
 * - Client-side validation (MIME, size, count)
 * - Image-grid and file-list display variants
 */

// ─── Existing file (already saved on server) ─────────────────

export interface ALExistingFile {
  /** Stable server-side identifier (used for delete calls and React keys) */
  id: number | string;
  /**
   * Full public URL — use directly in `<img src>`.
   * Never re-prefix with `/uploads/` — the server returns the complete path.
   */
  url: string;
  /** Whether this is the primary display image */
  isPrimary?: boolean;
  /** Optional display name shown in file-list variant */
  name?: string;
}

// ─── Validation error for a single pending file ──────────────

export interface ALFileValidationError {
  file: File;
  reason: "size" | "type" | "count";
  message: string;
}

// ─── Variant ─────────────────────────────────────────────────

/**
 * `"image"` — shows existing files in a thumbnail grid, pending files with image previews.
 * `"file"` — shows existing and pending files in a compact list with icons.
 * `"gallery"` — shows image tiles in a fixed grid with an inline add button tile.
 */
export type ALFileUploaderVariant = "image" | "file" | "gallery";

/** Number of thumbnails per row for `variant="image"`. */
export type ALFileUploaderImagePerRow = 2 | 4 | 6 | 8;

// ─── Props ───────────────────────────────────────────────────

export interface ALFileUploaderProps {
  // ── Label & Meta ────────────────────────────────────────────
  /** Label shown above the uploader */
  title?: string;
  /** Helper text shown below the uploader */
  description?: string;
  /** Error message shown below the uploader (overrides description) */
  error?: string;
  /** Shows an asterisk (*) next to the title */
  required?: boolean;

  // ── Existing files (already persisted on server) ────────────
  /** Array of already-uploaded files to display */
  existingFiles?: ALExistingFile[];
  /**
   * Called when the user clicks the delete button on an existing file.
   * Parent is responsible for the actual API DELETE call.
   */
  onDeleteExisting?: (id: number | string) => void;
  /**
   * ID of the existing file currently being deleted — shows a spinner on that item.
   * Pass `null` when no deletion is in progress.
   */
  deletingExistingId?: number | string | null;

  // ── Pending files (queued, not yet uploaded) ─────────────────
  /**
   * Controlled list of files staged for upload.
   * Parent manages this state; ALFileUploader calls `onPendingChange` on mutations.
   */
  pendingFiles: File[];
  /** Called with the updated pending-files array after add or remove */
  onPendingChange: (files: File[]) => void;
  /**
   * When `true`, renders an indeterminate progress bar / spinner over the pending
   * files area. Parent controls this while the upload API call is in-flight.
   */
  isUploading?: boolean;

  // ── Constraints ──────────────────────────────────────────────
  /**
   * Standard `<input accept>` value (e.g. `"image/*"`, `".pdf,.docx"`).
   * Used both for the file-picker dialog and client-side MIME validation.
   * @default "*"
   */
  accept?: string;
  /**
   * Human-readable labels for accepted types shown in the dropzone hint.
   * e.g. `["PNG", "JPG", "WEBP"]`
   */
  acceptHint?: string[];
  /**
   * Maximum number of files across existing + pending combined.
   * Adding more files beyond this limit is rejected with a validation error.
   * @default 10
   */
  maxFiles?: number;
  /**
   * Maximum size per file in bytes.
   * @default 10 * 1024 * 1024  (10 MB)
   */
  maxSizeBytes?: number;
  /**
   * Whether to allow selecting multiple files at once.
   * When `false`, only one file can be picked per interaction (but previous pending files are kept).
   * @default true
   */
  multiple?: boolean;

  // ── Display ──────────────────────────────────────────────────
  /**
   * `"image"` — thumbnail grid + image previews (default when `accept` starts with `image/` or `"image/*"`)
   * `"file"` — compact list with file-type icons
    * `"gallery"` — image gallery grid with inline add-tile upload affordance
   * @default "image"
   */
  variant?: ALFileUploaderVariant;
  /**
   * Thumbnails per row for `variant="image"`.
   * Allowed: 2, 4, 6, 8.
   * @default 4
   */
  imagePerRow?: ALFileUploaderImagePerRow;

  // ── State ───────────────────────────────────────────────────
  /** Disables all interactions */
  disabled?: boolean;
  /** Additional className for the outer container */
  className?: string;
}
