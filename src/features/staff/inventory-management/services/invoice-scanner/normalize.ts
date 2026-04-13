// ──────────────────────────────────────────────────────────
// Text & number normalization helpers for invoice processing
// Handles French/Vietnamese/German diacritics, European number
// formats (Swiss invoices), and common unit abbreviations.
// ──────────────────────────────────────────────────────────

/**
 * Full text normalization: lowercase → trim → strip accents →
 * remove punctuation → collapse whitespace.
 */
export function normalizeText(s: string | null | undefined): string {
  if (!s) return "";
  return removeAccents(s)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip diacritics (Vietnamese, French, German, etc.)
 * NFD decomposition + combining-mark removal.
 */
export function removeAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Tokenize normalized text into unique words.
 */
export function tokenize(s: string): Set<string> {
  const normalized = normalizeText(s);
  return new Set(normalized.split(" ").filter(Boolean));
}

// ──────────────────────────────────────────────────────────
// Numeric parsing (European / Swiss formats)
// ──────────────────────────────────────────────────────────

/**
 * Parse a numeric string from a European-format invoice.
 *
 * Key ambiguity: "15.700" could be 15700 or 15.7.
 * Resolution strategy:
 * - If unitHint is a weight/volume unit (kg, l, g) and the value has
 *   exactly 3 digits after dot → treat as large integer (thousands sep)
 *   ONLY if context suggests so (check against line_total / unit_price).
 * - If both comma AND dot present → last separator is decimal.
 * - Otherwise, dot is decimal.
 *
 * @param raw - raw string from LLM extraction
 * @param contextHints - optional unit_price and line_total to disambiguate
 */
export function parseNumericValue(
  raw: string | number | null | undefined,
  contextHints?: { unitPrice?: number | null; lineTotal?: number | null },
): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return isFinite(raw) ? raw : null;

  const cleaned = raw.replace(/[^\d.,\-]/g, "").trim();
  if (!cleaned) return null;

  // Both comma and dot present → last one is decimal separator
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let numStr: string;

  if (lastComma > -1 && lastDot > -1) {
    // Whichever is last is the decimal separator
    if (lastComma > lastDot) {
      // "1.234,56" → "1234.56"
      numStr = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // "1,234.56" → "1234.56"
      numStr = cleaned.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    // Only commas: "15,700" or "15,7"
    const afterComma = cleaned.slice(lastComma + 1);
    if (afterComma.length === 3 && !cleaned.slice(0, lastComma).includes(",")) {
      // Could be thousands separator — try context disambiguation
      numStr = disambiguateThousands(cleaned.replace(",", ""), cleaned.replace(",", "."), contextHints);
    } else {
      numStr = cleaned.replace(",", ".");
    }
  } else if (lastDot > -1) {
    // Only dots: "15.700" or "15.7"
    const afterDot = cleaned.slice(lastDot + 1);
    if (afterDot.length === 3 && !cleaned.slice(0, lastDot).includes(".")) {
      numStr = disambiguateThousands(cleaned.replace(".", ""), cleaned, contextHints);
    } else {
      numStr = cleaned;
    }
  } else {
    numStr = cleaned;
  }

  const result = Number(numStr);
  return isFinite(result) ? result : null;
}

/**
 * When we can't tell if a separator is decimal or thousands,
 * use line_total / unit_price context to pick the right interpretation.
 *
 * E.g., "15.700" KG at price 23.00 with total 361.10:
 *   - 15700 * 23 = 361100 ≠ 361.10
 *   - 15.7 * 23 = 361.1 ≈ 361.10 ✓
 */
function disambiguateThousands(
  asInteger: string,
  asDecimal: string,
  context?: { unitPrice?: number | null; lineTotal?: number | null },
): string {
  if (!context?.unitPrice || !context?.lineTotal) {
    // No context → prefer decimal interpretation for smaller, realistic values
    const intVal = Number(asInteger);
    const decVal = Number(asDecimal);
    // If integer version produces > 10,000 and decimal < 1000, prefer decimal
    if (intVal > 10_000 && decVal < 1_000) return asDecimal;
    return asDecimal;
  }

  const intVal = Number(asInteger);
  const decVal = Number(asDecimal);
  const expected = context.lineTotal;

  const intError = Math.abs(intVal * context.unitPrice - expected);
  const decError = Math.abs(decVal * context.unitPrice - expected);

  return decError <= intError ? asDecimal : asInteger;
}

// ──────────────────────────────────────────────────────────
// Date parsing
// ──────────────────────────────────────────────────────────

/**
 * Parse common European date formats to ISO YYYY-MM-DD.
 * Accepts: DD.MM.YY, DD.MM.YYYY, DD/MM/YYYY, DD/MM/YY, YYYY-MM-DD.
 * Returns null if unparseable.
 */
export function parseDateValue(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const match = s.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);

  if (year < 100) {
    year += year > 50 ? 1900 : 2000;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ──────────────────────────────────────────────────────────
// Unit normalization
// ──────────────────────────────────────────────────────────

const UNIT_MAP: Record<string, string> = {
  kg: "kg",
  kilo: "kg",
  kilogram: "kg",
  kilogramme: "kg",
  g: "g",
  gram: "g",
  gramme: "g",
  l: "l",
  litre: "l",
  liter: "l",
  ml: "ml",
  millilitre: "ml",
  milliliter: "ml",
  pcs: "pcs",
  pce: "pcs",
  piece: "pcs",
  pieces: "pcs",
  pc: "pcs",
  stk: "pcs",
  stück: "pcs",
  stuk: "pcs",
  box: "box",
  boîte: "box",
  boite: "box",
  carton: "carton",
  bottle: "bottle",
  bouteille: "bottle",
  can: "can",
  canette: "can",
  pack: "pack",
  paquet: "pack",
  bag: "bag",
  sachet: "bag",
  sac: "bag",
  bunch: "bunch",
  botte: "bunch",
};

export function normalizeUnit(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const key = removeAccents(raw.trim().toLowerCase());
  return UNIT_MAP[key] ?? key;
}

/**
 * Check if two unit strings are compatible (same base unit).
 */
export function unitsCompatible(
  extractedUnit: string | null,
  systemUnit: string | null,
): boolean {
  if (!extractedUnit || !systemUnit) return true; // can't compare → assume ok
  return normalizeUnit(extractedUnit) === normalizeUnit(systemUnit);
}
