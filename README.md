# Job Search Strategy Toolkit

面向中文求职者的 JD 导向简历工具 Skill。适合运营、产品、数据分析、市场营销、财务、审计、HR、销售/BD、开发/工程师、法务、战略咨询和设计等岗位。

## 功能

- **JD 解读**：拆解岗位职责、业务目标、硬性门槛、隐含要求、风险与投递建议。
- **简历深挖**：逐条补全经历中的业务问题、个人动作、方法、规模和结果；不猜测、不夸大。
- **简历修改润色**：支持通用修改润色，或根据具体 JD 定制简历。
- **双视角评审**：分别从 HR 招聘筛选和部门负责人角度评估简历，结果在对话中输出。
- **PDF 输出**：仅将用户确认后的修订简历生成 PDF；JD 解读和评审结果不写入 PDF。
- **照片兼容**：原简历有照片时保留原照片并使用带照片模板；没有照片时自动使用无照片模板。

## 使用方式

1. 提供 JD、简历，或两者同时提供。
2. 只有简历时，选择“通用修改润色”或“根据 JD 定制”。
3. 确认事实和改写内容后，再导出修订版简历 PDF。

## 下载与安装

### 方式一：通过 Codex 安装

在 Codex 中打开技能安装入口，输入 GitHub 仓库地址：

```text
https://github.com/Butteredryetoast/jobsearch-toolkit-skill
```

安装完成后，重启或刷新 Codex。在对话中直接说“帮我解读这份 JD”或“帮我修改简历”即可触发。

### 方式二：手动下载

下载 ZIP：打开仓库主页，点击 **Code → Download ZIP**，解压后将仓库根目录直接放入 Codex 的 skills 目录。根目录中应能看到 `SKILL.md`。

也可以使用 Git：

```bash
git clone https://github.com/Butteredryetoast/jobsearch-toolkit-skill.git
```

如果只需要安装到本机技能目录，可复制整个目录：

```bash
cp -R jobsearch-toolkit-skill /你的/Codex/skills目录/job-search-strategy-toolkit
```

## 使用教程

### 1. 只有 JD

直接粘贴 JD，并说明“只做 JD 解读”。工具会输出岗位职责、业务目标、硬性门槛、隐含要求、风险和投递建议，不会生成 PDF。

### 2. 只有简历

上传或粘贴简历后，工具会先询问：

```text
你这次更需要通用修改润色，还是根据具体JD定制简历？
```

选择“通用修改润色”即可进行简历深挖、结构调整和语言优化；选择“根据具体 JD 定制”时，再补充目标 JD。

### 3. JD + 简历

同时提供 JD 和简历，可直接要求“根据这份 JD 定制我的简历”。工具会先建立岗位要求与简历证据的对应关系，再改写已确认的经历，不会虚构数字、职责或成果。

### 4. 简历评审

说“请从 HR 和部门负责人两个视角评审这份简历”。两种视角会分别给出匹配度、证据强度、风险和修改建议，结果只在对话中输出。

### 5. 导出 PDF

确认最终修改内容后，先选择模板，再说“使用 minimal-grid 生成修订版简历 PDF”。PDF 会读取对应模板文件，只包含修订后的简历，不包含 JD 解读、评审结果或其他分析内容。

## 设计原则

- 中文优先，适合中国互联网及其他行业求职场景。
- 支持多岗位、多企业类型参考库。
- 只使用用户提供或明确标注来源的信息。
- 不保存个人简历、JD 或求职记录。

## 目录

```text
jobsearch-toolkit-skill/           # 下载后即为 Skill 根目录
├── SKILL.md
├── jd-insight-skill/
├── resume-rebuild-skill/
├── resume-review-skill/
├── references/
└── scripts/render-resume.mjs
```

当前提供 16 套简历模板，新增模板包括：

- `minimal-grid.html`：ATS 极简网格，适合大多数岗位投递
- `navy-executive.html`：深蓝商务风，适合管理、客户和综合岗位
- `warm-editorial.html`：暖色编辑风，适合市场、品牌、内容和设计岗位
