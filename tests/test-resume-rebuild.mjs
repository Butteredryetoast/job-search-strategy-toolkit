import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = new URL('../resume-rebuild-skill/', import.meta.url);

test('resume-only requests clarify the goal before editing', async () => {
  const text = await readFile(new URL('SKILL.md', base), 'utf8');
  assert.match(text, /通用修改润色/);
  assert.match(text, /JD定制/);
  assert.match(text, /每次只问一个问题/);
});

test('experience mining asks one question at a time and never invents metrics', async () => {
  const text = await readFile(new URL('prompts/experience-mining.md', base), 'utf8');
  assert.match(text, /一次只问一个问题/);
  assert.match(text, /不得猜测数字/);
});

test('rewrite rules reject unsupported ownership claims and preserve facts', async () => {
  const text = await readFile(new URL('SKILL.md', base), 'utf8');
  assert.match(text, /不得猜测数字/);
  assert.match(text, /待确认/);
});
