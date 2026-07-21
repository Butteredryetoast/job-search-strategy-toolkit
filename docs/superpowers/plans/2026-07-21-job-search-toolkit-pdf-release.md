# PDF Assembly and Public Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users select any available analysis sections, combine only those sections into one verified Chinese-first A4 PDF, and package the completed skill bundle for local installation and public distribution.

**Architecture:** Child skills return structured section objects; the top-level skill presents available sections and records the user's selection. A dependency-light Node renderer assembles a safe HTML document, prints it through an installed Chromium-based browser, and verifies both the intermediate structure and rendered PDF before delivery.

**Tech Stack:** Node.js standard library, Chrome/Chromium headless printing, HTML5, CSS Paged Media, Poppler `pdfinfo`/`pdftoppm`, Node.js built-in tests, Markdown Agent Skills, Git.

**Prerequisite:** Complete the foundation and all four child-skill plans so all six section IDs and report contracts exist.

## Global Constraints

- During implementation, use `skill-creator`, `superpowers:writing-skills`, and the PDF skill for render verification; preserve RED-GREEN-REFACTOR evidence.
- Default output is one combined Simplified Chinese PDF.
- The user chooses included sections before rendering; unselected sections are absent.
- Available sections: JD insight, revised resume, resume change explanation, dual-lens review, interview preparation plan, and printable interview workbook.
- PDF uses A4 dimensions, stable Chinese font fallbacks, page numbers, target company/role metadata, working source links, and evidence labels.
- Revised resume remains single-column and ATS-friendly.
- Workbook questions preserve handwriting space.
- Unsafe HTML, active scripts, unresolved data markers, font failures, overflow, blank pages, and missing sections block delivery.
- Temporary HTML and structured data are removed after successful delivery unless test mode explicitly retains them.
- No author-specific absolute paths appear in the published skill.

---

## File Map

- Create: `job-search-strategy-toolkit/references/report-selection.md` — selectable-section protocol.
- Create: `job-search-strategy-toolkit/assets/pdf-templates/report-shell.html` — combined document shell.
- Create: `job-search-strategy-toolkit/assets/pdf-templates/report.css` — A4 and section styles.
- Create: `job-search-strategy-toolkit/scripts/render-report.mjs` — safe assembly and Chrome printing.
- Create: `job-search-strategy-toolkit/scripts/validate-report.mjs` — structured and PDF checks.
- Modify: `job-search-strategy-toolkit/SKILL.md` — selection and delivery workflow.
- Create: `tests/fixtures/report-data.json` — selected-section sample.
- Create: `tests/fixtures/unsafe-report-data.json` — active-content rejection sample.
- Create: `tests/test-pdf-renderer.mjs` — renderer tests.
- Create: `tests/evals/full-flow.json` — cross-skill workflows.
- Create: `tests/baselines/full-flow-with-skill.md` — integration evidence.
- Create: `README.md` — public repository usage outside the skill folder.

### Task 1: Establish RED renderer tests

**Files:**
- Create: `tests/fixtures/report-data.json`
- Create: `tests/fixtures/unsafe-report-data.json`
- Create: `tests/test-pdf-renderer.mjs`

**Interfaces:**
- Consumes: report JSON with metadata, available sections, and selected section IDs.
- Produces: failing tests for selective assembly, safe HTML, PDF existence, and unselected-section omission.

- [ ] **Step 1: Create selected-section fixture**

Create `tests/fixtures/report-data.json`:

```json
{
  "title": "求职策略报告",
  "generated_at": "2026-07-21",
  "target_company": "示例科技",
  "target_role": "产品经理",
  "selected_section_ids": ["jd-insight", "printable-interview-workbook"],
  "sections": [
    {
      "id": "jd-insight",
      "title": "JD解读与投递策略",
      "html": "<h2>核心结论</h2><p><span class=\"evidence user\">用户确认</span> 候选人具备B端产品经验。</p>"
    },
    {
      "id": "revised-resume",
      "title": "修改后简历",
      "html": "<h2>候选人简历</h2><p>本章节不应出现在测试PDF中。</p>"
    },
    {
      "id": "printable-interview-workbook",
      "title": "可打印面试题册",
      "html": "<article class=\"question\"><h3>1. 请介绍一次你调整产品优先级的经历。</h3><p>考察点：优先级判断</p><div class=\"writing-space\" data-lines=\"8\"></div></article>"
    }
  ],
  "sources": [
    {
      "title": "示例科技招聘页",
      "url": "https://example.com/jobs/product",
      "publisher": "示例科技",
      "retrieved_at": "2026-07-21",
      "supports": "岗位职责"
    }
  ]
}
```

- [ ] **Step 2: Create unsafe fixture**

Create `tests/fixtures/unsafe-report-data.json` with one selected section whose `html` is `<script>document.body.innerHTML='unsafe'</script>`. The renderer must reject it before writing HTML or PDF.

- [ ] **Step 3: Write failing Node tests**

Create `tests/test-pdf-renderer.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const renderer = 'job-search-strategy-toolkit/scripts/render-report.mjs';

test('renders only selected sections into one PDF', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'job-search-report-'));
  const pdf = join(dir, 'report.pdf');
  const html = join(dir, 'report.html');
  const run = spawnSync(process.execPath, [renderer, '--input', 'tests/fixtures/report-data.json', '--output', pdf, '--keep-html', html], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const page = await readFile(html, 'utf8');
  assert.match(page, /JD解读与投递策略/);
  assert.match(page, /可打印面试题册/);
  assert.doesNotMatch(page, /本章节不应出现在测试PDF中/);
  assert.match(page, /目录/);
  const info = await stat(pdf);
  assert.ok(info.size > 1000);
  const signature = (await readFile(pdf)).subarray(0, 4).toString();
  assert.equal(signature, '%PDF');
});

test('rejects active HTML before rendering', () => {
  const run = spawnSync(process.execPath, [renderer, '--input', 'tests/fixtures/unsafe-report-data.json', '--output', '/tmp/unsafe-report.pdf'], { encoding: 'utf8' });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /Unsafe HTML/);
});
```

- [ ] **Step 4: Run tests and verify RED**

Run: `node --test tests/test-pdf-renderer.mjs`

Expected: FAIL because `render-report.mjs` does not exist.

- [ ] **Step 5: Commit RED artifacts**

```bash
git add tests/fixtures tests/test-pdf-renderer.mjs
git commit -m "test: add selective PDF renderer tests"
```

### Task 2: Implement the HTML shell and print CSS

**Files:**
- Create: `job-search-strategy-toolkit/assets/pdf-templates/report-shell.html`
- Create: `job-search-strategy-toolkit/assets/pdf-templates/report.css`

**Interfaces:**
- Consumes: escaped metadata, generated TOC, selected section HTML, and source appendix.
- Produces: one self-contained print-ready HTML document.

- [ ] **Step 1: Create the shell tokens**

`report-shell.html` must contain only these replacement tokens: `{{REPORT_CSS}}`, `{{TITLE}}`, `{{META}}`, `{{TOC}}`, `{{SECTIONS}}`, and `{{SOURCES}}`. Use this document structure:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{TITLE}}</title>
  <style>{{REPORT_CSS}}</style>
</head>
<body>
  <header class="cover"><h1>{{TITLE}}</h1>{{META}}</header>
  <nav class="toc" aria-label="目录"><h2>目录</h2>{{TOC}}</nav>
  <main>{{SECTIONS}}</main>
  <footer class="sources"><h2>来源与证据</h2>{{SOURCES}}</footer>
</body>
</html>
```

- [ ] **Step 2: Create A4 and Chinese-first CSS**

`report.css` must include:

```css
@page { size: A4; margin: 16mm 15mm 17mm; @bottom-center { content: counter(page); } }
* { box-sizing: border-box; }
body { margin: 0; color: #172033; background: #fff; font: 10.5pt/1.65 -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif; }
h1, h2, h3 { break-after: avoid; color: #102a43; }
table, figure, .question, .callout { break-inside: avoid; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #d8e1ea; padding: 6px 8px; vertical-align: top; }
.report-section { break-before: page; }
.report-section:first-child { break-before: auto; }
.resume-section { font-size: 9.5pt; line-height: 1.45; }
.evidence { display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 8.5pt; }
.evidence.user { background: #e8f5e9; }
.evidence.public { background: #e3f2fd; }
.evidence.inference { background: #fff3e0; }
.writing-space { min-height: 54mm; background: repeating-linear-gradient(to bottom, transparent 0, transparent 7mm, #cfd8e3 7.2mm); }
a { color: #0b57d0; overflow-wrap: anywhere; }
```

Add print rules that remove interactive controls and preserve link URLs in the source appendix.

- [ ] **Step 3: Commit templates**

```bash
git add job-search-strategy-toolkit/assets/pdf-templates
git commit -m "feat: add Chinese A4 report templates"
```

### Task 3: Implement safe selective assembly and Chrome printing

**Files:**
- Create: `job-search-strategy-toolkit/scripts/render-report.mjs`

**Interfaces:**
- Consumes: `--input report.json`, `--output report.pdf`, optional `--keep-html report.html`.
- Produces: one PDF containing selected sections only; exits nonzero on unsafe or invalid input.

- [ ] **Step 1: Implement argument and input validation**

Use Node standard library. Required checks:

- Input and output arguments are present.
- `selected_section_ids` is a non-empty array with unique IDs.
- Every selected ID exists exactly once in `sections`.
- Each selected section has non-empty `title` and `html`.
- Reject case-insensitive `<script`, `<iframe`, `<object`, `<embed`, `javascript:`, and inline `on...=` event handlers.
- Reject the strings `[待确认]`, `TBD`, and unresolved double-brace template tokens unless `--allow-unconfirmed` is explicitly supplied.

The rejection message for active content must begin `Unsafe HTML:`.

- [ ] **Step 2: Implement HTML assembly**

Escape title and metadata values. Preserve selected section HTML only after safety validation. Build TOC links and section wrappers in the order of `selected_section_ids`:

```javascript
const selected = data.selected_section_ids.map((id) => sectionById.get(id));
const toc = `<ol>${selected.map((section, index) => `<li><a href="#section-${index + 1}">${escapeHtml(section.title)}</a></li>`).join('')}</ol>`;
const sections = selected.map((section, index) => `<section class="report-section ${section.id === 'revised-resume' ? 'resume-section' : ''}" id="section-${index + 1}"><h1>${index + 1}. ${escapeHtml(section.title)}</h1>${expandWritingSpace(section.html)}</section>`).join('\n');
```

`expandWritingSpace` must read `data-lines` from 6 through 12 and set an inline `min-height` from 42mm through 84mm; values outside the range cause a validation error.

- [ ] **Step 3: Implement portable Chrome discovery**

Resolve the first executable from:

- `CHROME_PATH` environment variable.
- macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, `/Applications/Chromium.app/Contents/MacOS/Chromium`.
- Linux commands: `google-chrome`, `chromium`, `chromium-browser`.
- Windows standard Chrome installation locations derived from `PROGRAMFILES`, `PROGRAMFILES(X86)`, and `LOCALAPPDATA`.

If none exists, exit with `No Chrome or Chromium executable found` and do not create a PDF.

- [ ] **Step 4: Print and clean temporary files**

Use a temporary directory and execute Chrome with:

```text
--headless=new
--disable-gpu
--no-pdf-header-footer
--print-to-pdf=/tmp/job-search-report/report.pdf
file:///tmp/job-search-report/report.html
```

When `--keep-html` is absent, delete the temporary HTML after a successful PDF write. Never delete the source JSON or final PDF.

- [ ] **Step 5: Run renderer tests and verify GREEN**

Run: `node --test tests/test-pdf-renderer.mjs`

Expected: 2 tests PASS, 0 FAIL.

- [ ] **Step 6: Commit renderer**

```bash
git add job-search-strategy-toolkit/scripts/render-report.mjs
git commit -m "feat: render selected report sections to PDF"
```

### Task 4: Implement report validation and visual verification

**Files:**
- Create: `job-search-strategy-toolkit/scripts/validate-report.mjs`
- Modify: `tests/test-pdf-renderer.mjs`

**Interfaces:**
- Consumes: input JSON, retained HTML, and final PDF.
- Produces: `REPORT_VALID` or a nonzero exit with actionable errors.

- [ ] **Step 1: Implement structural validation**

`validate-report.mjs` must accept `--input`, `--html`, and `--pdf`. Check:

- Every selected title occurs in the HTML.
- No unselected section body occurs in the HTML.
- TOC link count equals selected section count.
- Source entries include title, URL, publisher, retrieval date, and supported claim.
- HTML contains none of the forbidden active-content or unresolved-marker patterns.
- PDF starts with `%PDF` and is larger than 1000 bytes.
- `pdfinfo` exits zero and reports at least one page.

On success print exactly `REPORT_VALID`.

- [ ] **Step 2: Extend the success test**

After rendering in the first Node test, run the validator and assert status zero and stdout contains `REPORT_VALID`.

- [ ] **Step 3: Render pages for visual inspection**

```bash
mkdir -p tests/output/report-pages
node job-search-strategy-toolkit/scripts/render-report.mjs --input tests/fixtures/report-data.json --output tests/output/sample-report.pdf --keep-html tests/output/sample-report.html
node job-search-strategy-toolkit/scripts/validate-report.mjs --input tests/fixtures/report-data.json --html tests/output/sample-report.html --pdf tests/output/sample-report.pdf
pdftoppm -png -r 120 tests/output/sample-report.pdf tests/output/report-pages/page
```

Inspect every PNG. Acceptance criteria: no clipped text, no blank page, readable Chinese glyphs, TOC present, only two selected sections, workbook writing lines visible, and source URL readable.

- [ ] **Step 4: Run all renderer tests**

Run: `node --test tests/test-pdf-renderer.mjs`

Expected: all tests PASS and validator prints `REPORT_VALID` for the safe fixture.

- [ ] **Step 5: Commit validation utilities**

```bash
git add job-search-strategy-toolkit/scripts/validate-report.mjs tests/test-pdf-renderer.mjs
git commit -m "test: validate PDF structure and rendering"
```

### Task 5: Implement user-selected report assembly workflow

**Files:**
- Create: `job-search-strategy-toolkit/references/report-selection.md`
- Modify: `job-search-strategy-toolkit/SKILL.md`

**Interfaces:**
- Consumes: section objects available from completed child workflows.
- Produces: one user-approved selection and one combined PDF.

- [ ] **Step 1: Define section registry and fixed IDs**

`report-selection.md` must define:

| ID | Chinese title |
|---|---|
| `jd-insight` | JD解读与投递策略 |
| `revised-resume` | 修改后简历 |
| `resume-change-explanation` | 简历修改说明 |
| `dual-lens-resume-review` | 简历双视角评审 |
| `interview-preparation-plan` | 面试准备方案 |
| `printable-interview-workbook` | 可打印面试题册 |

- [ ] **Step 2: Define the selection conversation**

After analysis, the top-level skill lists only sections actually available, marks recommended sections, and asks one question: `你希望最终PDF包含哪些部分？` The user may name one or more sections. Do not render until the selection is explicit.

- [ ] **Step 3: Define assembly and delivery commands**

The skill must create session-temporary report JSON, run `render-report.mjs`, run `validate-report.mjs`, render PDF pages for visual verification when local tools permit, and deliver only after all checks pass. It must delete temporary JSON, HTML, and page images after successful delivery; the selected PDF remains.

- [ ] **Step 4: Add explicit failure behavior**

If rendering or validation fails, report the exact blocker and do not present HTML as the final deliverable. Preserve diagnostic temporary files only until the issue is fixed or reported.

- [ ] **Step 5: Commit selection workflow**

```bash
git add job-search-strategy-toolkit/SKILL.md job-search-strategy-toolkit/references/report-selection.md
git commit -m "feat: add user-selected combined PDF workflow"
```

### Task 6: Run full-flow evaluations and prepare public repository

**Files:**
- Create: `tests/evals/full-flow.json`
- Create: `tests/baselines/full-flow-with-skill.md`
- Create: `README.md`

**Interfaces:**
- Consumes: completed top-level skill, four child skills, shared references, and renderer.
- Produces: end-to-end evidence, public usage instructions, and installable skill directory.

- [ ] **Step 1: Create full-flow evaluation fixture**

Include these exact workflows in `tests/evals/full-flow.json`:

```json
[
  {
    "id": "jd-resume-full-analysis-selected-output",
    "input": "产品经理JD与简历",
    "selected_section_ids": ["jd-insight", "dual-lens-resume-review", "printable-interview-workbook"],
    "assertions": ["先解读JD", "两个评审分数独立", "只输出三个所选章节", "一个PDF"]
  },
  {
    "id": "resume-only-general-polish",
    "input": "只有运营简历，用户选择通用润色",
    "selected_section_ids": ["revised-resume", "resume-change-explanation"],
    "assertions": ["不强制索取JD", "不编数字", "一个PDF"]
  },
  {
    "id": "engineering-professional-interview",
    "input": "后端工程师专业能力面，JD和简历证据不完整",
    "selected_section_ids": ["interview-preparation-plan", "printable-interview-workbook"],
    "assertions": ["暴露性能证据缺口", "不虚构事故", "一个PDF"]
  }
]
```

- [ ] **Step 2: Run each workflow in a fresh context**

Record verbatim routing, analysis, selection prompt, validation output, and final PDF path in `tests/baselines/full-flow-with-skill.md`. Confirm no user profile, JD bank, resume history, or story bank appears in the skill directory after each run.

- [ ] **Step 3: Write public repository README**

Outside the skill directory, document in Simplified Chinese:

- Product purpose and audience.
- Four child skills and six selectable PDF sections.
- Supported roles and company types.
- Installation by copying `job-search-strategy-toolkit/` into `~/.codex/skills/`.
- Example trigger prompts.
- Privacy statement: session-only processing and no profile/history bank.
- PDF dependency: an installed Chrome or Chromium executable.

Do not include copied branding, screenshots, or text from the reference repository.

- [ ] **Step 4: Run the complete verification suite**

```bash
node --test tests/*.mjs
for dir in job-search-strategy-toolkit job-search-strategy-toolkit/jd-insight-skill job-search-strategy-toolkit/resume-rebuild-skill job-search-strategy-toolkit/resume-review-skill job-search-strategy-toolkit/interview-prep-skill; do
  .venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/quick_validate.py "$dir"
done
rg -n '/Users/|Dreameryanyan|yanliudreamer|xiaohongshu' job-search-strategy-toolkit && exit 1 || true
```

Expected: all Node tests PASS, five `Skill is valid!` messages, and no author-specific path or copied-brand match.

- [ ] **Step 5: Install locally without overwriting an existing skill**

```bash
test ! -e /Users/mac/.codex/skills/job-search-strategy-toolkit
cp -R job-search-strategy-toolkit /Users/mac/.codex/skills/job-search-strategy-toolkit
```

Expected: `/Users/mac/.codex/skills/job-search-strategy-toolkit/SKILL.md` exists and the skill is discoverable on the next turn.

- [ ] **Step 6: Commit release-ready bundle**

```bash
git add job-search-strategy-toolkit tests README.md
git commit -m "feat: complete job search strategy toolkit"
```
