import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const forbidden = /interview|面试|题册|workbook|story-bank|jd-bank|Dreameryanyan|JD SKILL|Created by|xiaohongshu|yanliudreamer/i;
async function walk(dir) {
  const names = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of names) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path)); else files.push(path);
  }
  return files;
}

test('runtime bundle has no removed feature or upstream branding residue', async () => {
  const runtimeEntries = ['SKILL.md', 'agents', 'jd-insight-skill', 'references', 'resume-rebuild-skill', 'resume-review-skill', 'scripts'];
  const files = [];
  for (const entry of runtimeEntries) {
    const path = join(root, entry);
    const stat = await import('node:fs/promises').then(({ stat }) => stat(path));
    if (stat.isDirectory()) files.push(...await walk(path)); else files.push(path);
  }
  const filteredFiles = files.filter((file) => !file.endsWith('LICENSE'));
  const hits = [];
  for (const file of filteredFiles) {
    const text = await readFile(file, 'utf8');
    if (forbidden.test(text) || forbidden.test(file)) hits.push(file);
  }
  assert.deepEqual(hits, []);
});
