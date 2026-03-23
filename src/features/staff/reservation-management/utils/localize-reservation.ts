const STATUS_KEY_BY_CODE: Record<string, string> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CHECKED_IN: "checkedIn",
    CANCELLED: "cancelled",
    NO_SHOW: "noShow",
    COMPLETED: "completed",
};

const SOURCE_KEY_BY_CODE: Record<string, string> = {
    ONLINE: "online",
    PHONE: "phone",
    WALK_IN: "walkIn",
};

type Translator = (key: string) => string;

export const localizeStatusLabel = (
    statusCode: string | undefined,
    fallback: string,
    tStatus: Translator
): string => {
    const code = (statusCode || "").toUpperCase();
    const key = STATUS_KEY_BY_CODE[code];
    if (!key) {
        return fallback;
    }

    try {
        return tStatus(key);
    } catch {
        return fallback;
    }
};

export const localizeSourceLabel = (
    sourceCode: string | undefined,
    fallback: string,
    tSource: Translator
): string => {
    const code = (sourceCode || "").toUpperCase();
    const key = SOURCE_KEY_BY_CODE[code];
    if (!key) {
        return fallback;
    }

    try {
        return tSource(key);
    } catch {
        return fallback;
    }
};
