import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = new URL('../resume-review-skill/', import.meta.url);

test('HR and manager reviews run as independent passes', async () => {
  const text = await readFile(new URL('SKILL.md', base), 'utf8');
  assert.match(text, /先独立完成HR评审，再独立完成部门负责人评审/);
  assert.match(text, /不得先共享结论或合并分数/);
});

test('HR rubric uses approved weights and excludes gender', async () => {
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
