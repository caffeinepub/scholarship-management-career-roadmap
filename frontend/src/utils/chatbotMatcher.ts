interface KnowledgeEntry {
  id: number;
  patterns: string[];
  answer: string;
  pageLink: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

export function matchQuery(input: string, knowledgeBase: KnowledgeEntry[]): KnowledgeEntry | null {
  const normalizedInput = normalize(input);
  const inputWords = normalizedInput.split(' ').filter(Boolean);

  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;

    for (const pattern of entry.patterns) {
      const normalizedPattern = normalize(pattern);

      // Exact phrase match
      if (normalizedInput.includes(normalizedPattern)) {
        score += 10;
        continue;
      }

      // Word-level matching
      const patternWords = normalizedPattern.split(' ').filter(Boolean);
      let wordMatches = 0;
      for (const pw of patternWords) {
        if (inputWords.some((iw) => iw.includes(pw) || pw.includes(iw))) {
          wordMatches++;
        }
      }
      if (wordMatches > 0) {
        score += (wordMatches / patternWords.length) * 5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Minimum threshold to avoid false positives
  return bestScore >= 3 ? bestMatch : null;
}
