import { NextRequest } from "next/server";
import getClient, { MODEL } from "@/lib/openai";
import type { BriefingRequest, BriefingMetrics } from "@/types/index";

function computeMetrics(req: BriefingRequest): BriefingMetrics {
  const { incidents } = req;
  const p1Count = incidents.filter((i) => i.priority === "P1").length;

  const resolved = incidents.filter(
    (i) => i.status === "Resolved" && i.sla_hours
  );
  const avgResolutionHours =
    resolved.length > 0
      ? Math.round(
          resolved.reduce((sum, i) => sum + (i.sla_hours ?? 0), 0) /
            resolved.length
        )
      : null;

  const typeCounts: Record<string, number> = {};
  for (const inc of incidents) {
    if (inc.type) typeCounts[inc.type] = (typeCounts[inc.type] ?? 0) + 1;
  }
  const topType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { total: incidents.length, p1Count, avgResolutionHours, topType };
}

function buildSystemPrompt(tone: BriefingRequest["tone"]): string {
  const base = `You are an EHS operations analyst preparing a briefing for ${
    tone === "executive" ? "senior leadership" : "the EHS operations team"
  }.

Write a structured SIR briefing with these sections:
## Situation
## Impact
## Recommendation
## Gaps / Watch Items

Rules:`;

  if (tone === "executive") {
    return `${base}
- Total word count must be 200 words or fewer.
- Maximum 3 bullet points per section.
- Lead with the most critical item.
- Use plain language — no jargon.
- Focus on business risk and decision points.`;
  }

  return `${base}
- Be detailed and specific. Name incident types, priorities, and owners.
- Include timelines and SLA status.
- Highlight systemic patterns, not just individual incidents.
- Recommend specific corrective actions with owners and deadlines.
- Flag any regulatory exposure explicitly.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { incidents, dateRange, tone } = body as BriefingRequest;

  if (!incidents || !Array.isArray(incidents)) {
    return new Response(JSON.stringify({ error: "incidents array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const metrics = computeMetrics({ incidents, dateRange, tone });

  const incidentSummary =
    incidents.length === 0
      ? "No incidents recorded in this period."
      : incidents
          .map(
            (i) =>
              `- [${i.priority ?? "Unclassified"}] ${i.title} | Type: ${i.type ?? "Unknown"} | Owner: ${i.owner ?? "Unassigned"} | Status: ${i.status} | Date: ${i.date}`
          )
          .join("\n");

  const userMessage = `Generate a briefing for the period ${dateRange.from} to ${dateRange.to}.

Key metrics:
- Total incidents: ${metrics.total}
- P1 incidents: ${metrics.p1Count}
- Avg resolution time: ${metrics.avgResolutionHours != null ? `${metrics.avgResolutionHours}h` : "N/A"}
- Most common type: ${metrics.topType ?? "N/A"}

Incident list:
${incidentSummary}`;

  const client = getClient();

  const stream = await client.chat.completions.create({
    model: MODEL,
    max_tokens: tone === "executive" ? 512 : 1500,
    stream: true,
    messages: [
      { role: "system", content: buildSystemPrompt(tone) },
      { role: "user", content: userMessage },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "metrics", metrics })}\n\n`
        )
      );

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "text", text })}\n\n`
            )
          );
        }
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
