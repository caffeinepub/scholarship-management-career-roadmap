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
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

export function matchQuery(
  input: string,
  knowledgeBase: KnowledgeEntry[],
): KnowledgeEntry | null {
  const normalizedInput = normalize(input);
  const inputWords = normalizedInput.split(" ").filter(Boolean);

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
      const patternWords = normalizedPattern.split(" ").filter(Boolean);
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

// ── Emotional Intelligence Layer ─────────────────────────────────────────────

const EMOTION_MAP: Record<string, string[]> = {
  confused: [
    "confused",
    "confusing",
    "samajh nahi",
    "samajh nahin",
    "nahi aata",
    "nahin aata",
    "don't understand",
    "do not understand",
    "not sure",
    "unclear",
    "lost",
    "don't know",
    "kuch samajh",
    "समझ नहीं",
  ],
  discouraged: [
    "nahi hoga",
    "nahin hoga",
    "nahi kar sakta",
    "nahin kar sakta",
    "mujhse nahi",
    "mujhse nahin",
    "can't",
    "cannot",
    "i give up",
    "give up",
    "nahi hota",
    "impossible",
    "won't work",
    "नहीं होगा",
    "नहीं कर सकता",
  ],
  stressed: [
    "stress",
    "stressed",
    "stressful",
    "anxious",
    "anxiety",
    "overwhelmed",
    "pressure",
    "worried",
    "tension",
    "pareshan",
    "pareshaan",
    "takleef",
    "mushkil",
    "परेशान",
    "टेंशन",
  ],
  tired: [
    "thak gaya",
    "thak gayi",
    "thaka",
    "tired",
    "bore",
    "bored",
    "bore ho gaya",
    "thakawat",
    "थक गया",
    "बोर",
  ],
  seeking_help: [
    "help chahiye",
    "batao",
    "kaise karein",
    "kaise kare",
    "samjhao",
    "bata do",
    "guide karo",
    "help me",
    "please help",
    "बताओ",
    "मदद",
  ],
};

/**
 * Detects the emotional tone of a message.
 * Returns one of: "confused" | "discouraged" | "stressed" | "tired" | "seeking_help" | null
 */
export function detectEmotion(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [emotion, triggers] of Object.entries(EMOTION_MAP)) {
    if (triggers.some((t) => lower.includes(t))) {
      return emotion;
    }
  }
  return null;
}

/**
 * Returns a warm, Hinglish empathetic opening line based on detected emotion.
 */
export function getEmotionalPrefix(emotion: string | null): string {
  switch (emotion) {
    case "confused":
      return "Haan yaar, kabhi kabhi ye cheezein confusing lagti hain 🙂\nTension mat lo, main simple way mein samjhata hoon.";
    case "discouraged":
      return "Aisa lagna bilkul normal hai, but tu kar sakta hai 💪\nChal, isko chhote steps mein karte hain.";
    case "stressed":
      return "I get it, ye thoda stressful ho sakta hai.\nMain hoon na — step by step karte hain, sab theek ho jaayega 🙂";
    case "tired":
      return "Arrey yaar, thakna toh hota hai.\nThoda break lo, phir fresh mind se karte hain 💡";
    case "seeking_help":
      return "Bilkul! Main hoon na help karne ke liye.\nBata, kya problem hai — milke solve karte hain 🚀";
    default:
      return "";
  }
}
