# Revised Task 3 Report — 最终顶层路由与共用证据规则

## 范围

- 用最终中文优先的顶层路由替换上游 Offer/BQ 路由。
- 新建真实性、证据等级、职业阶段三个共用参考。
- 保留既有 metadata、安全、角色/企业目录测试；将 metadata 断言同步到 Task 2 已写入的无面试描述。
- 未修改任何子 Skill 的业务正文。

## RED（先改测试）

命令：

```bash
node --test --test-name-pattern='top-level router|common references|top-level skill declares' tests/test-foundation.mjs
```

关键输出：

```text
tests 5
pass 0
fail 5
```

失败直接证明复制的上游顶层内容仍使用旧 description、`job-description-skill` / `resume-skill` / `bq-skill` 路由、旧问题与旧 HTML/面试输出，且没有 common references。

## GREEN（实现后）

命令：

```bash
node --test --test-name-pattern='agent metadata|top-level router|common references|top-level skill declares' tests/test-foundation.mjs
```

关键输出：

```text
tests 6
pass 6
fail 0
```

## 文件清单

- 修改 `job-search-strategy-toolkit/SKILL.md`
  - `Use when...` frontmatter；仅覆盖 JD、简历重写/定制、HR 与部门负责人双视角评审。
  - 仅保留三个子 Skill 路由；明确五种输入路由、一次一问、精确的简历目标问题、chat-only 与 PDF 边界。
- 新建 `job-search-strategy-toolkit/references/common/authenticity.md`
- 新建 `job-search-strategy-toolkit/references/common/evidence-levels.md`
- 新建 `job-search-strategy-toolkit/references/common/career-stage.md`
- 修改 `tests/test-foundation.mjs`
  - 保留 metadata、安全与目录计数测试。
  - 为最终顶层路由、共用证据规则、chat-only/PDF 边界与无旧 BQ 子路由增加断言。
  - 将 metadata 的短描述断言与 Task 2 已创建的 `简历PDF工具箱` 值对齐，移除已废弃的“面试准备”预期。

## 自审

- 顶层有且仅有三个 child-SKILL Markdown 链接：`jd-insight-skill`、`resume-rebuild-skill`、`resume-review-skill`。
- 顶层没有旧 `bq-skill`、`BQ`、`Story Bank`、`Offer Strategy` 或英文 `interview` 路由；唯一“面试”出现是明确的不支持边界。
- 三个 common references 均由顶层直接链接；证据标签与优先级完整；真实性与职业阶段规则禁止虚构和人口统计评分。
- `git diff --check` 无输出。
- 子 Skill 正文未改动，留给后续任务处理。

## 全量 foundation 测试（Task 4 预期失败）

命令：

```bash
node --test tests/test-foundation.mjs
```

关键输出：

```text
tests 8
pass 7
fail 1
```

唯一失败：`shared references cover 12 roles and 6 company types`。原因是 `references/roles/` 与 `references/companies/` 尚不存在；这正是 Task 4 的职责。没有其他失败。
