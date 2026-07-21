#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('用法：node scripts/render-resume.mjs revised-resume.json output.pdf');
  process.exit(2);
}

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const safeUrl = (value = '') => /^(https?:|mailto:)/i.test(String(value)) ? String(value) : '';
const data = JSON.parse(await readFile(resolve(inputArg), 'utf8'));
if (data.id !== 'revised-resume') throw new Error('输入必须是 revised-resume 数据');
const templateName = data.template || 'classic-ats';
if (!/^[a-z0-9-]+$/.test(templateName)) throw new Error(`模板不存在：${templateName}`);
const templatePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'resume-rebuild-skill', 'templates', `${templateName}.html`);
let templateSource;
try {
  templateSource = await readFile(templatePath, 'utf8');
} catch {
  throw new Error(`模板不存在：${templateName}。可选模板位于 resume-rebuild-skill/templates/`);
}
const styleMatch = templateSource.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
if (!styleMatch) throw new Error(`模板缺少 <style>：${templateName}`);
const templateStyles = styleMatch[1];
const contact = data.contact ?? {};
const contactItems = [contact.city, contact.email, contact.phone, contact.url].filter(Boolean).map((item) => {
  const url = safeUrl(item);
  return url ? `<a href="${escapeHtml(url)}">${escapeHtml(item)}</a>` : escapeHtml(item);
}).join(' · ');
const entries = (data.experience ?? []).map((item) => `<div class="entry"><div class="row"><span><span class="title">${escapeHtml(item.title)}</span> · <span class="org">${escapeHtml(item.company)}</span></span><span class="date">${escapeHtml(item.start)} — ${escapeHtml(item.end)}</span></div><ul>${(item.bullets ?? []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul></div>`).join('');
const projects = (data.projects ?? []).map((item) => `<div class="entry"><div class="row"><span class="title">${escapeHtml(item.name)}</span><span class="date">${escapeHtml(item.period || '')}</span></div><p>${escapeHtml(item.description || '')}</p></div>`).join('');
const education = (data.education ?? []).map((item) => `<div class="entry"><div class="row"><span><span class="title">${escapeHtml(item.degree)}</span> · <span class="org">${escapeHtml(item.school)}</span></span><span class="date">${escapeHtml(item.end)}</span></div></div>`).join('');
const skills = (data.skills ?? []).map((item) => `<div class="skills-row">${escapeHtml(item)}</div>`).join('');
const html = `<!doctype html><html lang="zh-CN" data-template="${escapeHtml(templateName)}"><head><meta charset="utf-8"><title>${escapeHtml(data.name || '修订简历')}</title><style>${templateStyles}</style></head><body><div class="page"><header><div><h1>${escapeHtml(data.name || '修订简历')}</h1><div class="headline">${escapeHtml(data.headline || '')}</div></div><div class="contact">${contactItems}</div></header>${data.summary ? `<section><h2>个人概述</h2><p class="summary">${escapeHtml(data.summary)}</p></section>` : ''}${entries ? `<section><h2>工作经历</h2>${entries}</section>` : ''}${projects ? `<section><h2>项目经历</h2>${projects}</section>` : ''}${education ? `<section><h2>教育经历</h2>${education}</section>` : ''}${skills ? `<section><h2>技能</h2><div class="skills">${skills}</div></section>` : ''}</div></body></html>`;
const htmlPath = `${resolve(outputArg)}.html`;
await mkdir(dirname(resolve(outputArg)), { recursive: true });
await writeFile(htmlPath, html, 'utf8');
const chromeCandidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', 'google-chrome', 'chromium'];
const chrome = chromeCandidates.find((candidate) => candidate.includes('/') ? spawnSync('test', ['-x', candidate]).status === 0 : spawnSync('which', [candidate]).status === 0);
if (!chrome) throw new Error('未找到 Chrome/Chromium，无法生成 PDF');
const result = spawnSync(chrome, ['--headless', '--disable-gpu', '--no-sandbox', `--print-to-pdf=${resolve(outputArg)}`, `file://${htmlPath}`], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr || 'Chrome PDF 渲染失败');
console.log(resolve(outputArg));
