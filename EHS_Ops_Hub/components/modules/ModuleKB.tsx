"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { I } from "@/components/ui/Icons";
import { Badge, Button, Input, StreamingDots } from "@/components/ui/Primitives";
import { KB_ARTICLES, KB_CATEGORIES, type KBArticle } from "@/lib/seed-data";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  citations?: { id: string; title: string; url?: string }[];
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "ai",
  text: "Hi — I'm the EHS Knowledge Base assistant. I can answer questions using real EHS regulatory documents from OSHA, HSE, EU-OSHA, ISO, and more. Try something like \"What is the protocol for a chemical spill response?\"",
  citations: [],
};

export default function ModuleKB() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(KB_ARTICLES[0].id);
  const [chat, setChat] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let rows = KB_ARTICLES.filter((a) => cat === "All" || a.cat === cat);
    if (query) rows = rows.filter((a) => (a.title + a.cat + a.id).toLowerCase().includes(query.toLowerCase()));
    return rows;
  }, [query, cat]);

  const sel = KB_ARTICLES.find((a) => a.id === selectedArticle) || KB_ARTICLES[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, streaming]);

  const ask = async (text?: string) => {
    const userText = text ?? draft;
    if (!userText.trim() || streaming) return;
    setChat((c) => [...c, { role: "user", text: userText }]);
    setDraft("");
    setStreaming(true);

    try {
      const res = await fetch("/api/kb-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const citations = (data.topChunks || []).slice(0, 3).map((c: { id: string; title: string; url: string }) => ({
        id: c.id,
        title: c.title,
        url: c.url,
      }));

      setChat((c) => [...c, { role: "ai", text: data.answer, citations }]);
    } catch {
      setChat((c) => [...c, { role: "ai", text: "Sorry, I couldn't connect to the knowledge base. Please try again.", citations: [] }]);
    } finally {
      setStreaming(false);
    }
  };

  const suggestions = [
    "What is the protocol for a chemical spill response?",
    "PPE requirements for hazardous materials?",
    "How do I report a near-miss incident?",
    "What are OSHA first aid requirements?",
  ];

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "380px 1fr", gap: 14, padding: 18, minHeight: 0 }}>
      {/* LEFT: Article list */}
      <div className="card col" style={{ minHeight: 0, overflow: "hidden" }}>
        <div className="col gap-3" style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>Knowledge Base</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{KB_ARTICLES.length} articles</span>
          </div>
          <div style={{ position: "relative" }}>
            <I.Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}/>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles, IDs, tags…" style={{ width: "100%", paddingLeft: 32, height: 34 }}/>
          </div>
          <div className="row gap-1" style={{ flexWrap: "wrap" }}>
            {KB_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "3px 9px", fontSize: 11.5, borderRadius: 999,
                background: cat === c ? "rgba(59,130,246,0.18)" : "transparent",
                border: `1px solid ${cat === c ? "rgba(59,130,246,0.45)" : "var(--border)"}`,
                color: cat === c ? "#bfdbfe" : "var(--text-2)",
                fontWeight: cat === c ? 600 : 500,
              }}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div className="col gap-2" style={{ padding: 30, textAlign: "center", color: "var(--text-3)" }}>
              <I.Search size={22}/>
              <div style={{ fontSize: 13 }}>No articles match &quot;{query}&quot;</div>
              <button onClick={() => { setQuery(""); setCat("All"); }} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-2)", padding: "4px 10px", borderRadius: 6, fontSize: 12 }}>Reset</button>
            </div>
          ) : filtered.map((a) => (
            <button key={a.id} onClick={() => setSelectedArticle(a.id)} style={{
              width: "100%", textAlign: "left", padding: "11px 14px",
              borderBottom: "1px solid var(--border)",
              background: selectedArticle === a.id ? "rgba(59,130,246,0.07)" : "transparent",
              borderLeft: selectedArticle === a.id ? "2px solid var(--blue)" : "2px solid transparent",
              color: "inherit", display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{a.id}</span>
                <Badge tone="slate">{a.cat}</Badge>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-0)" }}>{a.title}</div>
              <div className="row" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--text-3)" }}>
                <span>Updated {a.updated}</span>
                <span>{a.reads.toLocaleString()} reads</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat */}
      <div className="card col" style={{ minHeight: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", justifyContent: "space-between" }}>
          <div className="col gap-1">
            <span className="row gap-2">
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>Ask the KB</span>
              <span className="ai-chip"><I.Sparkle size={11}/> grounded · real EHS docs</span>
            </span>
            <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
              Reading: <span className="mono">{sel.id}</span> · {sel.title}
            </span>
          </div>
          <Button size="sm" variant="outline" icon={<I.Refresh size={12}/>} onClick={() => setChat([INITIAL_MESSAGE])}>
            New thread
          </Button>
        </div>

        <div style={{ overflow: "auto", flex: 1, padding: 18 }}>
          <div className="col gap-3" style={{ maxWidth: 760, margin: "0 auto" }}>
            {chat.map((m, i) => <ChatBubble key={i} m={m}/>)}
            {streaming && (
              <div className="col gap-2" style={{ alignItems: "flex-start", maxWidth: "78%" }}>
                <div className="row gap-2"><span className="ai-chip"><I.Sparkle size={11}/> Answering…</span><StreamingDots/></div>
                <div className="ai-card" style={{ padding: 14, fontSize: 13, color: "var(--text-1)", lineHeight: 1.6 }}>
                  <span className="stream-caret"/>
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>
        </div>

        <div style={{ padding: 14, borderTop: "1px solid var(--border)", background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.08))" }}>
          {chat.length <= 1 && !streaming && (
            <div className="row gap-2" style={{ marginBottom: 10, flexWrap: "wrap" }}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => ask(s)} style={{
                  padding: "5px 10px", fontSize: 12, borderRadius: 999,
                  border: "1px solid var(--border-2)", background: "rgba(59,130,246,0.05)",
                  color: "var(--text-1)",
                }}>{s}</button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="row gap-2">
            <div style={{ position: "relative", flex: 1 }}>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask anything — protocols, thresholds, owners, prior incidents…"
                style={{ width: "100%", height: 40, paddingLeft: 14, paddingRight: 100, fontSize: 13.5 }}
              />
              <span className="mono" style={{ position: "absolute", right: 50, top: "50%", transform: "translateY(-50%)", fontSize: 10.5, color: "var(--text-3)" }}>↵</span>
              <button type="submit" disabled={!draft.trim() || streaming} style={{
                position: "absolute", right: 4, top: 4, height: 32,
                padding: "0 12px", borderRadius: 6, border: "none",
                background: streaming ? "var(--panel-3)" : "linear-gradient(135deg,#14b8a6,#3b82f6)",
                color: "#fff", fontWeight: 600, fontSize: 12, opacity: draft.trim() && !streaming ? 1 : 0.5,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <I.Send size={12}/> Ask
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMessage }) {
  if (m.role === "user") {
    return (
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <div style={{
          maxWidth: "78%", padding: "10px 14px",
          background: "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(37,99,235,0.05))",
          border: "1px solid rgba(37,99,235,0.22)", borderRadius: "12px 12px 4px 12px",
          fontSize: 13.5, color: "var(--text-0)", lineHeight: 1.5,
        }}>{m.text}</div>
      </div>
    );
  }
  return (
    <div className="col gap-2" style={{ maxWidth: "82%", alignItems: "flex-start" }}>
      <span className="ai-chip"><I.Sparkle size={11}/> KB Assistant</span>
      <div className="ai-card" style={{ padding: 14, fontSize: 13.5, color: "var(--text-1)", lineHeight: 1.65, borderRadius: "12px 12px 12px 4px" }}>
        <FormattedAnswer text={m.text}/>
        {m.citations && m.citations.length > 0 && (
          <div className="col gap-2" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(20,184,166,0.18)" }}>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--teal-2)", letterSpacing: "0.08em" }}>SOURCES · {m.citations.length}</span>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              {m.citations.map((c) => (
                <a
                  key={c.id}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="row gap-1"
                  style={{
                    padding: "4px 9px", fontSize: 11.5, borderRadius: 6,
                    background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,136,0.28)",
                    color: "#99f6e4", textDecoration: "none",
                  }}
                >
                  <I.Link size={11}/>
                  <span style={{ color: "var(--text-1)" }}>{c.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormattedAnswer({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="col gap-2">
      {lines.map((ln, i) => {
        if (!ln.trim()) return <div key={i} style={{ height: 4 }}/>;
        const m = ln.match(/^(\d+)\.\s+(.*)/);
        const content = (s: string) => {
          const parts = s.split(/(\*\*[^*]+\*\*)/g);
          return parts.map((p, j) =>
            p.startsWith("**") ? <strong key={j} style={{ color: "var(--text-0)", fontWeight: 600 }}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>
          );
        };
        if (m) {
          return (
            <div key={i} className="row gap-2" style={{ alignItems: "flex-start" }}>
              <span className="mono" style={{ minWidth: 18, color: "var(--teal-2)", fontWeight: 600, fontSize: 12 }}>{m[1]}.</span>
              <span>{content(m[2])}</span>
            </div>
          );
        }
        return <div key={i}>{content(ln)}</div>;
      })}
    </div>
  );
}
