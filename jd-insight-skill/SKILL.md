---
name: jd-insight-skill
description: "Use when a Chinese-speaking job seeker provides a JD and wants a structured understanding of the role, requirements, evidence gaps, application decision, or resume tailoring direction."
---

# JD 解读 Skill

把招聘话术翻译成求职者可以行动的岗位情报。默认只在当前聊天中输出，不生成 HTML/PDF，不保存 JD，不维护个人 JD 库。

## 一、输入检查

### JD 来源优先级

1. 用户粘贴的 JD 正文：最高优先级。
2. 用户提供的公开链接：尝试读取；读取失败时要求粘贴正文。
3. 用户对岗位的转述：可以先做初步分析，但必须明确哪些内容是用户转述、哪些内容仍待确认。

不要根据公司名称、职位名称或网络常识补齐 JD 中没有的职责、薪资、团队规模或企业内部信息。

### 首轮必要确认

- JD 已有公司、岗位和城市：直接解读，不重复询问。
- JD 未写岗位级别：标记“级别未注明”，根据职责范围给出 `[合理推断]`，不要为了填字段阻断解读。
- 用户要求匹配或定制，但没有简历：只问是否上传简历；不要先输出个人匹配分数。
- 用户只要求“解读 JD”：不索取简历，不把个人情况假设成事实。

## 二、五层解码流程

先完成五层解读，再做任何个人匹配或简历改写。

### 第 1 层：招聘经理真正要解决的问题

把“负责某模块/推动某项目”改写为业务问题：

- 当前业务处于增长、转型、补位、降本、提效还是风险控制阶段？
- 这个岗位接手什么存量问题？
- 入职后最可能被要求交付什么结果？

每个判断标记证据来源。没有直接证据时使用 `[合理推断]`，并写出推断依据。

### 第 2 层：硬性门槛与优先级

将 JD 拆成四类：

| 类别 | 识别方式 | 输出方式 |
|---|---|---|
| Must-have | 明确写“必须/要求/至少”或职责不可替代 | 逐条列出，标注是否有证据 |
| Core responsibility | 高频动作、交付对象、协作对象 | 说明优先级和验收结果 |
| Nice-to-have | “优先/加分/有经验者优先” | 作为加分项，不当作阻断项 |
| Constraint | 城市、出差、语言、年限、学历、行业限制 | 单列风险，不被综合分掩盖 |

### 第 3 层：业务目标与指标

把职责映射为可验证指标类别，例如：

- 运营：用户增长、转化、留存、活跃、收入、成本
- 产品：采用率、转化率、交付周期、活跃、工单、版本效果
- 数据：准确率、覆盖率、时效、决策采纳、成本和自动化程度
- 研发：稳定性、延迟、吞吐、交付周期、缺陷、成本
- 市场/销售：线索、管道、获客成本、成交、复购、回款

只能输出“JD 暗示需要关注的指标”，不能把指标写成候选人已经达成的结果。

### 第 4 层：隐含能力与筛选信号

从动词、对象、范围和协作关系中识别：

- 独立负责还是协作支持
- 从 0 到 1 还是持续优化
- 面向用户、业务、管理层还是技术团队
- 需要策略、执行、分析、项目推进还是资源协调
- 岗位是个人贡献者、项目负责人还是管理者

参考 [frameworks/decode-patterns.md](frameworks/decode-patterns.md)，但不把参考库内容当成这家公司已确认事实。

### 第 5 层：岗位级别、风险与投递建议

结合职责复杂度、影响范围、决策权和经验要求推断级别。输出：

- 级别：明确 / 未注明 / `[合理推断]`
- 主要风险：硬门槛、范围不匹配、信息不足、企业类型差异
- 适合谁投：符合哪些证据的人
- 不适合谁投：哪些阻断项无法短期补齐
- 下一步：补齐 JD、补充简历证据或直接进入定制

## 三、匹配与定制路径

只有用户提供简历或完整自述后才进入此路径。

### 要求—证据矩阵

| JD 要求 | 简历证据 | 证据等级 | 强度 | 缺口/动作 |
|---|---|---|---|---|
| 具体职责或 Must-have | 原文经历/项目/结果 | 用户确认/待确认 | 强/中/弱/无 | 补问、重排或保留缺口 |

匹配评分参考 [frameworks/match-rubric.md](frameworks/match-rubric.md)。评分只是辅助，不得让综合分掩盖硬性阻断项。

### 公司与行业背景

需要背景信息时读取 [prompts/research-company.md](prompts/research-company.md)：

- 优先使用公开来源并提供链接和检索日期。
- 将来源事实、用户信息和合理推断分开。
- 查不到就写“证据不足”，不以行业印象代替来源。
- 企业类型参考只用于提出验证问题。

### 简历定制

读取 [frameworks/resume-tailoring.md](frameworks/resume-tailoring.md) 和 [prompts/resume-tailor.md](prompts/resume-tailor.md)：

- 只重排、删减、翻译或改写已确认事实。
- 用 JD 关键词增强可检索性，但不生硬堆词。
- 每条改写说明对应的 JD 要求和原始证据。
- 缺口写成 `[待确认]` 或“当前简历未体现”，不补造经历。

## 四、聊天输出模板

### 只解读 JD

1. 一句话结论
2. 岗位核心职责与业务目标
3. Must-have / Nice-to-have / 约束
4. 隐含能力与岗位级别
5. 风险和信息缺口
6. 投递建议与下一步

### JD + 简历匹配

1. 岗位结论
2. 匹配度与评分拆解
3. 要求—证据矩阵
4. 硬性阻断项
5. 证据缺口和一问一答补全
6. 简历定制方向

所有结论都在对话中输出。除非用户明确进入简历重建流程，不生成 PDF。

## References

- [prompts/jd-decoder.md](prompts/jd-decoder.md)
- [prompts/match-score.md](prompts/match-score.md)
- [prompts/research-company.md](prompts/research-company.md)
- [prompts/resume-tailor.md](prompts/resume-tailor.md)
- [prompts/should-i-apply.md](prompts/should-i-apply.md)
- [frameworks/decode-patterns.md](frameworks/decode-patterns.md)
- [frameworks/go-no-go.md](frameworks/go-no-go.md)
- [frameworks/match-rubric.md](frameworks/match-rubric.md)
- [frameworks/resume-tailoring.md](frameworks/resume-tailoring.md)
