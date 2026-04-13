import type { InventoryItemDto } from "../../types/inventory.types";
import type {
  LlmExtractedLine,
  LlmExtractedHeader,
  LlmExtractedTotals,
  MatchResult,
  LineValidation,
  ProcessedLineItem,
} from "./types";
import { parseDateValue, normalizeUnit } from "./normalize";

// ──────────────────────────────────────────────────────────
// Per-line validation
// ──────────────────────────────────────────────────────────

export function validateLine(
  line: LlmExtractedLine,
  matchResult: MatchResult,
  _systemItems: InventoryItemDto[],
): LineValidation[] {
  const errors: LineValidation[] = [];

  // ── Blocking errors ────────────────────────────────────

  if (!line.item_name?.trim()) {
    errors.push({
      code: "MISSING_ITEM_NAME",
      severity: "error",
      message: "Item name is missing or empty",
      field: "item_name",
    });
  }

  if (line.quantity === null || line.quantity === undefined) {
    errors.push({
      code: "MISSING_QUANTITY",
      severity: "error",
      message: "Quantity is missing",
      field: "quantity",
    });
  } else if (typeof line.quantity !== "number" || !isFinite(line.quantity)) {
    errors.push({
      code: "INVALID_QUANTITY",
      severity: "error",
      message: "Quantity is not a valid number",
      field: "quantity",
    });
  } else if (line.quantity < 0) {
    errors.push({
      code: "NEGATIVE_QUANTITY",
      severity: "error",
      message: "Quantity cannot be negative",
      field: "quantity",
    });
  }

  if (!line.unit?.trim()) {
    errors.push({
      code: "MISSING_UNIT",
      severity: "error",
      message: "Unit is missing",
      field: "unit",
    });
  }

  if (line.unit_price === null || line.unit_price === undefined) {
    errors.push({
      code: "MISSING_UNIT_PRICE",
      severity: "error",
      message: "Unit price is missing",
      field: "unit_price",
    });
  }

  if (line.line_total === null || line.line_total === undefined) {
    errors.push({
      code: "MISSING_LINE_TOTAL",
      severity: "error",
      message: "Line total is missing",
      field: "line_total",
    });
  }

  if (line.expiry_date) {
    const parsed = parseDateValue(line.expiry_date);
    if (!parsed) {
      errors.push({
        code: "INVALID_DATE",
        severity: "error",
        message: `Invalid expiry date format: ${line.expiry_date}`,
        field: "expiry_date",
      });
    }
  }

  if (!matchResult.matched) {
    errors.push({
      code: "ITEM_NOT_MATCHED",
      severity: "error",
      message: "No matching item found in the system",
      field: "item_name",
    });
  }

  // ── Warnings ───────────────────────────────────────────

  if (line.ocr_confidence === "LOW") {
    errors.push({
      code: "LOW_CONFIDENCE_OCR",
      severity: "warning",
      message: "OCR confidence is low — verify extracted values",
    });
  }

  if (matchResult.matched && !matchResult.autoSelected && matchResult.candidates.length > 1) {
    errors.push({
      code: "ITEM_MATCH_AMBIGUOUS",
      severity: "warning",
      message: `${matchResult.candidates.length} possible matches found — manual selection required`,
      field: "item_name",
    });
  }

  // Unit mismatch between invoice and selected system item
  if (
    matchResult.autoSelected &&
    matchResult.bestMatch &&
    line.unit &&
    matchResult.bestMatch.unitName
  ) {
    const extractedUnit = normalizeUnit(line.unit);
    const systemUnit = normalizeUnit(matchResult.bestMatch.unitName);
    if (extractedUnit && systemUnit && extractedUnit !== systemUnit) {
      errors.push({
        code: "UNIT_MISMATCH",
        severity: "warning",
        message: `Invoice unit "${line.unit}" differs from system unit "${matchResult.bestMatch.unitName}"`,
        field: "unit",
      });
    }
  }

  // Line total cross-check
  if (
    line.quantity != null &&
    line.unit_price != null &&
    line.line_total != null &&
    isFinite(line.quantity) &&
    isFinite(line.unit_price)
  ) {
    const computed = line.quantity * line.unit_price;
    const diff = Math.abs(computed - line.line_total);
    // Allow 0.5% tolerance or 0.05 absolute
    if (diff > Math.max(0.05, line.line_total * 0.005)) {
      errors.push({
        code: "TOTAL_MISMATCH",
        severity: "warning",
        message: `Line total ${line.line_total} ≠ quantity × price (${computed.toFixed(2)})`,
        field: "line_total",
      });
    }
  }

  // Suspicious values
  if (line.unit_price != null && line.unit_price > 10_000) {
    errors.push({
      code: "SUSPICIOUS_PRICE",
      severity: "warning",
      message: `Unit price ${line.unit_price} seems unusually high`,
      field: "unit_price",
    });
  }

  if (line.quantity != null && line.quantity > 10_000) {
    errors.push({
      code: "SUSPICIOUS_QUANTITY",
      severity: "warning",
      message: `Quantity ${line.quantity} seems unusually high`,
      field: "quantity",
    });
  }

  return errors;
}

// ──────────────────────────────────────────────────────────
// Document-level validation
// ──────────────────────────────────────────────────────────

export function validateDocument(
  header: LlmExtractedHeader,
  processedItems: ProcessedLineItem[],
  totals: LlmExtractedTotals,
): LineValidation[] {
  const warnings: LineValidation[] = [];

  // No line items at all
  if (processedItems.length === 0) {
    warnings.push({
      code: "NO_LINE_ITEMS",
      severity: "warning",
      message: "No line items were extracted from this document. Only header information is available.",
    });
  }

  // Document totals vs sum of line totals
  if (totals.subtotal != null && processedItems.length > 0) {
    const linesSum = processedItems.reduce((sum, item) => {
      return sum + (item.extracted.line_total ?? 0);
    }, 0);

    if (linesSum > 0) {
      const diff = Math.abs(linesSum - totals.subtotal);
      if (diff > Math.max(0.1, totals.subtotal * 0.005)) {
        warnings.push({
          code: "TOTAL_MISMATCH",
          severity: "warning",
          message: `Sum of line totals (${linesSum.toFixed(2)}) differs from document subtotal (${totals.subtotal})`,
        });
      }
    }
  }

  return warnings;
}

// ──────────────────────────────────────────────────────────
// Check if a line has blocking errors
// ──────────────────────────────────────────────────────────

export function hasBlockingErrors(validations: LineValidation[]): boolean {
  return validations.some((v) => v.severity === "error");
}
