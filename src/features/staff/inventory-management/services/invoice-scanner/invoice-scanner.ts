import type { InventoryItemDto, TransactionItemRequest } from "../../types/inventory.types";
import type {
  InvoiceScanInput,
  InvoiceScanOutput,
  InvoiceScanResultDto,
  ProcessedLineItem,
  TotalsCheck,
  FormFillSummary,
  LlmExtractedLine,
  MatchResult,
} from "./types";
import { parseLlmResponse } from "./parse";
import { matchLineToSystemItems } from "./match";
import { validateLine, validateDocument, hasBlockingErrors } from "./validate";
import { parseNumericValue, parseDateValue } from "./normalize";
import { api } from "@/lib/http";
import type { ApiResponse } from "@/types/api-response.types";

// ──────────────────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────────────────

/**
 * Full invoice image processing pipeline:
 * 1. Upload image to BE → LLM vision extraction
 * 2. Parse LLM JSON response
 * 3. For each line: normalize → match → validate
 * 4. Build form-ready payload
 *
 * @returns Strongly typed output ready for UI consumption
 */
export async function processInvoiceImage(
  input: InvoiceScanInput,
): Promise<InvoiceScanOutput> {
  const { imageFile, systemItems } = input;

  // ── Step 1: Call BE scan endpoint ──────────────────────
  const scanResult = await callScanEndpoint(imageFile);

  if (!scanResult.success || !scanResult.rawJson) {
    return buildErrorOutput(scanResult.errorMessage ?? "Invoice scan failed");
  }

  // ── Step 2: Parse LLM response ────────────────────────
  const parsed = parseLlmResponse(scanResult.rawJson);

  if (!parsed.success || !parsed.data) {
    return buildErrorOutput(parsed.error ?? "Failed to parse invoice data");
  }

  const invoice = parsed.data;

  // ── Step 3: Process each line ─────────────────────────
  const processedItems = invoice.lines.map((line, _idx) =>
    processLine(line, systemItems),
  );

  // ── Step 4: Build totals check ────────────────────────
  const totalsCheck = buildTotalsCheck(processedItems, invoice.totals);

  // ── Step 5: Document-level validation ─────────────────
  const documentValidation = validateDocument(
    invoice.header,
    processedItems,
    invoice.totals,
  );

  // ── Step 6: Build form fill summary ───────────────────
  const formFill = buildFormFill(processedItems);

  return {
    document_type: invoice.document_type,
    header: invoice.header,
    items: processedItems,
    totals_check: totalsCheck,
    form_fill: formFill,
    document_validation: documentValidation,
    raw_text_excerpt: invoice.raw_text_excerpt,
  };
}

// ──────────────────────────────────────────────────────────
// Step 1: API call
// ──────────────────────────────────────────────────────────

async function callScanEndpoint(imageFile: File): Promise<InvoiceScanResultDto> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await api.post<ApiResponse<InvoiceScanResultDto>>(
    "/api/inventory/scan-invoice",
    formData,
  );

  return res.data;
}

// ──────────────────────────────────────────────────────────
// Step 3: Per-line processing
// ──────────────────────────────────────────────────────────

function processLine(
  line: LlmExtractedLine,
  systemItems: InventoryItemDto[],
): ProcessedLineItem {
  // Re-parse numeric fields using context-aware parsing
  const normalizedLine = normalizeLineNumbers(line);

  // Match against system items
  const matchResult = matchLineToSystemItems(normalizedLine, systemItems);

  // Validate
  const validations = validateLine(normalizedLine, matchResult, systemItems);

  // Build form item if auto-selected and no blocking errors
  const readyToFill = matchResult.autoSelected && !hasBlockingErrors(validations);
  const formItem = readyToFill
    ? buildFormItem(normalizedLine, matchResult)
    : null;

  return {
    lineNumber: normalizedLine.line_number,
    rawText: normalizedLine.raw_text,
    extracted: normalizedLine,
    matchResult,
    validations,
    readyToFill,
    formItem,
  };
}

function normalizeLineNumbers(line: LlmExtractedLine): LlmExtractedLine {
  const contextHints = {
    unitPrice: line.unit_price,
    lineTotal: line.line_total,
  };

  return {
    ...line,
    quantity: parseNumericValue(line.quantity, contextHints),
    unit_price: parseNumericValue(line.unit_price),
    line_total: parseNumericValue(line.line_total),
    discount: parseNumericValue(line.discount),
    expiry_date: parseDateValue(line.expiry_date) ?? line.expiry_date,
  };
}

function buildFormItem(
  line: LlmExtractedLine,
  matchResult: MatchResult,
): TransactionItemRequest | null {
  if (!matchResult.bestMatch) return null;
  if (line.quantity == null || line.quantity <= 0) return null;

  return {
    ingredientId: matchResult.bestMatch.ingredientId,
    quantity: line.quantity,
    unitLvId: matchResult.bestMatch.unitLvId,
    unitPrice: line.unit_price ?? undefined,
    note: [line.identifier, line.batch_number, line.notes]
      .filter(Boolean)
      .join(" | ") || undefined,
  };
}

// ──────────────────────────────────────────────────────────
// Step 4: Totals check
// ──────────────────────────────────────────────────────────

function buildTotalsCheck(
  items: ProcessedLineItem[],
  totals: { subtotal?: number | null; total?: number | null; tax_rate?: number | null; tax_amount?: number | null },
): TotalsCheck {
  const computedLinesTotal = items.reduce((sum, item) => {
    return sum + (item.extracted.line_total ?? 0);
  }, 0);

  const documentTotal = totals?.total ?? totals?.subtotal ?? null;
  const subtotal = totals?.subtotal ?? null;

  let difference: number | null = null;
  let matches = true;

  if (subtotal != null && computedLinesTotal > 0) {
    difference = Math.abs(computedLinesTotal - subtotal);
    matches = difference <= Math.max(0.1, subtotal * 0.005);
  }

  return {
    documentTotal,
    computedLinesTotal: Math.round(computedLinesTotal * 100) / 100,
    difference: difference != null ? Math.round(difference * 100) / 100 : null,
    matches,
    taxRate: totals?.tax_rate ?? null,
    taxAmount: totals?.tax_amount ?? null,
  };
}

// ──────────────────────────────────────────────────────────
// Step 6: Form fill summary
// ──────────────────────────────────────────────────────────

function buildFormFill(items: ProcessedLineItem[]): FormFillSummary {
  const readyItems = items.filter((i) => i.readyToFill && i.formItem);

  return {
    readyCount: readyItems.length,
    totalCount: items.length,
    canAutoSubmit: items.length > 0 && readyItems.length === items.length,
    items: readyItems.map((i) => i.formItem!),
  };
}

// ──────────────────────────────────────────────────────────
// Error output builder
// ──────────────────────────────────────────────────────────

function buildErrorOutput(message: string): InvoiceScanOutput {
  return {
    document_type: "UNKNOWN",
    header: {
      supplier_name: null,
      supplier_address: null,
      supplier_phone: null,
      supplier_tax_id: null,
      invoice_number: null,
      invoice_date: null,
      client_name: null,
      client_number: null,
      delivery_number: null,
      delivery_date: null,
      payment_method: null,
      currency: "CHF",
    },
    items: [],
    totals_check: {
      documentTotal: null,
      computedLinesTotal: 0,
      difference: null,
      matches: true,
      taxRate: null,
      taxAmount: null,
    },
    form_fill: {
      readyCount: 0,
      totalCount: 0,
      canAutoSubmit: false,
      items: [],
    },
    document_validation: [
      {
        code: "MISSING_ITEM_NAME",
        severity: "error",
        message,
      },
    ],
    raw_text_excerpt: null,
  };
}
