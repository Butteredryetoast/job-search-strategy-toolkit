import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = new URL('../job-search-strategy-toolkit/jd-insight-skill/', import.meta.url);

test('JD workflow decodes before matching and supports decode-only mode', async () => {
  const text = await readFile(new URL('SKILL.md', base), 'utf8');
  assert.match(text, /先完成五层解读/);
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
