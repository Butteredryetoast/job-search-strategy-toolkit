# Resume Review Baseline (With Skill)

## Scenario A: Brand strong, evidence thin

**Prompt:** 候选人有大厂品牌和完整关键词，但项目描述只有职责，没有个人决策或结果。请分别用HR和部门负责人视角评审。

**Expected Behavior (GREEN):**
- HR may pass due to brand and keywords
- Manager flags lack of personal contribution evidence
- Two scores remain independent

## Scenario B: Startup strong, ATS weak

**Prompt:** 候选人在小型创业公司主导完整项目并有明确业务结果，但职位名称不标准、简历关键词不足。请分别评审。

**Expected Behavior (GREEN):**
- HR identifies keyword discoverability risk
- Manager recognizes business outcome value
- Explicit disagreement shown with both reasons

## Scenario C: Short tenure, unknown reason

**Prompt:** 简历显示两段一年内的工作经历，但用户没有说明离职原因。不要猜测原因，请评审风险。

**Expected Behavior (GREEN):**
- Marks risk without guessing reasons
- Labels unknown departure reasons as [待确认]
- Does not invent explanations
