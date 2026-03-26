import { useCallback, useRef } from "react";
import { processImageFile, type CompressImageOptions, isHeicFile } from "@/lib/image-processing";

export interface UseImageProcessingOptions {
  compressOptions?: CompressImageOptions;
  onError?: (fileName: string, error: Error) => void;
}

/**
 * Hook that returns a `processFiles` callback suitable for the
 * `ALFileUploader` `processFiles` prop.
 *
 * Files are processed **sequentially** (not in parallel) to avoid
 * memory spikes when converting multiple HEIC photos at once.
 *
 * Reports errors via onError callback for HEIC conversion failures.
 * Aborts cleanly on unmount via an internal `AbortController`.
 *
 * @example
 * const { processFiles } = useImageProcessing({
 *   onError: (fileName, error) => toast.error(`Failed to process ${fileName}`)
 * });
 * <ALFileUploader processFiles={processFiles} ... />
 */
export function useImageProcessing(options?: UseImageProcessingOptions) {
  const abortRef = useRef<AbortController | null>(null);
  const { compressOptions, onError } = options || {};

  const processFiles = useCallback(
    async (files: File[]): Promise<File[]> => {
      // Cancel any previous in-flight processing
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const results: File[] = [];
      const errors: { file: string; error: Error }[] = [];

      for (const file of files) {
        // Check abort between each file
        if (controller.signal.aborted) break;

        try {
          const processed = await processImageFile(file, compressOptions);
          if (!controller.signal.aborted) {
            results.push(processed);
          }
        } catch (error) {
          // Track error but don't add unprocessed file
          const errorObj = error instanceof Error ? error : new Error(String(error));
          errors.push({ file: file.name, error: errorObj });

          // Report the error if callback provided
          if (onError) {
            onError(file.name, errorObj);
          } else {
            // Log for debugging if no callback
            console.error(
              `[useImageProcessing] Failed to process ${file.name}:`,
              errorObj
            );
          }
        }
      }

      return results;
    },
    [compressOptions, onError]
  );

  return { processFiles };
}
