"use client";
import React, { useState, useEffect, useRef } from "react";
import { I } from "@/components/ui/Icons";
import { Badge, Button, Input, Skeleton, StreamingDots } from "@/components/ui/Primitives";

interface CheckItem {
  t: string;
  done: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  owner: string;
  sla: string;
  ai: boolean;
  checklist: CheckItem[];
  _new?: boolean;
}

interface Workflow {
  name: string;
  steps: WorkflowStep[];
}

const SEED_WORKFLOW: Workflow = {
  name: "NH₃ Release — Tier 1 Response",
  steps: [
    { id: "s1", title: "Detect & confirm reading ≥ 25 ppm", owner: "Sensor Mesh", sla: "0m", ai: false, checklist: [
      { t: "Sensor mesh logs reading for ≥ 60s", done: true },
      { t: "Cross-check with adjacent fixed detector", done: true },
      { t: "Auto-page on-call Chemical Lead", done: false },
    ]},
    { id: "s2", title: "Evacuate 50-ft radius", owner: "Floor Lead", sla: "2m", ai: false, checklist: [
      { t: "Sound bay-level evac horn", done: false },
      { t: "Confirm headcount at muster point A-3", done: false },
      { t: "Hold inbound traffic at gate 1", done: false },
    ]},
    { id: "s3", title: "Don Level B PPE + SCBA", owner: "Chemical Lead", sla: "5m", ai: false, checklist: [
      { t: "Pull SCBA from cabinet CR-3", done: false },
      { t: "Buddy-check seal", done: false },
    ]},
    { id: "s4", title: "Isolate source at panel CR-3", owner: "Chemical Lead", sla: "8m", ai: true, checklist: [
      { t: "Close manual shutoff valve V-12", done: false },
      { t: "Confirm pressure drop on gauge", done: false },
      { t: "Photograph valve state for record", done: false },
    ]},
    { id: "s5", title: "Document & file incident report", owner: "Shift Supervisor", sla: "24h", ai: true, checklist: [
      { t: "Attach sensor logs from window ±10min", done: false },
      { t: "Collect witness statements", done: false },
      { t: "Submit OSHA 300 candidate flag if applicable", done: false },
    ]},
  ],
};

function totalEta(steps: WorkflowStep[]): string {
  let m = 0;
  for (const s of steps) {
    const v = s.sla || "";
    if (v.includes("d")) m += parseFloat(v) * 24 * 60;
    else if (v.includes("h")) m += parseFloat(v) * 60;
    else if (v.includes("m")) m += parseFloat(v);
  }
  if (m >= 1440) return `${(m / 1440).toFixed(1)}d`;
  if (m >= 60) return `${(m / 60).toFixed(1)}h`;
  return `${Math.round(m)}m`;
}

export default function ModuleWorkflow() {
  const [workflow, setWorkflow] = useState<Workflow>(SEED_WORKFLOW);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const generate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setGenProgress(0);
    setWorkflow({ name: "Generating…", steps: [] });

    try {
      const res = await fetch("/api/generate-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: prompt }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const steps: WorkflowStep[] = (data.steps || []).map((s: {
        title: string; description: string; owner: string; sla_hours: number; checklist: string[];
      }, i: number) => ({
        id: `g${i + 1}`,
        title: s.title,
        owner: s.owner || "Unassigned",
        sla: formatSla(s.sla_hours),
        ai: true,
        checklist: (s.checklist || []).map((t: string) => ({ t, done: false })),
        _new: false,
      }));

      const wfName = `${prompt.slice(0, 50)}${prompt.length > 50 ? "…" : ""}`;
      setWorkflow({ name: wfName, steps: [] });
      setPrompt("");

      let i = 0;
      const tick = () => {
        i++;
        setGenProgress(Math.min(100, Math.round((i / (steps.length + 1)) * 100)));
        if (i <= steps.length) {
          setWorkflow((prev) => ({
            ...prev,
            steps: [...prev.steps, { ...steps[i - 1], _new: true }],
          }));
          setTimeout(() => setWorkflow((prev) => ({
            ...prev,
            steps: prev.steps.map((s) => ({ ...s, _new: false })),
          })), 500);
        }
        if (i < steps.length) {
          timerRef.current = setTimeout(tick, 300);
        } else {
          setGenerating(false);
          setGenProgress(100);
        }
      };
      timerRef.current = setTimeout(tick, 200);
    } catch {
      setGenerating(false);
      setWorkflow(SEED_WORKFLOW);
    }
  };

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const onDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const src = draggingId;
    if (!src || src === id) { setDraggingId(null); setDragOverId(null); return; }
    setWorkflow((prev) => {
      const arr = prev.steps.slice();
      const fi = arr.findIndex((s) => s.id === src);
      const ti = arr.findIndex((s) => s.id === id);
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
      return { ...prev, steps: arr };
    });
    setDraggingId(null);
    setDragOverId(null);
  };

  const onDragEnd = () => { setDraggingId(null); setDragOverId(null); };

  const toggleCheck = (sid: string, ti: number) => {
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id !== sid ? s : {
          ...s,
          checklist: s.checklist.map((c, i) => i === ti ? { ...c, done: !c.done } : c),
        }
      ),
    }));
  };

  const addStep = () => {
    const id = "s" + Date.now();
    setWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, { id, title: "New step", owner: "Unassigned", sla: "—", ai: false, checklist: [{ t: "Add a task…", done: false }], _new: true }],
    }));
    setTimeout(() => setWorkflow((prev) => ({ ...prev, steps: prev.steps.map((s) => ({ ...s, _new: false })) })), 700);
  };

  const deleteStep = (sid: string) => {
    setWorkflow((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.id !== sid) }));
  };

  const save = () => { setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500); };

  return (
    <div className="col" style={{ height: "100%", padding: 18, gap: 14, overflow: "hidden" }}>
      {/* Prompt bar */}
      <div className="ai-card" style={{ padding: 14 }}>
        <div className="row gap-2" style={{ marginBottom: 10 }}>
          <span className="ai-chip"><I.Sparkle size={11}/> Generate SOP from description</span>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); generate(); }} className="row gap-2">
          <div style={{ position: "relative", flex: 1 }}>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a process… e.g. 'forklift collision response with first-aid escalation'"
              style={{ width: "100%", height: 42, paddingLeft: 14, paddingRight: 16, fontSize: 13.5 }}
            />
          </div>
          <Button variant="ai" icon={<I.Sparkle size={13}/>} onClick={generate} disabled={!prompt.trim() || generating}>
            {generating ? "Generating…" : "Generate"}
          </Button>
        </form>
        {generating && (
          <div className="row gap-2" style={{ marginTop: 10, alignItems: "center" }}>
            <StreamingDots/>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>
              Composing steps · referencing EHS knowledge base · {genProgress}%
            </span>
            <div style={{ flex: 1, height: 3, background: "var(--panel-3)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${genProgress}%`, height: "100%", background: "linear-gradient(90deg, var(--teal-2), var(--blue-2))", transition: "width .2s" }}/>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="card col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "12px 16px", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <div className="row gap-3">
            <input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-0)", fontSize: 15, fontWeight: 600, minWidth: 280 }}
            />
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
              {workflow.steps.length} steps · ETA {totalEta(workflow.steps)}
            </span>
          </div>
          <div className="row gap-2">
            <Button size="sm" variant="outline" icon={<I.Folder size={12}/>}>Load workflow</Button>
            <Button size="sm" variant="primary" icon={<I.Save size={12}/>} onClick={save}>
              {savedFlash ? "Saved ✓" : "Save workflow"}
            </Button>
          </div>
        </div>

        <div style={{ overflow: "auto", flex: 1, padding: "16px 24px", position: "relative" }}>
          {workflow.steps.length > 0 && (
            <div style={{
              position: "absolute", left: 53, top: 24, bottom: 24, width: 2,
              background: "linear-gradient(180deg, var(--teal-2) 0%, var(--blue-2) 60%, transparent 100%)",
              opacity: 0.35, borderRadius: 2,
            }}/>
          )}

          {workflow.steps.length === 0 && !generating && (
            <div className="col gap-3" style={{ alignItems: "center", justifyContent: "center", textAlign: "center", height: "100%", color: "var(--text-3)" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(59,130,246,0.12))",
                border: "1px solid rgba(59,130,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-2)",
              }}>
                <I.Workflow size={24}/>
              </div>
              <div>
                <div style={{ fontSize: 15, color: "var(--text-1)", fontWeight: 600, marginBottom: 4 }}>No workflow yet</div>
                <div style={{ fontSize: 12.5 }}>Describe a process above to generate one, or add steps manually.</div>
              </div>
              <Button size="sm" variant="outline" icon={<I.Plus size={12}/>} onClick={addStep}>Add first step</Button>
            </div>
          )}

          {workflow.steps.length === 0 && generating && (
            <div className="col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ padding: 14, opacity: 0.7 }}>
                  <div className="row gap-3">
                    <Skeleton w={36} h={36} r={8}/>
                    <div className="col gap-2" style={{ flex: 1 }}>
                      <Skeleton w="55%" h={14}/>
                      <Skeleton w="35%" h={10}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="col gap-3">
            {workflow.steps.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                idx={idx}
                dragging={draggingId === step.id}
                isDragTarget={dragOverId === step.id && draggingId !== null && draggingId !== step.id}
                onDragStart={onDragStart(step.id)}
                onDragOver={onDragOver(step.id)}
                onDrop={onDrop(step.id)}
                onDragEnd={onDragEnd}
                onToggle={(ti) => toggleCheck(step.id, ti)}
                onDelete={() => deleteStep(step.id)}
              />
            ))}
            {workflow.steps.length > 0 && (
              <button onClick={addStep} style={{
                marginLeft: 60, marginTop: 4, padding: "10px 14px",
                background: "transparent", border: "1px dashed var(--border-2)", borderRadius: 8,
                color: "var(--text-2)", fontSize: 12.5,
                display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
              }}>
                <I.Plus size={13}/> Add step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step, idx, dragging, isDragTarget,
  onDragStart, onDragOver, onDrop, onDragEnd, onToggle, onDelete,
}: {
  step: WorkflowStep;
  idx: number;
  dragging: boolean;
  isDragTarget: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onToggle: (i: number) => void;
  onDelete: () => void;
}) {
  const done = step.checklist.filter((c) => c.done).length;
  const total = step.checklist.length;
  const slaColor = (step.sla?.includes("h") || step.sla?.includes("d")) ? "slate" : (step.sla === "0m" ? "violet" : "blue") as "slate" | "blue" | "violet";

  return (
    <div
      className="row gap-3"
      style={{ alignItems: "flex-start", position: "relative", opacity: dragging ? 0.35 : 1, transition: "opacity .15s" }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {isDragTarget && (
        <div style={{ position: "absolute", left: 0, right: 0, top: -7, height: 3, background: "linear-gradient(90deg, var(--teal-2), var(--blue-2))", borderRadius: 999, boxShadow: "0 0 12px rgba(59,130,246,0.6)" }}/>
      )}

      <div
        className="mono"
        style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: step.ai
            ? "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(59,130,246,0.2))"
            : "var(--panel-2)",
          border: step.ai ? "1px solid rgba(20,184,166,0.45)" : "1px solid var(--border-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: step.ai ? "var(--teal-2)" : "var(--text-1)",
          fontWeight: 600, fontSize: 14,
          boxShadow: step.ai ? "0 0 0 4px rgba(20,184,166,0.08)" : "0 0 0 4px var(--bg-1)",
          position: "relative", zIndex: 1,
        }}
      >
        {String(idx + 1).padStart(2, "0")}
      </div>

      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{
          flex: 1, padding: 14,
          background: step._new ? "rgba(20,184,166,0.06)" : "var(--panel)",
          border: step.ai ? "1px solid rgba(20,184,166,0.25)" : "1px solid var(--border)",
          borderRadius: 10, cursor: "default",
          transition: "background 0.4s",
        }}
      >
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
          <div className="row gap-2" style={{ flex: 1, minWidth: 0 }}>
            <span title="Drag to reorder" style={{ padding: 2, color: "var(--text-3)", cursor: "grab" }}>
              <I.Grip size={14}/>
            </span>
            <input
              value={step.title}
              onChange={() => {}}
              style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text-0)", fontSize: 14, fontWeight: 600 }}
            />
            {step.ai && <span className="ai-chip"><I.Sparkle size={11}/> AI-drafted</span>}
          </div>
          <div className="row gap-2">
            <Badge tone={slaColor}>SLA {step.sla}</Badge>
            <button onClick={onDelete} title="Remove step" style={{
              width: 24, height: 24, border: "1px solid transparent", borderRadius: 6,
              background: "transparent", color: "var(--text-3)", display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <I.X size={12}/>
            </button>
          </div>
        </div>

        <div className="row gap-3" style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 10 }}>
          <span className="row gap-1"><I.User size={12}/> {step.owner}</span>
          <span style={{ color: "var(--text-4)" }}>·</span>
          <span className="row gap-1"><I.Check size={12}/> {done}/{total} tasks</span>
          <div style={{ flex: 1, maxWidth: 160, height: 3, background: "var(--panel-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, height: "100%", background: done === total ? "var(--p4)" : "linear-gradient(90deg, var(--teal-2), var(--blue-2))" }}/>
          </div>
        </div>

        <div className="col gap-1">
          {step.checklist.map((c, i) => (
            <button key={i} onClick={() => onToggle(i)} className="row gap-2" style={{
              background: "transparent", border: "none", padding: "4px 0", textAlign: "left",
              fontSize: 12.5, color: c.done ? "var(--text-3)" : "var(--text-1)",
              textDecoration: c.done ? "line-through" : "none",
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                border: c.done ? "1px solid var(--teal-2)" : "1px solid var(--border-strong)",
                background: c.done ? "var(--teal-2)" : "transparent",
                display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#0b1020",
              }}>
                {c.done && <I.Check size={10} stroke={3}/>}
              </span>
              {c.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatSla(hours: number): string {
  if (!hours || hours <= 0) return "0m";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}
