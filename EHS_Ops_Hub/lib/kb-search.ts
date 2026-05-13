import type { KBChunk } from "@/types/kb";

const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","this","that","these",
  "those","it","its","we","our","you","your","they","their","what","which",
  "who","how","when","where","why","not","no","if","as","by","from","about",
  "into","than","then","so","up","out","can","all","also","more","some","any",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export function searchKB(
  chunks: KBChunk[],
  query: string,
  topK: number = 8
): KBChunk[] {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0 || chunks.length === 0) {
    return chunks.slice(0, topK);
  }

  const scored = chunks.map((chunk) => {
    const contentTokens = tokenize(chunk.content + " " + chunk.title);
    const tokenSet = new Set(contentTokens);

    // Exact match score: how many query tokens appear in the chunk
    let score = 0;
    for (const qt of queryTokens) {
      if (tokenSet.has(qt)) score += 1;
      // Bonus for title match
      if (chunk.title.toLowerCase().includes(qt)) score += 0.5;
    }

    return { chunk, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);

  // If nothing matched, return shortest chunks as fallback context
  if (sorted[0].score === 0) {
    return [...chunks]
      .sort((a, b) => a.content.length - b.content.length)
      .slice(0, Math.min(5, topK));
  }

  return sorted.slice(0, topK).map((s) => s.chunk);
}
