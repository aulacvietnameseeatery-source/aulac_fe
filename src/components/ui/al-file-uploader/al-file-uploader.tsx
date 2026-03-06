"use client";

import * as React from "react";
import {
  Upload,
  X,
  File as FileIcon,
  FileImage,
  FileText,
  Loader2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ALFileUploaderProps, ALFileValidationError } from "./al-file-uploader.types";

// ─── Helpers ──────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return <FileImage size={16} />;
  if (file.type.startsWith("text/")) return <FileText size={16} />;
  return <FileIcon size={16} />;
}

/**
 * Check whether a File passes size + MIME constraints.
 * Returns a human-readable `message` or `null` if valid.
 */
function validateFile(
  file: File,
  maxSizeBytes: number,
  accept: string
): { reason: ALFileValidationError["reason"]; message: string } | null {
  if (maxSizeBytes > 0 && file.size > maxSizeBytes) {
    return {
      reason: "size",
      message: `"${file.name}" (${formatBytes(file.size)}) exceeds the ${formatBytes(maxSizeBytes)} limit.`,
    };
  }

  if (accept && accept !== "*") {
    const accepted = accept
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mimeOk = accepted.some((a) => {
      if (a.endsWith("/*")) return file.type.startsWith(a.slice(0, -1));
      if (a.startsWith(".")) return file.name.toLowerCase().endsWith(a.toLowerCase());
      return file.type === a;
    });

    if (!mimeOk) {
      return {
        reason: "type",
        message: `"${file.name}" has an unsupported file type (${file.type || "unknown"}).`,
      };
    }
  }

  return null;
}

// ─── Sub-components ───────────────────────────────────────────

/** Thumbnail grid item for an existing (persisted) image */
const ExistingImageThumb: React.FC<{
  url: string;
  isPrimary?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
  disabled?: boolean;
}> = ({ url, isPrimary, isDeleting, onDelete, disabled }) => (
  <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={url} alt="uploaded" className="w-full h-full object-cover" />

    {isPrimary && (
      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-semibold bg-indigo-600/80 text-white py-0.5">
        Primary
      </span>
    )}

    {isDeleting ? (
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <Loader2 size={16} className="animate-spin text-white" />
      </div>
    ) : (
      !disabled && onDelete && (
        <button
          type="button"
          aria-label="Remove image"
          onClick={onDelete}
          className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white
                     opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
        >
          <X size={12} />
        </button>
      )
    )}
  </div>
);

/** Thumbnail grid item for a pending (not-yet-uploaded) File */
const PendingImageThumb: React.FC<{
  file: File;
  previewUrl: string;
  onRemove: () => void;
  disabled?: boolean;
}> = ({ file, previewUrl, onRemove, disabled }) => (
  <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-dashed border-indigo-300 bg-indigo-50 shrink-0">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={previewUrl} alt={file.name} className="w-full h-full object-cover opacity-80" />
    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/70 text-white text-[9px] truncate px-1 py-0.5">
      {formatBytes(file.size)}
    </div>
    {!disabled && (
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white
                   opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
      >
        <X size={12} />
      </button>
    )}
  </div>
);

/** Compact list row for file variant */
const FileListRow: React.FC<{
  name: string;
  size?: number;
  url?: string;
  isDeleting?: boolean;
  onDelete?: () => void;
  disabled?: boolean;
  isPending?: boolean;
  icon?: React.ReactNode;
}> = ({ name, size, url, isDeleting, onDelete, disabled, isPending, icon }) => (
  <div
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg border text-sm",
      isPending
        ? "bg-indigo-50/60 border-indigo-200"
        : "bg-gray-50 border-gray-200"
    )}
  >
    <span className={cn("shrink-0", isPending ? "text-indigo-500" : "text-gray-400")}>
      {icon ?? <FileIcon size={16} />}
    </span>

    <div className="flex-1 min-w-0">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-800 truncate block hover:underline"
        >
          {name}
        </a>
      ) : (
        <span className="font-medium text-gray-800 truncate block">{name}</span>
      )}
      {size !== undefined && (
        <span className="text-xs text-gray-400">{formatBytes(size)}</span>
      )}
    </div>

    {isPending && (
      <span className="shrink-0 text-xs text-indigo-500 font-medium">Pending</span>
    )}

    {isDeleting ? (
      <Loader2 size={14} className="animate-spin text-gray-400 shrink-0" />
    ) : (
      !disabled && onDelete && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onDelete}
          className="shrink-0 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
      )
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────

/**
 * ALFileUploader — general-purpose controlled file upload component.
 *
 * @example
 * // Minimal — image uploader with pending-files only
 * <ALFileUploader
 *   title="Photos"
 *   pendingFiles={pendingFiles}
 *   onPendingChange={setPendingFiles}
 *   accept="image/*"
 *   acceptHint={["PNG", "JPG", "WEBP"]}
 *   maxFiles={5}
 *   maxSizeBytes={5 * 1024 * 1024}
 * />
 *
 * @example
 * // Full — with existing server files + live upload/delete
 * <ALFileUploader
 *   title="Table Images"
 *   existingFiles={table.images.map(img => ({ id: img.mediaId, url: img.url, isPrimary: img.isPrimary }))}
 *   onDeleteExisting={(id) => deleteMedia({ tableId, mediaId: Number(id) })}
 *   deletingExistingId={deletingMediaId}
 *   pendingFiles={pendingFiles}
 *   onPendingChange={setPendingFiles}
 *   isUploading={isUploading}
 *   accept="image/*"
 *   maxFiles={5}
 *   maxSizeBytes={5 * 1024 * 1024}
 * />
 */
const ALFileUploader = React.forwardRef<HTMLDivElement, ALFileUploaderProps>(
  (
    {
      title,
      description,
      error,
      required,
      existingFiles = [],
      onDeleteExisting,
      deletingExistingId = null,
      pendingFiles,
      onPendingChange,
      isUploading = false,
      accept = "*",
      acceptHint,
      maxFiles = 10,
      maxSizeBytes = 10 * 1024 * 1024,
      multiple = true,
      variant = "image",
      disabled = false,
      className,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState<ALFileValidationError[]>([]);

    // Generate stable object-URL previews for pending files
    const previews = React.useMemo(() => {
      if (variant !== "image") return {};
      return Object.fromEntries(
        pendingFiles.map((file) => [
          file.name + file.size,
          URL.createObjectURL(file),
        ])
      );
    }, [pendingFiles, variant]);

    // Revoke object URLs on unmount to prevent memory leaks
    React.useEffect(() => {
      return () => {
        Object.values(previews).forEach(URL.revokeObjectURL);
      };
    }, [previews]);

    const totalFileCount = existingFiles.length + pendingFiles.length;

    // ── Add files (from input or drop) ──
    const addFiles = React.useCallback(
      (incoming: File[]) => {
        const errors: ALFileValidationError[] = [];
        const valid: File[] = [];

        for (const file of incoming) {
          // Deduplicate by name + size
          const isDuplicate = pendingFiles.some(
            (p) => p.name === file.name && p.size === file.size
          );
          if (isDuplicate) continue;

          const valError = validateFile(file, maxSizeBytes, accept);
          if (valError) {
            errors.push({ file, ...valError });
            continue;
          }

          const wouldExceedLimit =
            totalFileCount + valid.length + 1 > maxFiles;
          if (wouldExceedLimit) {
            errors.push({
              file,
              reason: "count",
              message: `Cannot add "${file.name}" — maximum ${maxFiles} file(s) allowed.`,
            });
            continue;
          }

          valid.push(file);
        }

        setValidationErrors(errors);
        if (valid.length > 0) {
          onPendingChange([...pendingFiles, ...valid]);
        }
      },
      [pendingFiles, onPendingChange, accept, maxSizeBytes, maxFiles, totalFileCount]
    );

    const removePending = React.useCallback(
      (file: File) => {
        onPendingChange(pendingFiles.filter((f) => f !== file));
      },
      [pendingFiles, onPendingChange]
    );

    // ── Drag & drop ──
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      // Only trigger when leaving the dropzone itself
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      const files = Array.from(e.dataTransfer.files);
      addFiles(multiple ? files : files.slice(0, 1));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) addFiles(files);
      // Reset input so the same file can be selected again
      e.target.value = "";
    };

    const openFilePicker = () => {
      if (!disabled && !isUploading) inputRef.current?.click();
    };

    const isAtLimit = totalFileCount >= maxFiles;

    // ── Dropzone hint text ──
    const hintParts: string[] = [];
    if (acceptHint?.length) hintParts.push(acceptHint.join(", "));
    else if (accept !== "*") hintParts.push(accept);
    if (maxSizeBytes > 0) hintParts.push(`up to ${formatBytes(maxSizeBytes)} each`);
    if (maxFiles < Infinity) hintParts.push(`max ${maxFiles} files`);
    const hintText = hintParts.join(" · ");

    // ── Render ──
    return (
      <div ref={ref} className={cn("space-y-1.5", className)}>
        {/* Title */}
        {title && (
          <p className="text-sm font-medium text-gray-700">
            {title}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </p>
        )}

        {/* File grid / list */}
        {(existingFiles.length > 0 || pendingFiles.length > 0) && (
          <div
            className={cn(
              variant === "image"
                ? "flex flex-wrap gap-2"
                : "space-y-1.5"
            )}
          >
            {/* Existing files */}
            {existingFiles.map((f) =>
              variant === "image" ? (
                <ExistingImageThumb
                  key={f.id}
                  url={f.url}
                  isPrimary={f.isPrimary}
                  isDeleting={deletingExistingId === f.id}
                  onDelete={onDeleteExisting ? () => onDeleteExisting(f.id) : undefined}
                  disabled={disabled || isUploading}
                />
              ) : (
                <FileListRow
                  key={f.id}
                  name={f.name ?? String(f.id)}
                  url={f.url}
                  isDeleting={deletingExistingId === f.id}
                  onDelete={onDeleteExisting ? () => onDeleteExisting(f.id) : undefined}
                  disabled={disabled || isUploading}
                  icon={<ImageIcon size={16} />}
                />
              )
            )}

            {/* Pending files */}
            {pendingFiles.map((file) =>
              variant === "image" ? (
                <PendingImageThumb
                  key={file.name + file.size}
                  file={file}
                  previewUrl={previews[file.name + file.size] ?? ""}
                  onRemove={() => removePending(file)}
                  disabled={disabled || isUploading}
                />
              ) : (
                <FileListRow
                  key={file.name + file.size}
                  name={file.name}
                  size={file.size}
                  onDelete={() => removePending(file)}
                  disabled={disabled || isUploading}
                  isPending
                  icon={getFileIcon(file)}
                />
              )
            )}
          </div>
        )}

        {/* Dropzone — shown unless at file limit */}
        {!isAtLimit && (
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Upload files"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed",
              "p-4 text-center cursor-pointer select-none transition-colors",
              isDragging
                ? "border-indigo-400 bg-indigo-50"
                : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40",
              (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none",
              error && "border-red-300 bg-red-50/30"
            )}
          >
            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 z-10">
                <Loader2 size={20} className="animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-indigo-600 font-medium">Uploading…</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Upload size={16} className={isDragging ? "text-indigo-500" : "text-gray-400"} />
              <span>
                {isDragging
                  ? "Drop files here"
                  : multiple
                  ? "Drop files or click to browse"
                  : "Drop a file or click to browse"}
              </span>
            </div>
            {hintText && (
              <p className="text-xs text-gray-400">{hintText}</p>
            )}
          </div>
        )}

        {/* Max-files hint */}
        {isAtLimit && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle size={12} />
            Maximum of {maxFiles} file(s) reached. Remove a file to add more.
          </p>
        )}

        {/* Client-side validation errors */}
        {validationErrors.length > 0 && (
          <ul className="space-y-1">
            {validationErrors.map((ve) => (
              <li
                key={ve.file.name + ve.file.size}
                className="flex items-start gap-1.5 text-xs text-red-600"
              >
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                {ve.message}
              </li>
            ))}
          </ul>
        )}

        {/* External error */}
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={12} className="shrink-0" />
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept === "*" ? undefined : accept}
          multiple={multiple}
          disabled={disabled || isUploading}
          onChange={handleInputChange}
        />
      </div>
    );
  }
);

ALFileUploader.displayName = "ALFileUploader";

export default ALFileUploader;
export { ALFileUploader };
