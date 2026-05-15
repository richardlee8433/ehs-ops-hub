"use client";
import React, { useState, useEffect, useRef } from "react";
import { I } from "@/components/ui/Icons";
import { Button, StatCard, Skeleton, StreamingDots } from "@/components/ui/Primitives";
import { SEED_INCIDENTS } from "@/lib/seed-data";

interface BriefingMetrics {
  total: number;
  p1Count: number;
  avgResolutionHours: number | null;
  topType: string | null;
}

export default function ModuleExec() {
  const [range, setRange] = useState({ from: "2026-05-06", to: "2026-05-13" });
  const [tone, setTone] = useState<"operational" | "executive">("executive");
  const [state, setState] = useState<"idle" | "streaming" | "done">("idle");
  const [briefingText, setBriefingText] = useState("");
  const [metrics, setMetrics] = useState<BriefingMetrics | null>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState("streaming");
    setBriefingText("");
    setMetrics(null);
    setProgress(0);

    try {
      const res = await fetch("/api/generate-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidents: SEED_INCIDENTS,
          dateRange: range,
          tone,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("API error");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let charCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "metrics") {
              setMetrics(event.metrics);
            } else if (event.type === "text") {
              accumulated += event.text;
              charCount += event.text.length;
              setBriefingText(accumulated);
              setProgress(Math.min(95, Math.round((charCount / (tone === "executive" ? 600 : 2000)) * 100)));
            } else if (event.type === "done") {
              setProgress(100);
              setState("done");
            }
          } catch { /* skip malformed events */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState("idle");
      }
    }
  };

  const copyMd = () => {
    const md = `# ESG Weekly Briefing — ${range.from} to ${range.to}\n\n${briefingText}`;
    navigator.clipboard?.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const exportMd = () => {
    const md = `# ESG Weekly Briefing — ${range.from} to ${range.to}\n\n${briefingText}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ehs-briefing-${range.from}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="col gap-4" style={{ padding: 18, height: "100%", overflow: "auto" }}>
      {/* Controls */}
      <div className="card" style={{ padding: 14 }}>
        <div className="row gap-3" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="col gap-1">
            <span style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.02em" }}>Date range</span>
            <div className="row gap-2" style={{ background: "var(--panel-3)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px" }}>
              <I.Calendar size={13} style={{ color: "var(--text-3)" }}/>
              <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} style={dateInputStyle()}/>
              <span style={{ color: "var(--text-3)" }}>→</span>
              <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} style={dateInputStyle()}/>
            </div>
          </div>

          <div className="col gap-1">
            <span style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.02em" }}>Tone</span>
            <div style={{ background: "var(--panel-3)", border: "1px solid var(--border)", borderRadius: 8, padding: 3, display: "inline-flex", gap: 2 }}>
              {(["Operational", "Executive"] as const).map((t) => {
                const toneVal = t.toLowerCase() as "operational" | "executive";
                return (
                  <button key={t} onClick={() => setTone(toneVal)} style={{
                    padding: "5px 12px", fontSize: 12.5, borderRadius: 6, border: "none",
                    background: tone === toneVal ? "var(--panel)" : "transparent",
                    color: tone === toneVal ? "var(--text-0)" : "var(--text-2)",
                    fontWeight: tone === toneVal ? 600 : 500,
                    borderTop: "1px solid transparent",
                    boxShadow: tone === toneVal ? "0 1px 3px rgba(15,23,42,0.10)" : "none",
                  }}>{t}</button>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1 }}/>

          <Button variant="ai" icon={<I.Sparkle size={13}/>} onClick={generate} disabled={state === "streaming"}>
            {state === "streaming" ? `Generating… ${progress}%` : "Generate briefing"}
          </Button>
        </div>

        {state === "streaming" && (
          <div style={{ marginTop: 12, height: 3, background: "var(--panel-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,var(--teal-2),var(--blue-2))", transition: "width .15s ease" }}/>
          </div>
        )}
      </div>

      {/* Metrics strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        <StatCard mini label="Total incidents"  value={metrics ? metrics.total : "—"}         tone="slate"/>
        <StatCard mini label="P1 count"         value={metrics ? metrics.p1Count : "—"}       tone="red"/>
        <StatCard mini label="Avg resolution"   value={metrics?.avgResolutionHours ? `${metrics.avgResolutionHours}h` : "—"} tone="green"/>
        <StatCard mini label="SLA compliance"   value="94.2%"  tone="blue"/>
        <StatCard mini label="Top issue"        value={metrics?.topType ?? "—"} tone="orange"/>
      </div>

      {/* Briefing document */}
      {state === "idle" ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>
          <div className="col gap-3" style={{ alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,rgba(20,184,166,0.12),rgba(59,130,246,0.12))", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-2)" }}>
              <I.FileChart size={24}/>
            </div>
            <div>
              <div style={{ fontSize: 15, color: "var(--text-1)", fontWeight: 600, marginBottom: 4 }}>No briefing generated yet</div>
              <div style={{ fontSize: 12.5 }}>Select a date range and tone, then click Generate briefing.</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ai-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row" style={{ padding: "14px 18px", justifyContent: "space-between", borderBottom: "1px solid rgba(20,184,166,0.15)" }}>
            <div className="col gap-1">
              <div className="row gap-2">
                <span className="ai-chip"><I.Sparkle size={11}/> AI-generated · {tone} tone</span>
                {state === "streaming" && <StreamingDots/>}
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-0)", marginTop: 4 }}>
                ESG Weekly Briefing
                <span className="mono" style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginLeft: 8 }}>
                  {range.from} → {range.to}
                </span>
              </span>
            </div>
          </div>

          <div style={{ padding: 22, maxWidth: 900, lineHeight: 1.65, fontSize: 14 }}>
            {state === "streaming" && !briefingText && (
              <div className="col gap-3">
                <Skeleton w="92%" h={11}/><Skeleton w="86%" h={11}/><Skeleton w="70%" h={11}/>
                <div style={{ height: 12 }}/>
                <Skeleton w="78%" h={11}/><Skeleton w="65%" h={11}/>
              </div>
            )}
            {briefingText && (
              <BriefingRenderer text={briefingText} streaming={state === "streaming"}/>
            )}
          </div>

          <div className="row" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", justifyContent: "space-between", background: "rgba(255,255,255,0.01)" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
              Generated {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })} · Reviewed by: pending
            </span>
            <div className="row gap-2">
              <Button size="sm" variant="outline" icon={<I.Copy size={13}/>} onClick={copyMd} disabled={state !== "done"}>
                {copied ? "Copied!" : "Copy to clipboard"}
              </Button>
              <Button size="sm" variant="primary" icon={<I.Download size={13}/>} onClick={exportMd} disabled={state !== "done"}>
                Export markdown
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BriefingRenderer({ text, streaming }: { text: string; streaming: boolean }) {
  const sections = text.split(/\n(?=##\s)/);
  return (
    <div className="col" style={{ gap: 22 }}>
      {sections.map((section, i) => {
        const lines = section.trim().split("\n");
        const header = lines[0];
        const body = lines.slice(1).join("\n").trim();

        if (header.startsWith("## ")) {
          const title = header.replace("## ", "").trim();
          const tintMap: Record<string, string> = {
            Situation: "#60a5fa", Impact: "#fbbf24", Recommendation: "#34d399",
          };
          const labelMap: Record<string, string> = { Situation: "S", Impact: "I", Recommendation: "R" };
          const key = Object.keys(tintMap).find((k) => title.includes(k));
          const tint = key ? tintMap[key] : "var(--text-3)";
          const label = key ? labelMap[key] : title[0];

          return (
            <div key={i} style={{ marginBottom: 4 }}>
              <div className="row gap-3" style={{ marginBottom: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: `${tint}22`, border: `1px solid ${tint}55`, color: tint, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{label}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-0)" }}>{title}</span>
              </div>
              <div style={{ paddingLeft: 40, color: "var(--text-1)", whiteSpace: "pre-wrap" }}>
                {body}
                {streaming && i === sections.length - 1 && <span className="stream-caret"/>}
              </div>
            </div>
          );
        }

        return (
          <div key={i} style={{ color: "var(--text-1)", whiteSpace: "pre-wrap" }}>
            {section}
            {streaming && i === sections.length - 1 && <span className="stream-caret"/>}
          </div>
        );
      })}
    </div>
  );
}

function dateInputStyle(): React.CSSProperties {
  return {
    background: "transparent", border: "none", color: "var(--text-0)",
    fontSize: 12.5, padding: 2, outline: "none",
    colorScheme: "light", fontFamily: "var(--font-geist-mono), monospace",
  };
}
