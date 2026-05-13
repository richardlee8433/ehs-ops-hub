"use client";
import React, { useState, useEffect, useMemo } from "react";
import { I } from "@/components/ui/Icons";
import { Avatar, PriorityBadge, iconHeaderBtn } from "@/components/ui/Primitives";
import ModuleATC from "@/components/modules/ModuleATC";
import ModuleKB from "@/components/modules/ModuleKB";
import ModuleExec from "@/components/modules/ModuleExec";
import ModuleWorkflow from "@/components/modules/ModuleWorkflow";
import { SEED_INCIDENTS, SeedIncident } from "@/lib/seed-data";

type TabId = "atc" | "kb" | "exec" | "wf";

const TABS: { id: TabId; label: string; icon: React.FC<{ size?: number; stroke?: number }> }[] = [
  { id: "atc",  label: "Air Traffic Control", icon: I.Radar },
  { id: "kb",   label: "Knowledge Base",      icon: I.Book },
  { id: "exec", label: "Exec Briefing",       icon: I.FileChart },
  { id: "wf",   label: "Workflow Builder",    icon: I.Workflow },
];

export default function Home() {
  const [tab, setTab] = useState<TabId>("atc");
  const [sidebar, setSidebar] = useState(true);
  const [incidents, setIncidents] = useState<SeedIncident[]>(SEED_INCIDENTS);
  const [now, setNow] = useState(new Date("2026-05-13T09:42:18"));

  useEffect(() => {
    const t = setInterval(() => setNow((prev) => new Date(prev.getTime() + 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => ({
    open:     incidents.filter((i) => i.status === "Open").length,
    inprog:   incidents.filter((i) => i.status === "In Progress").length,
    resolved: incidents.filter((i) => i.status === "Resolved").length,
    overdue:  incidents.filter((i) => i.sla?.includes("OVERDUE")).length,
    p1:       incidents.filter((i) => i.priority === "P1" && i.status !== "Resolved").length,
  }), [incidents]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center",
        padding: "0 18px", height: 56, flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--panel)",
        boxShadow: "0 1px 0 var(--border), 0 2px 8px -4px rgba(15,23,42,0.06)",
      }}>
        <Brand/>

        <nav className="row" role="tablist" style={{ marginLeft: 24, gap: 2 }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const sel = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={sel}
                className="tab"
                onClick={() => setTab(t.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "0 12px", height: 38, background: "transparent",
                  border: "none", color: sel ? "var(--text-0)" : "var(--text-2)",
                  fontSize: 13, fontWeight: sel ? 600 : 500,
                  borderRadius: 6,
                }}
              >
                <Icon size={14} stroke={sel ? 2 : 1.75}/>
                {t.label}
                {t.id === "atc" && !sel && counts.open > 0 && (
                  <span className="mono" style={{
                    minWidth: 18, padding: "0 5px", height: 16, borderRadius: 4,
                    background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.22)",
                    color: "#b91c1c", fontSize: 10, fontWeight: 600,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>{counts.open}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="row gap-3" style={{ marginLeft: "auto" }}>
          <div className="row gap-2" style={{
            padding: "5px 10px", borderRadius: 999,
            border: "1px solid var(--border)", background: "rgba(34,197,94,0.04)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }}/>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>SYS · all green</span>
          </div>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>
            {now.toLocaleTimeString("en-US", { hour12: false })} <span style={{ color: "var(--text-4)" }}>PT</span>
          </span>
          <button title="Notifications" style={iconHeaderBtn()}>
            <I.Bell size={15}/>
            <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "var(--p1)", boxShadow: "0 0 6px var(--p1)" }}/>
          </button>
          <Avatar name="Maya Cohen" size={28}/>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <main style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <div className={tab !== "atc" ? "module-hidden" : ""} style={{ height: "100%" }}>
            <ModuleATC incidents={incidents} setIncidents={setIncidents}/>
          </div>
          <div className={tab !== "kb" ? "module-hidden" : ""} style={{ height: "100%" }}>
            <ModuleKB/>
          </div>
          <div className={tab !== "exec" ? "module-hidden" : ""} style={{ height: "100%" }}>
            <ModuleExec/>
          </div>
          <div className={tab !== "wf" ? "module-hidden" : ""} style={{ height: "100%" }}>
            <ModuleWorkflow/>
          </div>
        </main>

        <Sidebar open={sidebar} setOpen={setSidebar} counts={counts} incidents={incidents}/>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="row gap-2" style={{ alignItems: "center" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "linear-gradient(135deg, #14b8a6, #3b82f6 70%, #6366f1)",
        display: "grid", placeItems: "center",
        boxShadow: "0 4px 14px -6px rgba(20,184,166,0.6), 0 0 0 1px rgba(20,184,166,0.3) inset",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M12 12 9 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="1.6" fill="white"/>
        </svg>
      </div>
      <div className="col" style={{ lineHeight: 1.1 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-0)", letterSpacing: "-0.01em" }}>
          EHS Ops Intelligence
        </span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Hub · v4.2.1
        </span>
      </div>
    </div>
  );
}

function Sidebar({
  open, setOpen, counts, incidents,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  counts: { open: number; inprog: number; resolved: number; overdue: number; p1: number };
  incidents: SeedIncident[];
}) {
  if (!open) {
    return (
      <aside style={{
        width: 44, borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "12px 0", gap: 14, background: "var(--panel-2)",
      }}>
        <button title="Open sidebar" onClick={() => setOpen(true)} style={iconHeaderBtn()}>
          <I.PanelRight size={14}/>
        </button>
        <div style={{ width: 1, height: 14, background: "var(--border)" }}/>
        <SideMini value={counts.open}     label="OPN" tone="blue"/>
        <SideMini value={counts.inprog}   label="WIP" tone="slate"/>
        <SideMini value={counts.resolved} label="RES" tone="green"/>
        <SideMini value={counts.overdue}  label="OVD" tone="red"/>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 280, borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      background: "var(--panel-2)",
      overflow: "hidden",
    }}>
      <div className="row" style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-0)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Ops Pulse</span>
        <button title="Collapse sidebar" onClick={() => setOpen(false)} style={iconHeaderBtn()}>
          <I.PanelRightOff size={13}/>
        </button>
      </div>

      <div style={{ padding: 14, overflow: "auto", flex: 1 }}>
        <div className="col gap-2">
          <SideStat label="Open"         value={counts.open}    tone="blue"  hint="3 awaiting assignment"/>
          <SideStat label="In Progress"  value={counts.inprog}  tone="slate" hint="avg 4h 12m to resolve"/>
          <SideStat label="Resolved 24h" value={6}              tone="green" hint="+2 vs yesterday"/>
          <SideStat label="Overdue"      value={counts.overdue} tone="red"   hint={counts.overdue > 0 ? "escalate" : "none"}/>
        </div>

        <div style={{ marginTop: 18 }}>
          <SideHeading>Priority watch</SideHeading>
          <div className="col gap-1">
            {incidents.filter((i) => i.priority === "P1" || i.priority === "P2").slice(0, 4).map((i) => (
              <div key={i.id} className="row gap-2" style={{
                padding: "8px 10px", borderRadius: 7,
                background: "var(--panel-2)", border: "1px solid var(--border)",
              }}>
                <PriorityBadge p={i.priority}/>
                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                  <span className="truncate mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{i.id}</span>
                  <span className="truncate" style={{ fontSize: 12, color: "var(--text-0)", fontWeight: 500 }}>{i.title}</span>
                </div>
                <I.Chevron size={12} style={{ color: "var(--text-3)" }}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SideHeading>Trend · last 7d</SideHeading>
          <Sparkline data={[12, 9, 14, 11, 18, 15, 16, 8]}/>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
            <span className="mono">May 6</span>
            <span className="mono">May 13</span>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SideHeading>SLA compliance</SideHeading>
          <div className="row gap-2" style={{ alignItems: "baseline" }}>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "#15803d" }}>94.2%</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>+1.4 pts</span>
          </div>
          <div style={{ height: 5, background: "var(--panel-3)", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
            <div style={{ width: "94.2%", height: "100%", background: "linear-gradient(90deg, var(--teal), var(--blue))" }}/>
          </div>
        </div>

        <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: "linear-gradient(135deg, rgba(20,184,166,0.06), rgba(59,130,246,0.04))", border: "1px solid rgba(20,184,166,0.18)" }}>
          <div className="row gap-2" style={{ marginBottom: 6 }}>
            <I.Sparkle size={12} style={{ color: "var(--teal-2)" }}/>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-0)" }}>AI weekly summary</span>
          </div>
          <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.55 }}>
            NH₃ event cluster at DC-4 driving 38% of incidents. Calibration drift suspected on 2 of 5 sensors. Recommend tightening cal cycle to 14 days.
          </p>
          <button style={{
            marginTop: 8, padding: "4px 10px", fontSize: 11.5, borderRadius: 6,
            background: "transparent", border: "1px solid rgba(13,148,136,0.35)", color: "#0f766e",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            Open full briefing <I.Chevron size={10}/>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SideMini({ value, label, tone }: { value: number; label: string; tone: "blue" | "slate" | "green" | "red" }) {
  const colors = { blue: "#1d4ed8", slate: "#475569", green: "#15803d", red: "#b91c1c" };
  return (
    <div className="col" style={{ alignItems: "center", padding: "4px 0" }}>
      <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: colors[tone] }}>{value}</span>
      <span className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

function SideStat({ label, value, tone, hint }: { label: string; value: number; tone: "blue" | "slate" | "green" | "red"; hint: string }) {
  const tones = {
    blue:  { color: "#1d4ed8", dot: "#3b82f6" },
    slate: { color: "var(--text-0)", dot: "#94a3b8" },
    green: { color: "#15803d", dot: "#22c55e" },
    red:   { color: "#b91c1c", dot: "#ef4444" },
  };
  const t = tones[tone];
  return (
    <div className="row" style={{ justifyContent: "space-between", padding: "10px 12px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }}>
      <div className="col" style={{ gap: 2 }}>
        <span className="row gap-2" style={{ fontSize: 11, color: "var(--text-2)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot, boxShadow: `0 0 6px ${t.dot}` }}/>
          {label}
        </span>
        <span style={{ fontSize: 10.5, color: "var(--text-3)" }}>{hint}</span>
      </div>
      <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: t.color, letterSpacing: "-0.02em" }}>{value}</span>
    </div>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
      {children}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 230, h = 36, pad = 2;
  const max = Math.max(...data), min = Math.min(...data);
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `M${x(0)},${h - pad} L${pts.split(" ").join(" L")} L${x(data.length - 1)},${h - pad} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="spk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spk)"/>
      <polyline fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts}/>
      {data.map((_v, i) => i === data.length - 1 && (
        <circle key={i} cx={x(i)} cy={y(data[i])} r="2.5" fill="#60a5fa" stroke="#0b1020" strokeWidth="1.5"/>
      ))}
    </svg>
  );
}
