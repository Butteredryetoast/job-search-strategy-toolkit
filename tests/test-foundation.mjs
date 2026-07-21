import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../job-search-strategy-toolkit/', import.meta.url);

test('top-level skill declares required frontmatter metadata', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  assert.match(text, /^---\nname: job-search-strategy-toolkit\ndescription: .+\n---/);
});

test('agent metadata exposes the toolkit identity', async () => {
  const yaml = await readFile(new URL('agents/openai.yaml', root), 'utf8');
  const shortDescription = '面向中文求职者的JD解读、简历优化、双视角评审与面试准备工具箱';
  assert.match(yaml, /^interface:\n/);
  assert.match(yaml, /^  display_name: "Job Search Strategy Toolkit"$/m);
  assert.ok([...shortDescription].length >= 25 && [...shortDescription].length <= 64);
  assert.match(yaml, new RegExp(`^  short_description: "${shortDescription}"$`, 'm'));
  const defaultPrompt = yaml.match(/^  default_prompt: "([^"\n]+)"$/m);
  assert.ok(defaultPrompt, 'default_prompt must be a non-empty double-quoted string');
  assert.match(defaultPrompt[1], /\$job-search-strategy-toolkit/);
});

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
