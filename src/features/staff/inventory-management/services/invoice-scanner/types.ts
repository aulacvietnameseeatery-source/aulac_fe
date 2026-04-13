import type { InventoryItemDto, TransactionItemRequest } from "../../types/inventory.types";

// ──────────────────────────────────────────────────────────
// LLM Extracted Invoice (raw response from vision model)
// ──────────────────────────────────────────────────────────

export type DocumentType = "INVOICE" | "RECEIPT" | "DELIVERY_NOTE" | "UNKNOWN";
export type OcrConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface LlmExtractedHeader {
  supplier_name: string | null;
  supplier_address: string | null;
  supplier_phone: string | null;
  supplier_tax_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  client_name: string | null;
  client_number: string | null;
  delivery_number: string | null;
  delivery_date: string | null;
  payment_method: string | null;
  currency: string;
}

export interface LlmExtractedLine {
  line_number: number;
  raw_text: string | null;
  identifier: string | null;
  item_name: string | null;
  origin: string | null;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
  line_total: number | null;
  discount: number | null;
  batch_number: string | null;
  expiry_date: string | null;
  notes: string | null;
  ocr_confidence: OcrConfidence | null;
}

export interface LlmExtractedTotals {
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number | null;
  total_label: string | null;
}

export interface LlmExtractedInvoice {
  document_type: DocumentType;
  header: LlmExtractedHeader;
  lines: LlmExtractedLine[];
  totals: LlmExtractedTotals;
  raw_text_excerpt: string | null;
}

// ──────────────────────────────────────────────────────────
// Matching
// ──────────────────────────────────────────────────────────

export type MatchReason =
  | "EXACT_NAME"
  | "IDENTIFIER_MATCH"
  | "SUBSTRING"
  | "WORD_OVERLAP"
  | "CATEGORY_HINT"
  | "NONE";

export interface MatchCandidate {
  ingredientId: number;
  ingredientName: string;
  unitLvId: number;
  unitName: string | null;
  categoryName: string | null;
  score: number;
  matchReason: MatchReason;
}

export interface MatchResult {
  matched: boolean;
  autoSelected: boolean;
  bestMatch: MatchCandidate | null;
  candidates: MatchCandidate[];
  confidence: number;
}

// ──────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────

export type BlockingErrorCode =
  | "MISSING_ITEM_NAME"
  | "MISSING_QUANTITY"
  | "INVALID_QUANTITY"
  | "NEGATIVE_QUANTITY"
  | "MISSING_UNIT"
  | "MISSING_UNIT_PRICE"
  | "MISSING_LINE_TOTAL"
  | "INVALID_DATE"
  | "ITEM_NOT_MATCHED"
  | "ITEM_INACTIVE";

export type WarningCode =
  | "LOW_CONFIDENCE_OCR"
  | "ITEM_MATCH_AMBIGUOUS"
  | "UNIT_MISMATCH"
  | "TOTAL_MISMATCH"
  | "SUSPICIOUS_PRICE"
  | "SUSPICIOUS_QUANTITY"
  | "NO_LINE_ITEMS";

export type ValidationCode = BlockingErrorCode | WarningCode;

export type ValidationSeverity = "error" | "warning";

export interface LineValidation {
  code: ValidationCode;
  severity: ValidationSeverity;
  message: string;
  field?: string;
}

// ──────────────────────────────────────────────────────────
// Processed Output
// ──────────────────────────────────────────────────────────

export interface ProcessedLineItem {
  lineNumber: number;
  rawText: string | null;
  extracted: LlmExtractedLine;
  matchResult: MatchResult;
  validations: LineValidation[];
  readyToFill: boolean;
  formItem: TransactionItemRequest | null;
}

export interface TotalsCheck {
  documentTotal: number | null;
  computedLinesTotal: number;
  difference: number | null;
  matches: boolean;
  taxRate: number | null;
  taxAmount: number | null;
}

export interface FormFillSummary {
  readyCount: number;
  totalCount: number;
  canAutoSubmit: boolean;
  items: TransactionItemRequest[];
}

export interface InvoiceScanOutput {
  document_type: DocumentType;
  header: LlmExtractedHeader;
  items: ProcessedLineItem[];
  totals_check: TotalsCheck;
  form_fill: FormFillSummary;
  document_validation: LineValidation[];
  raw_text_excerpt: string | null;
}

// ──────────────────────────────────────────────────────────
// Input
// ──────────────────────────────────────────────────────────

export interface InvoiceScanInput {
  imageFile: File;
  systemItems: InventoryItemDto[];
}

// ──────────────────────────────────────────────────────────
// BE Response (mirrors Core/DTO/Inventory/InvoiceScanResult)
// ──────────────────────────────────────────────────────────

export interface InvoiceScanResultDto {
  success: boolean;
  rawJson: string | null;
  errorMessage: string | null;
  tokensUsed: number;
}
