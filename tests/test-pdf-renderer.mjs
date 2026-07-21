import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const fixture = new URL('./fixtures/revised-resume.json', import.meta.url);
const output = '/tmp/job-search-toolkit-revised-resume.pdf';

test('renderer creates a revised-resume PDF with Chinese content', async () => {
  execFileSync('node', [fileURLToPath(new URL('scripts/render-resume.mjs', root)), fileURLToPath(fixture), output], { stdio: 'pipe' });
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
