import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";
import { load as cheerioLoad } from "cheerio";

const require = createRequire(import.meta.url);
// pdf-parse is CJS-only; createRequire avoids ESM interop issues
const pdfParse = require("pdf-parse") as (
  buf: Buffer
) => Promise<{ text: string }>;

// ─── Types ────────────────────────────────────────────────────────────────────

interface KBChunk {
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

interface DocConfig {
  title: string;
  source: KBChunk["source"];
  category: KBChunk["category"];
  url: string;
  type: "html" | "pdf";
  slug: string;
}

// ─── Document list ────────────────────────────────────────────────────────────

const DOCS: DocConfig[] = [
  // OSHA — HTML (using current URL structure)
  {
    title: "Emergency Exit Routes",
    source: "OSHA",
    category: "incident_response",
    url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.37",
    type: "html",
    slug: "osha-exit-routes",
  },
  {
    title: "Fire Safety",
    source: "OSHA",
    category: "incident_response",
    url: "https://www.osha.gov/fire-safety",
    type: "html",
    slug: "osha-fire-safety",
  },
  {
    title: "Hazard Communication Standard",
    source: "OSHA",
    category: "hazardous_materials",
    url: "https://www.osha.gov/hazcom",
    type: "html",
    slug: "osha-hazcom-sds",
  },
  {
    title: "Carbon Monoxide Poisoning",
    source: "OSHA",
    category: "hazardous_materials",
    url: "https://www.osha.gov/SLTC/carbonmonoxide/",
    type: "html",
    slug: "osha-co-poisoning",
  },
  {
    title: "Workplace Violence Prevention",
    source: "OSHA",
    category: "workplace_health",
    url: "https://www.osha.gov/workplace-violence",
    type: "html",
    slug: "osha-workplace-violence",
  },
  {
    title: "Electrical Safety",
    source: "OSHA",
    category: "incident_response",
    url: "https://www.osha.gov/electrical",
    type: "html",
    slug: "osha-electrical-safety",
  },
  {
    title: "Flood Cleanup Safety",
    source: "OSHA",
    category: "incident_response",
    url: "https://www.osha.gov/SLTC/flooding/index.html",
    type: "html",
    slug: "osha-flood-cleanup",
  },
  {
    title: "Employer Responsibilities After Incident",
    source: "OSHA",
    category: "regulatory",
    url: "https://www.osha.gov/workers/file-complaint",
    type: "html",
    slug: "osha-employer-responsibilities",
  },
  // HSE UK — HTML (PDF links moved; using topic pages instead)
  {
    title: "First Aid at Work",
    source: "HSE",
    category: "first_aid",
    url: "https://www.hse.gov.uk/firstaid/",
    type: "html",
    slug: "hse-first-aid",
  },
  {
    title: "COSHH: Control of Substances Hazardous to Health",
    source: "HSE",
    category: "hazardous_materials",
    url: "https://www.hse.gov.uk/coshh/basics.htm",
    type: "html",
    slug: "hse-coshh",
  },
  {
    title: "Manual Handling at Work",
    source: "HSE",
    category: "ergonomics",
    url: "https://www.hse.gov.uk/msd/manual-handling/",
    type: "html",
    slug: "hse-manual-handling",
  },
  {
    title: "Work-Related Stress",
    source: "HSE",
    category: "workplace_health",
    url: "https://www.hse.gov.uk/stress/causes.htm",
    type: "html",
    slug: "hse-stress",
  },
  {
    title: "Slips and Trips",
    source: "HSE",
    category: "incident_response",
    url: "https://www.hse.gov.uk/slips/information.htm",
    type: "html",
    slug: "hse-slips-trips",
  },
  {
    title: "Work-Related Upper Limb Disorders",
    source: "HSE",
    category: "ergonomics",
    url: "https://www.hse.gov.uk/msd/uld/",
    type: "html",
    slug: "hse-wruld",
  },
  {
    title: "Personal Protective Equipment (PPE) at Work",
    source: "HSE",
    category: "ppe",
    url: "https://www.hse.gov.uk/ppe/",
    type: "html",
    slug: "hse-ppe",
  },
  {
    title: "Managing Contractors",
    source: "HSE",
    category: "regulatory",
    url: "https://www.hse.gov.uk/managing/topics/contractors.htm",
    type: "html",
    slug: "hse-contractors",
  },
  {
    title: "Workplace Transport Safety",
    source: "HSE",
    category: "incident_response",
    url: "https://www.hse.gov.uk/workplacetransport/drivers.htm",
    type: "html",
    slug: "hse-transport-safety",
  },
  {
    title: "Noise at Work",
    source: "HSE",
    category: "workplace_health",
    url: "https://www.hse.gov.uk/noise/regulations.htm",
    type: "html",
    slug: "hse-noise",
  },
  // HSA Ireland — HTML
  {
    title: "Safety, Health and Welfare at Work Act 2005",
    source: "HSA",
    category: "regulatory",
    url: "https://www.hsa.ie/eng/topics/",
    type: "html",
    slug: "hsa-shww-act",
  },
  {
    title: "Near Miss Reporting",
    source: "HSA",
    category: "incident_response",
    url: "https://www.hsa.ie/eng/topics/accident_and_dangerous_occurrence_reporting/",
    type: "html",
    slug: "hsa-near-miss",
  },
  // EU-OSHA — HTML
  {
    title: "EU OSH Framework Directive Overview",
    source: "EU-OSHA",
    category: "regulatory",
    url: "https://osha.europa.eu/en/legislation/directives/the-osh-framework-directive/1",
    type: "html",
    slug: "eu-osha-framework",
  },
  {
    title: "Musculoskeletal Disorders in the Workplace",
    source: "EU-OSHA",
    category: "ergonomics",
    url: "https://osha.europa.eu/en/themes/musculoskeletal-disorders",
    type: "html",
    slug: "eu-osha-msd",
  },
  {
    title: "Psychosocial Risks and Stress at Work",
    source: "EU-OSHA",
    category: "workplace_health",
    url: "https://osha.europa.eu/en/themes/psychosocial-risks-and-stress",
    type: "html",
    slug: "eu-osha-psychosocial",
  },
  {
    title: "Dangerous Substances in the Workplace",
    source: "EU-OSHA",
    category: "hazardous_materials",
    url: "https://osha.europa.eu/en/themes/dangerous-substances",
    type: "html",
    slug: "eu-osha-dangerous-substances",
  },
  {
    title: "Workplace Health Promotion",
    source: "EU-OSHA",
    category: "workplace_health",
    url: "https://osha.europa.eu/en/themes/workplace-health-promotion",
    type: "html",
    slug: "eu-osha-health-promotion",
  },
  // EPA Ireland — HTML
  {
    title: "Waste Management Guidance",
    source: "EPA",
    category: "environmental",
    url: "https://www.epa.ie/our-services/monitoring--assessment/waste/",
    type: "html",
    slug: "epa-waste-management",
  },
  {
    title: "Greenhouse Gas Reporting",
    source: "EPA",
    category: "environmental",
    url: "https://www.epa.ie/our-services/monitoring--assessment/climate-change/",
    type: "html",
    slug: "epa-ghg-reporting",
  },
  // ISO — HTML
  {
    title: "ISO 45001: Occupational Health and Safety Overview",
    source: "ISO",
    category: "regulatory",
    url: "https://www.iso.org/iso-45001-occupational-health-and-safety.html",
    type: "html",
    slug: "iso-45001",
  },
  {
    title: "ISO 14001: Environmental Management Overview",
    source: "ISO",
    category: "environmental",
    url: "https://www.iso.org/iso-14001-environmental-management.html",
    type: "html",
    slug: "iso-14001",
  },
  // NIOSH — HTML
  {
    title: "Ergonomics and Musculoskeletal Disorders",
    source: "NIOSH",
    category: "ergonomics",
    url: "https://www.cdc.gov/niosh/topics/ergonomics/",
    type: "html",
    slug: "niosh-ergonomics",
  },
];

// ─── Text extraction ──────────────────────────────────────────────────────────

async function fetchHtmlText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; EHS-KB-Ingest/1.0; research purposes)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const $ = cheerioLoad(html);

  // Remove non-content elements
  $(
    "script, style, nav, header, footer, aside, .nav, .navigation, .menu, .sidebar, .cookie, .banner, .ad, noscript, iframe"
  ).remove();

  // Extract main content in priority order
  const mainSelectors = [
    "main",
    "article",
    '[role="main"]',
    ".content",
    ".main-content",
    "#content",
    "#main",
    ".entry-content",
    "body",
  ];

  let text = "";
  for (const sel of mainSelectors) {
    const el = $(sel);
    if (el.length) {
      text = el.text();
      break;
    }
  }

  // Clean up whitespace
  return text
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPdfText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; EHS-KB-Ingest/1.0; research purposes)",
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const parsed = await pdfParse(buffer);
  return parsed.text
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Chunking ─────────────────────────────────────────────────────────────────

const CHUNK_WORDS = 400;
const OVERLAP_WORDS = 50;

function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_WORDS, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start = end - OVERLAP_WORDS;
  }

  return chunks;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const allChunks: KBChunk[] = [];
  let successCount = 0;
  const failures: string[] = [];

  for (const doc of DOCS) {
    process.stdout.write(`Fetching: ${doc.title} (${doc.source}) ... `);
    try {
      const rawText =
        doc.type === "pdf"
          ? await fetchPdfText(doc.url)
          : await fetchHtmlText(doc.url);

      if (rawText.length < 60) {
        throw new Error("Extracted text too short — page may have blocked the request");
      }

      const textChunks = chunkText(rawText);

      textChunks.forEach((content, i) => {
        allChunks.push({
          id: `${doc.slug}-chunk-${i}`,
          title: doc.title,
          source: doc.source,
          category: doc.category,
          url: doc.url,
          content,
          chunk_index: i,
          total_chunks: textChunks.length,
        });
      });

      console.log(`✓ ${textChunks.length} chunks`);
      successCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ SKIPPED — ${msg}`);
      failures.push(`${doc.title} (${doc.url}): ${msg}`);
    }
  }

  // Write output
  const outputDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "kb-chunks.json");
  fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2), "utf-8");

  console.log("\n─── Ingest Summary ───────────────────────────────────");
  console.log(`  Documents: ${successCount}/${DOCS.length} succeeded`);
  console.log(`  Total chunks: ${allChunks.length}`);
  console.log(`  Output: ${outputPath}`);

  if (failures.length > 0) {
    console.log(`\n  Failed (${failures.length}):`);
    failures.forEach((f) => console.log(`    - ${f}`));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
