---
name: jd-insight-skill
description: Use when a Chinese-speaking job seeker provides a JD and wants to understand the role, requirements, evidence gaps, application decision, or resume tailoring direction.
---

# JD Insight

## Core contract

默认使用简体中文。JD 解读只在对话中输出，不生成 HTML/PDF，不保存 JD。不得编造公司、岗位、薪资或候选人事实。

## Workflow

1. 读取 JD 原文；若只有链接且无法读取，要求用户粘贴正文。
2. 先完成五层解读：职责与门槛、业务目标与指标、隐含能力、约束与风险、投递建议与下一步。
3. 仅当用户要求个人匹配或简历定制时，才索取简历；已有简历直接使用。
4. 匹配时使用 `frameworks/match-rubric.md`，每条结论引用 JD 或简历证据，并标注 `[用户确认]`、`[公开来源]`、`[合理推断]`、`[待确认]`。
5. 需要公司/行业背景时，提供来源链接和检索日期；没有来源就明确写证据不足。

## Output

输出结构：岗位核心结论、硬性要求、隐含要求、证据矩阵、风险与缺口、投递建议、简历定制方向。只在当前对话中输出，不写本地报告、不维护资料库。

## References

- [prompts/jd-decoder.md](prompts/jd-decoder.md)
- [prompts/match-score.md](prompts/match-score.md)
- [prompts/research-company.md](prompts/research-company.md)
- [frameworks/decode-patterns.md](frameworks/decode-patterns.md)
- [frameworks/match-rubric.md](frameworks/match-rubric.md)
- [frameworks/resume-tailoring.md](frameworks/resume-tailoring.md)
