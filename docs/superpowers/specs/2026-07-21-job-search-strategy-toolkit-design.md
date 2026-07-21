# Job Search Strategy Toolkit Design

## Scope decision

Build a Chinese-first public Codex skill by modifying the downloaded MIT-licensed `offer-toolkit-skill`. Preserve its MIT license and copyright notice. Reuse compatible JD, resume, and HTML-template assets; remove upstream branding, author footers, personal paths, persistent banks, and example candidate data from runtime behavior.

The final bundle has three capabilities only:

1. JD insight.
2. Resume evidence mining, rewriting, and JD tailoring.
3. Independent HR-screening and hiring-manager resume review.

Delete every interview-related module, prompt, route, output, question bank, workbook, stage rule, and report field. PDF output contains only the revised resume. JD insight and dual-lens review are conversational outputs and never enter the PDF.

## Audience and language

- Primary users: Chinese-speaking white-collar job seekers, especially ages 25–35 in first-tier and strong second-tier cities.
- Default language: Simplified Chinese.
- English or bilingual wording: only when the user requests it or the target JD/resume requires it.
- Role coverage: operations, product, data analysis, marketing, finance, audit, HR, sales/BD, engineering, legal, strategy/consulting, and design.
- Company coverage: large technology, mid-size internet, startup, multinational, state-owned, and bank/financial institution.

Age may inform career-stage context but never employability scoring. Gender never affects matching, scoring, or hiring recommendations.

## Architecture

```text
job-search-strategy-toolkit/
├── SKILL.md
├── agents/openai.yaml
├── LICENSE
├── jd-insight-skill/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── prompts/
│   └── frameworks/
├── resume-rebuild-skill/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── prompts/
│   ├── frameworks/
│   └── templates/
├── resume-review-skill/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── prompts/
│   └── frameworks/
├── references/
│   ├── common/
│   ├── roles/
│   └── companies/
├── assets/report/
└── scripts/
```

No interview child skill exists.

## Router

| Available material | Behavior |
|---|---|
| JD only | Route to JD insight. Ask for a resume only when the user requests personal match analysis. |
| Resume only | Ask one question: general polishing or tailoring to a specific JD? |
| JD and resume | Decode the JD, rebuild/tailor the resume, then offer independent dual-lens review. |
| Resume review request | Run HR and hiring-manager reviews independently, then synthesize disagreements. |
| Vague request | Ask whether the user wants to understand a JD or improve/review a resume. |

Ask at most one necessary question at a time and never repeat information already supplied.

## Shared evidence rules

Use four evidence labels:

- `[用户确认]`: supplied or explicitly confirmed by the user.
- `[公开来源]`: supported by a link and retrieval date.
- `[合理推断]`: an inference with its basis stated.
- `[待确认]`: material information not yet confirmed.

Precedence: user-confirmed facts > current JD > selected role reference > selected company reference > general advice.

Never invent candidate experience, metrics, titles, tools, certificates, projects, company facts, or compensation data. Do not save user profiles, resumes, JDs, review history, or any bank. Test fixtures must be explicitly anonymous and synthetic.

## JD insight

Decode five layers:

1. Explicit responsibilities and qualifications.
2. Business goals and success metrics.
3. Hidden expectations and likely ownership.
4. Constraints, risks, and ambiguity.
5. Application decision and next action.

When a resume is present, score match with evidence-linked dimensions: hard requirements 30, core experience 30, domain/company context 20, tools/methods 10, and practical constraints 10. Missing evidence lowers confidence and becomes `[待确认]`; it never becomes a guessed fact.

JD output is conversation only. It does not create a PDF section.

## Resume rebuild

When only a resume is supplied and the goal is unclear, ask exactly:

> 你这次更需要通用修改润色，还是根据具体JD定制简历？

Use a session-only normalized resume model. Mine one evidence dimension per question: business problem, personal action, method/tool, scale, result, and relevant constraint. Stop when more questions would not materially improve relevance or credibility.

Rewrite bullets as action + method + result while preserving uncertainty. Never promote participation to ownership, upgrade titles, add metrics, or hide weak evidence behind vague language.

The revised resume is the only PDF-eligible artifact.

## Dual-lens resume review

Run two independent passes before synthesis.

HR rubric (100): ATS readability 15, role relevance 25, keyword coverage 15, continuity/risk 15, clarity/density 15, credibility/completeness 15.

Hiring-manager rubric (100): professional capability 20, business understanding 15, project complexity 15, individual contribution 15, result credibility 15, ownership/collaboration 10, immediate contribution/ramp-up cost 10.

Each score cites resume text, a JD requirement, a user-confirmed fact, or a public source. Keep scores and verdicts independent; never create a blended score. Synthesis shows shared strengths, shared concerns, disagreements, blockers, and three to five priority revisions.

Review output is conversation only. It does not create a PDF section and contains no interview questions or probes.

## PDF output

Reuse compatible upstream resume templates and rendering patterns. Generate one A4 PDF containing only the revised resume. Do not include JD analysis, review scores, change explanations, interview material, question workbooks, or generated table of contents.

The renderer must:

- accept validated revised-resume data;
- escape untrusted text and validate URLs;
- render Simplified Chinese with stable font fallbacks;
- preserve clickable contact links;
- avoid blank pages, overflow, clipped text, placeholders, branding, and author footers;
- use Chrome/Chromium print-to-PDF;
- validate with `pdfinfo`, render pages with `pdftoppm`, and visually inspect the result.

## Validation

- Static tests enforce three child skills, 12 role references, six company references, valid metadata, Chinese-first routing, evidence safety, non-persistence, and complete absence of interview terms/modules.
- Forward tests cover JD-only, resume-only, JD-plus-resume, and dual-lens review.
- JD and review outputs must remain conversational.
- PDF tests assert the artifact contains revised-resume content only.
- Official `quick_validate.py` must pass for the top-level and all three child skills.
- The final public repository retains the upstream MIT notice and contains no copied branding, personal paths, persistent banks, or real candidate data.

## Acceptance criteria

1. Users can enter with a JD, resume, both, or a resume-review request.
2. Resume-only requests clarify general polish versus JD tailoring with one question.
3. JD conclusions distinguish evidence, inference, and missing information.
4. Resume rewrites never invent facts and can mine missing evidence one question at a time.
5. HR and hiring-manager reviews remain independent and evidence-linked.
6. No interview-related runtime content exists.
7. Only the revised resume is exported to a verified PDF.
8. Default interaction and artifacts are Simplified Chinese.
