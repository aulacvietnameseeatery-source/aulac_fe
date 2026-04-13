import type { LlmExtractedInvoice } from "./types";

/**
 * Safely parse the raw LLM response string into a typed invoice object.
 *
 * Handles:
 * - Markdown-fenced JSON (```json ... ```)
 * - Leading/trailing whitespace or text
 * - Partial or malformed responses
 */
export function parseLlmResponse(rawJson: string | null | undefined): {
  success: boolean;
  data: LlmExtractedInvoice | null;
  error: string | null;
} {
  if (!rawJson || rawJson.trim().length === 0) {
    return { success: false, data: null, error: "Empty response from LLM" };
  }

  const cleaned = stripMarkdownFences(rawJson);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from surrounding text
    const extracted = extractJsonObject(cleaned);
    if (!extracted) {
      return {
        success: false,
        data: null,
        error: "Failed to parse LLM response as JSON",
      };
    }
    try {
      parsed = JSON.parse(extracted);
    } catch {
      return {
        success: false,
        data: null,
        error: "Failed to parse extracted JSON from LLM response",
      };
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return { success: false, data: null, error: "LLM response is not a JSON object" };
  }

  const invoice = normalizeStructure(parsed as Record<string, unknown>);
  return { success: true, data: invoice, error: null };
}

// ──────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────

function stripMarkdownFences(s: string): string {
  // Remove ```json ... ``` or ``` ... ```
  const fenceRegex = /^[\s\S]*?```(?:json)?\s*\n?([\s\S]*?)```[\s\S]*$/;
  const match = s.match(fenceRegex);
  if (match) return match[1].trim();
  return s.trim();
}

function extractJsonObject(s: string): string | null {
  // Find the first { ... last }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return s.slice(first, last + 1);
}

/**
 * Normalize raw parsed object to ensure required structure exists.
 * Missing fields get safe defaults — never throws.
 */
function normalizeStructure(raw: Record<string, unknown>): LlmExtractedInvoice {
  const header = (raw.header as Record<string, unknown>) ?? {};
  const totals = (raw.totals as Record<string, unknown>) ?? {};
  const lines = Array.isArray(raw.lines) ? raw.lines : [];

  return {
    document_type: asDocumentType(raw.document_type),
    header: {
      supplier_name: asStr(header.supplier_name),
      supplier_address: asStr(header.supplier_address),
      supplier_phone: asStr(header.supplier_phone),
      supplier_tax_id: asStr(header.supplier_tax_id),
      invoice_number: asStr(header.invoice_number),
      invoice_date: asStr(header.invoice_date),
      client_name: asStr(header.client_name),
      client_number: asStr(header.client_number),
      delivery_number: asStr(header.delivery_number),
      delivery_date: asStr(header.delivery_date),
      payment_method: asStr(header.payment_method),
      currency: asStr(header.currency) ?? "CHF",
    },
    lines: lines.map((line: unknown, idx: number) => {
      const l = (line as Record<string, unknown>) ?? {};
      return {
        line_number: asNum(l.line_number) ?? idx + 1,
        raw_text: asStr(l.raw_text),
        identifier: asStr(l.identifier),
        item_name: asStr(l.item_name),
        origin: asStr(l.origin),
        quantity: asNum(l.quantity),
        unit: asStr(l.unit),
        unit_price: asNum(l.unit_price),
        line_total: asNum(l.line_total),
        discount: asNum(l.discount),
        batch_number: asStr(l.batch_number),
        expiry_date: asStr(l.expiry_date),
        notes: asStr(l.notes),
        ocr_confidence: asOcrConfidence(l.ocr_confidence),
      };
    }),
    totals: {
      subtotal: asNum(totals.subtotal),
      tax_rate: asNum(totals.tax_rate),
      tax_amount: asNum(totals.tax_amount),
      total: asNum(totals.total),
      total_label: asStr(totals.total_label),
    },
    raw_text_excerpt: asStr(raw.raw_text_excerpt),
  };
}

function asStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return String(v);
}

function asNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return isFinite(n) ? n : null;
}

function asDocumentType(v: unknown): LlmExtractedInvoice["document_type"] {
  const valid = ["INVOICE", "RECEIPT", "DELIVERY_NOTE", "UNKNOWN"];
  const s = String(v ?? "").toUpperCase();
  return valid.includes(s) ? (s as LlmExtractedInvoice["document_type"]) : "UNKNOWN";
}

function asOcrConfidence(v: unknown): "HIGH" | "MEDIUM" | "LOW" | null {
  const valid = ["HIGH", "MEDIUM", "LOW"];
  const s = String(v ?? "").toUpperCase();
  return valid.includes(s) ? (s as "HIGH" | "MEDIUM" | "LOW") : null;
}
