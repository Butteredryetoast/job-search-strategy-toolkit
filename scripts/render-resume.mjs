#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
const templateNames = new Map([
  ['经典ATS', 'classic-ats'],
  ['学术工程', 'ledger'],
  ['技术紧凑', 'tech-compact'],
  ['现代侧栏', 'modern-sidebar'],
  ['信息卡片', 'pillar'],
  ['优雅衬线', 'elegant-serif'],
  ['极简留白', 'atelier'],
  ['职业时间轴', 'timeline'],
  ['瑞士栅格', 'swiss'],
  ['商务管理', 'executive'],
  ['杂志编辑', 'editorial-banner'],
  ['商务头像', 'photo-corporate'],
  ['极简头像', 'photo-minimal'],
  ['极简网格', 'minimal-grid'],
  ['深蓝商务', 'navy-executive'],
  ['暖色编辑', 'warm-editorial'],
]);
const requestedTemplateLabel = String(data.template || '经典ATS');
const requestedTemplate = templateNames.get(requestedTemplateLabel) || requestedTemplateLabel;
if (!/^[a-z0-9-]+$/.test(requestedTemplate)) throw new Error(`模板不存在：${requestedTemplate}`);
const photoTemplates = new Set(['photo-corporate', 'photo-minimal']);
const photoValue = data.photo ?? data.contact?.photo ?? '';
const hasPhoto = Boolean(photoValue);
const templateName = hasPhoto && !photoTemplates.has(requestedTemplate)
  ? 'photo-corporate'
  : !hasPhoto && photoTemplates.has(requestedTemplate) ? 'classic-ats' : requestedTemplate;
const templatePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'resume-rebuild-skill', 'templates', `${templateName}.html`);
let templateSource;
try {
  templateSource = await readFile(templatePath, 'utf8');
} catch {
  throw new Error(`模板不存在：${templateName}。可选模板位于 resume-rebuild-skill/templates/`);
}
const styleSource = templateSource.replace(/<!--[\s\S]*?-->/g, '');
const styleMatches = [...styleSource.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
const styleMatch = styleMatches.find((match) => /@page|body\s*\{/i.test(match[1]));
if (!styleMatch) throw new Error(`模板缺少 <style>：${templateName}`);
const templateStyles = styleMatch[1];
const photoSource = (value) => {
  const source = String(value);
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(source) || /^https?:\/\//i.test(source)) return source;
  if (source.startsWith('/')) return pathToFileURL(source).href;
  throw new Error('照片格式无法读取：请使用图片 URL、data:image 数据或本地绝对路径');
};
const photoMarkup = hasPhoto ? `<img src="${escapeHtml(photoSource(photoValue))}" alt="人物照片">` : '';
const contact = data.contact ?? {};
const contactItems = [contact.city, contact.email, contact.phone, contact.url].filter(Boolean).map((item) => {
  const url = safeUrl(item);
  return url ? `<a href="${escapeHtml(url)}">${escapeHtml(item)}</a>` : escapeHtml(item);
}).join(' · ');
const entries = (data.experience ?? []).map((item) => `<div class="entry"><div class="row"><span><span class="title">${escapeHtml(item.title)}</span> · <span class="org">${escapeHtml(item.company)}</span></span><span class="date">${escapeHtml(item.start)} — ${escapeHtml(item.end)}</span></div><ul>${(item.bullets ?? []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul></div>`).join('');
const projects = (data.projects ?? []).map((item) => `<div class="entry"><div class="row"><span class="title">${escapeHtml(item.name)}</span><span class="date">${escapeHtml(item.period || '')}</span></div><p>${escapeHtml(item.description || '')}</p></div>`).join('');
const education = (data.education ?? []).map((item) => `<div class="entry"><div class="row"><span><span class="title">${escapeHtml(item.degree)}</span> · <span class="org">${escapeHtml(item.school)}</span></span><span class="date">${escapeHtml(item.end)}</span></div></div>`).join('');
const skills = (data.skills ?? []).map((item) => `<div class="skills-row">${escapeHtml(item)}</div>`).join('');
const summary = data.summary ? `<section class="about"><h2>个人概述</h2><p>${escapeHtml(data.summary)}</p></section>` : '';
const corporateExperience = (data.experience ?? []).map((item) => `<div class="exp-item"><div class="top"><div class="role">${escapeHtml(item.title)}</div><div class="when">${escapeHtml(item.start)} — ${escapeHtml(item.end)}</div></div><div class="org">${escapeHtml(item.company)}</div><ul>${(item.bullets ?? []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul></div>`).join('');
const minimalExperience = (data.experience ?? []).map((item) => `<div class="job"><div class="top"><div class="role">${escapeHtml(item.title)}</div><div class="when">${escapeHtml(item.start)} — ${escapeHtml(item.end)}</div></div><div class="org">${escapeHtml(item.company)}</div><p>${(item.bullets ?? []).map((bullet) => escapeHtml(bullet)).join(' ')}</p></div>`).join('');
const corporateSkills = (data.skills ?? []).map((item) => `<div class="skill-row"><span>${escapeHtml(item)}</span><span class="bar"></span></div>`).join('');
const minimalSkills = (data.skills ?? []).map((item) => `<div class="skill"><div class="lbl">${escapeHtml(item)}</div><div class="track"></div></div>`).join('');
const photoPage = templateName === 'photo-corporate'
  ? `<div class="page"><div class="photo">${photoMarkup}</div><div class="banner"><h1>${escapeHtml(data.name || '修订简历')}</h1><div class="title">${escapeHtml(data.headline || '')}</div></div><div class="body"><aside>${summary}${education ? `<section><h2>教育经历</h2>${education}</section>` : ''}${corporateSkills ? `<section><h2>技能</h2>${corporateSkills}</section>` : ''}</aside><main><div class="contact">${contactItems}</div>${corporateExperience ? `<section><h2>工作经历</h2><div class="timeline">${corporateExperience}</div></section>` : ''}${projects ? `<section><h2>项目经历</h2>${projects}</section>` : ''}</main></div></div>`
  : `<div class="page"><div class="top"><div class="contacts"><div class="row"><span class="ic">☎</span>${escapeHtml(contact.phone || '')}</div><div class="row"><span class="ic">✉</span>${escapeHtml(contact.email || '')}</div><div class="row"><span class="ic">◎</span>${escapeHtml(contact.city || '')}</div></div><div class="nameblock"><h1>${escapeHtml(data.name || '修订简历')}</h1><div class="sub">${escapeHtml(data.headline || '')}</div></div></div><div class="body"><aside><div class="photo">${photoMarkup}</div>${minimalSkills ? `<section><h2>技能</h2>${minimalSkills}</section>` : ''}</aside><main>${summary}${minimalExperience ? `<section><h2>工作经历</h2>${minimalExperience}</section>` : ''}${projects ? `<section><h2>项目经历</h2>${projects}</section>` : ''}${education ? `<section><h2>教育经历</h2>${education}</section>` : ''}</main></div></div>`;
const standardPage = `<div class="page"><header><div><h1>${escapeHtml(data.name || '修订简历')}</h1><div class="headline">${escapeHtml(data.headline || '')}</div></div><div class="contact">${contactItems}</div></header>${data.summary ? `<section><h2>个人概述</h2><p class="summary">${escapeHtml(data.summary)}</p></section>` : ''}${entries ? `<section><h2>工作经历</h2>${entries}</section>` : ''}${projects ? `<section><h2>项目经历</h2>${projects}</section>` : ''}${education ? `<section><h2>教育经历</h2>${education}</section>` : ''}${skills ? `<section><h2>技能</h2><div class="skills">${skills}</div></section>` : ''}</div>`;
const html = `<!doctype html><html lang="zh-CN" data-template="${escapeHtml(templateName)}" data-template-requested="${escapeHtml(requestedTemplate)}"><head><meta charset="utf-8"><title>${escapeHtml(data.name || '修订简历')}</title><style>${templateStyles}</style></head><body>${photoTemplates.has(templateName) ? photoPage : standardPage}</body></html>`;
const htmlPath = `${resolve(outputArg)}.html`;
await mkdir(dirname(resolve(outputArg)), { recursive: true });
await writeFile(htmlPath, html, 'utf8');
const chromeCandidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', 'google-chrome', 'chromium'];
const chrome = chromeCandidates.find((candidate) => candidate.includes('/') ? spawnSync('test', ['-x', candidate]).status === 0 : spawnSync('which', [candidate]).status === 0);
if (!chrome) throw new Error('未找到 Chrome/Chromium，无法生成 PDF');
const result = spawnSync(chrome, ['--headless', '--disable-gpu', '--no-sandbox', `--print-to-pdf=${resolve(outputArg)}`, `file://${htmlPath}`], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr || 'Chrome PDF 渲染失败');
console.log(resolve(outputArg));
