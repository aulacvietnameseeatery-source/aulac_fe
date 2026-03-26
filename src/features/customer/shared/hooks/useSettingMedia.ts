"use client";

import { useEffect, useMemo, useState } from "react";

const CACHE_PARAM = "storeMediaTs";

const shouldBypassCache = (src: string) =>
  src.includes("/uploads/") || src.includes("uploads/");

const appendCacheBuster = (src: string, version: string) => {
  if (!src || !shouldBypassCache(src)) return src;

  const [base, hash = ""] = src.split("#");
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${CACHE_PARAM}=${version}${hash ? `#${hash}` : ""}`;
};

export function useSettingMedia(src: string, isSettingsLoading = false) {
  const [cacheVersion, setCacheVersion] = useState(() => Date.now().toString());
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCacheVersion(Date.now().toString());
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const mediaSrc = useMemo(
    () => appendCacheBuster(src, cacheVersion),
    [cacheVersion, src]
  );

  const hasSource = Boolean(src);
  const showSkeleton = isSettingsLoading || !hasSource || !isLoaded || hasError;

  return {
    hasSource,
    mediaSrc,
    showSkeleton,
    handleLoad: () => {
      setIsLoaded(true);
      setHasError(false);
    },
    handleError: () => {
      setIsLoaded(false);
      setHasError(true);
    },
  };
}
