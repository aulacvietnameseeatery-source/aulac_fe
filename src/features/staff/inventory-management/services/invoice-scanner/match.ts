import type { InventoryItemDto } from "../../types/inventory.types";
import type { LlmExtractedLine, MatchCandidate, MatchResult, MatchReason } from "./types";
import { normalizeText, tokenize, normalizeUnit, unitsCompatible } from "./normalize";

// ──────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────

const AUTO_SELECT_MIN_SCORE = 0.85;
const AUTO_SELECT_MIN_GAP = 0.15;
const EXACT_MATCH_SCORE = 1.0;
const MAX_CANDIDATES = 5;

// ──────────────────────────────────────────────────────────
// Main matching function
// ──────────────────────────────────────────────────────────

/**
 * Match a single extracted invoice line against the full system items list.
 * Returns ranked candidates with confidence scores.
 */
export function matchLineToSystemItems(
  line: LlmExtractedLine,
  systemItems: InventoryItemDto[],
): MatchResult {
  const itemName = line.item_name;
  const identifier = line.identifier;

  if (!itemName && !identifier) {
    return noMatch();
  }

  const candidates: MatchCandidate[] = [];

  for (const item of systemItems) {
    const score = scoreItem(line, item);
    if (score.score > 0.1) {
      candidates.push({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        unitLvId: item.unitLvId,
        unitName: item.unitName,
        categoryName: item.categoryName,
        score: score.score,
        matchReason: score.reason,
      });
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  // Keep top N
  const topCandidates = candidates.slice(0, MAX_CANDIDATES);

  if (topCandidates.length === 0) {
    return noMatch();
  }

  const best = topCandidates[0];
  const second = topCandidates.length > 1 ? topCandidates[1] : null;
  const gap = second ? best.score - second.score : 1.0;

  // Auto-select: exact match OR high score with clear margin
  const autoSelected =
    best.score >= EXACT_MATCH_SCORE ||
    (best.score >= AUTO_SELECT_MIN_SCORE && gap >= AUTO_SELECT_MIN_GAP);

  return {
    matched: true,
    autoSelected,
    bestMatch: autoSelected ? best : null,
    candidates: topCandidates,
    confidence: best.score,
  };
}

// ──────────────────────────────────────────────────────────
// Scoring pipeline
// ──────────────────────────────────────────────────────────

interface ScoreResult {
  score: number;
  reason: MatchReason;
}

function scoreItem(line: LlmExtractedLine, item: InventoryItemDto): ScoreResult {
  const scores: ScoreResult[] = [];

  // 1. Exact normalized name match
  const nameScore = scoreExactName(line.item_name, item.ingredientName);
  if (nameScore.score > 0) scores.push(nameScore);

  // 2. Identifier matches ingredient name (e.g., "106555" literally in name)
  const identifierScore = scoreIdentifier(line.identifier, item.ingredientName);
  if (identifierScore.score > 0) scores.push(identifierScore);

  // 3. Substring containment
  const substringScore = scoreSubstring(line.item_name, item.ingredientName);
  if (substringScore.score > 0) scores.push(substringScore);

  // 4. Word overlap (Jaccard similarity)
  const overlapScore = scoreWordOverlap(line.item_name, item.ingredientName);
  if (overlapScore.score > 0) scores.push(overlapScore);

  // 5. Category hint from line context
  const categoryScore = scoreCategoryHint(line, item);
  if (categoryScore.score > 0) scores.push(categoryScore);

  if (scores.length === 0) return { score: 0, reason: "NONE" };

  // Take the highest individual score
  const best = scores.reduce((a, b) => (a.score > b.score ? a : b));

  // Apply unit compatibility bonus/penalty
  let finalScore = best.score;
  if (line.unit && item.unitName) {
    if (unitsCompatible(line.unit, item.unitName)) {
      finalScore = Math.min(1.0, finalScore + 0.05);
    } else {
      finalScore = Math.max(0, finalScore - 0.1);
    }
  }

  return { score: round(finalScore), reason: best.reason };
}

// ── Score: exact name ──────────────────────────────────────

function scoreExactName(extractedName: string | null, systemName: string): ScoreResult {
  if (!extractedName) return { score: 0, reason: "NONE" };

  const a = normalizeText(extractedName);
  const b = normalizeText(systemName);

  if (!a || !b) return { score: 0, reason: "NONE" };
  if (a === b) return { score: EXACT_MATCH_SCORE, reason: "EXACT_NAME" };

  return { score: 0, reason: "NONE" };
}

// ── Score: identifier in system name ─────────────────────

function scoreIdentifier(identifier: string | null, systemName: string): ScoreResult {
  if (!identifier) return { score: 0, reason: "NONE" };

  const normId = normalizeText(identifier);
  const normName = normalizeText(systemName);

  if (!normId || !normName) return { score: 0, reason: "NONE" };

  // Raw identifier directly found in the system name
  if (normName.includes(normId) || normId.includes(normName)) {
    return { score: 0.95, reason: "IDENTIFIER_MATCH" };
  }

  return { score: 0, reason: "NONE" };
}

// ── Score: substring containment ────────────────────────

function scoreSubstring(extractedName: string | null, systemName: string): ScoreResult {
  if (!extractedName) return { score: 0, reason: "NONE" };

  const a = normalizeText(extractedName);
  const b = normalizeText(systemName);

  if (!a || !b) return { score: 0, reason: "NONE" };
  if (a === b) return { score: 0, reason: "NONE" }; // handled by exact match

  if (b.includes(a) || a.includes(b)) {
    // Score based on length ratio — longer overlap = higher score
    const shorter = Math.min(a.length, b.length);
    const longer = Math.max(a.length, b.length);
    const ratio = shorter / longer;
    const score = 0.6 + ratio * 0.2; // Range: 0.6–0.8
    return { score: round(score), reason: "SUBSTRING" };
  }

  return { score: 0, reason: "NONE" };
}

// ── Score: word overlap (Jaccard) ───────────────────────

function scoreWordOverlap(extractedName: string | null, systemName: string): ScoreResult {
  if (!extractedName) return { score: 0, reason: "NONE" };

  const tokensA = tokenize(extractedName);
  const tokensB = tokenize(systemName);

  if (tokensA.size === 0 || tokensB.size === 0) return { score: 0, reason: "NONE" };

  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }

  if (intersection === 0) return { score: 0, reason: "NONE" };

  const union = new Set([...tokensA, ...tokensB]).size;
  const jaccard = intersection / union;
  const score = jaccard * 0.7; // Jaccard caps at 0.7 (below auto-select threshold alone)

  return { score: round(score), reason: "WORD_OVERLAP" };
}

// ── Score: category hint ────────────────────────────────

function scoreCategoryHint(line: LlmExtractedLine, item: InventoryItemDto): ScoreResult {
  if (!item.categoryName) return { score: 0, reason: "NONE" };

  // Use combined context from line (name, notes, origin) to detect category hints
  const context = normalizeText(
    [line.item_name, line.notes, line.origin].filter(Boolean).join(" "),
  );
  const category = normalizeText(item.categoryName);

  if (!context || !category) return { score: 0, reason: "NONE" };

  // Category name appears in line context → small boost
  if (context.includes(category) || category.includes(context.split(" ")[0])) {
    return { score: 0.2, reason: "CATEGORY_HINT" };
  }

  return { score: 0, reason: "NONE" };
}

// ── Helpers ─────────────────────────────────────────────

function noMatch(): MatchResult {
  return {
    matched: false,
    autoSelected: false,
    bestMatch: null,
    candidates: [],
    confidence: 0,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
