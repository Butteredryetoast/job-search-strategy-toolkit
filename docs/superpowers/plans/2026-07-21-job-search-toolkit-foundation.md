# Job Search Strategy Toolkit Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the discoverable top-level router, shared Chinese-first rules, role and company references, and validation harness for `job-search-strategy-toolkit`.

**Architecture:** A top-level skill routes requests into four independently discoverable sub-skills. Shared references are loaded progressively in the order common rules, role rules, company rules, task rules, and user evidence; no user data is persisted.

**Tech Stack:** Markdown Agent Skills, YAML frontmatter, Python skill scaffolding utilities, Node.js built-in test runner, Git.

## Global Constraints

- During implementation, use `skill-creator` and `superpowers:writing-skills`; preserve RED-GREEN-REFACTOR evidence for every skill.
- Skill and directory name: `job-search-strategy-toolkit`.
- Default interaction and artifacts use Simplified Chinese.
- Supported roles: operations, product, data analysis, marketing, finance, audit, HR, sales/BD, development/engineering, legal, strategy/consulting, and design.
- Supported company types: large internet/technology, small and medium internet, startup, multinational, state-owned, and bank/financial institution.
- Never fabricate candidate facts, metrics, company facts, or compensation data.
- Ask one question at a time when information is missing.
- Do not persist user profiles, resumes, JDs, interview records, or story banks.
- Do not use gender in scoring or hiring recommendations.
- Do not copy names, footers, personal paths, branding, or example data from `offer-toolkit-skill`.
- Reuse the installed MIT-licensed `offer-toolkit-skill` as the implementation base; preserve its license and copyright notice, while removing product branding, personal paths, and example candidate data from runtime outputs.

---

## File Map

- Create: `job-search-strategy-toolkit/SKILL.md` — top-level intent router and shared principles.
- Create: `job-search-strategy-toolkit/agents/openai.yaml` — Codex UI metadata.
- Create: `job-search-strategy-toolkit/references/common/authenticity.md` — fact and inference rules.
- Create: `job-search-strategy-toolkit/references/common/career-stage.md` — Chinese white-collar career-stage guidance.
- Create: `job-search-strategy-toolkit/references/common/evidence-levels.md` — evidence labels and precedence.
- Create: `job-search-strategy-toolkit/references/roles/*.md` — 12 role-family references.
- Create: `job-search-strategy-toolkit/references/companies/*.md` — six company-type references.
- Create: `tests/evals/router.json` — routing evaluation cases.
- Create: `tests/baselines/router-without-skill.md` — verbatim RED observations.
- Create: `tests/test-foundation.mjs` — structural and Chinese-first assertions.
- Create: `.gitignore` — excludes the local validation environment.

### Task 1: Establish RED routing and structure evaluations

**Files:**
- Create: `tests/evals/router.json`
- Create: `tests/baselines/router-without-skill.md`
- Create: `tests/test-foundation.mjs`

**Interfaces:**
- Consumes: approved design in `docs/superpowers/specs/2026-07-21-job-search-strategy-toolkit-design.md`.
- Produces: deterministic assertions for paths, metadata, routing phrases, supported-role count, supported-company count, and non-persistence rules.

- [ ] **Step 1: Record baseline behavior without the new skill**

Run three fresh-context baseline evaluations without loading the new skill:

```text
1. 用户上传一份简历并说：“帮我看看。”
2. 用户粘贴一份产品经理 JD，但没有简历。
3. 用户说：“我下周是部门负责人面，帮我准备。”
```

Record each prompt, verbatim output, and observed failure in `tests/baselines/router-without-skill.md`. The required failure to observe is at least one of: asking multiple questions at once, assuming a fixed workflow, or skipping intent/round clarification.

- [ ] **Step 2: Write the evaluation fixture**

Create `tests/evals/router.json` with this exact scenario contract:

```json
[
  {
    "id": "resume-only",
    "prompt": "我上传了一份简历，帮我看看。",
    "expected_route": "ask_resume_goal",
    "required_behavior": ["一次只问一个问题", "询问通用润色、面试准备或JD定制"]
  },
  {
    "id": "jd-only",
    "prompt": "这是产品经理JD：负责增长产品规划，要求5年以上B端产品经验。",
    "expected_route": "jd_insight",
    "required_behavior": ["先解读JD", "仅在需要匹配度时索取简历"]
  },
  {
    "id": "interview-only",
    "prompt": "我下周是部门负责人面，帮我准备。",
    "expected_route": "interview_prep",
    "required_behavior": ["识别部门负责人面", "只追问下一个必要信息"]
  }
]
```

- [ ] **Step 3: Write failing structural tests**

Create `tests/test-foundation.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../job-search-strategy-toolkit/', import.meta.url);

test('top-level skill is Chinese-first and routes all entry modes', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  for (const phrase of ['默认使用简体中文', '只有 JD', '只有简历', 'JD + 简历', '面试轮次']) {
    assert.match(text, new RegExp(phrase.replace('+', '\\+')));
  }
});

test('shared references cover 12 roles and 6 company types', async () => {
  const roles = (await readdir(new URL('references/roles/', root))).filter((name) => name.endsWith('.md'));
  const companies = (await readdir(new URL('references/companies/', root))).filter((name) => name.endsWith('.md'));
  assert.equal(roles.length, 12);
  assert.equal(companies.length, 6);
});

test('top-level skill forbids persistence and demographic scoring', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  assert.match(text, /不保存用户画像、简历、JD、面试记录或故事库/);
  assert.match(text, /不得将性别用于评分、匹配或录用建议/);
});
```

- [ ] **Step 4: Run tests and verify RED**

Run: `node --test tests/test-foundation.mjs`

Expected: FAIL with `ENOENT` for `job-search-strategy-toolkit/SKILL.md`.

- [ ] **Step 5: Commit RED artifacts**

```bash
git add tests/evals/router.json tests/baselines/router-without-skill.md tests/test-foundation.mjs
git commit -m "test: add toolkit foundation evaluations"
```

### Task 2: Seed the bundle from `offer-toolkit-skill`

**Files:**
- Create: `job-search-strategy-toolkit/`
- Create: `job-search-strategy-toolkit/jd-insight-skill/`
- Create: `job-search-strategy-toolkit/resume-rebuild-skill/`
- Create: `job-search-strategy-toolkit/resume-review-skill/`
- Create: `job-search-strategy-toolkit/interview-prep-skill/`

**Interfaces:**
- Consumes: `/Users/mac/.codex/skills/offer-toolkit-skill`, licensed under MIT.
- Produces: a renamed working copy with four child skills, preserved license notice, and reusable JD/resume/interview/template assets ready for targeted modification.

- [ ] **Step 1: Create the local validation environment**

Keep the approved local-development ignores in `.gitignore`:

```gitignore
.worktrees/
.superpowers/
.venv/
node_modules/
```

Then run:

```bash
python3 -m venv .venv
.venv/bin/pip install PyYAML
```

Expected: `.venv/bin/python` imports `yaml` successfully.

- [ ] **Step 2: Copy the existing toolkit as the working base**

```bash
cp -R /Users/mac/.codex/skills/offer-toolkit-skill job-search-strategy-toolkit
rm -rf job-search-strategy-toolkit/.git
```

Expected: `job-search-strategy-toolkit/SKILL.md`, `LICENSE`, and the three source child skills exist. Verify the copied `LICENSE` retains `Copyright (c) 2026 yanliudesign` and the MIT permission notice.

- [ ] **Step 3: Map reusable source modules to the approved architecture**

```bash
mv job-search-strategy-toolkit/job-description-skill job-search-strategy-toolkit/jd-insight-skill
mv job-search-strategy-toolkit/resume-skill job-search-strategy-toolkit/resume-rebuild-skill
mv job-search-strategy-toolkit/bq-skill job-search-strategy-toolkit/interview-prep-skill
```

Create `job-search-strategy-toolkit/resume-review-skill/` with Skill Creator because the source toolkit has no equivalent. Generate `agents/openai.yaml` for all five skill entry points. Preserve reusable prompts, frameworks, templates, and scripts; later tasks will replace conflicting persistence, branding, footer, story-bank, and output rules.

Expected: each child directory contains `SKILL.md`; `resume-review-skill` is a valid initialized skill; the copied MIT license remains at bundle root.

- [ ] **Step 4: Commit scaffolding**

```bash
git add .gitignore job-search-strategy-toolkit
git commit -m "chore: seed toolkit from MIT-licensed base"
```

### Task 3: Implement the top-level router and common rules

**Files:**
- Modify: `job-search-strategy-toolkit/SKILL.md`
- Create: `job-search-strategy-toolkit/references/common/authenticity.md`
- Create: `job-search-strategy-toolkit/references/common/career-stage.md`
- Create: `job-search-strategy-toolkit/references/common/evidence-levels.md`

**Interfaces:**
- Consumes: raw user intent and available JD/resume/interview material.
- Produces: exactly one next route and at most one clarification question.

- [ ] **Step 1: Replace top-level frontmatter and routing body**

Use this frontmatter and required section order in `SKILL.md`:

```markdown
---
name: job-search-strategy-toolkit
description: Use when Chinese-speaking job seekers need help understanding a JD, improving or tailoring a resume, receiving HR and hiring-manager resume feedback, or preparing for a specific interview round.
---

# Job Search Strategy Toolkit

## Core contract
默认使用简体中文。一次只问一个必要问题。不得编造经历、数字、公司信息或薪资数据。

## Route by available material
- 只有 JD：进入 `jd-insight-skill`；只有用户要求匹配度时才索取简历。
- 只有简历：询问目标是通用润色、面试准备还是按 JD 定制。
- JD + 简历：建议依次进入 JD 解读、简历重构、双视角评审、面试准备。
- 只有面试需求：先确认面试轮次，再进入 `interview-prep-skill`。
- 需求模糊：询问用户处于看岗位、准备投递还是准备面试阶段。

## Shared constraints
- 读取 `references/common/authenticity.md` 与 `references/common/evidence-levels.md`。
- 按需读取一个岗位文件和一个企业类型文件，不得一次加载全部规则库。
- 不保存用户画像、简历、JD、面试记录或故事库。
- 不得将性别用于评分、匹配或录用建议。
```

- [ ] **Step 2: Write exact evidence labels**

In `references/common/evidence-levels.md`, define these labels and precedence:

```markdown
# 证据等级

- `[用户确认]`：用户明确提供或确认的事实与数字。
- `[公开来源]`：可访问来源支持的公司、行业、岗位或薪资信息，必须附链接与检索日期。
- `[合理推断]`：从JD措辞、组织结构或多项证据推导的判断，必须写明推断依据。
- `[待确认]`：影响结论但尚未得到用户确认的信息。

优先级：用户确认事实 > 当前JD > 岗位规则 > 企业规则 > 通用建议。
```

- [ ] **Step 3: Write authenticity and career-stage rules**

`authenticity.md` must explicitly forbid invented metrics, upgraded titles, fictional projects, unsupported company claims, and unverified salary ranges. `career-stage.md` must cover 25–35-year-old Chinese white-collar contexts—job changes, promotion plateau, management transition, specialization, and city mobility—without treating age or gender as a hiring score.

- [ ] **Step 4: Run foundation tests**

Run: `node --test tests/test-foundation.mjs`

Expected: first and third tests PASS; role/company count test still FAILS with missing reference directories or count mismatch.

- [ ] **Step 5: Commit router and common rules**

```bash
git add job-search-strategy-toolkit/SKILL.md job-search-strategy-toolkit/references/common
git commit -m "feat: add Chinese-first job search router"
```

### Task 4: Implement role and company references

**Files:**
- Create: `job-search-strategy-toolkit/references/roles/{operations,product,data-analysis,marketing,finance,audit,hr,sales-bd,engineering,legal,strategy-consulting,design}.md`
- Create: `job-search-strategy-toolkit/references/companies/{large-tech,mid-size-internet,startup,multinational,state-owned,bank-finance}.md`

**Interfaces:**
- Consumes: normalized role family and company type.
- Produces: keywords, metrics, tools, HR signals, hiring-manager signals, risks, and interview themes.

- [ ] **Step 1: Use one fixed role-reference contract**

Every role file must begin with its exact Chinese title and then contain these headings:

```markdown
## 核心业务目标
## 招聘关键词
## 有意义的成果指标
## 常用工具与方法
## HR筛选重点
## 部门负责人关注点
## 常见简历雷区
## 分轮面试主题
```

Use these exact title mappings: `operations.md` → `# 运营`, `product.md` → `# 产品`, `data-analysis.md` → `# 数据分析`, `marketing.md` → `# 市场营销`, `finance.md` → `# 财务`, `audit.md` → `# 审计`, `hr.md` → `# HR`, `sales-bd.md` → `# 销售与BD`, `engineering.md` → `# 开发与工程`, `legal.md` → `# 法务`, `strategy-consulting.md` → `# 战略与咨询`, `design.md` → `# 设计`.

- [ ] **Step 2: Populate all 12 role files with role-specific anchors**

Use these required anchors; expand each into concise, evidence-based rules:

| File | Required anchors |
|---|---|
| `operations.md` | activation, retention, content supply, conversion, GMV, cohort, campaign review |
| `product.md` | user problem, roadmap, PRD, adoption, conversion, cross-functional delivery |
| `data-analysis.md` | metric definition, SQL, experiment, model validity, business recommendation |
| `marketing.md` | audience insight, campaign, CAC, ROI, brand lift, channel mix |
| `finance.md` | closing, budget, forecast, variance, cash flow, compliance |
| `audit.md` | assertions, sampling, working papers, control deficiency, remediation |
| `hr.md` | hiring funnel, time-to-fill, retention, performance, organization support |
| `sales-bd.md` | pipeline, quota, win rate, deal cycle, account strategy, renewal |
| `engineering.md` | architecture, reliability, latency, throughput, quality, ownership |
| `legal.md` | contract, compliance, risk exposure, dispute, privacy, regulatory analysis |
| `strategy-consulting.md` | hypothesis, market sizing, structured analysis, recommendation, impact |
| `design.md` | user research, design system, usability, accessibility, product outcome |

- [ ] **Step 3: Populate six company files**

Each company file must use headings `招聘偏好`, `简历风格`, `证据要求`, `风险信号`, and `面试风格`. Required distinctions:

- `large-tech.md`: scale, data, cross-functional complexity, calibrated leveling.
- `mid-size-internet.md`: independent delivery, breadth, cost awareness, practical execution.
- `startup.md`: ambiguity, speed, ownership, resource constraints, zero-to-one evidence.
- `multinational.md`: concise evidence, English readiness, stakeholder alignment, compliance.
- `state-owned.md`: completeness, stability, formal credentials, process discipline, long-term fit.
- `bank-finance.md`: precision, risk, regulation, confidentiality, certification, auditability.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/test-foundation.mjs`

Expected: all three tests PASS.

- [ ] **Step 5: Commit shared references**

```bash
git add job-search-strategy-toolkit/references/roles job-search-strategy-toolkit/references/companies
git commit -m "feat: add role and company reference layers"
```

### Task 5: Validate discovery metadata and routing behavior

**Files:**
- Modify: `job-search-strategy-toolkit/agents/openai.yaml`
- Modify: child `agents/openai.yaml` files only if generated metadata is inconsistent.
- Create: `tests/baselines/router-with-skill.md`

**Interfaces:**
- Consumes: completed foundation bundle.
- Produces: validated metadata and recorded post-skill routing evidence.

- [ ] **Step 1: Regenerate top-level metadata from final skill text**

```bash
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py job-search-strategy-toolkit \
  --interface display_name="Job Search Strategy Toolkit" \
  --interface short_description="中文求职全链路策略工具箱" \
  --interface default_prompt="请根据我现有的JD、简历或面试阶段，先判断下一步并一次只问一个必要问题。"
```

- [ ] **Step 2: Create a validation environment and run official validation**

```bash
for dir in job-search-strategy-toolkit job-search-strategy-toolkit/jd-insight-skill job-search-strategy-toolkit/resume-rebuild-skill job-search-strategy-toolkit/resume-review-skill job-search-strategy-toolkit/interview-prep-skill; do
  .venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/quick_validate.py "$dir"
done
```

Expected: five lines containing `Skill is valid!`.

- [ ] **Step 3: Re-run the three router scenarios with the skill loaded**

Use fresh contexts and the exact prompts in `tests/evals/router.json`. Record outputs in `tests/baselines/router-with-skill.md`. Each output must select the expected route and ask no more than one question.

- [ ] **Step 4: Run all foundation checks**

Run: `node --test tests/test-foundation.mjs`

Expected: 3 tests PASS, 0 FAIL.

- [ ] **Step 5: Commit validated foundation**

```bash
git add job-search-strategy-toolkit tests/baselines/router-with-skill.md
git commit -m "test: validate toolkit routing and discovery"
```
