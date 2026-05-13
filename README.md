EHS Ops Intelligence Hub
An AI-powered Environmental Health & Safety operations platform. Four integrated modules cover the full EHS ops lifecycle — from real-time incident triage to executive briefings and SOP generation.

Live demo: https://ehs-ops-hub.onrender.com

Modules
M1 · Air Traffic Control
Real-time incident triage queue with AI classification. Describe an incident and GPT-4o instantly assigns priority (P1–P4), incident type, responsible owner, and SLA — with a confidence score and rationale. New incidents flash into the live queue.

M2 · Knowledge Base
RAG-powered chat assistant grounded in 66 real EHS regulatory document chunks sourced from OSHA, HSE, EU-OSHA, ISO, EPA, and NIOSH. Answers include cited source links. Keyword-based retrieval with stopword filtering and title-boost scoring.

M3 · Exec Briefing
Streaming SIR (Situation / Impact / Recommendation) report generator. Choose Executive (≤200 words) or Operational (detailed, named owners) tone. Briefing streams token-by-token via Server-Sent Events. Export as Markdown.

M4 · Workflow Builder
AI-generated drag-and-drop SOP canvas. Describe any EHS process and GPT-4o produces a structured 5–8 step workflow with owners, SLA estimates, and actionable checklists. Steps animate in one-by-one. Reorder by dragging.

Tech Stack
Layer	Technology
Framework	Next.js 15 (App Router)
Language	TypeScript + React 19
AI	OpenAI GPT-4o via openai SDK
Styling	CSS custom properties + Tailwind CSS v4
Fonts	Geist Sans + Geist Mono
KB Ingest	cheerio + pdf-parse → data/kb-chunks.json
Deployment	Render (Node.js web service)
Project Structure
app/
  page.tsx                     # App shell — nav, sidebar, tab routing
  globals.css                  # Design tokens + global styles
  api/
    triage/route.ts            # POST /api/triage — incident classification
    kb-chat/route.ts           # POST /api/kb-chat — RAG Q&A
    generate-briefing/route.ts # POST /api/generate-briefing — SSE streaming
    generate-workflow/route.ts # POST /api/generate-workflow — SOP generation

components/
  ui/
    Icons.tsx                  # SVG icon library
    Primitives.tsx             # Badge, Button, StatCard, Input, etc.
  modules/
    ModuleATC.tsx              # M1 Air Traffic Control
    ModuleKB.tsx               # M2 Knowledge Base
    ModuleExec.tsx             # M3 Exec Briefing
    ModuleWorkflow.tsx         # M4 Workflow Builder

lib/
  openai.ts                    # OpenAI client singleton
  kb-search.ts                 # Keyword search over KB chunks
  seed-data.ts                 # Demo incidents + KB article metadata
  storage.ts                   # localStorage helpers

data/
  kb-chunks.json               # 66 ingested regulatory document chunks

scripts/
  ingest-kb.ts                 # Build-time KB ingest pipeline
  add-chunks.mjs               # Utility to append chunks manually

types/
  index.ts                     # Shared TypeScript interfaces
  kb.ts                        # KBChunk type
Knowledge Base Sources
Authority	Coverage
OSHA	Chemical spill response, ammonia protocol, VOC limits, fire safety, PPE, near-miss reporting, first aid, exit routes
HSE (UK)	Manual handling, slips & trips, noise, PPE, work-related stress, upper limb disorders
EU-OSHA	OSH framework directive, dangerous substances, musculoskeletal disorders, psychosocial risks
ISO	ISO 45001 (OH&S management), ISO 14001 (environmental management)
EPA	Greenhouse gas reporting, waste management
HSA (Ireland)	Safety, Health and Welfare at Work Act 2005
NIOSH	Ergonomics and MSDs
Local Development
# 1. Clone
git clone https://github.com/richardlee8433/ehs-ops-hub.git
cd ehs-ops-hub/EHS_Ops_Hub

# 2. Install dependencies
npm install

# 3. Add environment variable
echo "OPENAI_API_KEY=sk-..." > .env.local

# 4. Start dev server
npm run dev
# → http://localhost:3000
Re-run KB ingest (optional)
npm run ingest-kb
# Fetches HTML/PDF from regulatory sources
# Outputs data/kb-chunks.json
Deployment (Render)
Create a new Web Service on render.com
Connect this GitHub repo
Set Root Directory to EHS_Ops_Hub
Build command: npm install && npm run build
Start command: npm start
Add environment variable: OPENAI_API_KEY
Design
Light professional theme with teal/blue AI accent gradient
AI cards (.ai-card) and chips (.ai-chip) visually distinguish AI-generated content
Geist Sans + Geist Mono typography
All design tokens via CSS custom properties
No external UI library — all components hand-built in Primitives.tsx
