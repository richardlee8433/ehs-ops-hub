export interface SeedIncident {
  id: string;
  title: string;
  type: string;
  priority: "P1" | "P2" | "P3" | "P4";
  owner: string;
  sla: string;
  status: "Open" | "In Progress" | "Resolved";
  reporter: string;
  created: string;
  ai?: boolean;
  _new?: boolean;
}

export const SEED_INCIDENTS: SeedIncident[] = [
  { id: "INC-2841", title: "NH₃ leak detected — Bay 3 cold storage",   type: "Chemical Release", priority: "P1", owner: "M. Chen",     sla: "12m",         status: "In Progress", reporter: "K. Patel",    created: "2026-05-13 08:14", ai: true },
  { id: "INC-2840", title: "Forklift collision — DC-4 dock 12",         type: "Vehicle Incident",  priority: "P2", owner: "S. Okafor",   sla: "47m",         status: "In Progress", reporter: "J. Liu",      created: "2026-05-13 07:52" },
  { id: "INC-2839", title: "Eyewash station fails inspection",          type: "Equipment Failure", priority: "P3", owner: "A. Reyes",    sla: "3h 14m",      status: "Open",        reporter: "T. Walsh",    created: "2026-05-13 07:21", ai: true },
  { id: "INC-2838", title: "Slip & fall — break room east wing",        type: "Personal Injury",   priority: "P2", owner: "Unassigned",  sla: "OVERDUE 22m", status: "Open",        reporter: "R. Singh",    created: "2026-05-13 06:48" },
  { id: "INC-2837", title: "Air quality VOC spike — paint booth 2",     type: "Air Quality",       priority: "P2", owner: "D. Brooks",   sla: "1h 04m",      status: "In Progress", reporter: "L. Garcia",   created: "2026-05-13 05:33", ai: true },
  { id: "INC-2836", title: "Near-miss: pallet rack overload C-17",      type: "Near Miss",         priority: "P3", owner: "M. Chen",     sla: "6h 11m",      status: "Open",        reporter: "P. Tanaka",   created: "2026-05-13 04:17" },
  { id: "INC-2835", title: "PPE non-compliance audit — line 7",         type: "Compliance",        priority: "P4", owner: "K. Adler",    sla: "1d 2h",       status: "Open",        reporter: "Audit Bot",   created: "2026-05-12 22:09" },
  { id: "INC-2834", title: "Sprinkler head obstruction — Aisle 9",      type: "Fire Safety",       priority: "P3", owner: "S. Okafor",   sla: "2h 48m",      status: "Resolved",    reporter: "Walk-through",created: "2026-05-12 19:44" },
  { id: "INC-2833", title: "Battery thermal event — charging room",     type: "Fire Safety",       priority: "P1", owner: "D. Brooks",   sla: "—",           status: "Resolved",    reporter: "Auto-sensor", created: "2026-05-12 18:02", ai: true },
  { id: "INC-2832", title: "Ergonomic complaint — pack station 14",     type: "Ergonomic",         priority: "P4", owner: "A. Reyes",    sla: "3d",          status: "Resolved",    reporter: "Self-report", created: "2026-05-12 16:30" },
];

export interface KBArticle {
  id: string;
  cat: string;
  title: string;
  updated: string;
  author: string;
  reads: number;
  body?: string;
}

export const KB_ARTICLES: KBArticle[] = [
  { id: "KB-014", cat: "Chemical",   title: "Ammonia (NH₃) Release Response — Tier 1",  updated: "Apr 02, 2026", author: "M. Chen",  reads: 1284, body: "Tier-1 response triggers when sensor readings exceed 25 ppm at any fixed detector for ≥ 60 seconds…" },
  { id: "KB-013", cat: "PPE",        title: "PPE Matrix for Cold Storage Operators",      updated: "Mar 28, 2026", author: "K. Adler", reads: 942 },
  { id: "KB-012", cat: "Fire",       title: "Li-ion Battery Thermal Runaway Protocol",   updated: "Mar 19, 2026", author: "D. Brooks",reads: 2103 },
  { id: "KB-011", cat: "Vehicle",    title: "Forklift Operator Recertification Window",   updated: "Mar 11, 2026", author: "S. Okafor",reads: 568  },
  { id: "KB-010", cat: "Air",        title: "VOC Threshold Limits — Paint & Coating",    updated: "Feb 26, 2026", author: "L. Garcia",reads: 712 },
  { id: "KB-009", cat: "Ergonomic",  title: "Pack Station Ergonomic Risk Scoring",        updated: "Feb 14, 2026", author: "A. Reyes", reads: 433 },
  { id: "KB-008", cat: "Chemical",   title: "Chemical Spill Containment — Quick Card",   updated: "Feb 03, 2026", author: "M. Chen",  reads: 1875 },
  { id: "KB-007", cat: "Compliance", title: "OSHA 300 Logging — What Counts",             updated: "Jan 22, 2026", author: "K. Adler", reads: 1102 },
  { id: "KB-006", cat: "Fire",       title: 'Sprinkler Clearance Requirements (18")',     updated: "Jan 09, 2026", author: "S. Okafor",reads: 318 },
];

export const KB_CATEGORIES = ["All", "Chemical", "Fire", "PPE", "Air", "Vehicle", "Ergonomic", "Compliance"];
