"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { I } from "@/components/ui/Icons";
import { Badge, PriorityBadge, Button, Field, Input, Textarea, Select, StatCard, Tooltip, Avatar, Skeleton, StreamingDots, cx } from "@/components/ui/Primitives";
import type { SeedIncident } from "@/lib/seed-data";

interface TriageResult {
  type: string;
  priority: "P1" | "P2" | "P3" | "P4";
  owner: string;
  sla_hours: number;
  rationale: string;
}

interface ATCProps {
  incidents: SeedIncident[];
  setIncidents: React.Dispatch<React.SetStateAction<SeedIncident[]>>;
}

export default function ModuleATC({ incidents, setIncidents }: ATCProps) {
  const [form, setForm] = useState({ title: "", description: "", reporter: "", location: "", date: "2026-05-13", time: "09:30" });
  const [aiState, setAiState] = useState<"idle" | "streaming" | "done">("idle");
  const [aiResult, setAiResult] = useState<TriageResult | null>(null);
  const [streamText, setStreamText] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("sla");
  const [selected, setSelected] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const counts = useMemo(() => ({
    open: incidents.filter((i) => i.status === "Open").length,
    inprog: incidents.filter((i) => i.status === "In Progress").length,
    resolved: incidents.filter((i) => i.status === "Resolved").length,
    overdue: incidents.filter((i) => i.sla?.includes("OVERDUE")).length,
  }), [incidents]);

  const filtered = useMemo(() => {
    let rows = incidents.slice();
    if (filter !== "All") {
      rows = rows.filter((r) =>
        filter === "Overdue" ? r.sla?.includes("OVERDUE") : r.status === filter
      );
    }
    rows.sort((a, b) => {
      if (sort === "priority") return a.priority.localeCompare(b.priority);
      if (sort === "created") return b.created.localeCompare(a.created);
      const oa = a.sla?.includes("OVERDUE") ? -1 : 0;
      const ob = b.sla?.includes("OVERDUE") ? -1 : 0;
      return oa - ob || a.priority.localeCompare(b.priority);
    });
    return rows;
  }, [incidents, filter, sort]);

  const canClassify = form.title.length >= 6 && form.description.length >= 10;

  const classify = async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAiState("streaming");
    setAiResult(null);
    setStreamText("Classifying incident… analyzing description, reporter history, and cross-referencing SOP library.");

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, reporter: form.reporter, date: form.date }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("API error");
      const result: TriageResult = await res.json();
      setAiState("done");
      setAiResult(result);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setAiState("idle");
      }
    }
  };

  const submit = () => {
    if (!canClassify || !aiResult) return;
    const newId = `INC-${2842 + incidents.length}`;
    const slaLabel = aiResult.sla_hours < 1
      ? `${Math.round(aiResult.sla_hours * 60)}m`
      : aiResult.sla_hours < 24
      ? `${aiResult.sla_hours}h`
      : `${Math.round(aiResult.sla_hours / 24)}d`;

    setIncidents([{
      id: newId, title: form.title, type: aiResult.type,
      priority: aiResult.priority, owner: aiResult.owner, sla: slaLabel,
      status: "Open", reporter: form.reporter || "Anonymous",
      created: `${form.date} ${form.time}`, ai: true, _new: true,
    }, ...incidents]);

    setForm({ title: "", description: "", reporter: "", location: "", date: "2026-05-13", time: "09:30" });
    setAiState("idle");
    setAiResult(null);
    setStreamText("");
    setTimeout(() => setIncidents((prev) => prev.map((p) => ({ ...p, _new: false }))), 1400);
  };

  useEffect(() => {
    if (!canClassify) { setAiState("idle"); setAiResult(null); return; }
    if (aiState === "streaming") return;
    const t = setTimeout(() => classify(), 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, form.description]);

  const filterOptions = ["All", "Open", "In Progress", "Resolved", "Overdue"];

  return (
    <div className="col gap-4" style={{ padding: 18, height: "100%", overflow: "auto" }}>
      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Open"        value={counts.open}     delta="+3 today"  tone="blue"  icon={<I.AlertTriangle size={14}/>}/>
        <StatCard label="In Progress" value={counts.inprog}   delta="−1 today"  tone="slate" icon={<I.Refresh size={14}/>}/>
        <StatCard label="Resolved 7d" value={48}              delta="+12 wk"    tone="green" icon={<I.Check size={14}/>}/>
        <StatCard label="Overdue"     value={counts.overdue}  delta={counts.overdue > 0 ? "needs attn" : "healthy"} tone={counts.overdue > 0 ? "red" : "slate"} icon={<I.Clock size={14}/>}/>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 14, minHeight: 0 }}>
        {/* LEFT: Form */}
        <div className="col gap-3" style={{ minWidth: 0 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div className="col gap-1">
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>Report incident</span>
                <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>AI classification runs as you type</span>
              </div>
              <Badge tone="slate"><I.Brain size={10}/> auto-triage on</Badge>
            </div>
            <div className="col gap-3">
              <Field label="Title" required>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. NH₃ leak detected — Bay 3 cold storage"/>
              </Field>
              <Field label="Description" required>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened? Include readings, location specifics, immediate actions taken."/>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Reporter">
                  <Input value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} placeholder="Your name"/>
                </Field>
                <Field label="Location">
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Facility / zone"/>
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Date">
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}/>
                </Field>
                <Field label="Time">
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}/>
                </Field>
              </div>
              <div className="row gap-2" style={{ marginTop: 4 }}>
                <Button variant="primary" icon={<I.Send size={13}/>} onClick={submit} disabled={!aiResult}>
                  Submit &amp; route
                </Button>
                <Button variant="ghost" onClick={() => { setForm({ title: "", description: "", reporter: "", location: "", date: "2026-05-13", time: "09:30" }); setAiState("idle"); setAiResult(null); }}>
                  Clear
                </Button>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}>⌘+↵ to submit</span>
              </div>
            </div>
          </div>
          <AIClassificationCard state={aiState} streamText={streamText} result={aiResult}/>
        </div>

        {/* RIGHT: Queue */}
        <div className="card col" style={{ minWidth: 0, padding: 0, overflow: "hidden" }}>
          <div className="row" style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", justifyContent: "space-between" }}>
            <div className="row gap-3">
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>Live ops queue</span>
              <span className="pulse-dot mono" style={{ fontSize: 11, color: "var(--text-2)" }}>streaming · {filtered.length} events</span>
            </div>
            <div className="row gap-2">
              <div className="row gap-1" style={{ background: "var(--panel-3)", border: "1px solid var(--border)", borderRadius: 8, padding: 2 }}>
                {filterOptions.map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "5px 9px", fontSize: 12, borderRadius: 6, border: "none",
                    background: filter === f ? "var(--panel)" : "transparent",
                    color: filter === f ? "var(--text-0)" : "var(--text-2)",
                    fontWeight: filter === f ? 600 : 500,
                    boxShadow: filter === f ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
                  }}>{f}</button>
                ))}
              </div>
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="sla">Sort: SLA</option>
                <option value="priority">Sort: Priority</option>
                <option value="created">Sort: Newest</option>
              </Select>
            </div>
          </div>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12.5 }}>
              <thead style={{ position: "sticky", top: 0, background: "var(--panel-2)", zIndex: 2 }}>
                <tr style={{ color: "var(--text-3)", textAlign: "left" }}>
                  {["ID", "Incident", "Type", "Priority", "Owner", "SLA", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "9px 12px", fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(selected === r.id ? null : r.id)}
                    style={{
                      cursor: "pointer",
                      background: selected === r.id ? "rgba(59,130,246,0.06)" : r._new ? "rgba(20,184,166,0.08)" : "transparent",
                      transition: "background .2s",
                    }}
                    onMouseEnter={(e) => { if (selected !== r.id && !r._new) e.currentTarget.style.background = "var(--panel-2)"; }}
                    onMouseLeave={(e) => { if (selected !== r.id && !r._new) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td className="mono" style={td()}>
                      <span className="row gap-2">
                        {r.ai && <span title="AI-classified" style={{ color: "var(--teal-2)" }}><I.Sparkle size={12}/></span>}
                        {r.id}
                      </span>
                    </td>
                    <td style={td()}>
                      <div className="truncate" style={{ maxWidth: 280, color: "var(--text-0)", fontWeight: 500 }}>{r.title}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 2 }}>{r.reporter} · {r.created.split(" ")[1]}</div>
                    </td>
                    <td style={td()}><span style={{ color: "var(--text-1)" }}>{r.type}</span></td>
                    <td style={td()}><PriorityBadge p={r.priority}/></td>
                    <td style={td()}>
                      {r.owner === "Unassigned"
                        ? <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>unassigned</span>
                        : <span className="row gap-2"><Avatar name={r.owner} size={20}/><span style={{ color: "var(--text-1)" }}>{r.owner}</span></span>}
                    </td>
                    <td className="mono" style={td()}>
                      {r.sla.includes("OVERDUE")
                        ? <span style={{ color: "#b91c1c", fontWeight: 600 }}>{r.sla}</span>
                        : <span style={{ color: r.status === "Resolved" ? "var(--text-3)" : "var(--text-1)" }}>{r.sla}</span>}
                    </td>
                    <td style={td()}><StatusPill s={r.status}/></td>
                    <td style={{ ...td(), paddingRight: 12 }}>
                      <div className="row gap-1" style={{ justifyContent: "flex-end" }}>
                        <button title="Reassign" style={iconBtn()}><I.User size={13}/></button>
                        <button title="View SOP" style={iconBtn()}><I.Book size={13}/></button>
                        <button title="More" style={iconBtn()}><I.Chevron size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function td(): React.CSSProperties {
  return { padding: "10px 12px", borderBottom: "1px solid var(--border)", verticalAlign: "middle" };
}

function iconBtn(): React.CSSProperties {
  return { width: 26, height: 26, border: "1px solid var(--border)", borderRadius: 6, background: "transparent", color: "var(--text-2)", display: "inline-flex", alignItems: "center", justifyContent: "center" };
}

function StatusPill({ s }: { s: string }) {
  const map: Record<string, { c: string; bd: string; bg: string }> = {
    "Open":        { c: "#b45309", bd: "rgba(217,119,6,0.30)",  bg: "rgba(251,191,36,0.08)" },
    "In Progress": { c: "#1d4ed8", bd: "rgba(37,99,235,0.28)",  bg: "rgba(59,130,246,0.07)" },
    "Resolved":    { c: "#15803d", bd: "rgba(22,163,74,0.28)",  bg: "rgba(22,163,74,0.07)"  },
  };
  const m = map[s] || { c: "var(--text-2)", bd: "var(--border)", bg: "transparent" };
  return (
    <span className="row gap-2" style={{ display: "inline-flex", padding: "2px 8px 2px 7px", borderRadius: 999, border: `1px solid ${m.bd}`, background: m.bg, color: m.c, fontSize: 11.5, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.c, boxShadow: `0 0 8px ${m.c}` }}/>
      {s}
    </span>
  );
}

function AIClassificationCard({ state, streamText, result }: { state: string; streamText: string; result: TriageResult | null }) {
  if (state === "idle") {
    return (
      <div className="card" style={{ padding: 16, borderStyle: "dashed", borderColor: "var(--border)" }}>
        <div className="row gap-2" style={{ color: "var(--text-3)" }}>
          <I.Sparkle size={14}/>
          <span style={{ fontSize: 12.5 }}>AI classification will appear here once you describe the incident.</span>
        </div>
      </div>
    );
  }
  return (
    <div className="ai-card" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <span className="ai-chip">
          <I.Sparkle size={11}/> AI Classification
          {state === "streaming" && <><span style={{ margin: "0 4px" }}>·</span><StreamingDots/></>}
        </span>
        {result && (
          <Tooltip content={result.rationale}>
            <span className="row gap-1" style={{ fontSize: 11, color: "var(--text-2)", cursor: "help" }}>
              <I.Info size={12}/> Why?
            </span>
          </Tooltip>
        )}
      </div>

      {state === "streaming" && !result && (
        <div className="col gap-2">
          <div className="mono" style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
            <span className="stream-caret">{streamText}</span>
          </div>
          <div className="col gap-2" style={{ marginTop: 6 }}>
            <Skeleton w="62%" h={10}/><Skeleton w="84%" h={10}/><Skeleton w="48%" h={10}/>
          </div>
        </div>
      )}

      {result && (
        <div className="col gap-3">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ResultRow label="Type" value={result.type}/>
            <ResultRow label="Priority" value={<PriorityBadge p={result.priority}/>}/>
            <ResultRow label="Suggested owner" value={<span className="row gap-2"><Avatar size={18} name={result.owner}/>{result.owner}</span>}/>
            <ResultRow label="SLA" value={<span className="mono">{result.sla_hours}h</span>}/>
          </div>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.18)", fontSize: 12, color: "var(--text-1)", lineHeight: 1.55 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--teal-2)", letterSpacing: "0.08em" }}>RATIONALE</span>
            <div style={{ marginTop: 4 }}>{result.rationale}</div>
          </div>
          <div className="row gap-2" style={{ fontSize: 11.5, color: "var(--text-3)" }}>
            <span>Confidence</span>
            <div style={{ flex: 1, height: 4, background: "var(--panel-3)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: "92%", height: "100%", background: "linear-gradient(90deg,var(--teal),var(--blue))" }}/>
            </div>
            <span className="mono">92%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="col gap-1">
      <span style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
