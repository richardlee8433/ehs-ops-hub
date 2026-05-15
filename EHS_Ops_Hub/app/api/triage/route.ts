import { NextRequest, NextResponse } from "next/server";
import getClient, { MODEL } from "@/lib/openai";
import type { TriageRequest, TriageResponse } from "@/types/index";

const SYSTEM_PROMPT = `You are an ESG (Environmental, Social, and Governance) incident triage system for a corporate operations team.

Classify each incident and return ONLY valid JSON with this exact schema:
{
  "type": <one of the incident types below>,
  "priority": <"P1" | "P2" | "P3" | "P4">,
  "owner": <one of the owner roles below>,
  "sla_hours": <number>,
  "rationale": <1-2 sentence explanation of the priority decision>
}

INCIDENT TYPES (pick the best fit):
Chemical Spill | Workplace Injury | Near Miss | Fire / Explosion Risk | Electrical Hazard | Ergonomic Issue | Environmental Breach | PPE Non-Compliance | Training Gap | Administrative | Other

PRIORITY RUBRIC:
P1 — Imminent danger to life, active injury, regulatory violation with immediate legal exposure, or environmental contamination. SLA: 1–4 hours.
P2 — Significant injury risk, regulatory non-compliance requiring corrective action, or incident with potential for escalation. SLA: 8–24 hours.
P3 — Near-miss with no injury, minor non-compliance, or safety concern requiring monitoring. SLA: 48–72 hours.
P4 — Administrative, training gap, process improvement, or low-risk observation. SLA: 120–168 hours.

OWNER ROLES (pick the most responsible party):
ESG Manager | Site Lead | HR | Facilities | Safety Officer

Return ONLY the JSON object. No markdown, no explanation outside the JSON.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, description, reporter, date } = body as TriageRequest;
  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    );
  }

  const userMessage = `Incident Report:
Title: ${title}
Description: ${description}
Reporter: ${reporter ?? "Unknown"}
Date: ${date ?? new Date().toISOString()}

Classify this incident.`;

  const client = getClient();
  const message = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const raw = message.choices[0]?.message?.content?.trim() ?? "";

  // Strip markdown code fences if Claude added them
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "");

  let triage: TriageResponse;
  try {
    triage = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "AI returned malformed JSON", raw },
      { status: 502 }
    );
  }

  return NextResponse.json(triage);
}
