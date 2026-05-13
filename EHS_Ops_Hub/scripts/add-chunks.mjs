import { readFileSync, writeFileSync } from "fs";

const existing = JSON.parse(readFileSync("./data/kb-chunks.json", "utf8"));

const newChunks = [
  {
    id: "osha-chemical-spill-chunk-0",
    title: "Chemical Spill Response and Containment",
    source: "OSHA",
    category: "hazardous_materials",
    url: "https://www.osha.gov/hazardous-substances",
    content: "Chemical Spill Response Protocol: Immediate Actions. When a chemical spill occurs, follow these steps immediately. 1. Alert — Sound the alarm and notify all personnel in the affected area. Evacuate non-essential workers from the spill zone. Call emergency services if the spill is large or involves highly toxic substances. 2. Identify — Determine the chemical identity using the Safety Data Sheet (SDS). Identify the hazard class: flammable, corrosive, toxic, oxidizer, or reactive. Check the SDS for spill response guidance specific to that substance. 3. Isolate — Establish a safety perimeter. For unknown chemicals, maintain a minimum 300-foot isolation zone. Prevent access to the spill area. Shut off ignition sources if the chemical is flammable. 4. Personal Protective Equipment (PPE) — Only trained personnel with proper PPE should attempt cleanup. Minimum PPE for chemical spills: chemical-resistant gloves, safety goggles, face shield, chemical-resistant apron or coverall. For vapors or gases: air-purifying respirator or SCBA depending on concentration. 5. Containment — Use absorbent materials (vermiculite, dry sand, commercial absorbents) to contain the spill. Prevent the chemical from entering drains, sewers, or waterways. For liquid spills, work from the outside of the spill toward the center. 6. Cleanup — Collect absorbed material in labeled, compatible waste containers. Seal containers tightly. Decontaminate all equipment and PPE used. 7. Reporting — All significant chemical spills must be reported per OSHA 29 CFR 1910.120 (HAZWOPER). Spills exceeding reportable quantities under CERCLA must be reported to the National Response Center at 1-800-424-8802.",
    chunk_index: 0,
    total_chunks: 2
  },
  {
    id: "osha-chemical-spill-chunk-1",
    title: "Chemical Spill Response and Containment",
    source: "OSHA",
    category: "hazardous_materials",
    url: "https://www.osha.gov/hazardous-substances",
    content: "HAZWOPER Standard (29 CFR 1910.120) — Hazardous Waste Operations and Emergency Response. OSHA HAZWOPER applies to all employees involved in hazardous substance emergency response operations. Training Requirements: First Responder Awareness Level — employees who witness or discover a hazardous substance release must recognize the hazard, protect themselves, and call for assistance. First Responder Operations Level — employees who respond defensively require 8 hours of training minimum. Hazardous Materials Technician — employees who actively contain releases require 24 hours of training. Incident Command System (ICS): All emergency responses must use the ICS framework. Designate an Incident Commander. Establish a command post upwind and uphill from the release. Secondary Containment: Every chemical storage area must have secondary containment capable of holding 110% of the largest container volume. Drip trays, berms, and containment pallets are acceptable. Spill Kit Requirements: Spill kits must be located within 10 seconds travel time of all chemical storage and use areas. Kits must contain: absorbent pads and booms, chemical-resistant gloves, goggles, neutralizing agents appropriate to chemicals stored, waste disposal bags and labels. Post-Incident Reporting: Complete OSHA Form 300 if any worker injury or illness resulted. Submit written incident report within 24 hours to EHS Manager. Conduct root cause analysis within 72 hours.",
    chunk_index: 1,
    total_chunks: 2
  },
  {
    id: "osha-ammonia-response-chunk-0",
    title: "Ammonia (NH3) Hazard Response Protocol",
    source: "OSHA",
    category: "hazardous_materials",
    url: "https://www.osha.gov/ammonia",
    content: "Ammonia (NH3) Emergency Response. Ammonia is a colorless, pungent gas that is highly toxic and corrosive. OSHA Permissible Exposure Limit (PEL): 50 ppm (8-hour TWA). ACGIH STEL: 25 ppm (15-minute short-term). IDLH: 300 ppm. Detection and Alarm: Fixed gas detectors should alarm at 25 ppm (Tier 1) and 50 ppm (Tier 2). Personal monitors must be worn by all workers in refrigeration and cold storage facilities. Tier 1 Response (25-50 ppm): Notify Chemical Lead immediately. Investigate source — check valves, fittings, and flexible hose connections. Increase ventilation. Evacuate non-essential personnel from a 50-foot radius. Tier 2 Response (50-300 ppm): Mandatory evacuation of affected building zone. Don Level B PPE with SCBA before entry. Isolate source at panel shutoff valve. Contact local HAZMAT team if release cannot be controlled. Notify LEPC if release exceeds 500 lbs. Tier 3 Response (above 300 ppm or uncontrolled release): Full facility evacuation. Call 911 and notify LEPC and SERC. Do not attempt entry without full encapsulating Level A suit. First Aid for Ammonia Exposure: Inhalation — move to fresh air immediately, administer oxygen if breathing is difficult, seek emergency medical attention. Eye contact — flush with water for 15 minutes, do not rub eyes. Skin contact — remove contaminated clothing, wash with large amounts of water.",
    chunk_index: 0,
    total_chunks: 1
  },
  {
    id: "osha-voc-air-quality-chunk-0",
    title: "VOC Exposure Limits and Air Quality Response",
    source: "OSHA",
    category: "hazardous_materials",
    url: "https://www.osha.gov/indoor-air-quality",
    content: "Volatile Organic Compounds (VOCs) — Workplace Exposure Standards and Response. Common workplace sources include paints, coatings, adhesives, cleaning products, and industrial solvents. OSHA PELs for common VOCs: Toluene 200 ppm (8-hr TWA), Xylene 100 ppm, Acetone 1000 ppm, Benzene 1 ppm (carcinogen), Methylene Chloride 25 ppm. Air Quality Monitoring: Continuous air monitoring is required in paint booths and coating operations. Multi-gas detectors should be calibrated monthly. Action levels are typically 50% of the PEL. VOC Exceedance Response Procedure: 1. Stop all spray operations immediately upon alarm. 2. Increase exhaust ventilation to emergency mode. 3. Evacuate personnel from the affected zone (minimum 30-foot radius). 4. Identify the source — check spray equipment, containers, and transfer lines. 5. Do not restart operations until air monitoring confirms levels below the action level. 6. If levels exceed IDLH, treat as emergency: mandatory evacuation, SCBA required for re-entry. 7. Document all exceedances on OSHA Form 300 if any health effects reported. Engineering Controls: Local exhaust ventilation (LEV) is the preferred control method. Spray booths must meet NFPA 33 requirements. Air velocity across the booth face must be maintained at 100 fpm minimum. PPE: Air-purifying respirators with organic vapor cartridges for exposures up to 10x PEL. SCBA required above 10x PEL or when oxygen is below 19.5%.",
    chunk_index: 0,
    total_chunks: 1
  },
  {
    id: "osha-ppe-requirements-chunk-0",
    title: "PPE Requirements for Hazardous Materials Handling",
    source: "OSHA",
    category: "ppe",
    url: "https://www.osha.gov/personal-protective-equipment",
    content: "Personal Protective Equipment (PPE) Requirements — OSHA 29 CFR 1910.132. Employers must perform a hazard assessment to determine necessary PPE. PPE Levels for Hazardous Materials: Level A (Highest Protection) — fully encapsulating chemical-resistant suit, SCBA (pressure-demand, NIOSH-approved), inner and outer chemical-resistant gloves. Use when substance is highly toxic by skin absorption or unidentified substances are present. Level B — SCBA or supplied-air respirator, chemical-resistant clothing, gloves. Used when high respiratory protection is needed but lower skin protection. Level C — full-face air-purifying respirator, chemical-resistant clothing, gloves. Used when air contaminant type and concentration are known. Level D — standard work uniform with safety boots and glasses. Not acceptable when respiratory or skin hazards exist. PPE Inspection and Maintenance: All PPE must be inspected before each use. Damaged PPE must be removed from service immediately. Chemical-resistant gloves must be tested for integrity. SCBA units must be inspected monthly and after each use. Fit Testing: All respirator users must pass a qualitative or quantitative fit test annually. Medical clearance is required before respirator use.",
    chunk_index: 0,
    total_chunks: 1
  },
  {
    id: "osha-near-miss-reporting-chunk-0",
    title: "Near-Miss Incident Reporting Requirements",
    source: "OSHA",
    category: "incident_response",
    url: "https://www.osha.gov/near-miss",
    content: "Near-Miss Reporting — OSHA Guidance and Best Practices. A near-miss is an unplanned event that did not result in injury, illness, or damage but had the potential to do so. Why Report Near-Misses: For every serious injury, there are approximately 29 minor injuries and 300 near-misses (Heinrich Triangle). Early identification allows corrective action before an injury occurs. Reporting Procedure: 1. Report the near-miss immediately to the supervisor — verbal report within 1 hour. 2. Complete the Near-Miss Report Form within 24 hours, including: date, time, location, description, potential consequences, and contributing factors. 3. Submit report to EHS department for root cause analysis within 48 hours. 4. Corrective actions assigned with owner and deadline. 5. Findings shared at next safety meeting. Corrective Action Priorities: Immediate hazard — correct within 24 hours. High potential severity — correct within 1 week. Moderate potential severity — correct within 30 days. OSHA Recordability: Near-misses themselves are NOT OSHA recordable. However, if a near-miss investigation reveals an underlying condition that caused a previous recordable incident, that incident must be recorded.",
    chunk_index: 0,
    total_chunks: 1
  },
  {
    id: "osha-first-aid-chunk-0",
    title: "OSHA First Aid Requirements",
    source: "OSHA",
    category: "first_aid",
    url: "https://www.osha.gov/first-aid",
    content: "OSHA First Aid Requirements — 29 CFR 1910.151. In the absence of an infirmary, clinic, or hospital in near proximity to the workplace, a person or persons shall be adequately trained to render first aid. First Aid Training Requirements: At least one person per shift must be trained in first aid and CPR. Recertification required every 2 years for CPR/AED and every 3 years for first aid. First Aid Kit Requirements: Kits must be inspected monthly and replenished after use. Minimum one kit per 50 employees. Minimum contents per ANSI/ISEA Z308.1: adhesive bandages, sterile gauze pads, elastic bandages, antiseptic wipes, antibiotic ointment, burn treatment, eye wash solution, CPR face shield, disposable gloves. AED Requirements: OSHA recommends AEDs in all workplaces. AEDs must be accessible within 3-5 minutes of a cardiac event. Response Procedures: 1. Assess the scene for safety before approaching. 2. Call emergency services (911) if injury is serious. 3. Provide first aid within your level of training. 4. Do not move an injured person unless there is immediate danger. 5. Stay with the injured person until emergency services arrive. 6. Complete an incident report immediately after the event. Medical Emergency Contacts: Emergency services: 911. Poison Control Center: 1-800-222-1222.",
    chunk_index: 0,
    total_chunks: 1
  }
];

const updated = [...existing, ...newChunks];
writeFileSync("./data/kb-chunks.json", JSON.stringify(updated, null, 2));
console.log(`Added ${newChunks.length} chunks. Total: ${updated.length}`);
