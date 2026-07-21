import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const fixture = new URL('./fixtures/revised-resume.json', import.meta.url);
const output = '/tmp/job-search-toolkit-revised-resume.pdf';
const templateOutput = '/tmp/job-search-toolkit-minimal-grid.pdf';
const renderer = fileURLToPath(new URL('scripts/render-resume.mjs', root));

test('renderer creates a revised-resume PDF with Chinese content', async () => {
  execFileSync('node', [renderer, fileURLToPath(fixture), output], { stdio: 'pipe' });
  await access(output);
  const info = execFileSync('pdfinfo', [output], { encoding: 'utf8' });
  assert.match(info, /Pages:\s+1/);
  try {
    const textPath = '/tmp/job-search-toolkit-revised-resume.txt';
    execFileSync('pdftotext', [output, textPath]);
    const text = await readFile(textPath, 'utf8');
    assert.match(text, /匿名示例候选人/);
    assert.match(text, /产品运营/);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const stat = await import('node:fs/promises').then(({ stat }) => stat(output));
    assert.ok(stat.size > 1000);
  }
});

test('renderer loads the requested template stylesheet instead of fixed default CSS', async () => {
  const templateFixture = JSON.parse(await readFile(fixture, 'utf8'));
  templateFixture.template = 'minimal-grid';
  const fixturePath = '/tmp/job-search-toolkit-minimal-grid.json';
  await import('node:fs/promises').then(({ writeFile }) => writeFile(fixturePath, JSON.stringify(templateFixture), 'utf8'));
  execFileSync('node', [renderer, fixturePath, templateOutput], { stdio: 'pipe' });
  const renderedHtml = await readFile(`${templateOutput}.html`, 'utf8');
  assert.match(renderedHtml, /data-template="minimal-grid"/);
  assert.match(renderedHtml, /#20242a/);
  assert.doesNotMatch(renderedHtml, /@page\{size:A4;margin:13mm\}/);
});

test('renderer rejects unknown template names with an actionable error', () => {
  const invalidFixture = '/tmp/job-search-toolkit-invalid-template.json';
  writeFileSync(invalidFixture, JSON.stringify({ id: 'revised-resume', template: 'does-not-exist' }));
  const result = spawnSync('node', [renderer, invalidFixture, '/tmp/job-search-toolkit-invalid-template.pdf'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /模板不存在/);
});

test('template directory contains the selectable HTML templates', async () => {
  const names = (await readdir(new URL('resume-rebuild-skill/templates/', root)))
    .filter((name) => name.endsWith('.html'));
  assert.ok(names.length >= 16, `expected at least 16 templates, found ${names.length}`);
  assert.ok(names.includes('minimal-grid.html'));
  assert.ok(names.includes('navy-executive.html'));
  assert.ok(names.includes('warm-editorial.html'));
});
