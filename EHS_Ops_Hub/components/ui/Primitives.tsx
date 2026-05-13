"use client";
import React, { useState } from "react";
import { I } from "./Icons";

export function cx(...xs: (string | boolean | undefined | null)[]) {
  return xs.filter(Boolean).join(" ");
}

// ─── Badge ────────────────────────────────────────────────────────
type BadgeTone = "slate" | "blue" | "teal" | "red" | "orange" | "yellow" | "green" | "violet";

const BADGE_TONES: Record<BadgeTone, { bg: string; bd: string; fg: string }> = {
  slate:  { bg: "#f1f5f9", bd: "#cbd5e1", fg: "#334155" },
  blue:   { bg: "#eff6ff", bd: "#bfdbfe", fg: "#1d4ed8" },
  teal:   { bg: "#ecfdf5", bd: "#99f6e4", fg: "#0f766e" },
  red:    { bg: "#fef2f2", bd: "#fecaca", fg: "#b91c1c" },
  orange: { bg: "#fff7ed", bd: "#fed7aa", fg: "#c2410c" },
  yellow: { bg: "#fefce8", bd: "#fde68a", fg: "#a16207" },
  green:  { bg: "#f0fdf4", bd: "#bbf7d0", fg: "#15803d" },
  violet: { bg: "#f5f3ff", bd: "#ddd6fe", fg: "#6d28d9" },
};

export function Badge({
  children,
  tone = "slate",
  className,
  style,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = BADGE_TONES[tone];
  return (
    <span
      className={cx("mono", className)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "1px 7px", borderRadius: 5,
        background: t.bg, border: `1px solid ${t.bd}`, color: t.fg,
        fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em",
        textTransform: "uppercase", lineHeight: 1.5, ...style,
      }}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, BadgeTone> = { P1: "red", P2: "orange", P3: "yellow", P4: "green" };
  const labels: Record<string, string> = {
    P1: "P1 · CRIT", P2: "P2 · HIGH", P3: "P3 · MED", P4: "P4 · LOW",
  };
  return <Badge tone={map[p] || "slate"}>{labels[p] || p}</Badge>;
}

// ─── Button ───────────────────────────────────────────────────────
type ButtonVariant = "default" | "ghost" | "outline" | "primary" | "ai" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BTN_VARIANTS: Record<ButtonVariant, { bg: string; bd: string; fg: string; shadow?: string }> = {
  default: { bg: "#ffffff", bd: "1px solid var(--border-2)", fg: "var(--text-0)", shadow: "0 1px 0 rgba(255,255,255,.8) inset,0 1px 2px rgba(15,23,42,.05)" },
  ghost:   { bg: "transparent", bd: "1px solid transparent", fg: "var(--text-1)" },
  outline: { bg: "transparent", bd: "1px solid var(--border-2)", fg: "var(--text-1)" },
  primary: { bg: "linear-gradient(180deg,#3b82f6,#2563eb)", bd: "1px solid #1d4ed8", fg: "#fff", shadow: "0 1px 0 rgba(255,255,255,.25) inset,0 4px 12px -6px rgba(37,99,235,.5)" },
  ai:      { bg: "linear-gradient(135deg,#14b8a6 0%,#2563eb 100%)", bd: "1px solid rgba(13,148,136,.5)", fg: "#fff", shadow: "0 1px 0 rgba(255,255,255,.25) inset,0 6px 18px -8px rgba(37,99,235,.45)" },
  danger:  { bg: "linear-gradient(180deg,#ef4444,#dc2626)", bd: "1px solid #b91c1c", fg: "#fff" },
};

const BTN_SIZES: Record<ButtonSize, { pad: string; fs: number; h: number; gap: number }> = {
  sm: { pad: "5px 9px", fs: 12, h: 26, gap: 5 },
  md: { pad: "7px 12px", fs: 13, h: 32, gap: 6 },
  lg: { pad: "9px 16px", fs: 14, h: 38, gap: 8 },
};

export function Button({
  children, variant = "default", size = "md", icon, iconRight,
  onClick, disabled, className, style, type, title,
}: {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  title?: string;
}) {
  const v = BTN_VARIANTS[variant];
  const s = BTN_SIZES[size];
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: s.gap,
        padding: s.pad, height: s.h, fontSize: s.fs, fontWeight: 500,
        background: v.bg, border: v.bd, color: v.fg, borderRadius: 8,
        boxShadow: v.shadow || "none",
        opacity: disabled ? 0.5 : 1,
        transition: "transform .08s ease, filter .15s ease",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0.5px)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
    >
      {icon}{children}{iconRight}
    </button>
  );
}

// ─── Field ────────────────────────────────────────────────────────
export function Field({
  label, hint, children, required, style,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <label className="col gap-1" style={style}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-2)", letterSpacing: "0.02em" }}>
        {label}{required && <span style={{ color: "var(--p1)" }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{hint}</span>}
    </label>
  );
}

// ─── Input ────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        height: 32, padding: "0 10px",
        background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 7,
        color: "var(--text-0)", fontSize: 13, outline: "none",
        transition: "border-color .15s, box-shadow .15s",
        ...props.style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--blue)";
        e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--input-border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        padding: "8px 10px", minHeight: 76,
        background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 7,
        color: "var(--text-0)", fontSize: 13, outline: "none", resize: "vertical",
        fontFamily: "inherit", lineHeight: 1.5,
        ...props.style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--blue)";
        e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--input-border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────
export function Select({
  value, onChange, children, style,
}: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          appearance: "none", WebkitAppearance: "none",
          height: 32, padding: "0 30px 0 10px",
          background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 7,
          color: "var(--text-0)", fontSize: 13, outline: "none", cursor: "pointer",
          ...style,
        }}
      >
        {children}
      </select>
      <I.ChevronDown
        size={14}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}
      />
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────
type StatTone = "slate" | "blue" | "green" | "red" | "orange";

const STAT_TONES: Record<StatTone, { bd: string; glow: string; num: string }> = {
  slate:  { bd: "var(--border)",              glow: "transparent",                                                                num: "var(--text-0)" },
  blue:   { bd: "rgba(37,99,235,0.30)",  glow: "linear-gradient(135deg,rgba(37,99,235,0.06),transparent 60%)",   num: "#1d4ed8" },
  green:  { bd: "rgba(22,163,74,0.30)",  glow: "linear-gradient(135deg,rgba(22,163,74,0.06),transparent 60%)",   num: "#15803d" },
  red:    { bd: "rgba(220,38,38,0.32)",  glow: "linear-gradient(135deg,rgba(220,38,38,0.07),transparent 60%)",   num: "#b91c1c" },
  orange: { bd: "rgba(234,88,12,0.30)",  glow: "linear-gradient(135deg,rgba(234,88,12,0.06),transparent 60%)",   num: "#c2410c" },
};

export function StatCard({
  label, value, delta, tone = "slate", icon, mini,
}: {
  label: string;
  value: number | string;
  delta?: string;
  tone?: StatTone;
  icon?: React.ReactNode;
  mini?: boolean;
}) {
  const t = STAT_TONES[tone];
  return (
    <div
      className="card"
      style={{ padding: mini ? "10px 12px" : "14px 16px", border: `1px solid ${t.bd}`, background: `${t.glow}, var(--panel)`, position: "relative", overflow: "hidden" }}
    >
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        {icon && <span style={{ color: "var(--text-3)" }}>{icon}</span>}
      </div>
      <div className="row gap-2" style={{ alignItems: "baseline" }}>
        <span className="mono" style={{ fontSize: mini ? 22 : 28, fontWeight: 600, color: t.num, letterSpacing: "-0.02em" }}>{value}</span>
        {delta && (
          <span className="mono" style={{ fontSize: 11, color: delta.startsWith("-") ? "#15803d" : delta.startsWith("+") ? "#b91c1c" : "var(--text-3)" }}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────
export function Tooltip({
  children, content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
            background: "#0f172a", border: "1px solid #1e293b",
            padding: "8px 10px", borderRadius: 8, fontSize: 11.5,
            color: "#e2e8f0", whiteSpace: "normal", width: 260, zIndex: 50,
            boxShadow: "0 12px 30px -10px rgba(15,23,42,0.4)",
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────
export function Avatar({ name, size = 22 }: { name: string; size?: number }) {
  const init = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return (
    <span
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, hsl(${hue}deg 60% 50%), hsl(${(hue + 40) % 360}deg 65% 38%))`,
        color: "#fff", fontSize: size * 0.42, fontWeight: 600,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 1px 2px rgba(15,23,42,0.12)",
        flexShrink: 0,
      }}
    >
      {init}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────
export function Skeleton({
  w = "100%", h = 12, r = 6, style,
}: {
  w?: string | number;
  h?: number;
  r?: number;
  style?: React.CSSProperties;
}) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

// ─── StreamingDots ────────────────────────────────────────────────
export function StreamingDots() {
  return (
    <span className="row gap-1" style={{ display: "inline-flex" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5, height: 5, borderRadius: "50%", background: "var(--teal)",
            animation: `pulse-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
            boxShadow: "0 0 6px rgba(13,148,136,0.5)",
          }}
        />
      ))}
    </span>
  );
}

// ─── iconHeaderBtn helper ─────────────────────────────────────────
export function iconHeaderBtn(): React.CSSProperties {
  return {
    position: "relative",
    width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 8,
    background: "var(--panel-2)", color: "var(--text-1)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };
}
