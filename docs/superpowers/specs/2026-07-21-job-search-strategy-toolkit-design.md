# Job Search Strategy Toolkit Design

## Status

Approved in conversation on 2026-07-21.

## Product identity

- Skill name: `job-search-strategy-toolkit`
- Directory: `job-search-strategy-toolkit/`
- Public title: Job Search Strategy Toolkit
- Chinese subtitle: 互联网白领全链路求职策略工具箱

## Objective

Build a public Codex skill bundle for job seekers that supports the full path from understanding a job description to preparing for a specific interview round. Its primary audience is 25–35-year-old white-collar workers in Chinese first-tier and strong second-tier cities, especially people working in internet-related roles.

The toolkit must produce evidence-based, practical outputs without fabricating experience, responsibilities, metrics, company facts, or salary data.

## Target roles

The first release supports these 12 role families:

- Operations
- Product management
- Data analysis
- Marketing
- Finance
- Audit
- Human resources
- Sales and business development
- Software development and engineering
- Legal
- Strategy and consulting
- Design

## Target company types

Rules must distinguish these six company types:

- Large internet and technology companies
- Small and medium internet companies
- Startups
- Multinational companies
- State-owned enterprises
- Banks and financial institutions

## Product principles

1. Never fabricate candidate experience, responsibilities, results, metrics, qualifications, company information, or compensation data.
2. Ask one question at a time when collecting missing information.
3. Separate user-confirmed facts, public-source facts, and model inferences.
4. Cite online research with source links and retrieval dates.
5. Treat user-confirmed facts as higher priority than generic role or company patterns.
6. Do not use gender as an input to resume scoring, job matching, or interview assessment.
7. Do not persist user profiles, resumes, job descriptions, interview records, or story banks.
8. Let the user choose which report sections to include before PDF rendering.

## Architecture

Use a top-level router, four independently discoverable sub-skills, shared references, PDF assets, and deterministic rendering utilities.

```text
job-search-strategy-toolkit/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── jd-insight-skill/
│   ├── SKILL.md
│   ├── prompts/
│   └── frameworks/
├── resume-rebuild-skill/
│   ├── SKILL.md
│   ├── prompts/
│   └── frameworks/
├── resume-review-skill/
│   ├── SKILL.md
│   ├── prompts/
│   └── frameworks/
├── interview-prep-skill/
│   ├── SKILL.md
│   ├── prompts/
│   └── frameworks/
├── references/
│   ├── common/
│   ├── roles/
│   ├── companies/
│   ├── review/
│   ├── interviews/
│   └── rubrics/
├── assets/
│   └── pdf-templates/
└── scripts/
```

Each sub-skill must be usable independently. The top-level skill routes broad or multi-stage requests and coordinates the shared session context.

## Top-level routing

The router determines the path from the material and intent available in the current conversation.

| Available input | Behavior |
|---|---|
| JD only | Decode the JD first. Ask for a resume or career summary only if candidate matching is requested. |
| Resume only | Ask whether the goal is general polishing, interview preparation, or tailoring to a specific JD. |
| JD and resume | Offer the full sequence: JD insight, resume mining and tailoring, dual-lens review, and interview preparation. |
| Interview request only | Ask for the interview round, then request only the company, role, resume, and JD information required for that round. |
| Vague job-search request | Ask whether the user is evaluating roles, preparing an application, or preparing for an interview. |

The user may invoke any sub-skill directly and is never required to run the complete sequence.

## Session data flow

Maintain a temporary in-session task context containing:

- Target role and city
- Company and company type
- Raw JD and decoded requirements
- Online research sources
- Resume facts confirmed by the user
- Current interview round
- Numbers and edits confirmed by the user

Do not write this context into a user profile, JD bank, resume history, or story bank. Temporary rendering files must be removed after final delivery. Only the user-selected final PDF remains.

## Sub-skill responsibilities

### JD Insight Skill

Accept a JD URL or full text and perform:

- Company, product, industry, hiring-trend, and compensation research
- Five-layer JD decoding: explicit responsibilities, must-haves, nice-to-haves, hidden signals, and real business objectives
- Level, likely reporting line, and KPI inference
- Candidate match, gap, and apply-or-not analysis when resume evidence is available
- Source and inference labeling

Its selectable report section is “JD Insight and Application Strategy.”

### Resume Rebuild Skill

Support three workflows:

- General resume improvement without a JD
- Tailoring to a specific JD
- One-question-at-a-time experience mining when evidence is thin

Load the relevant role and company rules, preserve verified facts, flag unconfirmed data, and produce two selectable sections:

- Revised resume
- Resume change explanation

The revised resume defaults to a single-column ATS-friendly layout.

### Resume Review Skill

Evaluate the same resume from two independent perspectives.

HR screening covers ATS readability, keyword relevance, career continuity, stability and risk signals, information density, and whether the candidate should enter the next stage.

Hiring-manager review covers professional capability, business understanding, project complexity, individual contribution, result credibility, ownership, collaboration, immediate contribution, and likely interview probes.

The report must show separate scores, separate verdicts, shared concerns, disagreements, and the highest-priority revisions. Its selectable report section is “Dual-Lens Resume Review.”

### Interview Prep Skill

Ask which interview round the user is preparing for, then load the relevant rules for:

- HR screening
- Business first round
- Professional capability round
- Department-head round
- Executive or final round

Combine the interview round with role rules, company-type rules, JD requirements, resume evidence, and resume gaps. Produce two selectable sections:

- Interview preparation plan
- Printable interview question workbook

Questions must include category, difficulty, competency assessed, why the interviewer is likely to ask, follow-up chain, answer framework, and writing space.

## Shared reference system

Use a layered reference architecture rather than duplicating every role-by-company-by-stage combination.

```text
references/
├── common/
│   ├── authenticity.md
│   ├── career-stage.md
│   └── evidence-levels.md
├── roles/
├── companies/
├── review/
├── interviews/
└── rubrics/
```

Load references in this order:

1. Common authenticity and evidence rules
2. Target-role rules
3. Target-company-type rules
4. Current task or interview-stage rules
5. User-provided JD, resume, and confirmed facts

Resolve conflicts using this precedence:

> User-confirmed facts > current JD > role rules > company rules > general guidance

Each role reference must define professional keywords, meaningful metrics, typical tools, common resume risks, HR screening priorities, hiring-manager priorities, and stage-specific interview themes.

## Scoring model

### JD match

Check hard blockers separately, then calculate the match score:

- Core responsibility alignment: 30%
- Must-have requirements: 30%
- Resume evidence strength: 20%
- Industry and business context: 10%
- Nice-to-have requirements: 10%

Education, location, language, required certifications, and experience thresholds that are explicit hard blockers must remain visible and cannot be hidden by a high aggregate score.

### HR review

Score ATS readability, target relevance, keyword coverage, career continuity, risk signals, clarity, and information density. Provide a next-stage recommendation with cited evidence.

### Hiring-manager review

Score professional capability, business understanding, project complexity, individual contribution, result credibility, ownership, collaboration, immediate contribution, and expected ramp-up cost. Provide likely interview probes with cited evidence.

Every score and verdict must reference a resume passage, JD requirement, user-confirmed fact, or cited public source.

## Online research and evidence handling

Use online research when JD analysis benefits from company, product, industry, hiring-trend, or compensation context.

- Prefer primary and authoritative sources.
- Include source links and retrieval dates in the final PDF.
- Label statements as confirmed public facts, user-confirmed facts, or inference.
- If sources conflict, show the conflict and explain the uncertainty.
- If reliable compensation information is unavailable, state that evidence is insufficient.
- Never infer a JD from a company name when the JD URL cannot be read; ask the user to paste the full text.

## PDF selection and assembly

After analysis, show the user the report sections available for the current task:

- JD Insight and Application Strategy
- Revised Resume
- Resume Change Explanation
- Dual-Lens Resume Review
- Interview Preparation Plan
- Printable Interview Question Workbook

Recommend sections based on the current goal, but let the user decide what to include. Assemble selected sections into one PDF with a generated table of contents. Omit unselected sections entirely.

Use this pipeline:

> Validated temporary structured data > HTML templates > browser PDF rendering > visual and structural verification

The PDF must use A4 print dimensions, stable Chinese font fallbacks, page numbers, generation date, target company and role where relevant, working source links, and visible evidence labels. The question workbook must preserve adequate handwriting space.

## Error handling

- If a JD URL cannot be read, ask the user to paste the full text.
- If a resume is scanned, run OCR and ask the user to confirm critical fields.
- If metrics or evidence are missing, mark them as pending confirmation.
- If sources conflict, present the conflicting evidence.
- If compensation evidence is weak, do not invent a range.
- If JD and resume facts conflict, ask the user to resolve the contradiction.
- If PDF rendering has font, overflow, pagination, blank-page, or link problems, fix and rerender before delivery.
- If PDF generation is unavailable, report the blocker and do not present HTML as the requested final deliverable.

## Evaluation strategy

Develop the skill with baseline and post-skill evaluations.

### Routing evaluations

Test JD-only, resume-only, JD-plus-resume, interview-only, and vague job-search prompts. Confirm correct routing and one-question-at-a-time behavior.

### Professional evaluations

Use representative operations, product, engineering, and additional role samples. Confirm correct JD decomposition, evidence-grounded resume edits, genuinely distinct HR and hiring-manager assessments, and stage-specific interview questions.

### Adversarial evaluations

Test missing metrics, unavailable company information, requests to exaggerate responsibility, demographic bias risks, and contradictions between the JD and resume.

### PDF evaluations

Verify selected-section assembly, table-of-contents accuracy, Chinese fonts, pagination, tables, links, ATS readability, workbook writing space, and absence of placeholders or copied branding.

### Public-release evaluations

Verify independent triggering of the top-level and four sub-skills, portability without author-specific absolute paths, absence of persistent user data, temporary-file cleanup, valid skill metadata, and original branding and wording.

## Attribution and originality

The implementation may learn from the modular bundle architecture of `offer-toolkit-skill`, but must use original naming, instructions, templates, scoring explanations, prompts, and visual identity. Do not copy the reference repository’s personal footer, author branding, output paths, example user data, or proprietary-looking presentation details.

## Success criteria

The first release is successful when:

1. Users can enter from a JD, resume, interview request, or broad job-search request.
2. The router asks only the next necessary question.
3. All 12 roles and six company types load appropriate shared rules.
4. Resume edits and scores are traceable to evidence.
5. HR and hiring-manager reviews remain independent and useful.
6. Interview preparation changes according to the interview round.
7. Users can select report sections and receive one verified PDF.
8. No persistent user profile, JD bank, resume history, or story bank is created.
9. The skill is portable, independently discoverable, and ready for public release.
