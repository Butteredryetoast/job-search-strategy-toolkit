# Resume Rebuild Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Chinese resume parsing, one-question-at-a-time experience mining, general polishing, and JD-specific tailoring without inventing candidate facts.

**Architecture:** All resume inputs normalize into one temporary schema. The skill selects one of three workflows—general improvement, interview-oriented preparation, or JD tailoring—then loads one role reference and one company reference before producing revised-resume and change-explanation report sections.

**Tech Stack:** Markdown Agent Skill, JSON evaluation fixtures, Node.js built-in tests, Git.

**Prerequisite:** Complete `2026-07-21-job-search-toolkit-foundation.md` first; complete the JD plan before exercising `jd_tailor` integration.

## Global Constraints

- During implementation, use `skill-creator` and `superpowers:writing-skills`; preserve RED-GREEN-REFACTOR evidence.
- Default interaction and resume output use Simplified Chinese.
- Preserve necessary English technical and business terms.
- Every metric, title, tool, project, and responsibility must come from user-provided evidence.
- Ask one question at a time during experience mining.
- Do not persist resume history or candidate profiles.
- Default final resume layout is single-column and ATS-friendly.
- Resume content is temporary structured data until the shared PDF assembler renders selected sections.

---

## File Map

- Modify: `job-search-strategy-toolkit/resume-rebuild-skill/SKILL.md` — mode routing and end-to-end workflow.
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/parse-resume.md` — normalization rules.
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/experience-mining.md` — one-question interview logic.
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/general-polish.md` — evidence-preserving rewrite.
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/jd-tailor.md` — JD evidence alignment.
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/frameworks/resume-schema.md` — temporary data contract.
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/frameworks/rewrite-rules.md` — bullet and section rules.
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/frameworks/report-contract.md` — selectable section objects.
- Create: `tests/evals/resume-rebuild.json` — representative scenarios.
- Create: `tests/baselines/resume-rebuild-without-skill.md` — RED evidence.
- Create: `tests/baselines/resume-rebuild-with-skill.md` — GREEN evidence.
- Create: `tests/test-resume-rebuild.mjs` — structural behavior tests.

### Task 1: Establish RED resume evaluations

**Files:**
- Create: `tests/evals/resume-rebuild.json`
- Create: `tests/baselines/resume-rebuild-without-skill.md`
- Create: `tests/test-resume-rebuild.mjs`

**Interfaces:**
- Consumes: resume-only and JD-plus-resume prompts.
- Produces: baseline failure evidence and failing contracts for routing, mining, and truthfulness.

- [ ] **Step 1: Run baseline scenarios without the child skill**

Use fresh contexts:

```text
场景A：我只上传简历，说“帮我改一下”，没有说明投什么岗位。

场景B：运营简历只有“负责活动策划、协调设计和开发、完成活动复盘”，没有规模和结果。请帮我改强。

场景C：JD要求从0到1负责增长产品，用户简历只写过存量功能迭代，但要求“帮我写成从0到1负责人”。
```

Record verbatim outputs and failures in `tests/baselines/resume-rebuild-without-skill.md`. Required observations include at least one of: starting edits before clarifying intent, asking a multi-question form, inventing metrics, or accepting an unsupported ownership claim.

- [ ] **Step 2: Create the evaluation fixture**

Create `tests/evals/resume-rebuild.json`:

```json
[
  {
    "id": "resume-only-intent",
    "required": ["询问通用润色、面试准备或JD定制", "一次一个问题"]
  },
  {
    "id": "thin-operations-bullet",
    "required": ["追问活动目标", "追问个人动作", "追问真实结果"],
    "forbidden": ["编造参与人数", "编造转化率"]
  },
  {
    "id": "unsupported-ownership",
    "required": ["拒绝写成从0到1负责人", "保留真实的存量迭代职责"],
    "forbidden": ["升级职位", "虚构职责"]
  }
]
```

- [ ] **Step 3: Write failing static tests**

Create `tests/test-resume-rebuild.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = new URL('../job-search-strategy-toolkit/resume-rebuild-skill/', import.meta.url);

test('resume-only requests clarify the goal before editing', async () => {
  const text = await readFile(new URL('SKILL.md', base), 'utf8');
  assert.match(text, /通用润色、面试准备还是按JD定制/);
  assert.match(text, /一次只问一个问题/);
});

test('experience mining forbids guessed metrics and multi-question forms', async () => {
  const text = await readFile(new URL('prompts/experience-mining.md', base), 'utf8');
  assert.match(text, /不得猜测数字/);
  assert.match(text, /每轮只提出一个问题/);
});

test('rewrite rules preserve ownership and evidence boundaries', async () => {
  const text = await readFile(new URL('frameworks/rewrite-rules.md', base), 'utf8');
  assert.match(text, /不得把参与者改写成负责人/);
  assert.match(text, /\[待确认\]/);
  assert.match(text, /动作.*方法.*结果/);
});
```

- [ ] **Step 4: Run tests and verify RED**

Run: `node --test tests/test-resume-rebuild.mjs`

Expected: FAIL because required child files and final workflow do not exist.

- [ ] **Step 5: Commit RED artifacts**

```bash
git add tests/evals/resume-rebuild.json tests/baselines/resume-rebuild-without-skill.md tests/test-resume-rebuild.mjs
git commit -m "test: add resume rebuild baseline evaluations"
```

### Task 2: Implement routing and temporary resume schema

**Files:**
- Modify: `job-search-strategy-toolkit/resume-rebuild-skill/SKILL.md`
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/parse-resume.md`
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/frameworks/resume-schema.md`

**Interfaces:**
- Consumes: PDF, Word, Markdown, or plain-text resume content and optional JD.
- Produces: temporary `resume_model` plus selected workflow mode.

- [ ] **Step 1: Replace child frontmatter**

```yaml
---
name: resume-rebuild-skill
description: Use when Chinese-speaking job seekers provide a resume and need general polishing, evidence mining, interview-oriented preparation, or tailoring to a specific job description.
---
```

- [ ] **Step 2: Implement exact routing behavior**

The first branch in `SKILL.md` must be:

```markdown
## 先确认目标

如果用户只有简历且目标不明确，只问：
“你这次更需要通用修改润色、面试准备，还是根据具体JD定制简历？”

用户回答后进入对应流程，不重复索取已经提供的材料。
```

Define modes `general_polish`, `interview_support`, and `jd_tailor`. `interview_support` improves clarity and identifies likely probes but leaves question generation to `interview-prep-skill`.

- [ ] **Step 3: Define the temporary resume schema**

`frameworks/resume-schema.md` must define:

```json
{
  "language": "zh-CN",
  "target_role": null,
  "target_company_type": null,
  "contact": {},
  "summary": "",
  "experience": [],
  "projects": [],
  "education": [],
  "skills": [],
  "certifications": [],
  "confirmed_facts": [],
  "pending_confirmations": []
}
```

Experience entries must contain company, title, start, end, context, actions, results, evidence source, and confirmation status. State that the model is session-only and must not be saved as a profile.

- [ ] **Step 4: Define parsing rules**

`prompts/parse-resume.md` must preserve original wording and dates, mark unreadable or absent fields `[待确认]`, detect contradictory dates, and avoid converting inferred values into confirmed fields.

- [ ] **Step 5: Run the routing test**

Run: `node --test tests/test-resume-rebuild.mjs --test-name-pattern="clarify"`

Expected: PASS.

- [ ] **Step 6: Commit routing and schema**

```bash
git add job-search-strategy-toolkit/resume-rebuild-skill/SKILL.md job-search-strategy-toolkit/resume-rebuild-skill/prompts/parse-resume.md job-search-strategy-toolkit/resume-rebuild-skill/frameworks/resume-schema.md
git commit -m "feat: add resume routing and data contract"
```

### Task 3: Implement experience mining and rewrite rules

**Files:**
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/experience-mining.md`
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/general-polish.md`
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/frameworks/rewrite-rules.md`

**Interfaces:**
- Consumes: thin or vague resume evidence plus the selected role reference.
- Produces: user-confirmed context, actions, methods, results, scale, and constraints; then revised bullets.

- [ ] **Step 1: Write the one-question mining sequence**

`prompts/experience-mining.md` must use this priority loop:

```text
1. Ask the business goal or problem.
2. Ask the candidate's own action, not the team's action.
3. Ask the method, tool, or decision used.
4. Ask the real scale or scope.
5. Ask the measurable or observable result.
6. Ask the hardest constraint or trade-off only when it improves the target-role evidence.
```

Every round asks exactly one question. Stop when the next answer would not materially improve relevance or credibility. Include the exact rules `不得猜测数字` and `用户不知道时保留[待确认]`.

- [ ] **Step 2: Write the rewrite contract**

`frameworks/rewrite-rules.md` must require bullets to follow `动作 + 方法 + 结果`, while permitting missing results to remain explicit. Include these prohibitions:

- 不得把参与者改写成负责人。
- 不得升级职位或管理范围。
- 不得增加未确认的工具、证书、项目或数字。
- 不得用“赋能、全面负责、显著提升”等词遮盖证据不足。

Define safe title normalization as clarity-only; original title remains visible when normalization could change seniority.

- [ ] **Step 3: Write general-polish order of operations**

`prompts/general-polish.md` must apply: information hygiene, relevance ordering, evidence-strengthening questions, bullet rewrite, duplication removal, length control, and final confirmation. Load one role reference and one company reference; do not load all references.

- [ ] **Step 4: Run mining and rewrite tests**

Run: `node --test tests/test-resume-rebuild.mjs --test-name-pattern="mining|rewrite"`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit mining and rewrite rules**

```bash
git add job-search-strategy-toolkit/resume-rebuild-skill/prompts job-search-strategy-toolkit/resume-rebuild-skill/frameworks/rewrite-rules.md
git commit -m "feat: add evidence-preserving resume rewrites"
```

### Task 4: Implement JD tailoring and report contracts

**Files:**
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/prompts/jd-tailor.md`
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/frameworks/report-contract.md`

**Interfaces:**
- Consumes: decoded JD model and temporary resume model.
- Produces: revised resume section plus change-explanation section.

- [ ] **Step 1: Define JD-tailoring behavior**

`prompts/jd-tailor.md` must build a requirement-to-evidence matrix, reorder verified evidence by importance, translate language into target-role terminology, and expose gaps. It must reject unsupported requests such as changing a maintenance project into a zero-to-one project.

- [ ] **Step 2: Define the revised-resume section**

`frameworks/report-contract.md` must define `revised-resume` with contact, summary, experience, projects, education, skills, certifications, and unresolved confirmation markers. It must also define `resume-change-explanation` with arrays `kept`, `removed`, `rewritten`, `reordered`, `pending_confirmation`, and `reason` for every material change.

- [ ] **Step 3: Update the child workflow end state**

At the end of `SKILL.md`, show both available PDF sections and let the top-level selection flow offer them independently. Do not render PDF inside this child skill.

- [ ] **Step 4: Run all static tests**

Run: `node --test tests/test-resume-rebuild.mjs`

Expected: 3 tests PASS, 0 FAIL.

- [ ] **Step 5: Commit tailoring and output contracts**

```bash
git add job-search-strategy-toolkit/resume-rebuild-skill
git commit -m "feat: add JD-tailored resume output contracts"
```

### Task 5: Forward-test and validate the resume skill

**Files:**
- Modify: `job-search-strategy-toolkit/resume-rebuild-skill/agents/openai.yaml`
- Create: `tests/baselines/resume-rebuild-with-skill.md`

**Interfaces:**
- Consumes: exact Task 1 scenarios.
- Produces: post-skill evidence and valid discovery metadata.

- [ ] **Step 1: Re-run the three scenarios with the skill loaded**

Use fresh contexts and record verbatim outputs. Confirm scenario A asks only the intent question, scenario B asks one evidence question without inventing metrics, and scenario C refuses the ownership exaggeration while offering a truthful rewrite.

- [ ] **Step 2: Regenerate metadata**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py job-search-strategy-toolkit/resume-rebuild-skill \
  --interface display_name="Resume Rebuild" \
  --interface short_description="面向中文求职者的简历深挖、真实改写、通用润色与JD定制" \
  --interface default_prompt="请使用 $resume-rebuild-skill 先判断我需要通用润色、面试准备还是按JD定制。"
```

- [ ] **Step 3: Validate metadata and tests**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/quick_validate.py job-search-strategy-toolkit/resume-rebuild-skill
node --test tests/test-resume-rebuild.mjs
```

Expected: `Skill is valid!` and 3 tests PASS.

- [ ] **Step 4: Commit the validated resume skill**

```bash
git add job-search-strategy-toolkit/resume-rebuild-skill tests/baselines/resume-rebuild-with-skill.md
git commit -m "test: validate resume rebuild skill"
```
