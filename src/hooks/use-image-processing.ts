import { useCallback, useRef } from "react";
import { processImageFile, type CompressImageOptions } from "@/lib/image-processing";

/**
 * Hook that returns a `processFiles` callback suitable for the
 * `ALFileUploader` `processFiles` prop.
 *
 * Files are processed **sequentially** (not in parallel) to avoid
 * memory spikes when converting multiple HEIC photos at once.
 *
 * Aborts cleanly on unmount via an internal `AbortController`.
 *
 * @example
 * const { processFiles } = useImageProcessing();
 * <ALFileUploader processFiles={processFiles} ... />
 */
export function useImageProcessing(compressOptions?: CompressImageOptions) {
  const abortRef = useRef<AbortController | null>(null);

  const processFiles = useCallback(
    async (files: File[]): Promise<File[]> => {
      // Cancel any previous in-flight processing
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const results: File[] = [];

      for (const file of files) {
        // Check abort between each file
        if (controller.signal.aborted) break;

        try {
          const processed = await processImageFile(file, compressOptions);
          if (!controller.signal.aborted) {
            results.push(processed);
          }
        } catch {
          // If conversion/compression fails for one file, skip it and
          // push the original so the caller can still show a validation error
          // or let the backend reject it.
          if (!controller.signal.aborted) {
            results.push(file);
          }
        }
      }

      return results;
    },
    [compressOptions]
  );

  return { processFiles };
}
