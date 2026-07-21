# Interview Preparation Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement interview-round-aware preparation plans and printable question workbooks derived from role, company type, JD evidence, resume evidence, and identified gaps.

**Architecture:** The child skill asks for the current interview round first, loads exactly one stage reference plus one role and one company reference, then generates a preparation-plan section and a question-workbook section. Questions are traceable to likely evaluation signals rather than randomly sampled from a generic bank.

**Tech Stack:** Markdown Agent Skill, JSON evaluation fixtures, Node.js built-in tests, Git.

**Prerequisite:** Complete the foundation plan; complete JD and resume plans before running their cross-skill interview scenarios.

## Global Constraints

- During implementation, use `skill-creator` and `superpowers:writing-skills`; preserve RED-GREEN-REFACTOR evidence.
- Default interaction and artifacts use Simplified Chinese.
- Ask for the interview round before generating preparation content.
- Ask one question at a time and do not repeat information already supplied.
- Support HR screening, business first round, professional capability round, department-head round, and executive/final round.
- Generate questions from stage, role, company type, JD, resume evidence, and gaps.
- Do not fabricate candidate stories, technical experience, or answer metrics.
- Do not persist a story bank, interview record, or user profile.
- Offer preparation plan and printable workbook as independently selectable PDF sections.

---

## File Map

- Modify: `job-search-strategy-toolkit/interview-prep-skill/SKILL.md` — stage routing and assembly workflow.
- Create: `job-search-strategy-toolkit/interview-prep-skill/prompts/build-prep-plan.md` — preparation strategy contract.
- Create: `job-search-strategy-toolkit/interview-prep-skill/prompts/generate-question-workbook.md` — traceable question contract.
- Create: `job-search-strategy-toolkit/interview-prep-skill/prompts/answer-framework.md` — evidence-safe response guidance.
- Create: `job-search-strategy-toolkit/interview-prep-skill/frameworks/question-schema.md` — question object.
- Create: `job-search-strategy-toolkit/interview-prep-skill/frameworks/report-contract.md` — two selectable sections.
- Create: `job-search-strategy-toolkit/references/interviews/{hr-screen,business-first,professional,department-head,executive-final}.md` — stage rules.
- Create: `tests/evals/interview-prep.json` — stage-sensitive scenarios.
- Create: `tests/baselines/interview-prep-without-skill.md` — RED evidence.
- Create: `tests/baselines/interview-prep-with-skill.md` — GREEN evidence.
- Create: `tests/test-interview-prep.mjs` — stage and question-contract tests.

### Task 1: Establish RED stage-aware evaluations

**Files:**
- Create: `tests/evals/interview-prep.json`
- Create: `tests/baselines/interview-prep-without-skill.md`
- Create: `tests/test-interview-prep.mjs`

**Interfaces:**
- Consumes: interview request, known round, role/JD/resume evidence.
- Produces: baseline proof of generic-question failure and failing stage-contract tests.

- [ ] **Step 1: Run baseline scenarios without the child skill**

Use fresh contexts:

```text
场景A：我只说“帮我准备面试”，没有告诉你是哪一轮。

场景B：我准备互联网大厂产品经理的部门负责人面。JD强调商业化增长和跨部门推动；简历里增长结果明确，但没有复杂冲突案例。

场景C：我准备后端工程师专业能力面。JD强调高并发、稳定性和故障处理；简历只写了接口开发，没有性能或事故证据。
```

Record verbatim outputs. Required baseline failures include at least one of: generating questions before asking the round, returning generic questions unrelated to evidence gaps, inventing a candidate story, or mixing HR and technical evaluation dimensions.

- [ ] **Step 2: Create evaluation fixture**

Create `tests/evals/interview-prep.json`:

```json
[
  {
    "id": "unknown-round",
    "required": ["只询问面试轮次"],
    "forbidden": ["直接生成题目", "一次询问多个字段"]
  },
  {
    "id": "product-department-head",
    "required": ["商业判断", "跨部门影响", "冲突追问", "证据缺口"]
  },
  {
    "id": "backend-professional",
    "required": ["高并发", "稳定性", "故障处理", "缺少性能证据"],
    "forbidden": ["虚构事故案例", "虚构性能数字"]
  }
]
```

- [ ] **Step 3: Write failing static tests**

Create `tests/test-interview-prep.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const child = new URL('../job-search-strategy-toolkit/interview-prep-skill/', import.meta.url);
const stages = new URL('../job-search-strategy-toolkit/references/interviews/', import.meta.url);

test('unknown interview requests ask only for the round', async () => {
  const text = await readFile(new URL('SKILL.md', child), 'utf8');
  assert.match(text, /你正在准备哪一轮面试/);
  assert.match(text, /确认轮次前不得生成题目/);
});

test('five interview stage references exist', async () => {
  const files = (await readdir(stages)).filter((name) => name.endsWith('.md'));
  assert.deepEqual(files.sort(), ['business-first.md', 'department-head.md', 'executive-final.md', 'hr-screen.md', 'professional.md']);
});

test('question schema requires traceability and printable answer space', async () => {
  const text = await readFile(new URL('frameworks/question-schema.md', child), 'utf8');
  for (const field of ['category', 'difficulty', 'competency', 'why_likely', 'evidence_source', 'follow_ups', 'answer_framework', 'writing_space_lines']) {
    assert.match(text, new RegExp(field));
  }
});
```

- [ ] **Step 4: Run tests and verify RED**

Run: `node --test tests/test-interview-prep.mjs`

Expected: FAIL because child workflow, stage references, and schema do not exist.

- [ ] **Step 5: Commit RED artifacts**

```bash
git add tests/evals/interview-prep.json tests/baselines/interview-prep-without-skill.md tests/test-interview-prep.mjs
git commit -m "test: add interview preparation baselines"
```

### Task 2: Implement stage routing and stage references

**Files:**
- Modify: `job-search-strategy-toolkit/interview-prep-skill/SKILL.md`
- Create: `job-search-strategy-toolkit/references/interviews/hr-screen.md`
- Create: `job-search-strategy-toolkit/references/interviews/business-first.md`
- Create: `job-search-strategy-toolkit/references/interviews/professional.md`
- Create: `job-search-strategy-toolkit/references/interviews/department-head.md`
- Create: `job-search-strategy-toolkit/references/interviews/executive-final.md`

**Interfaces:**
- Consumes: raw interview request.
- Produces: normalized stage and exactly one loaded stage reference.

- [ ] **Step 1: Replace child frontmatter**

```yaml
---
name: interview-prep-skill
description: Use when Chinese-speaking job seekers need preparation for a specific HR, business, professional, department-head, executive, or final interview round, including evidence-linked practice questions and a printable workbook.
---
```

- [ ] **Step 2: Implement the first-question contract**

`SKILL.md` must state:

```markdown
如果用户没有说明轮次，只问：“你正在准备哪一轮面试？”
确认轮次前不得生成题目。
```

After the round is known, ask only the next missing input among target role/company, JD, and resume evidence. Do not ask for information already present in the conversation.

- [ ] **Step 3: Write exact stage reference responsibilities**

Each stage file must contain `评价目标`, `常见信号`, `高概率题型`, `追问方式`, `淘汰风险`, and `候选人反问`.

- `hr-screen.md`: motivation, availability, compensation expectations, communication, continuity, basic fit.
- `business-first.md`: role execution, collaboration, method, business context, verified results.
- `professional.md`: role-specific depth; engineering includes architecture, reliability, performance, debugging, and trade-offs.
- `department-head.md`: business judgment, ownership, prioritization, influence, conflict, scale, hiring risk.
- `executive-final.md`: strategic fit, values under pressure, long-term direction, decision quality, organizational leverage.

- [ ] **Step 4: Run stage-routing tests**

Run: `node --test tests/test-interview-prep.mjs --test-name-pattern="round|five interview"`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit routing and stage references**

```bash
git add job-search-strategy-toolkit/interview-prep-skill/SKILL.md job-search-strategy-toolkit/references/interviews
git commit -m "feat: add interview stage routing"
```

### Task 3: Implement preparation plan and question generation

**Files:**
- Create: `job-search-strategy-toolkit/interview-prep-skill/prompts/build-prep-plan.md`
- Create: `job-search-strategy-toolkit/interview-prep-skill/prompts/generate-question-workbook.md`
- Create: `job-search-strategy-toolkit/interview-prep-skill/prompts/answer-framework.md`
- Create: `job-search-strategy-toolkit/interview-prep-skill/frameworks/question-schema.md`

**Interfaces:**
- Consumes: stage reference, role reference, company reference, decoded JD, resume evidence, and identified gaps.
- Produces: ranked preparation priorities and traceable question objects.

- [ ] **Step 1: Define preparation-plan order**

`build-prep-plan.md` must produce:

1. This round's decision objective.
2. Five highest-priority evaluation signals.
3. Candidate evidence already available.
4. Evidence gaps and risk questions.
5. Preparation sequence for the remaining time.
6. Questions the candidate should ask the interviewer.

Each point must cite stage rules, JD text, resume evidence, or a clearly labeled inference.

- [ ] **Step 2: Define the question schema**

`question-schema.md` must define:

```json
{
  "number": 1,
  "question": "请介绍一次你在资源受限时调整优先级的经历。",
  "category": "部门负责人面",
  "difficulty": "medium",
  "competency": "优先级判断",
  "why_likely": "JD强调多项目并行和跨部门推动",
  "evidence_source": "JD核心职责第3条",
  "follow_ups": [],
  "answer_framework": ["背景", "目标", "个人判断", "关键动作", "结果与复盘"],
  "writing_space_lines": 8
}
```

Require `writing_space_lines` from 6 to 12. Questions without a traceable `why_likely` are excluded from the top-priority set.

- [ ] **Step 3: Define question-generation rules**

`generate-question-workbook.md` must rank questions from stage signals, JD must-haves, resume evidence, and gaps. Use four categories where relevant: behavioral, role-professional, company-context, and resume-risk. Do not create complete candidate stories or invented metrics.

- [ ] **Step 4: Define answer guidance**

`answer-framework.md` must offer STAR, CAR, structured case analysis, or technical trade-off framing according to question type. It may organize confirmed facts but must leave missing actions/results `[待确认]`.

- [ ] **Step 5: Run question-schema test**

Run: `node --test tests/test-interview-prep.mjs --test-name-pattern="question schema"`

Expected: PASS.

- [ ] **Step 6: Commit question generation**

```bash
git add job-search-strategy-toolkit/interview-prep-skill/prompts job-search-strategy-toolkit/interview-prep-skill/frameworks/question-schema.md
git commit -m "feat: add stage-aware interview questions"
```

### Task 4: Define selectable output sections

**Files:**
- Create: `job-search-strategy-toolkit/interview-prep-skill/frameworks/report-contract.md`
- Modify: `job-search-strategy-toolkit/interview-prep-skill/SKILL.md`

**Interfaces:**
- Consumes: preparation priorities and question objects.
- Produces: `interview-preparation-plan` and `printable-interview-workbook` section objects.

- [ ] **Step 1: Define preparation-plan section fields**

Use fields `stage`, `target_role`, `decision_objective`, `evaluation_signals`, `evidence_available`, `gaps`, `practice_plan`, `candidate_questions`, and `sources`.

- [ ] **Step 2: Define workbook section fields**

Use fields `stage`, `instructions`, `questions`, `practice_checklist`, and `reflection_page`. Each question follows `question-schema.md` and preserves writing space in print rendering.

- [ ] **Step 3: Update child end state**

At completion, `SKILL.md` must offer the preparation plan and printable workbook independently to the shared PDF section selector. Do not render PDF inside the child skill.

- [ ] **Step 4: Run all static tests**

Run: `node --test tests/test-interview-prep.mjs`

Expected: 3 tests PASS, 0 FAIL.

- [ ] **Step 5: Commit report contracts**

```bash
git add job-search-strategy-toolkit/interview-prep-skill
git commit -m "feat: add interview report contracts"
```

### Task 5: Forward-test and validate the interview skill

**Files:**
- Modify: `job-search-strategy-toolkit/interview-prep-skill/agents/openai.yaml`
- Create: `tests/baselines/interview-prep-with-skill.md`

**Interfaces:**
- Consumes: exact Task 1 scenarios.
- Produces: stage-sensitive post-skill evidence and valid metadata.

- [ ] **Step 1: Run all scenarios with the skill loaded**

Record verbatim outputs. Confirm scenario A asks only the round, scenario B prioritizes business judgment and missing conflict evidence, and scenario C asks technical depth questions without inventing incidents or performance data.

- [ ] **Step 2: Regenerate metadata**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py job-search-strategy-toolkit/interview-prep-skill \
  --interface display_name="Interview Prep" \
  --interface short_description="按面试轮次生成准备方案和题册" \
  --interface default_prompt="请先确认我正在准备哪一轮面试，再生成针对性方案。"
```

- [ ] **Step 3: Run official and static validation**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/quick_validate.py job-search-strategy-toolkit/interview-prep-skill
node --test tests/test-interview-prep.mjs
```

Expected: `Skill is valid!` and 3 tests PASS.

- [ ] **Step 4: Commit validated interview skill**

```bash
git add job-search-strategy-toolkit/interview-prep-skill tests/baselines/interview-prep-with-skill.md
git commit -m "test: validate interview preparation skill"
```
