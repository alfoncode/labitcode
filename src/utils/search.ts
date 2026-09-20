export interface SearchEntry {
  title: string;
  description: string;
  tags: string[];
  slug: string;
  type: "blog" | "project";
  lang: "en" | "es";
}

/**
 * Normalizes text for search:
 * - Converts to lowercase
 * - Strips diacritics (accents) for Spanish/English tolerance (e.g., guía -> guia)
 * - Replaces non-alphanumeric characters with spaces
 * - Normalizes consecutive spaces
 */
export function normalize(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes the Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const lenA = a.length;
  const lenB = b.length;
  const prevRow = new Array(lenB + 1);
  const currRow = new Array(lenB + 1);

  for (let j = 0; j <= lenB; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    currRow[0] = i;
    const charA = a[i - 1];
    for (let j = 1; j <= lenB; j++) {
      const cost = charA === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // deletion
        prevRow[j - 1] + cost // substitution
      );
    }
    for (let j = 0; j <= lenB; j++) {
      prevRow[j] = currRow[j];
    }
  }

  return prevRow[lenB];
}

/**
 * Scores how well a single query token matches a candidate text field.
 */
function scoreTokenInText(token: string, normField: string, fieldWords: string[]): number {
  if (!token || !normField) return 0;

  // 1. Exact match of the entire field
  if (normField === token) {
    return 100;
  }

  // 2. Field starts with the exact token
  if (normField.startsWith(token + " ")) {
    return 80;
  }

  let bestWordScore = 0;

  for (const word of fieldWords) {
    if (word === token) {
      bestWordScore = Math.max(bestWordScore, 90);
      break;
    }

    if (word.startsWith(token)) {
      // Score based on how much of the word was typed
      const ratio = token.length / word.length;
      bestWordScore = Math.max(bestWordScore, 60 + 20 * ratio);
      continue;
    }

    if (word.includes(token) && token.length >= 3) {
      bestWordScore = Math.max(bestWordScore, 40);
      continue;
    }

    // Fuzzy matching with Levenshtein distance for typo tolerance
    if (token.length >= 4) {
      const maxAllowedDistance = token.length >= 8 ? 2 : 1;
      const lenDiff = Math.abs(word.length - token.length);

      if (lenDiff <= maxAllowedDistance) {
        const dist = levenshtein(token, word);
        if (dist <= maxAllowedDistance) {
          const maxLen = Math.max(token.length, word.length);
          const similarity = 1 - dist / maxLen;
          if (similarity >= 0.75) {
            bestWordScore = Math.max(bestWordScore, 50 * similarity);
          }
        }
      }
    }
  }

  return bestWordScore;
}

/**
 * Scores an entry against a multi-token query.
 * Returns 0 if any required query token does not match.
 */
export function scoreEntry(entry: SearchEntry, query: string, currentLang?: "en" | "es"): number {
  const normQuery = normalize(query);
  if (!normQuery) return 0;

  const queryTokens = normQuery.split(" ").filter(Boolean);
  if (queryTokens.length === 0) return 0;

  const normTitle = normalize(entry.title);
  const titleWords = normTitle.split(" ").filter(Boolean);

  const normDesc = normalize(entry.description);
  const descWords = normDesc.split(" ").filter(Boolean);

  const tagData = (entry.tags || []).map((t) => {
    const normTag = normalize(t);
    return {
      normTag,
      tagWords: normTag.split(" ").filter(Boolean),
    };
  });

  let totalScore = 0;

  // Weights for different fields
  const TITLE_WEIGHT = 5.0;
  const TAG_WEIGHT = 3.5;
  const DESC_WEIGHT = 1.5;

  for (const token of queryTokens) {
    const titleScore = scoreTokenInText(token, normTitle, titleWords) * TITLE_WEIGHT;

    let bestTagScore = 0;
    for (const tag of tagData) {
      const ts = scoreTokenInText(token, tag.normTag, tag.tagWords) * TAG_WEIGHT;
      if (ts > bestTagScore) bestTagScore = ts;
    }

    const descScore = scoreTokenInText(token, normDesc, descWords) * DESC_WEIGHT;

    const tokenMax = Math.max(titleScore, bestTagScore, descScore);

    // If any token in the query cannot match anything in this entry, the entry does NOT match
    if (tokenMax <= 0) {
      return 0;
    }

    totalScore += tokenMax;
  }

  // Bonus for full exact phrase matches in title, tags, or description
  if (queryTokens.length > 1) {
    if (normTitle.includes(normQuery)) {
      totalScore += 250;
    } else if (tagData.some((t) => t.normTag.includes(normQuery))) {
      totalScore += 180;
    } else if (normDesc.includes(normQuery)) {
      totalScore += 100;
    }
  }

  // Language relevance boost: when browsing in Spanish or English, give a modest boost to matching items in that language
  if (currentLang && entry.lang === currentLang) {
    totalScore *= 1.25;
  }

  return totalScore;
}

/**
 * Searches and ranks search entries based on relevance.
 * Excludes entries with zero score.
 */
export function search(
  entries: SearchEntry[],
  query: string,
  currentLang?: "en" | "es",
  limit = 10
): SearchEntry[] {
  if (!query || !query.trim()) return [];

  const scored: { entry: SearchEntry; score: number }[] = [];

  for (const entry of entries) {
    const score = scoreEntry(entry, query, currentLang);
    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.entry);
}
