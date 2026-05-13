export interface KBChunk {
  id: string;
  title: string;
  source: "OSHA" | "HSE" | "HSA" | "EU-OSHA" | "EPA" | "ISO" | "NIOSH";
  category:
    | "incident_response"
    | "hazardous_materials"
    | "ergonomics"
    | "environmental"
    | "regulatory"
    | "first_aid"
    | "ppe"
    | "workplace_health";
  url: string;
  content: string;
  chunk_index: number;
  total_chunks: number;
}
