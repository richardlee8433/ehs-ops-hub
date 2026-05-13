import type { Incident, Workflow, KBChatMessage } from "@/types/index";

const KEYS = {
  incidents: "ehs_incidents",
  workflows: "ehs_workflows",
  kbHistory: "ehs_kb_history",
} as const;

// ─── Incidents ────────────────────────────────────────────────────
export function getIncidents(): Incident[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.incidents) ?? "[]");
  } catch {
    return [];
  }
}

export function saveIncident(incident: Incident): void {
  const all = getIncidents();
  const idx = all.findIndex((i) => i.id === incident.id);
  if (idx >= 0) {
    all[idx] = incident;
  } else {
    all.unshift(incident);
  }
  localStorage.setItem(KEYS.incidents, JSON.stringify(all));
}

export function updateIncidentStatus(
  id: string,
  status: Incident["status"]
): void {
  const all = getIncidents();
  const target = all.find((i) => i.id === id);
  if (target) {
    target.status = status;
    localStorage.setItem(KEYS.incidents, JSON.stringify(all));
  }
}

export function deleteIncident(id: string): void {
  const filtered = getIncidents().filter((i) => i.id !== id);
  localStorage.setItem(KEYS.incidents, JSON.stringify(filtered));
}

// ─── Workflows ───────────────────────────────────────────────────
export function getWorkflows(): Workflow[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.workflows) ?? "[]");
  } catch {
    return [];
  }
}

export function saveWorkflow(workflow: Workflow): void {
  const all = getWorkflows();
  const idx = all.findIndex((w) => w.id === workflow.id);
  if (idx >= 0) {
    all[idx] = workflow;
  } else {
    all.unshift(workflow);
  }
  localStorage.setItem(KEYS.workflows, JSON.stringify(all));
}

export function deleteWorkflow(id: string): void {
  const filtered = getWorkflows().filter((w) => w.id !== id);
  localStorage.setItem(KEYS.workflows, JSON.stringify(filtered));
}

// ─── KB Chat History ─────────────────────────────────────────────
export function getKBHistory(): KBChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.kbHistory) ?? "[]");
  } catch {
    return [];
  }
}

export function appendKBMessage(message: KBChatMessage): void {
  const history = getKBHistory();
  history.push(message);
  // Keep last 100 messages
  const trimmed = history.slice(-100);
  localStorage.setItem(KEYS.kbHistory, JSON.stringify(trimmed));
}

export function clearKBHistory(): void {
  localStorage.removeItem(KEYS.kbHistory);
}
