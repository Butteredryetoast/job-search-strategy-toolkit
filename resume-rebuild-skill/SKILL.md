---
name: resume-rebuild-skill
description: Use when a Chinese-speaking job seeker provides a resume and needs general polishing, evidence mining, or tailoring to a specific JD.
---

# Resume Rebuild

## 先确认目标

如果用户只有简历且目标不明确，只问：

> 你这次更需要通用修改润色，还是根据具体JD定制简历？

用户回答后进入对应流程，不重复索取已提供材料。

## 两种模式

- `general_polish`：清理信息、调整相关性顺序、逐条增强证据、改写 bullet、去重并控制长度。
- `jd_tailor`：读取 JD 解读结果，建立要求-证据矩阵，只重排和改写已确认事实，明确缺口。

## 证据深挖

每次只问一个问题，顺序为：业务问题 → 个人动作 → 方法/工具 → 规模 → 结果 → 关键约束。不得猜测数字；用户不知道时保留 `[待确认]`。不得把“参与”改成“主导”，不得升级职位、管理范围、工具或成果。

## 输出

先在对话中输出修改前后对照、修改理由和待确认项；用户确认后生成 `revised-resume`。生成 PDF 前让用户选择模板，写入 `template` 字段；有原简历照片时保留 `photo` 字段并自动使用带照片模板，没有照片时自动避开带照片模板。`scripts/render-resume.mjs` 会读取对应的 `templates/<template>.html`，不使用固定默认 CSS。PDF 只包含这份修订简历，不把 JD 解读或评审结果放入 PDF。

## References

- [schema/resume-data.md](schema/resume-data.md)
- [prompts/experience-mining.md](prompts/experience-mining.md)
- [prompts/beautify.md](prompts/beautify.md)
- [prompts/resume-tailor.md](prompts/resume-tailor.md)
- [guides/writing-tips.md](guides/writing-tips.md)
