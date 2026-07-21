---
name: resume-review-skill
description: "从HR招聘筛选和部门负责人角度独立评分并评审中文简历。"
---

# Resume Review Skill

## 双视角评审流程

1. 读取简历、目标岗位、可用JD、岗位规则和企业类型规则。
2. 先独立完成HR评审，再独立完成部门负责人评审。
3. 两次评审不得先共享结论或合并分数。
4. 两次评审完成后才运行综合层。
5. 将"双视角简历评审"提供给PDF章节选择流程。

## HR评审

使用 [frameworks/hr-rubric.md](frameworks/hr-rubric.md) 进行独立评分。

## 部门负责人评审

使用 [frameworks/hiring-manager-rubric.md](frameworks/hiring-manager-rubric.md) 进行独立评分。

## 综合层

使用 [prompts/synthesize-review.md](prompts/synthesize-review.md) 汇总两次评审结果，生成最终报告。
