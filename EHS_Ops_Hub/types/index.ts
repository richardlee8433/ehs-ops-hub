// ─── Incident / M1 ───────────────────────────────────────────────
export type IncidentPriority = "P1" | "P2" | "P3" | "P4";
export type IncidentStatus = "Open" | "In Progress" | "Resolved" | "Overdue";
export type IncidentType =
  | "Chemical Spill"
  | "Workplace Injury"
  | "Near Miss"
  | "Fire / Explosion Risk"
  | "Electrical Hazard"
  | "Ergonomic Issue"
  | "Environmental Breach"
  | "PPE Non-Compliance"
  | "Training Gap"
  | "Administrative"
  | "Other";

export type IncidentOwner =
  | "ESG Manager"
  | "Site Lead"
  | "HR"
  | "Facilities"
  | "Safety Officer";

export interface Incident {
  id: string;
  title: string;
  description: string;
  reporter: string;
  date: string; // ISO string
  createdAt: string; // ISO string
  status: IncidentStatus;
  // AI-assigned fields (undefined until classified)
  type?: IncidentType;
  priority?: IncidentPriority;
  owner?: IncidentOwner;
  sla_hours?: number;
  rationale?: string;
  // Manual override flag
  manuallyOverridden?: boolean;
}

export interface TriageRequest {
  title: string;
  description: string;
  reporter: string;
  date: string;
}

export interface TriageResponse {
  type: IncidentType;
  priority: IncidentPriority;
  owner: IncidentOwner;
  sla_hours: number;
  rationale: string;
}

// ─── Knowledge Base / M2 ─────────────────────────────────────────
export type KBCategory =
  | "Incident Response"
  | "Regulatory & Compliance"
  | "Chemical Handling"
  | "First Aid"
  | "Emergency Procedures"
  | "PPE"
  | "Training"
  | "Environmental";

export interface KBArticle {
  id: string;
  title: string;
  category: KBCategory;
  content: string;
  lastUpdated: string; // ISO date string
  tags: string[];
}

export interface KBChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[]; // article ids
  timestamp: string;
}

export interface KBChatRequest {
  question: string;
  articles: KBArticle[];
}

export interface KBChatResponse {
  answer: string;
  sources: string[]; // article ids
}

// ─── Exec Briefing / M3 ──────────────────────────────────────────
export type BriefingTone = "operational" | "executive";

export interface BriefingRequest {
  incidents: Incident[];
  dateRange: { from: string; to: string };
  tone: BriefingTone;
}

export interface BriefingMetrics {
  total: number;
  p1Count: number;
  avgResolutionHours: number | null;
  topType: string | null;
}

// ─── Workflow Builder / M4 ───────────────────────────────────────
export interface WorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  owner: string;
  sla_hours: number;
  checklist: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  linkedIncidentType?: IncidentType;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerateWorkflowRequest {
  description: string;
}

export interface GenerateWorkflowResponse {
  steps: Omit<WorkflowStep, "id" | "stepNumber">[];
}

// ─── Dashboard stats ─────────────────────────────────────────────
export interface DashboardStats {
  open: number;
  inProgress: number;
  resolved: number;
  overdue: number;
}
