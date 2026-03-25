import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["en", "fr", "vi"] as const;
const MODULES = [
    "common",
    "auth",
    "orders",
    "kitchen",
    "reservations",
    "shift",
    "table",
    "notifications",
    "catalog",
    "settings",
    "navigation",
    "inventory",
    "supplier",
] as const;

type MessageTree = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: MessageTree, incoming: MessageTree): MessageTree {
    const result: MessageTree = { ...base };

    for (const [key, value] of Object.entries(incoming)) {
        const current = result[key];
        if (isRecord(current) && isRecord(value)) {
            result[key] = deepMerge(current, value);
            continue;
        }
        result[key] = value;
    }

    return result;
}

async function loadLocaleMessages(locale: string): Promise<MessageTree> {
    let merged: MessageTree = {};

    for (const moduleName of MODULES) {
        try {
            const mod = (await import(`./messages/${locale}/${moduleName}.json`)).default as MessageTree;
            merged = deepMerge(merged, mod);
        } catch {
            // Optional module file; ignore missing file for incremental migration.
        }
    }

    if (Object.keys(merged).length === 0) {
        return (await import(`./messages/${locale}.json`)).default as MessageTree;
    }

    return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = await requestLocale;

    if (!locale || !locales.includes(locale as (typeof locales)[number])) {
        notFound();
    }

    return {
        locale,
        messages: await loadLocaleMessages(locale),
    };
});