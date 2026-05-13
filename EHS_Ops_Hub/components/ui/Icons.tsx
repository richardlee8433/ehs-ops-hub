"use client";
import React from "react";

interface IconProps {
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
  className?: string;
}

const Icon = ({
  d,
  size = 14,
  stroke = 1.75,
  children,
  style,
  className,
}: IconProps & { d?: string; children?: React.ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    {children || <path d={d} />}
  </svg>
);

export const I = {
  Radar: (p: IconProps) => (
    <Icon {...p}>
      <path d="M19.07 4.93A10 10 0 1 1 4.93 19.07" />
      <path d="M12 12 8 8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="8" opacity="0.4" />
    </Icon>
  ),
  Book: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z" />
      <path d="M4 4.5v15" />
    </Icon>
  ),
  FileChart: (p: IconProps) => (
    <Icon {...p}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 17v-3M12 17v-5M16 17v-2" />
    </Icon>
  ),
  Workflow: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
    </Icon>
  ),
  Search: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  ),
  Sparkle: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </Icon>
  ),
  Send: (p: IconProps) => (
    <Icon {...p}>
      <path d="m22 2-11 11" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </Icon>
  ),
  Copy: (p: IconProps) => (
    <Icon {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Icon>
  ),
  Download: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 21h16" />
    </Icon>
  ),
  Bell: (p: IconProps) => (
    <Icon {...p}>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </Icon>
  ),
  Chevron: (p: IconProps) => <Icon {...p}><path d="m9 6 6 6-6 6" /></Icon>,
  ChevronDown: (p: IconProps) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>,
  Plus: (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>,
  Grip: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="9" cy="6" r="0.6" fill="currentColor" />
      <circle cx="9" cy="12" r="0.6" fill="currentColor" />
      <circle cx="9" cy="18" r="0.6" fill="currentColor" />
      <circle cx="15" cy="6" r="0.6" fill="currentColor" />
      <circle cx="15" cy="12" r="0.6" fill="currentColor" />
      <circle cx="15" cy="18" r="0.6" fill="currentColor" />
    </Icon>
  ),
  Check: (p: IconProps) => <Icon {...p}><path d="m5 13 4 4L19 7" /></Icon>,
  X: (p: IconProps) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>,
  Info: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </Icon>
  ),
  Clock: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  Calendar: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Icon>
  ),
  Filter: (p: IconProps) => <Icon {...p}><path d="M3 5h18l-7 9v5l-4-2v-3z" /></Icon>,
  PanelRight: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M15 4v16" />
    </Icon>
  ),
  PanelRightOff: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </Icon>
  ),
  AlertTriangle: (p: IconProps) => (
    <Icon {...p}>
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </Icon>
  ),
  Save: (p: IconProps) => (
    <Icon {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </Icon>
  ),
  Folder: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Icon>
  ),
  User: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  ),
  Refresh: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </Icon>
  ),
  Stop: (p: IconProps) => <Icon {...p}><rect x="6" y="6" width="12" height="12" rx="2" /></Icon>,
  Tag: (p: IconProps) => (
    <Icon {...p}>
      <path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="8" cy="8" r="1.5" />
    </Icon>
  ),
  Link: (p: IconProps) => (
    <Icon {...p}>
      <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </Icon>
  ),
  Brain: (p: IconProps) => (
    <Icon {...p}>
      <path d="M9.5 3a3 3 0 0 0-3 3v.1A3 3 0 0 0 4 9a3 3 0 0 0 .8 2A3 3 0 0 0 4 13a3 3 0 0 0 2.5 3v1a3 3 0 0 0 5 1.5" />
      <path d="M14.5 3a3 3 0 0 1 3 3v.1A3 3 0 0 1 20 9a3 3 0 0 1-.8 2A3 3 0 0 1 20 13a3 3 0 0 1-2.5 3v1a3 3 0 0 1-5 1.5" />
      <path d="M12 5v15" />
    </Icon>
  ),
};
