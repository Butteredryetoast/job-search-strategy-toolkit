# Job Search Strategy Toolkit Revised Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`. Every production change uses `superpowers:test-driven-development`; every Skill change uses `skill-creator` and `superpowers:writing-skills`; PDF work uses `pdf:pdf`.

**Goal:** Modify the downloaded MIT `offer-toolkit-skill` into a Chinese-first public Skill containing only JD insight, resume mining/rewrite/tailoring, dual-lens resume review, and revised-resume PDF export.

**Architecture:** One router plus three child skills (`jd-insight-skill`, `resume-rebuild-skill`, `resume-review-skill`). Reuse compatible upstream prompts/templates, add missing review logic, and remove all interview behavior. JD and review outputs stay in chat; only the revised resume can become PDF.

**Tech Stack:** Markdown Skill files, YAML metadata, Node.js built-in tests, HTML/CSS, Playwright/Chrome, `pdfinfo`, `pdftoppm`, Python virtual environment with PyYAML for official Skill validation.

## Global Constraints

- Default interaction and artifacts use Simplified Chinese.
- Ask at most one necessary question at a time.
- Supported roles: operations, product, data analysis, marketing, finance, audit, HR, sales/BD, engineering, legal, strategy/consulting, and design.
- Supported companies: large technology, mid-size internet, startup, multinational, state-owned, and bank/financial institution.
- Never invent candidate facts, metrics, titles, tools, certificates, projects, company facts, or compensation data.
- Do not persist user profiles, resumes, JDs, review history, JD banks, or story banks.
- Gender never affects matching or scoring. Age is career-stage context only.
- Remove every interview route, module, prompt, field, question, workbook, stage rule, and runtime mention.
- JD insight and dual-lens review are chat-only. PDF contains only the revised resume.
- Preserve upstream `LICENSE` with `Copyright (c) 2026 yanliudesign`; remove upstream branding, author footer, social links, personal paths, and example candidate data from runtime outputs.
- Metadata strings are double quoted. Each `short_description` is 25–64 characters. Each `default_prompt` includes its `$skill-name`.

## Execution Order

Foundation → JD → Resume → Review → PDF/release. A task proceeds only after RED/GREEN evidence, commit, and independent task review.

### Task 1: Establish RED router evaluations

**Status:** Implemented and independently approved in commits `9a9303e`, `0c2aa5c`, `c50f90a`, and `096dd90`.

**Files:** `tests/evals/router.json`, `tests/baselines/router-without-skill.md`, `tests/test-foundation.mjs`.

Keep the anonymous synthetic baselines and five RED assertions. In Task 3, update the route assertion from the superseded interview wording to the final two-intent resume wording and add the no-interview scan before making the suite GREEN.

### Task 2: Seed three child skills from the MIT source

**Files:** Create `job-search-strategy-toolkit/` and three child skill folders.

1. Verify `.gitignore` contains `.worktrees/`, `.superpowers/`, `.venv/`, and `node_modules/`.
2. Create `.venv`; install PyYAML; verify `.venv/bin/python -c 'import yaml'`.
3. Copy `/Users/mac/.codex/skills/offer-toolkit-skill` to `job-search-strategy-toolkit` and preserve the top-level `LICENSE` verbatim.
4. Remove the copied `.git` directory if present and delete `bq-skill` completely.
5. Rename `job-description-skill` to `jd-insight-skill` and `resume-skill` to `resume-rebuild-skill`.
6. Initialize only the missing `resume-review-skill` with Skill Creator.
7. Generate `agents/openai.yaml` for top-level and all three children with valid quoted metadata. Use these values:
   - top: `Job Search Strategy Toolkit`; `面向中文求职者的JD解读、简历优化、双视角评审与简历PDF工具箱`; prompt includes `$job-search-strategy-toolkit`.
   - JD: `JD Insight`; `面向中文求职者的JD解读、证据匹配、投递判断与岗位风险分析`; prompt includes `$jd-insight-skill`.
   - resume: `Resume Rebuild`; `面向中文求职者的简历深挖、真实改写、通用润色与JD定制`; prompt includes `$resume-rebuild-skill`.
   - review: `Dual-Lens Resume Review`; `从HR招聘筛选和部门负责人角度独立评分并评审中文简历`; prompt includes `$resume-review-skill`.
8. Do not rewrite business content in this task. Commit: `chore: seed toolkit from MIT-licensed base`.

### Task 3: Implement the final top-level router and common evidence rules

**Files:** Modify top-level `SKILL.md`; create `references/common/{authenticity,evidence-levels,career-stage}.md`; modify `tests/test-foundation.mjs`.

1. First modify the test to require exactly three child routes, the question `你这次更需要通用修改润色，还是根据具体JD定制简历？`, chat-only JD/review output, revised-resume-only PDF, and no interview child. Run and verify RED against copied upstream content.
2. Replace frontmatter with `name: job-search-strategy-toolkit` and a `Use when...` description covering JD, resume rewrite/tailoring, and dual-lens review only.
3. Implement routes: JD only; resume only; JD+resume; direct resume-review; vague request. One question maximum.
4. Define evidence labels `[用户确认]`, `[公开来源]`, `[合理推断]`, `[待确认]` and precedence `用户确认事实 > 当前JD > 岗位规则 > 企业规则 > 通用建议`.
5. Explicitly prohibit persistence, demographic scoring, fabricated evidence, interview content, and non-resume PDF content.
6. Run the focused router tests; commit `feat: add Chinese-first JD and resume router`.

### Task 4: Add role/company references and validate foundation

**Files:** Create `references/roles/*.md`, `references/companies/*.md`; create `tests/baselines/router-with-skill.md`.

1. Create exactly 12 role files: `operations`, `product`, `data-analysis`, `marketing`, `finance`, `audit`, `hr`, `sales-bd`, `engineering`, `legal`, `strategy-consulting`, `design`.
2. Each role file contains `核心业务目标`, `招聘关键词`, `有意义的成果指标`, `常用工具与方法`, `HR筛选重点`, `部门负责人关注点`, and `常见简历雷区`. No interview section.
3. Create six company files: `large-tech`, `mid-size-internet`, `startup`, `multinational`, `state-owned`, `bank-finance`, with `招聘偏好`, `简历风格`, `证据要求`, and `风险信号` only.
4. Run the router scenarios with the Skill in fresh contexts; record verbatim outputs.
5. Run `node --test tests/test-foundation.mjs`. Expected: all tests pass.
6. Run official validation for the top and three children; child validation may remain blocked only by business frontmatter scheduled in later tasks, and any such block must be reported rather than hidden.
7. Commit `feat: add role and company reference layers`.

### Task 5: Establish RED JD evaluations

**Files:** Create `tests/evals/jd-insight.json`, `tests/baselines/jd-insight-without-skill.md`, `tests/test-jd-insight.mjs`.

Use anonymous synthetic JD-only, JD+resume, and ambiguous-company scenarios. Tests require five-layer decode, weights `30/30/20/10/10`, evidence labels, one-question behavior, research links/dates, chat-only output, and absence of interview prediction. Run the test and verify expected RED before production edits. Commit `test: add JD insight evaluations`.

### Task 6: Adapt the upstream JD module

**Files:** Modify `jd-insight-skill/SKILL.md`, `prompts/jd-decoder.md`, `prompts/match-score.md`, `prompts/should-i-apply.md`; create/update `frameworks/{decode-patterns,match-rubric,report-contract}.md`.

1. Remove `prompts/interview-predictor.md`, `jd-bank/`, persistent indexing, report footer requirements, social links, and PDF/HTML report generation.
2. Implement five layers: explicit requirements, business goals/success metrics, hidden ownership, constraints/risks, application decision/next action.
3. Implement resume match weights: hard requirements 30, core experience 30, domain/company context 20, tools/methods 10, practical constraints 10.
4. Every match row cites JD text and resume evidence. Missing evidence becomes `[待确认]` and lowers confidence.
5. Public research requires link, retrieval date, and `[公开来源]`; inference requires basis.
6. Output a structured Chinese chat response only. Run JD tests and commit `feat: adapt JD insight workflow`.

### Task 7: Forward-test and validate JD Skill

**Files:** Create `tests/baselines/jd-insight-with-skill.md`; regenerate JD metadata.

Run Task 5 scenarios in fresh contexts. Confirm no resume request unless personal matching is requested, no interview content, no persistent bank, and no PDF output. Run `quick_validate.py` and JD tests. Commit `test: validate JD insight skill`.

### Task 8: Establish RED resume evaluations

**Files:** Create `tests/evals/resume-rebuild.json`, `tests/baselines/resume-rebuild-without-skill.md`, `tests/test-resume-rebuild.mjs`.

Use anonymous synthetic scenarios: unclear resume-only goal, vague bullet with missing metric, unsupported ownership exaggeration, and JD tailoring. Tests require the exact two-choice question, session-only schema, one-question mining, truthful rewrite, revised-resume-only output, and no interview mode. Verify RED. Commit `test: add resume rebuild evaluations`.

### Task 9: Adapt resume routing, schema, mining, and rewrite rules

**Files:** Modify `resume-rebuild-skill/SKILL.md`; create/update `prompts/{parse-resume,experience-mining,general-polish}.md`; create/update `frameworks/{resume-schema,rewrite-rules}.md`.

1. Delete `prompts/interview.md` and any interview route.
2. Support modes `general_polish` and `jd_tailor` only.
3. When unclear, ask exactly `你这次更需要通用修改润色，还是根据具体JD定制简历？`.
4. Define a session-only resume model with contact, summary, experience, projects, education, skills, certifications, confirmed facts, and pending confirmations.
5. Mining loop asks one item at a time: problem, personal action, method/tool, scale, result, relevant constraint.
6. Rewrite as action + method + result; prohibit upgraded ownership/title and invented facts.
7. Run focused tests; commit `feat: adapt evidence-preserving resume rebuild`.

### Task 10: Implement JD tailoring and revised-resume contract

**Files:** Create/update `prompts/jd-tailor.md`, `frameworks/report-contract.md`; remove obsolete upstream output contracts.

1. Build a requirement-to-evidence matrix; reorder only verified evidence; expose gaps.
2. Define the single artifact `id: revised-resume` with contact, summary, experience, projects, education, skills, certifications, and unresolved confirmation markers.
3. The revised resume is the only PDF-eligible artifact. Change explanations, JD insight, and reviews stay in chat.
4. Reject unsupported zero-to-one, management, title, tool, and metric upgrades.
5. Run all resume tests; commit `feat: add JD-tailored revised resume contract`.

### Task 11: Forward-test and validate Resume Skill

**Files:** Create `tests/baselines/resume-rebuild-with-skill.md`; regenerate resume metadata.

Run Task 8 scenarios in fresh contexts. Confirm one-question behavior, truthful refusals, no interview path, no persistence, and revised-resume-only artifact. Run `quick_validate.py` and resume tests. Commit `test: validate resume rebuild skill`.

### Task 12: Establish RED dual-lens review evaluations

**Files:** Create `tests/evals/resume-review.json`, `tests/baselines/resume-review-without-skill.md`, `tests/test-resume-review.mjs`.

Use anonymous synthetic cases: brand strong/evidence thin, startup outcomes/ATS weak, short tenure/reason unknown. Tests require independent scores, exact rubric weights, evidence citations, disagreements, chat-only output, no blended score, and no interview probe fields. Verify RED. Commit `test: add dual-lens review evaluations`.

### Task 13: Implement independent HR and hiring-manager review

**Files:** Modify `resume-review-skill/SKILL.md`; create `frameworks/{hr-rubric,hiring-manager-rubric,report-contract}.md`; create `prompts/{hr-review,hiring-manager-review,synthesize-review}.md`.

1. HR weights: ATS 15, relevance 25, keywords 15, continuity/risk 15, clarity/density 15, credibility/completeness 15.
2. Manager weights: professional capability 20, business understanding 15, project complexity 15, individual contribution 15, result credibility 15, ownership/collaboration 10, immediate contribution/ramp-up cost 10.
3. Run passes independently; retain separate scores/verdicts; synthesize shared strengths, concerns, disagreements, blockers, and 3–5 priority revisions.
4. Each dimension includes score, max score, evidence, risk, and confidence. Do not include `next_question`, interview probes, or blended score.
5. Output Chinese chat only; no PDF artifact.
6. Run tests; commit `feat: add dual-lens resume review workflow`.

### Task 14: Forward-test and validate Review Skill

**Files:** Create `tests/baselines/resume-review-with-skill.md`; regenerate review metadata.

Run Task 12 scenarios in fresh contexts. Confirm appropriate HR/manager divergence, unknown facts remain `[待确认]`, and no interview/PDF output. Run `quick_validate.py` and review tests. Commit `test: validate dual-lens resume review`.

### Task 15: Establish RED revised-resume PDF tests

**Files:** Create `tests/fixtures/revised-resume.json`, `tests/test-pdf-renderer.mjs`, `tests/test-no-interview.mjs`.

Tests require:

- renderer accepts only `revised-resume`;
- rejects JD insight, review, question/workbook, and unknown section IDs;
- escapes HTML and rejects unsafe URLs;
- creates A4 HTML/PDF with Chinese font fallbacks;
- contains no branding/footer/social links/placeholders;
- runtime skill tree has no `interview`, `面试`, `题册`, `workbook`, or `story-bank` content or paths.

Run and verify RED. Commit `test: add revised resume PDF evaluations`.

### Task 16: Reuse resume templates and implement PDF rendering

**Files:** Reuse one compatible upstream ATS resume template under `assets/report/`; create `scripts/render-resume.mjs`, `scripts/validate-resume-report.mjs`; update `resume-rebuild-skill/SKILL.md` with execution instructions.

1. Keep one clean A4 ATS template; remove upstream author branding, photo-only assumptions, demo data, and unrelated templates unless directly useful.
2. Renderer input is validated `revised-resume` JSON; no arbitrary section selection exists.
3. Escape text; permit only safe `http`, `https`, and `mailto` URLs.
4. Discover Chrome/Chromium portably; print HTML to PDF; expose clear dependency errors.
5. Validator rejects blank/overflow-prone/placeholder output and non-resume section markers.
6. Run Node tests; render `/tmp/job-search-report/revised-resume.pdf`; verify with `pdfinfo`; render pages using `pdftoppm`; visually inspect images.
7. Commit `feat: render revised resume PDF only`.

### Task 17: Remove residual interview content and prepare public release

**Files:** Modify/delete residual copied files; create repository-root `README.md`; install the finished Skill locally.

1. Search the runtime bundle for `interview|面试|题册|workbook|story-bank|jd-bank|Dreameryanyan|JD SKILL|Created by|linkedin.com/in/` and delete or replace every runtime occurrence. License copyright is retained.
2. Delete copied READMEs, demo reports, preview images, banks, social/footer fragments, and unused templates from inside the Skill bundle. Create a clean repository-root Chinese README describing only the final scope, installation, usage, privacy, PDF behavior, and upstream MIT attribution.
3. Run all Node tests together.
4. Run `quick_validate.py` for top-level and all three child skills; expect four `Skill is valid!` results.
5. Run four fresh-context full flows: JD only; resume general polish to PDF; JD-tailored resume to PDF; dual-lens review. Verify JD and review remain chat-only and PDFs contain resume content only.
6. Render and visually inspect at least one Chinese revised-resume PDF. Confirm no blank pages, clipping, placeholders, branding, interview content, or unsafe links.
7. Copy the verified bundle to the local Codex skills directory under `job-search-strategy-toolkit` without overwriting the original `offer-toolkit-skill`.
8. Commit `test: validate public job search toolkit release`.

