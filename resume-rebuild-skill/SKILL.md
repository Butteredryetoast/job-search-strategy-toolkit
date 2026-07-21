---
name: resume-rebuild-skill
description: "Use when a Chinese-speaking job seeker provides a resume and needs parsing, evidence mining, general polishing, or tailoring to a specific JD."
---

# 简历重建与定制 Skill

把已有简历、公开履历或用户自述整理成可确认的 `resume-data`，再进行通用润色、JD 定制和模板渲染。美化只是最后一步；内容证据、岗位相关性和事实准确性优先。

## 一、三条硬规则

1. **绝不杜撰**：公司、职位、时间、职责、数字、工具、项目结果和管理范围都必须来自用户材料或用户确认。
2. **一次只问一个问题**：每次只补一个能改变改写结果的事实；用户不确定时保留 `[待确认]`。
3. **先结构化再渲染**：未完成 `resume-data` 确认前，不套模板、不导出 PDF。

## 二、入口判断

| 用户输入 | 进入流程 |
|---|---|
| 上传 PDF、Word、图片或粘贴已有简历 | 解析与通用润色 / JD 定制 |
| 说“帮我改得更专业/更好看” | `general_polish` |
| 说“根据这个 JD 改简历” | `jd_tailor`，读取 JD 解读结果或先走 JD Skill |
| 提供 LinkedIn 链接或履历文本 | LinkedIn 导入降级流程 |
| 没有简历，想从零建立 | 对话式采集，按结构化字段逐步完成 |
| 只有简历且目标不明确 | 只问：`你这次更需要通用修改润色，还是根据具体JD定制简历？` |
| 只想换版式 | 直接使用已有 `resume-data` 重新渲染，不改内容 |

如果用户同时提供 JD 和简历，先读取 JD Skill 的岗位解码，再进入 `jd_tailor`；不得跳过 JD 证据拆解直接凭感觉改写。

## 三、解析与结构化

### 1. 先完整读取

按原顺序读取：姓名/联系方式、目标定位、概述、工作经历、项目、教育、技能、证书、作品链接。不要只摘取看起来“厉害”的部分。

### 2. 转换为标准字段

使用 [schema/resume-data.md](schema/resume-data.md) 作为唯一中间格式。字段缺失标 `[缺失]`；无法确认的数字标 `[待确认]`。回显结构化结果，让用户确认后再改写。

### 3. 诊断维度

对每段经历检查：

- 是否说明业务背景或问题
- 是否清楚区分个人动作与团队动作
- 是否有方法、工具、规模和结果
- 是否能对应目标岗位关键词
- 是否存在职责堆砌、空泛形容、重复表达或时间线冲突
- 是否把结果写成无来源的数字
- 是否适合 ATS 读取：标题清楚、时间统一、关键词自然出现

诊断只说明问题和影响，不在用户确认前擅自改写事实。

## 四、经历深挖协议

读取 [prompts/experience-mining.md](prompts/experience-mining.md)，一次只问一个问题，按以下顺序推进：

1. 业务问题：当时为什么做？
2. 个人动作：你具体做了什么？
3. 方法与工具：如何分析、设计、推进或交付？
4. 规模：涉及多少用户、项目、团队、预算、渠道或数据？
5. 结果：有什么已确认的变化？统计周期是什么？
6. 关键约束：资源、时间、合规、技术或协作限制是什么？

如果用户回答“记不清”，不要继续追问同一问题的多个变体；先用已有证据完成保守版，并标 `[待确认]`。

## 五、通用润色流程（general_polish）

1. 解析并回显 `resume-data`。
2. 输出诊断：结构、相关性、证据、表达、ATS 和长度。
3. 选择最弱且最影响结果的一条经历，开始一问一答补证据。
4. 使用动作 + 方法 + 结果重写 bullet；保留用户原意和事实边界。
5. 输出修改前/修改后/修改理由/待确认项四列对照。
6. 用户确认后继续下一条；不要一次重写整份简历并要求用户盲目接受。
7. 完成后按目标岗位和职业阶段重新排序、去重、压缩和校对。

## 六、JD 定制流程（jd_tailor）

1. 读取 JD 解码结果：核心职责、Must-have、指标、隐含能力和约束。
2. 将每条 JD 要求映射到简历中的经历、项目、技能或缺口。
3. 使用 [prompts/resume-tailor.md](prompts/resume-tailor.md) 和 [frameworks/resume-tailoring.md](frameworks/resume-tailoring.md)。
4. 优先调整顺序和标题，再改写已有 bullet；不为了关键词添加不存在的经历。
5. 对每条关键改写说明：对应 JD 要求、原始证据、改写变化和仍待确认的信息。
6. 输出“保留/前置/压缩/删除/补充证据”清单。
7. 用户确认事实后生成定制版 `resume-data`。

### 定制时的取舍

- JD 明确要求且简历已有证据：前置并使用 JD 同义关键词。
- JD 要求但简历没有证据：保留缺口，不暗示已具备。
- 简历有但与目标岗位弱相关：压缩，不必全部删除。
- 同一成果出现在多个经历：保留最有说服力的一处，避免重复。
- 数字、金额、比例、人数和时间：单独列出给用户确认。

## 七、模板与照片流程

当前有 16 套 HTML 模板，位于 `templates/`。选择原则：

- ATS/海投：`classic-ats`、`ledger`
- 工程/数据高密度：`tech-compact`
- 产品/市场/综合岗位：`modern-sidebar`、`pillar`、`executive`
- 设计/品牌/内容：`elegant-serif`、`atelier`、`timeline`、`swiss`、`editorial-banner`、`warm-editorial`
- 有人物照片：`photo-corporate` 或 `photo-minimal`
- 无人物照片：自动避开两套 Photo 模板

### 照片规则

- 从原简历保留 `photo` 字段；支持图片 URL、`data:image` 或本地绝对路径。
- 有照片但选择了无照片模板：自动切换到 `photo-corporate`，不丢弃照片。
- 无照片但选择了 Photo 模板：自动切换到 `classic-ats`。
- 正方形照片不拉伸，Photo 模板按头像框比例居中裁剪；原始图片不被改写。
- 不使用占位头像替代用户原照片。

## 八、渲染与 PDF 输出

### 渲染前检查

- 用户已确认姓名、联系方式、时间线和数字。
- 所有示例内容已替换或删除。
- 空板块整块删除。
- 一页优先：经验较少时控制在一页；内容过长先精简，不把字号缩到不可读。
- 电话、地址和照片是否适合公开发布已提醒用户确认。

### 实际渲染

将确认后的数据写成：

```json
{
  "id": "revised-resume",
  "template": "classic-ats",
  "photo": "可选的图片 URL、data:image 或本地绝对路径",
  "name": "用户姓名",
  "headline": "目标职位"
}
```

运行 `scripts/render-resume.mjs`。脚本会读取 `templates/<template>.html` 的真实样式，不使用固定默认 CSS，并输出 PDF。PDF 只包含修订简历，不包含 JD 解读、评审分数、诊断过程或修改说明。

## 九、输出格式

### 对话阶段

按以下顺序输出：

1. 当前目标与采用模式
2. 原简历诊断
3. 证据缺口和一次一个问题的补全
4. 修改前后对照
5. 事实待确认清单
6. 用户确认后的最终简历文本

### 完成阶段

- 给出修订版简历内容。
- 说明使用的模板和照片处理方式。
- 用户明确确认后才生成 PDF。
- 不生成与简历无关的额外报告文件。

## References

- [schema/resume-data.md](schema/resume-data.md)
- [prompts/experience-mining.md](prompts/experience-mining.md)
- [prompts/beautify.md](prompts/beautify.md)
- [prompts/editable-version.md](prompts/editable-version.md)
- [prompts/linkedin-import.md](prompts/linkedin-import.md)
- [prompts/resume-tailor.md](prompts/resume-tailor.md)
- [guides/writing-tips.md](guides/writing-tips.md)
- `templates/*.html`
