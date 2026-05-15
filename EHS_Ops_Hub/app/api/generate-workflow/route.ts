import { NextRequest, NextResponse } from "next/server";
import getClient, { MODEL } from "@/lib/openai";
import type { GenerateWorkflowRequest, GenerateWorkflowResponse } from "@/types/index";

const SYSTEM_PROMPT = `You are an ESG (Environmental, Social, and Governance) workflow design expert.

When given a process description, generate a structured ESG workflow as a JSON array of steps.

Return ONLY valid JSON with this exact schema:
{
  "steps": [
    {
      "title": "Step title (concise, action-oriented)",
      "description": "What happens in this step and why it matters",
      "owner": "Role responsible (e.g. ESG Manager, Site Lead, HR, Facilities, Safety Officer, First Aider)",
      "sla_hours": <number — realistic timeframe to complete this step>,
      "checklist": ["specific sub-task 1", "specific sub-task 2", ...]
    }
  ]
}

Rules:
- Generate 5–8 steps (never fewer than 5, never more than 8).
- Steps must be sequential and logically ordered.
- Each checklist should have 2–4 specific, actionable items.
- SLA hours should reflect real-world ESG urgency (immediate response steps = 1–4h, documentation = 24–48h, training = 72–168h).
- Owners should be realistic ESG team roles, not individual names.
- Steps should reflect actual ESG/OSHA best practices where applicable.
- Return ONLY the JSON object. No markdown, no explanation outside the JSON.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.description !== "string" || !body.description.trim()) {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 }
    );
  }

  const { description } = body as GenerateWorkflowRequest;

  const client = getClient();
  const message = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Generate an ESG workflow for the following process:\n\n${description}` },
    ],
  });

  const raw = message.choices[0]?.message?.content?.trim() ?? "";

  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "");

  let result: GenerateWorkflowResponse;
  try {
    result = JSON.parse(cleaned);
    if (!Array.isArray(result.steps)) throw new Error("steps must be an array");
  } catch {
    return NextResponse.json(
      { error: "AI returned malformed JSON", raw },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
