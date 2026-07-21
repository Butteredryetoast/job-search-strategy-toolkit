import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../job-search-strategy-toolkit/', import.meta.url);

test('top-level skill declares required frontmatter metadata', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  assert.match(text, /^---\nname: job-search-strategy-toolkit\ndescription: "Use when[^"\n]+"\n---/);
});

test('agent metadata exposes the toolkit identity', async () => {
  const yaml = await readFile(new URL('agents/openai.yaml', root), 'utf8');
  const shortDescription = '面向中文求职者的JD解读、简历优化、双视角评审与简历PDF工具箱';
  assert.match(yaml, /^interface:\n/);
  assert.match(yaml, /^  display_name: "Job Search Strategy Toolkit"$/m);
  assert.ok([...shortDescription].length >= 25 && [...shortDescription].length <= 64);
  assert.match(yaml, new RegExp(`^  short_description: "${shortDescription}"$`, 'm'));
  const defaultPrompt = yaml.match(/^  default_prompt: "([^"\n]+)"$/m);
  assert.ok(defaultPrompt, 'default_prompt must be a non-empty double-quoted string');
  assert.match(defaultPrompt[1], /\$job-search-strategy-toolkit/);
});

test('top-level router is Chinese-first and exposes exactly the three supported child routes', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  assert.match(text, /默认使用简体中文/);
  const childRoutes = [...text.matchAll(/\]\(([^)]+\/SKILL\.md)\)/g)].map((match) => match[1]);
  assert.deepEqual(childRoutes, [
    'jd-insight-skill/SKILL.md',
    'resume-rebuild-skill/SKILL.md',
    'resume-review-skill/SKILL.md',
  ]);
  assert.doesNotMatch(text, /interview|面试|题册|workbook|story[- ]bank|故事库/i);
});

test('top-level router handles JD, resume, combined, review, and vague requests with one necessary question', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  for (const phrase of ['只有 JD', '只有简历', 'JD + 简历', '直接要求评审简历', '需求不明确']) {
    assert.match(text, new RegExp(phrase.replace('+', '\\+')));
  }
  assert.match(text, /一次只问一个必要问题/);
  assert.match(text, /你这次更需要通用修改润色，还是根据具体JD定制简历？/);
});

test('top-level router keeps JD and review in chat and limits PDF to the revised resume', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  assert.match(text, /JD 解读.*仅在聊天中输出/);
  assert.match(text, /双视角评审.*仅在聊天中输出/);
  assert.match(text, /只有修订简历可以导出为 PDF/);
});

test('shared references cover 12 roles and 6 company types', async () => {
  const roles = (await readdir(new URL('references/roles/', root))).filter((name) => name.endsWith('.md'));
  const companies = (await readdir(new URL('references/companies/', root))).filter((name) => name.endsWith('.md'));
  assert.equal(roles.length, 12);
  assert.equal(companies.length, 6);
});

test('top-level skill forbids persistence and demographic scoring', async () => {
  const text = await readFile(new URL('SKILL.md', root), 'utf8');
  assert.match(text, /不保存任何用户材料、分析结果或工作记录/);
  assert.match(text, /不得将性别用于评分、匹配或录用建议/);
});

test('common references define evidence labels, precedence, authenticity, and career-stage boundaries', async () => {
  const skill = await readFile(new URL('SKILL.md', root), 'utf8');
  for (const reference of [
    'references/common/authenticity.md',
    'references/common/evidence-levels.md',
    'references/common/career-stage.md',
  ]) {
    assert.match(skill, new RegExp(reference.replaceAll('.', '\\.')));
  }

  const evidence = await readFile(new URL('references/common/evidence-levels.md', root), 'utf8');
  for (const label of ['[用户确认]', '[公开来源]', '[合理推断]', '[待确认]']) {
    assert.match(evidence, new RegExp(`\\${label}`));
  }
  assert.match(evidence, /用户确认事实\s*>\s*当前JD\s*>\s*岗位规则\s*>\s*企业规则\s*>\s*通用建议/);

  const authenticity = await readFile(new URL('references/common/authenticity.md', root), 'utf8');
  assert.match(authenticity, /不得杜撰/);

  const careerStage = await readFile(new URL('references/common/career-stage.md', root), 'utf8');
  assert.match(careerStage, /年龄只能作为职业阶段语境/);
});
