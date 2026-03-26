"use client";

import * as React from "react";
import {
  Upload,
  X,
  ImagePlus,
  File as FileIcon,
  FileImage,
  FileText,
  Loader2,
  AlertCircle,
  ImageIcon,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { ALFieldLabel, ALFieldMessage } from "@/components/ui/al-field-wrapper";
import type {
  ALFileUploaderProps,
  ALFileValidationError,
  ALFileUploaderImagePerRow,
} from "./al-file-uploader.types";
import { isHeicFile } from "@/lib/image-processing";

const IMAGE_PER_ROW_CLASS_MAP: Record<ALFileUploaderImagePerRow, string> = {
  2: "grid-cols-2",
  4: "grid-cols-2 sm:grid-cols-4",
  6: "grid-cols-3 sm:grid-cols-4 xl:grid-cols-6",
  8: "grid-cols-4 sm:grid-cols-6 xl:grid-cols-8",
};

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

    // Allow HEIC/HEIF files through when the accept pattern includes images —
    // iOS may report empty or application/octet-stream MIME for HEIC files,
    // which would fail the MIME check above. They'll be converted to JPEG
    // by processFiles before upload.
    if (!mimeOk && isHeicFile(file)) {
      const acceptsImages = accepted.some(
        (a) => a === "image/*" || a.startsWith("image/") || a === ".heic" || a === ".heif"
      );
      if (acceptsImages) return null;
    }

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
  onPreview?: () => void;
  disabled?: boolean;
  tileClassName?: string;
  removeButtonClassName?: string;
  primaryBadgeClassName?: string;
}> = ({ url, isPrimary, isDeleting, onDelete, onPreview, disabled, tileClassName, removeButtonClassName, primaryBadgeClassName }) => (
  <div
    className={cn(
      "relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0",
      onPreview && "cursor-pointer",
      tileClassName
    )}
    onClick={onPreview}
    role={onPreview ? "button" : undefined}
    tabIndex={onPreview ? 0 : undefined}
    onKeyDown={onPreview ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPreview(); } } : undefined}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={url} alt="uploaded" className="w-full h-full object-cover" />

    {/* Hover zoom overlay */}
    {onPreview && !isDeleting && (
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )}

    {isPrimary && (
      <span className={cn("absolute bottom-0 left-0 right-0 text-center text-[9px] font-semibold bg-[#1A3A52]/80 text-white py-0.5", primaryBadgeClassName)}>
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
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={cn(
            "absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80",
            removeButtonClassName
          )}
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
  onPreview?: () => void;
  disabled?: boolean;
  tileClassName?: string;
  removeButtonClassName?: string;
  sizeBadgeClassName?: string;
}> = ({ file, previewUrl, onRemove, onPreview, disabled, tileClassName, removeButtonClassName, sizeBadgeClassName }) => (
  <div
    className={cn(
      "relative group rounded-lg overflow-hidden border border-dashed border-[#D5BA98] bg-[#D5BA98]/10 shrink-0",
      onPreview && "cursor-pointer",
      tileClassName
    )}
    onClick={onPreview}
    role={onPreview ? "button" : undefined}
    tabIndex={onPreview ? 0 : undefined}
    onKeyDown={onPreview ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPreview(); } } : undefined}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={previewUrl} alt={file.name} className="w-full h-full object-cover opacity-80" />

    {/* Hover zoom overlay */}
    {onPreview && (
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )}

    <div className={cn("absolute bottom-0 left-0 right-0 bg-[#1A3A52]/70 text-white text-[9px] truncate px-1 py-0.5", sizeBadgeClassName)}>
      {formatBytes(file.size)}
    </div>
    {!disabled && (
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className={cn(
          "absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80",
          removeButtonClassName
        )}
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
      imagePerRow = 4,
      processFiles,
      disabled = false,
      className,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState<ALFileValidationError[]>([]);
    const processingAbortRef = React.useRef<AbortController | null>(null);

    // Abort any in-flight processing on unmount
    React.useEffect(() => {
      return () => {
        processingAbortRef.current?.abort();
      };
    }, []);
    const isGalleryVariant = variant === "gallery";
    const isImageLikeVariant = variant === "image" || isGalleryVariant;
    const responsiveImageGridClass = cn(
      "grid gap-2",
      IMAGE_PER_ROW_CLASS_MAP[imagePerRow]
    );
    const responsiveGalleryGridClass = "grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-2 sm:grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))]";
    const responsiveImageTileClass = "aspect-square h-auto w-full";
    const responsiveGalleryTileClass = "aspect-square h-auto w-full shrink-none";
    const responsiveRemoveButtonClass = "size-5 p-0 bg-white/90 text-slate-700 opacity-100 shadow-sm hover:bg-red-600 hover:text-white sm:size-6";
    const responsiveBadgeClass = "text-[9px] py-0.5 sm:text-[10px] sm:py-1";

    // Generate stable object-URL previews for pending files.
    // Key uses lastModified (stable across HEIC→JPEG conversion) instead of size.
    const fileKey = (f: File) => f.name + f.lastModified;

    const previews = React.useMemo(() => {
      if (!isImageLikeVariant) return {};
      return Object.fromEntries(
        pendingFiles.map((file) => [
          fileKey(file),
          URL.createObjectURL(file),
        ])
      );
    }, [pendingFiles, isImageLikeVariant]);

    // Revoke object URLs on unmount to prevent memory leaks
    React.useEffect(() => {
      return () => {
        Object.values(previews).forEach(URL.revokeObjectURL);
      };
    }, [previews]);

    const totalFileCount = existingFiles.length + pendingFiles.length;

    // ── Add files (from input or drop) ──
    const addFiles = React.useCallback(
      async (incoming: File[]) => {
        const errors: ALFileValidationError[] = [];
        const valid: File[] = [];

        for (const file of incoming) {
          // Deduplicate by name + lastModified (stable across conversion)
          const isDuplicate = pendingFiles.some(
            (p) => p.name === file.name && p.lastModified === file.lastModified
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

        if (valid.length === 0) return;

        // If a processFiles callback is provided, run conversion/compression
        if (processFiles) {
          processingAbortRef.current?.abort();
          const controller = new AbortController();
          processingAbortRef.current = controller;

          setIsProcessing(true);
          try {
            const processed = await processFiles(valid);
            if (!controller.signal.aborted) {
              onPendingChange([...pendingFiles, ...processed]);
            }
          } catch {
            // If processing fails entirely, add originals so user can see them
            if (!controller.signal.aborted) {
              onPendingChange([...pendingFiles, ...valid]);
            }
          } finally {
            if (!controller.signal.aborted) {
              setIsProcessing(false);
            }
          }
        } else {
          onPendingChange([...pendingFiles, ...valid]);
        }
      },
      [pendingFiles, onPendingChange, accept, maxSizeBytes, maxFiles, totalFileCount, processFiles]
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
      if (disabled || isUploading || isProcessing) return;
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
      if (!disabled && !isUploading && !isProcessing) inputRef.current?.click();
    };

    const isAtLimit = totalFileCount >= maxFiles;
    const hasFiles = totalFileCount > 0;
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    // ── Dropzone hint text ──
    const hintParts: string[] = [];
    if (acceptHint?.length) hintParts.push(acceptHint.join(", "));
    else if (accept !== "*") hintParts.push(accept);
    if (maxSizeBytes > 0) hintParts.push(`up to ${formatBytes(maxSizeBytes)} each`);
    if (maxFiles < Infinity) hintParts.push(`max ${maxFiles} files`);
    const hintText = hintParts.join(" · ");
    const galleryCountLabel = `${totalFileCount}/${maxFiles} ${maxFiles === 1 ? "image" : "images"}`;

    // _OLD: previous render used unified grid for all variants + dropzone below thumbnails.
    //       Now: image variant shows dropzone above (full when empty, compact bar with files),
    //       thumbnails below with click-to-preview. Gallery/file variants largely unchanged.
    //       Labels & messages unified via ALFieldLabel / ALFieldMessage.
    // ── Render ──
    return (
      <div ref={ref} className={cn("space-y-2 min-w-0", className)}>
        {/* ── Title (unified) ────────────────────────── */}
        {title && (
          <ALFieldLabel size="default" required={required}>
            {title}
          </ALFieldLabel>
        )}

        {/* ═══ IMAGE VARIANT ═══════════════════════════ */}
        {variant === "image" && (
          <>
            {/* Dropzone: full-size when empty, compact bar when has files */}
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
                  "relative rounded-lg border-2 border-dashed transition-colors select-none mb-0",
                  hasFiles
                    ? "flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5 cursor-pointer sm:px-4"
                    : "flex min-h-40 flex-col items-center justify-center gap-2 p-5 cursor-pointer",
                  isDragging
                    ? "border-[#1A3A52] bg-[#D5BA98]/10"
                    : "border-slate-300 bg-white hover:border-[#1A3A52]/40 hover:bg-[#D5BA98]/5",
                  (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none",
                  error && "border-red-300 bg-red-50/30"
                )}
              >
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 z-10">
                    <Loader2 size={20} className="animate-spin text-[#1A3A52]" />
                    <span className="ml-2 text-sm text-[#1A3A52] font-medium">Uploading…</span>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 z-10">
                    <Loader2 size={20} className="animate-spin text-[#1A3A52]" />
                    <span className="ml-2 text-sm text-[#1A3A52] font-medium">Processing images…</span>
                  </div>
                )}

                {hasFiles ? (
                  <>
                    <Upload size={16} className="shrink-0 text-[#1A3A52]/50" />
                    <span className="min-w-0 text-sm text-[#1A3A52]/70">
                      {isDragging ? "Drop here" : "Add more images"}
                    </span>
                    {hintText && (
                      <span className="basis-full text-xs text-[#1A3A52]/40 sm:ml-auto sm:basis-auto">
                        {hintText}
                      </span>
                    )}
                    <span className="text-xs font-medium text-[#1A3A52]/50 sm:ml-0">
                      {totalFileCount}/{maxFiles}
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus size={32} className="text-[#1A3A52]/35" />
                    <p className="text-sm font-medium text-[#1A3A52]/70">
                      {isDragging ? "Drop images here" : "Upload images"}
                    </p>
                    <p className="text-xs text-[#1A3A52]/50">
                      {isDragging
                        ? "Release to add files"
                        : multiple
                          ? "Drag & drop or click to browse"
                          : "Drag & drop or click to browse"}
                    </p>
                    {hintText && (
                      <p className="text-xs text-[#1A3A52]/40">{hintText}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Image thumbnail grid (below dropzone) */}
            {hasFiles && (
              <div className={cn(responsiveImageGridClass, "items-start")}>
                {existingFiles.map((f) => (
                  <ExistingImageThumb
                    key={f.id}
                    url={f.url}
                    isPrimary={f.isPrimary}
                    isDeleting={deletingExistingId === f.id}
                    onDelete={onDeleteExisting ? () => onDeleteExisting(f.id) : undefined}
                    onPreview={() => setPreviewUrl(f.url)}
                    disabled={disabled || isUploading}
                    tileClassName={responsiveImageTileClass}
                    removeButtonClassName={responsiveRemoveButtonClass}
                    primaryBadgeClassName={responsiveBadgeClass}
                  />
                ))}
                {pendingFiles.map((file) => (
                  <PendingImageThumb
                    key={fileKey(file)}
                    file={file}
                    previewUrl={previews[fileKey(file)] ?? ""}
                    onRemove={() => removePending(file)}
                    onPreview={() => setPreviewUrl(previews[fileKey(file)] ?? "")}
                    disabled={disabled || isUploading}
                    tileClassName={responsiveImageTileClass}
                    removeButtonClassName={responsiveRemoveButtonClass}
                    sizeBadgeClassName={responsiveBadgeClass}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ GALLERY VARIANT (unchanged) ═════════════ */}
        {isGalleryVariant && (
          <div className={responsiveGalleryGridClass}>
            {existingFiles.map((f) => (
              <ExistingImageThumb
                key={f.id}
                url={f.url}
                isPrimary={f.isPrimary}
                isDeleting={deletingExistingId === f.id}
                onDelete={onDeleteExisting ? () => onDeleteExisting(f.id) : undefined}
                onPreview={() => setPreviewUrl(f.url)}
                disabled={disabled || isUploading}
                tileClassName={responsiveGalleryTileClass}
                removeButtonClassName={responsiveRemoveButtonClass}
                primaryBadgeClassName={responsiveBadgeClass}
              />
            ))}
            {pendingFiles.map((file) => (
              <PendingImageThumb
                key={fileKey(file)}
                file={file}
                previewUrl={previews[fileKey(file)] ?? ""}
                onRemove={() => removePending(file)}
                onPreview={() => setPreviewUrl(previews[fileKey(file)] ?? "")}
                disabled={disabled || isUploading}
                tileClassName={responsiveGalleryTileClass}
                removeButtonClassName={responsiveRemoveButtonClass}
                sizeBadgeClassName={responsiveBadgeClass}
              />
            ))}
            {!isAtLimit && (
              <button
                type="button"
                aria-label="Add images"
                onClick={openFilePicker}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors",
                  isDragging
                    ? "border-[#1A3A52] bg-[#D5BA98]/10"
                    : "border-slate-300 bg-white hover:border-[#1A3A52]/40 hover:bg-[#D5BA98]/5",
                  (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <ImagePlus className="h-5 w-5 text-[#1A3A52]/55 sm:h-6 sm:w-6" />
                <span className="text-[11px] text-[#1A3A52]/60 sm:text-xs">Add</span>
              </button>
            )}
          </div>
        )}

        {/* ═══ FILE VARIANT (unchanged) ════════════════ */}
        {variant === "file" && (
          <>
            {hasFiles && (
              <div className="space-y-1.5">
                {existingFiles.map((f) => (
                  <FileListRow
                    key={f.id}
                    name={f.name ?? String(f.id)}
                    url={f.url}
                    isDeleting={deletingExistingId === f.id}
                    onDelete={onDeleteExisting ? () => onDeleteExisting(f.id) : undefined}
                    disabled={disabled || isUploading}
                    icon={<ImageIcon size={16} />}
                  />
                ))}
                {pendingFiles.map((file) => (
                  <FileListRow
                    key={fileKey(file)}
                    name={file.name}
                    size={file.size}
                    onDelete={() => removePending(file)}
                    disabled={disabled || isUploading}
                    isPending
                    icon={getFileIcon(file)}
                  />
                ))}
              </div>
            )}

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
                  "p-4 text-center cursor-pointer select-none transition-colors mb-0",
                  isDragging
                    ? "border-[#1A3A52] bg-[#D5BA98]/10"
                    : "border-slate-300 bg-white hover:border-[#1A3A52]/40 hover:bg-[#D5BA98]/5",
                  (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none",
                  error && "border-red-300 bg-red-50/30"
                )}
              >
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 z-10">
                    <Loader2 size={20} className="animate-spin text-[#1A3A52]" />
                    <span className="ml-2 text-sm text-[#1A3A52] font-medium">Uploading…</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[#1A3A52]/60">
                  <Upload size={16} className={isDragging ? "text-[#1A3A52]" : "text-[#1A3A52]/40"} />
                  <span>
                    {isDragging
                      ? "Drop files here"
                      : multiple
                        ? "Drop files or click to browse"
                        : "Drop a file or click to browse"}
                  </span>
                </div>
                {hintText && (
                  <p className="text-xs text-[#1A3A52]/40">{hintText}</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ═══ Common footer ═══════════════════════════ */}

        {/* Max-files hint */}
        {isAtLimit && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle size={12} />
            Maximum of {maxFiles} file(s) reached. Remove a file to add more.
          </p>
        )}

        {isGalleryVariant && !error && (
          <p className="text-xs text-center text-[#1A3A52]/55">{galleryCountLabel}</p>
        )}

        {/* Client-side validation errors */}
        {validationErrors.length > 0 && (
          <ul className="space-y-1">
            {validationErrors.map((ve) => (
              <li
                key={ve.file.name + ve.file.lastModified}
                className="flex items-start gap-1.5 text-xs text-red-600"
              >
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                {ve.message}
              </li>
            ))}
          </ul>
        )}

        {/* External error / description (unified) */}
        <ALFieldMessage error={error} description={description} />

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

        {/* ═══ Image preview dialog ════════════════════ */}
        {previewUrl && (
          <Dialog
            open={!!previewUrl}
            onClose={() => setPreviewUrl(null)}
            title="Image Preview"
            width="min(90vw, 800px)"
          >
            <div className="flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </Dialog>
        )}
      </div>
    );
  }
);

ALFileUploader.displayName = "ALFileUploader";

export default ALFileUploader;
export { ALFileUploader };
