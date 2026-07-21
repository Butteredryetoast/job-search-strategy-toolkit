# Dual-Lens Resume Review Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement independent HR-screening and hiring-manager resume reviews with evidence-linked scores, disagreements, risks, and revision priorities.

**Architecture:** The child skill evaluates one normalized resume twice using separate rubrics. It never averages away the two perspectives; a synthesis layer reports shared findings, disagreements, blockers, and likely interview probes as one selectable report section.

**Tech Stack:** Markdown Agent Skill, JSON evaluation fixtures, Node.js built-in tests, Git.

**Prerequisite:** Complete the foundation plan and the temporary resume schema from the resume-rebuild plan.

## Global Constraints

- During implementation, use `skill-creator` and `superpowers:writing-skills`; preserve RED-GREEN-REFACTOR evidence.
- Default output language is Simplified Chinese.
- HR and hiring-manager scores remain independent.
- Every score and verdict cites resume text, a JD requirement, a user-confirmed fact, or a public source.
- Missing evidence lowers confidence; it is not replaced by invented evidence.
- Gender is excluded from all scoring.
- Age is used only for career-stage context, never as an employability score.
- No review history is persisted.

---

## File Map

- Modify: `job-search-strategy-toolkit/resume-review-skill/SKILL.md` — independent-pass workflow.
- Create: `job-search-strategy-toolkit/resume-review-skill/prompts/hr-review.md` — HR evidence pass.
- Create: `job-search-strategy-toolkit/resume-review-skill/prompts/hiring-manager-review.md` — business-owner evidence pass.
- Create: `job-search-strategy-toolkit/resume-review-skill/prompts/synthesize-review.md` — disagreement and priority synthesis.
- Create: `job-search-strategy-toolkit/resume-review-skill/frameworks/hr-rubric.md` — 100-point HR rubric.
- Create: `job-search-strategy-toolkit/resume-review-skill/frameworks/hiring-manager-rubric.md` — 100-point manager rubric.
- Create: `job-search-strategy-toolkit/resume-review-skill/frameworks/report-contract.md` — report object.
- Create: `tests/evals/resume-review.json` — divergent review scenarios.
- Create: `tests/baselines/resume-review-without-skill.md` — RED evidence.
- Create: `tests/baselines/resume-review-with-skill.md` — GREEN evidence.
- Create: `tests/test-resume-review.mjs` — structural rubric tests.

### Task 1: Establish RED dual-lens evaluations

**Files:**
- Create: `tests/evals/resume-review.json`
- Create: `tests/baselines/resume-review-without-skill.md`
- Create: `tests/test-resume-review.mjs`

**Interfaces:**
- Consumes: resume evidence with optional JD.
- Produces: baseline proof that generic review tends to collapse perspectives, plus failing rubric tests.

- [ ] **Step 1: Run baseline scenarios without the child skill**

Use fresh contexts:

```text
场景A：候选人有大厂品牌和完整关键词，但项目描述只有职责，没有个人决策或结果。请分别用HR和部门负责人视角评审。

场景B：候选人在小型创业公司主导完整项目并有明确业务结果，但职位名称不标准、简历关键词不足。请分别评审。

场景C：简历显示两段一年内的工作经历，但用户没有说明离职原因。不要猜测原因，请评审风险。
```

Record verbatim outputs. Required baseline failures include at least one of: identical HR and manager conclusions, unsupported risk assumptions, a single blended score, or feedback without evidence citations.

- [ ] **Step 2: Create evaluation fixture**

Create `tests/evals/resume-review.json`:

```json
[
  {
    "id": "brand-strong-evidence-thin",
    "expected": ["HR可能通过", "负责人关注个人贡献与结果", "两个分数独立"]
  },
  {
    "id": "startup-strong-ats-weak",
    "expected": ["HR指出关键词风险", "负责人识别业务结果", "明确分歧"]
  },
  {
    "id": "short-tenure-unknown-reason",
    "expected": ["标记风险", "离职原因待确认", "不得猜测"]
  }
]
```

- [ ] **Step 3: Write failing static tests**

Create `tests/test-resume-review.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = new URL('../job-search-strategy-toolkit/resume-review-skill/', import.meta.url);

test('HR and manager reviews run as independent passes', async () => {
  const text = await readFile(new URL('SKILL.md', base), 'utf8');
  assert.match(text, /先独立完成HR评审，再独立完成部门负责人评审/);
  assert.match(text, /不得先共享结论或合并分数/);
});

test('HR rubric totals 100 and excludes gender', async () => {
  const text = await readFile(new URL('frameworks/hr-rubric.md', base), 'utf8');
  for (const item of ['ATS可读性：15', '岗位相关度：25', '关键词覆盖：15', '连续性与风险：15', '清晰度与信息密度：15', '可信度与完整性：15']) {
    assert.match(text, new RegExp(item));
  }
  assert.match(text, /性别不参与评分/);
});

test('manager rubric prioritizes evidence of contribution and outcomes', async () => {
  const text = await readFile(new URL('frameworks/hiring-manager-rubric.md', base), 'utf8');
  for (const item of ['专业能力：20', '业务理解：15', '项目复杂度：15', '个人贡献：15', '结果可信度：15', 'Ownership与协作：10', '即战力与培养成本：10']) {
    assert.match(text, new RegExp(item));
  }
});
```

- [ ] **Step 4: Run tests and verify RED**

Run: `node --test tests/test-resume-review.mjs`

Expected: FAIL because final skill and rubric files do not exist.

- [ ] **Step 5: Commit RED artifacts**

```bash
git add tests/evals/resume-review.json tests/baselines/resume-review-without-skill.md tests/test-resume-review.mjs
git commit -m "test: add dual-lens review baselines"
```

### Task 2: Implement independent HR and manager rubrics

**Files:**
- Create: `job-search-strategy-toolkit/resume-review-skill/frameworks/hr-rubric.md`
- Create: `job-search-strategy-toolkit/resume-review-skill/frameworks/hiring-manager-rubric.md`
- Create: `job-search-strategy-toolkit/resume-review-skill/prompts/hr-review.md`
- Create: `job-search-strategy-toolkit/resume-review-skill/prompts/hiring-manager-review.md`

**Interfaces:**
- Consumes: normalized resume, optional decoded JD, selected role reference, and company reference.
- Produces: two `review_pass` objects with dimension scores, evidence, risks, confidence, verdict, and interview probes.

- [ ] **Step 1: Write the HR rubric**

Use these exact weights in `hr-rubric.md`:

```markdown
- ATS可读性：15
- 岗位相关度：25
- 关键词覆盖：15
- 连续性与风险：15
- 清晰度与信息密度：15
- 可信度与完整性：15
```

Define verdict bands: 80–100 recommend advancing, 65–79 advance with questions, 50–64 hold or screen carefully, below 50 do not advance. Explicit blockers remain separate. Add `性别不参与评分`; short tenure may be flagged but the reason remains `[待确认]`.

- [ ] **Step 2: Write the manager rubric**

Use these exact weights in `hiring-manager-rubric.md`:

```markdown
- 专业能力：20
- 业务理解：15
- 项目复杂度：15
- 个人贡献：15
- 结果可信度：15
- Ownership与协作：10
- 即战力与培养成本：10
```

Use the same numerical bands but manager-specific verdict wording: strong interview, interview with targeted probes, weak evidence, or low role fit.

- [ ] **Step 3: Define the evidence row contract**

Both review prompts must output each scored dimension as:

```json
{
  "dimension": "岗位相关度",
  "score": 0,
  "max_score": 25,
  "evidence": ["简历原文或JD条款"],
  "risk": "明确风险或无",
  "confidence": "high、medium或low",
  "next_question": "需要面试验证的问题或无"
}
```

State that score zero is valid when evidence is absent; the reviewer must not invent evidence.

- [ ] **Step 4: Run rubric tests**

Run: `node --test tests/test-resume-review.mjs --test-name-pattern="rubric"`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit rubrics**

```bash
git add job-search-strategy-toolkit/resume-review-skill/frameworks job-search-strategy-toolkit/resume-review-skill/prompts/hr-review.md job-search-strategy-toolkit/resume-review-skill/prompts/hiring-manager-review.md
git commit -m "feat: add independent resume review rubrics"
```

### Task 3: Implement the independent-pass workflow and synthesis

**Files:**
- Modify: `job-search-strategy-toolkit/resume-review-skill/SKILL.md`
- Create: `job-search-strategy-toolkit/resume-review-skill/prompts/synthesize-review.md`
- Create: `job-search-strategy-toolkit/resume-review-skill/frameworks/report-contract.md`

**Interfaces:**
- Consumes: two completed `review_pass` objects.
- Produces: one `dual-lens-review` section without modifying either source verdict.

- [ ] **Step 1: Replace child frontmatter**

```yaml
---
name: resume-review-skill
description: Use when Chinese-speaking job seekers want a resume evaluated separately from HR-screening and hiring-manager perspectives, including evidence-linked scores, risks, disagreements, and likely interview probes.
---
```

- [ ] **Step 2: Implement independent-pass order**

`SKILL.md` must state:

```markdown
1. 读取简历、目标岗位、可用JD、岗位规则和企业类型规则。
2. 先独立完成HR评审，再独立完成部门负责人评审。
3. 两次评审不得先共享结论或合并分数。
4. 两次评审完成后才运行综合层。
5. 将“双视角简历评审”提供给PDF章节选择流程。
```

- [ ] **Step 3: Define synthesis output**

`prompts/synthesize-review.md` must produce:

- HR score and verdict unchanged.
- Hiring-manager score and verdict unchanged.
- Shared strengths.
- Shared concerns.
- Disagreements with both reasons shown.
- Explicit blockers.
- Three to five highest-priority revisions ranked by expected impact.
- Likely interview probes linked to the originating evidence gap.

- [ ] **Step 4: Define report contract**

`frameworks/report-contract.md` must define `id: dual-lens-resume-review`, `hr_review`, `hiring_manager_review`, `shared_findings`, `disagreements`, `priority_changes`, and `interview_probes`. It must prohibit a single blended score.

- [ ] **Step 5: Run all static tests**

Run: `node --test tests/test-resume-review.mjs`

Expected: 3 tests PASS, 0 FAIL.

- [ ] **Step 6: Commit workflow and synthesis**

```bash
git add job-search-strategy-toolkit/resume-review-skill
git commit -m "feat: add dual-lens resume review workflow"
```

### Task 4: Forward-test and validate the review skill

**Files:**
- Modify: `job-search-strategy-toolkit/resume-review-skill/agents/openai.yaml`
- Create: `tests/baselines/resume-review-with-skill.md`

**Interfaces:**
- Consumes: the three Task 1 scenarios.
- Produces: evidence that two perspectives diverge appropriately and remain grounded.

- [ ] **Step 1: Run the scenarios with the skill loaded**

Record verbatim outputs. Confirm scenario A can pass HR while remaining weak for the manager, scenario B can show HR discoverability risk while recognizing manager value, and scenario C marks unknown departure reasons without guessing.

- [ ] **Step 2: Regenerate metadata**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py job-search-strategy-toolkit/resume-review-skill \
  --interface display_name="Dual-Lens Resume Review" \
  --interface short_description="HR与部门负责人双视角简历评审" \
  --interface default_prompt="请分别用HR和部门负责人视角独立评审这份简历。"
```

- [ ] **Step 3: Run official and static validation**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/quick_validate.py job-search-strategy-toolkit/resume-review-skill
node --test tests/test-resume-review.mjs
```

Expected: `Skill is valid!` and 3 tests PASS.

- [ ] **Step 4: Commit validated review skill**

```bash
git add job-search-strategy-toolkit/resume-review-skill tests/baselines/resume-review-with-skill.md
git commit -m "test: validate dual-lens resume review"
```
