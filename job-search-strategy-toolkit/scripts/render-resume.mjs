#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

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
const contact = data.contact ?? {};
const contactItems = [contact.city, contact.email, contact.phone, contact.url].filter(Boolean).map((item) => {
  const url = safeUrl(item);
  return url ? `<a href="${escapeHtml(url)}">${escapeHtml(item)}</a>` : escapeHtml(item);
}).join(' · ');
const entries = (data.experience ?? []).map((item) => `<article><div class="row"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.company)} · ${escapeHtml(item.start)}–${escapeHtml(item.end)}</span></div><ul>${(item.bullets ?? []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul></article>`).join('');
const education = (data.education ?? []).map((item) => `<article><div class="row"><strong>${escapeHtml(item.degree)}</strong><span>${escapeHtml(item.school)} · ${escapeHtml(item.end)}</span></div></article>`).join('');
const skills = (data.skills ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeHtml(data.name || '修订简历')}</title><style>@page{size:A4;margin:13mm}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",Arial,sans-serif;color:#17202a;font-size:10.5pt;line-height:1.45;margin:0}h1{font-size:24pt;margin:0 0 2pt}h2{font-size:11pt;letter-spacing:.12em;border-bottom:1px solid #9aa4ad;padding-bottom:3pt;margin:14pt 0 7pt}.headline{font-size:12pt;color:#405466}.contact{font-size:9pt;color:#536575;margin-top:5pt}.contact a{color:inherit;text-decoration:none}.row{display:flex;justify-content:space-between;gap:12pt}.row span{color:#536575;white-space:nowrap}article{margin-bottom:8pt}ul{margin:3pt 0 0;padding-left:16pt}li{margin:1pt 0}.summary{margin:0}.pending{color:#9b5c00}</style></head><body><header><h1>${escapeHtml(data.name || '修订简历')}</h1><div class="headline">${escapeHtml(data.headline || '')}</div><div class="contact">${contactItems}</div></header>${data.summary ? `<section><h2>个人概述</h2><p class="summary">${escapeHtml(data.summary)}</p></section>` : ''}${entries ? `<section><h2>工作经历</h2>${entries}</section>` : ''}${data.projects?.length ? `<section><h2>项目经历</h2>${data.projects.map((item) => `<article><div class="row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.period || '')}</span></div><p>${escapeHtml(item.description || '')}</p></article>`).join('')}</section>` : ''}${education ? `<section><h2>教育经历</h2>${education}</section>` : ''}${skills ? `<section><h2>技能</h2><ul>${skills}</ul></section>` : ''}</body></html>`;
const htmlPath = `${resolve(outputArg)}.html`;
await mkdir(dirname(resolve(outputArg)), { recursive: true });
await writeFile(htmlPath, html, 'utf8');
const chromeCandidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', 'google-chrome', 'chromium'];
const chrome = chromeCandidates.find((candidate) => candidate.includes('/') ? spawnSync('test', ['-x', candidate]).status === 0 : spawnSync('which', [candidate]).status === 0);
if (!chrome) throw new Error('未找到 Chrome/Chromium，无法生成 PDF');
const result = spawnSync(chrome, ['--headless', '--disable-gpu', '--no-sandbox', `--print-to-pdf=${resolve(outputArg)}`, `file://${htmlPath}`], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr || 'Chrome PDF 渲染失败');
console.log(resolve(outputArg));
