# JD Insight Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement evidence-grounded Chinese JD decoding, company research, candidate matching, gap analysis, and application strategy as an independent child skill.

**Architecture:** The child skill converts a JD into a five-layer requirement model before matching any candidate evidence. It reads one shared role reference and one company reference, applies a deterministic rubric, and returns a structured report section for the shared PDF assembler.

**Tech Stack:** Markdown Agent Skill, web research instructions, JSON evaluation fixtures, Node.js built-in tests, Git.

**Prerequisite:** Complete `2026-07-21-job-search-toolkit-foundation.md` first so shared evidence, role, and company references exist.

## Global Constraints

- During implementation, use `skill-creator` and `superpowers:writing-skills`; preserve RED-GREEN-REFACTOR evidence.
- Default output language is Simplified Chinese.
- Never infer a missing JD from company or role name.
- Never fabricate company information, salary ranges, candidate evidence, or match claims.
- Public facts require source links and retrieval dates; inference requires an explicit basis.
- Candidate match is optional when no resume or career summary is available.
- Do not create a JD bank or persist analyzed JDs.
- Ask no more than one clarification question at a time.

---

## File Map

- Modify: `job-search-strategy-toolkit/jd-insight-skill/SKILL.md` — three-stage workflow and exception paths.
- Create: `job-search-strategy-toolkit/jd-insight-skill/prompts/decode-jd.md` — five-layer decoder contract.
- Create: `job-search-strategy-toolkit/jd-insight-skill/prompts/match-candidate.md` — evidence matrix and gap analysis.
- Create: `job-search-strategy-toolkit/jd-insight-skill/prompts/research-company.md` — source discipline.
- Create: `job-search-strategy-toolkit/jd-insight-skill/frameworks/match-rubric.md` — weights and blocker logic.
- Create: `job-search-strategy-toolkit/jd-insight-skill/frameworks/report-contract.md` — structured PDF section contract.
- Create: `tests/evals/jd-insight.json` — representative JD scenarios.
- Create: `tests/baselines/jd-insight-without-skill.md` — RED observations.
- Create: `tests/baselines/jd-insight-with-skill.md` — GREEN observations.
- Create: `tests/test-jd-insight.mjs` — structural rubric tests.

### Task 1: Establish RED JD evaluations

**Files:**
- Create: `tests/evals/jd-insight.json`
- Create: `tests/baselines/jd-insight-without-skill.md`
- Create: `tests/test-jd-insight.mjs`

**Interfaces:**
- Consumes: raw JD text, optional candidate facts.
- Produces: baseline evidence and failing tests for five-layer decoding, scoring weights, and evidence labels.

- [ ] **Step 1: Run baseline scenarios without the child skill**

Use fresh contexts with these prompts:

```text
场景A：这是一份增长产品经理JD：负责增长策略、用户转化漏斗和跨团队落地；要求5年以上产品经验、2年以上增长经验，熟悉A/B测试。先只解读岗位，不分析我的匹配度。

场景B：JD要求SQL、实验设计、业务分析和跨部门沟通。我的简历证据只有“使用SQL完成经营分析并推动销售团队调整客户分层”。请计算匹配度。

场景C：帮我查某创业公司的薪资和团队文化；公开信息很少，也没有可靠薪资样本。
```

Record verbatim responses and identify failures such as matching before decoding, presenting unsupported salary numbers, failing to label inference, or asking for a resume in scenario A.

- [ ] **Step 2: Create the evaluation fixture**

Create `tests/evals/jd-insight.json`:

```json
[
  {
    "id": "decode-only",
    "required": ["核心职责", "Must-have", "Nice-to-have", "隐藏信号", "业务目标"],
    "forbidden": ["强制索取简历", "无依据匹配度"]
  },
  {
    "id": "match-with-thin-evidence",
    "required": ["逐项证据", "缺口", "待确认", "硬性门槛单列"],
    "forbidden": ["补写不存在的实验经历"]
  },
  {
    "id": "weak-public-data",
    "required": ["证据不足", "来源", "检索日期"],
    "forbidden": ["虚构薪资区间", "虚构团队文化"]
  }
]
```

- [ ] **Step 3: Write failing static tests**

Create `tests/test-jd-insight.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = new URL('../job-search-strategy-toolkit/jd-insight-skill/', import.meta.url);

test('JD workflow decodes before matching and supports decode-only mode', async () => {
  const text = await readFile(new URL('SKILL.md', base), 'utf8');
  assert.match(text, /先完成五层解读，再进行候选人匹配/);
  assert.match(text, /只解读JD时不得索取简历/);
});

test('match rubric contains approved weights and blocker separation', async () => {
  const text = await readFile(new URL('frameworks/match-rubric.md', base), 'utf8');
  for (const item of ['核心职责匹配：30%', 'Must-have：30%', '简历证据强度：20%', '行业与业务背景：10%', 'Nice-to-have：10%']) {
    assert.match(text, new RegExp(item));
  }
  assert.match(text, /硬性阻断项不得被综合分掩盖/);
});

test('research contract requires sources and uncertainty labels', async () => {
  const text = await readFile(new URL('prompts/research-company.md', base), 'utf8');
  assert.match(text, /来源链接/);
  assert.match(text, /检索日期/);
  assert.match(text, /证据不足/);
});
```

- [ ] **Step 4: Run tests and verify RED**

Run: `node --test tests/test-jd-insight.mjs`

Expected: FAIL because the child skill still contains generated scaffold content and required files do not exist.

- [ ] **Step 5: Commit RED artifacts**

```bash
git add tests/evals/jd-insight.json tests/baselines/jd-insight-without-skill.md tests/test-jd-insight.mjs
git commit -m "test: add JD insight baseline evaluations"
```

### Task 2: Implement five-layer JD decoding and routing

**Files:**
- Modify: `job-search-strategy-toolkit/jd-insight-skill/SKILL.md`
- Create: `job-search-strategy-toolkit/jd-insight-skill/prompts/decode-jd.md`
- Create: `job-search-strategy-toolkit/jd-insight-skill/frameworks/report-contract.md`

**Interfaces:**
- Consumes: JD URL or full JD text plus optional company, role, and level.
- Produces: `jd_model` with responsibilities, must-haves, nice-to-haves, hidden signals, business objectives, level, reporting inference, and KPI inference.

- [ ] **Step 1: Replace child frontmatter and workflow**

Use this frontmatter:

```yaml
---
name: jd-insight-skill
description: Use when Chinese-speaking job seekers provide a job description or ask whether a role is worth applying for, what the employer really wants, how well they match, or what gaps and interview risks exist.
---
```

The body must define this sequence:

```text
1. Acquire the JD: open a provided URL; if unavailable, ask the user to paste the full text.
2. Normalize company, role, location, and level from explicit JD evidence.
3. Read prompts/decode-jd.md and complete all five layers.
4. Research company context only when it improves the decision.
5. If candidate evidence exists, run match-candidate.md; otherwise return JD-only insight.
6. Offer the JD report section to the shared PDF selection flow.
```

Include exact exception rules: only-decode requests do not ask for a resume; candidate matching without evidence asks for one resume or career-summary input; no step stores the JD.

- [ ] **Step 2: Write the five-layer decoder contract**

`prompts/decode-jd.md` must require this output order:

```markdown
# JD五层解读
## 1. 显性核心职责
## 2. Must-have硬性条件
## 3. Nice-to-have加分项
## 4. Hidden signals隐藏信号
## 5. 真实业务目标
## 岗位级别与汇报关系
## 可能承担的核心KPI
## 信息缺口与待确认项
```

For every hidden signal, require the exact source phrase from the JD and an explanation of the inference. Prohibit generic claims that cannot be tied to JD wording.

- [ ] **Step 3: Define the report-section contract**

`frameworks/report-contract.md` must define a section object with these keys:

```json
{
  "id": "jd-insight",
  "title": "JD解读与投递策略",
  "summary": "三到五条结论",
  "facts": [],
  "inferences": [],
  "hard_blockers": [],
  "match": null,
  "gaps": [],
  "recommendation": "值得投、谨慎投或不建议投",
  "sources": []
}
```

Define `sources` entries as `title`, `url`, `publisher`, `retrieved_at`, and `supports`.

- [ ] **Step 4: Run the first static test**

Run: `node --test tests/test-jd-insight.mjs --test-name-pattern="decodes before"`

Expected: PASS.

- [ ] **Step 5: Commit decoder workflow**

```bash
git add job-search-strategy-toolkit/jd-insight-skill/SKILL.md job-search-strategy-toolkit/jd-insight-skill/prompts/decode-jd.md job-search-strategy-toolkit/jd-insight-skill/frameworks/report-contract.md
git commit -m "feat: add five-layer JD decoding"
```

### Task 3: Implement evidence matching and research discipline

**Files:**
- Create: `job-search-strategy-toolkit/jd-insight-skill/prompts/match-candidate.md`
- Create: `job-search-strategy-toolkit/jd-insight-skill/prompts/research-company.md`
- Create: `job-search-strategy-toolkit/jd-insight-skill/frameworks/match-rubric.md`

**Interfaces:**
- Consumes: `jd_model`, candidate facts, shared evidence labels, one role reference, and one company reference.
- Produces: evidence matrix, blocker list, weighted match score, gaps, research appendix, and application recommendation.

- [ ] **Step 1: Write the exact scoring rubric**

`frameworks/match-rubric.md` must contain:

```markdown
# JD匹配评分

- 核心职责匹配：30%
- Must-have：30%
- 简历证据强度：20%
- 行业与业务背景：10%
- Nice-to-have：10%

先列硬性阻断项，再计算综合分。硬性阻断项不得被综合分掩盖。

每条证据使用四档：
- 3：直接、具体、可量化的强证据
- 2：直接但缺少规模或结果
- 1：可迁移的间接证据
- 0：没有证据
```

Define score bands: 80–100 strong fit, 65–79 viable with focused gaps, 50–64 high-risk application, below 50 low fit. State that explicit blockers can override the band recommendation.

- [ ] **Step 2: Write the candidate evidence matrix contract**

`prompts/match-candidate.md` must require one row per decoded requirement with columns `JD要求`, `重要度`, `简历证据原文`, `证据档位`, `缺口`, and `可执行补救`. Missing evidence must be shown as `[待确认]` or `无证据`; it must never be replaced with generated experience.

- [ ] **Step 3: Write the company research contract**

`prompts/research-company.md` must require:

- Primary sources first: official company pages, official product documentation, filings, and official recruitment pages.
- Reputable secondary sources only when primary sources do not answer the question.
- Chinese-market sources for China-market claims.
- A source link and retrieval date for every material claim.
- `[合理推断]` plus the supporting facts for inferred culture, team, or hiring signals.
- The phrase `证据不足，无法可靠判断` when reliable compensation or culture evidence is unavailable.

- [ ] **Step 4: Run all JD tests and verify GREEN**

Run: `node --test tests/test-jd-insight.mjs`

Expected: 3 tests PASS, 0 FAIL.

- [ ] **Step 5: Commit matching and research rules**

```bash
git add job-search-strategy-toolkit/jd-insight-skill/prompts job-search-strategy-toolkit/jd-insight-skill/frameworks
git commit -m "feat: add evidence-based JD matching"
```

### Task 4: Forward-test and validate the JD skill

**Files:**
- Modify: `job-search-strategy-toolkit/jd-insight-skill/agents/openai.yaml`
- Create: `tests/baselines/jd-insight-with-skill.md`

**Interfaces:**
- Consumes: exact scenarios from Task 1.
- Produces: post-skill behavior evidence and valid discovery metadata.

- [ ] **Step 1: Run all three scenarios with the child skill loaded**

Use fresh contexts. Record verbatim outputs in `tests/baselines/jd-insight-with-skill.md`. Confirm scenario A does not request a resume, scenario B exposes missing experiment evidence, and scenario C refuses to invent salary data.

- [ ] **Step 2: Regenerate child metadata**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py job-search-strategy-toolkit/jd-insight-skill \
  --interface display_name="JD Insight" \
  --interface short_description="中文JD解读、匹配与投递策略" \
  --interface default_prompt="请先解读这份JD；只有需要匹配度时再向我索取简历。"
```

- [ ] **Step 3: Run official and static validation**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/quick_validate.py job-search-strategy-toolkit/jd-insight-skill
node --test tests/test-jd-insight.mjs
```

Expected: `Skill is valid!` and 3 tests PASS.

- [ ] **Step 4: Commit the validated JD skill**

```bash
git add job-search-strategy-toolkit/jd-insight-skill tests/baselines/jd-insight-with-skill.md
git commit -m "test: validate JD insight skill"
```
