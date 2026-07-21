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
5. 将双视角评审结果只在当前对话中输出，不写入简历 PDF。

## HR评审

使用 [frameworks/hr-rubric.md](frameworks/hr-rubric.md) 进行独立评分。

## 部门负责人评审

使用 [frameworks/hiring-manager-rubric.md](frameworks/hiring-manager-rubric.md) 进行独立评分。

## 综合层

综合两次结果，输出 HR 分数、部门负责人分数、共同优点、共同风险、分歧和 3–5 条优先修改建议。每条判断引用简历、JD 或用户确认事实；缺失信息标记 `[待确认]`。
