import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import viMessages from "@/messages/vi.json";

export type SupportedLocale = "en" | "fr" | "vi";

type ApiErrorDictionary = typeof enMessages.common.apiErrors;

type ApiErrorKey = keyof ApiErrorDictionary;

interface ApiErrorBody {
  code?: number;
  subCode?: number;
  userMessage?: string;
  message?: string;
  systemMessage?: string | null;
  validateInfo?: unknown[];
}

export interface ApiClientError extends Error {
  status?: number;
  response?: {
    data: ApiErrorBody;
    status: number;
  };
}

const dictionaries: Record<SupportedLocale, ApiErrorDictionary> = {
  en: enMessages.common.apiErrors,
  fr: frMessages.common.apiErrors,
  vi: viMessages.common.apiErrors,
};

function normalize(value?: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

export function getCurrentLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en";

  const pathLocale = window.location.pathname.split("/").filter(Boolean)[0];
  if (pathLocale === "en" || pathLocale === "fr" || pathLocale === "vi") {
    return pathLocale;
  }

  const htmlLang = document.documentElement.lang.toLowerCase();
  if (htmlLang.startsWith("fr")) return "fr";
  if (htmlLang.startsWith("vi")) return "vi";
  return "en";
}

function formatMessage(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

function getDictionary(locale: SupportedLocale): ApiErrorDictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

function resolveErrorKey(status?: number, body?: ApiErrorBody): ApiErrorKey {
  const systemMessage = normalize(body?.systemMessage);
  const rawMessage = normalize(body?.message);
  const userMessage = normalize(body?.userMessage);
  const subCode = body?.subCode;

  if (status === 0) {
    return "network";
  }

  if (
    systemMessage === "not_found" ||
    rawMessage.includes("resource not found") ||
    subCode === 404 ||
    status === 404
  ) {
    return "notFound";
  }

  if (
    systemMessage === "forbidden" ||
    status === 403
  ) {
    return "forbidden";
  }

  if (
    systemMessage === "validation_error" ||
    rawMessage.includes("validation failed") ||
    subCode === 1 ||
    status === 400
  ) {
    return "validation";
  }

  if (
    systemMessage === "unprocessable_entity" ||
    status === 422
  ) {
    return "unprocessable";
  }

  if (
    systemMessage === "conflict" ||
    status === 409
  ) {
    return "conflict";
  }

  if (status === 408) {
    return "timeout";
  }

  if (
    userMessage.includes("session expired") ||
    rawMessage.includes("session expired")
  ) {
    return "sessionExpired";
  }

  if (
    rawMessage.includes("token refresh failed") ||
    systemMessage.includes("token refresh failed")
  ) {
    return "tokenRefreshFailed";
  }

  if (rawMessage.includes("no access token")) {
    return "noAccessToken";
  }

  if (status === 401) {
    return "unauthorized";
  }

  if (status && status >= 500) {
    return "unexpected";
  }

  return "http";
}

export function getLocalizedApiErrorMessage(
  error: unknown,
  fallbackMessage?: string,
  locale = getCurrentLocale()
): string {
  const dictionary = getDictionary(locale);

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const apiError = error as ApiClientError;
    const body = apiError.response?.data;
    const status = apiError.response?.status ?? apiError.status;

    if (body || status) {
      const key = resolveErrorKey(status, body);
      if (key === "http") {
        return status
          ? formatMessage(dictionary.httpStatus, { status })
          : fallbackMessage ?? body?.userMessage ?? apiError.message ?? dictionary.http;
      }

      return dictionary[key] ?? fallbackMessage ?? apiError.message ?? dictionary.unexpected;
    }

    if (apiError instanceof Error && apiError.message) {
      return fallbackMessage ?? apiError.message;
    }
  }

  return fallbackMessage ?? dictionary.unexpected;
}

export function createApiClientError(
  body: ApiErrorBody | undefined,
  status: number,
  fallbackMessage?: string,
  locale = getCurrentLocale()
): ApiClientError {
  const dictionary = getDictionary(locale);
  const key = resolveErrorKey(status, body);
  const message =
    key === "http"
      ? status > 0
        ? formatMessage(dictionary.httpStatus, { status })
        : fallbackMessage ?? body?.userMessage ?? body?.message ?? dictionary.http
      : dictionary[key] ?? fallbackMessage ?? dictionary.unexpected;

  const error = new Error(message) as ApiClientError;
  error.status = status;
  error.response = {
    data: {
      ...body,
      userMessage: message,
    },
    status,
  };

  return error;
}

export function getLocalizedLoginPath(locale = getCurrentLocale()): string {
  return `/${locale}/login`;
}
