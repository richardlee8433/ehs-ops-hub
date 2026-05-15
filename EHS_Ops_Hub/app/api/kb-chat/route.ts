import { NextRequest, NextResponse } from "next/server";
import getClient, { MODEL } from "@/lib/openai";
import { searchKB } from "@/lib/kb-search";
import type { KBChunk } from "@/types/kb";

// kb-chunks.json is loaded once at module level (server-side only)
let kbChunks: KBChunk[] | null = null;

function loadChunks(): KBChunk[] {
  if (kbChunks) return kbChunks;
  try {
    // Dynamic require so Next.js doesn't try to bundle the JSON at edge
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    kbChunks = require("../../../data/kb-chunks.json") as KBChunk[];
    return kbChunks;
  } catch {
    console.warn("kb-chunks.json not found — run `npm run ingest-kb` first");
    return [];
  }
}

const SYSTEM_PROMPT = `You are an ESG (Environmental, Social, and Governance) knowledge assistant for a corporate operations team.
You answer questions using ONLY the provided knowledge base excerpts below.

Rules:
- Always cite your sources: at the end of your answer, list the document title and URL for every chunk you used.
- If the answer is not in the provided excerpts, say explicitly: "I don't have information on this in the current knowledge base. Consider checking [suggest relevant authority, e.g. OSHA, HSE, EU-OSHA]."
- Be concise and actionable. ESG professionals need clear answers, not long essays.
- Format citations as: Source: [Title] — [URL]
- Never fabricate regulatory specifics, thresholds, or legal requirements not present in the excerpts.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.question !== "string" || !body.question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const { question } = body as { question: string };
  const chunks = loadChunks();
  const topChunks = searchKB(chunks, question, 8);

  const kbContext =
    topChunks.length > 0
      ? topChunks
          .map((c) => `[${c.title} | ${c.source}]\n${c.content}`)
          .join("\n\n---\n\n")
      : "No knowledge base content available. The knowledge base may not have been ingested yet.";

  const userMessage = `Knowledge base excerpts:\n\n${kbContext}\n\n---\n\nUser question: ${question}`;

  const client = getClient();
  const message = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const answer = message.choices[0]?.message?.content ?? "";

  // Extract source ids from the chunks that were used as context
  const sources = topChunks.map((c) => c.id);

  return NextResponse.json({ answer, sources, topChunks });
}
