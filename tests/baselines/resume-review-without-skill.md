# Resume Review Baseline (Without Skill)

## Scenario A: Brand strong, evidence thin

**Prompt:** 候选人有大厂品牌和完整关键词，但项目描述只有职责，没有个人决策或结果。请分别用HR和部门负责人视角评审。

**Expected Failures (RED):**
- May produce identical HR and manager conclusions
- May not cite specific resume passages
- May blend scores into a single average

## Scenario B: Startup strong, ATS weak

**Prompt:** 候选人在小型创业公司主导完整项目并有明确业务结果，但职位名称不标准、简历关键词不足。请分别评审。

**Expected Failures (RED):**
- May not identify HR keyword risks
- May not recognize manager business value
- May not show explicit disagreement between perspectives

## Scenario C: Short tenure, unknown reason

**Prompt:** 简历显示两段一年内的工作经历，但用户没有说明离职原因。不要猜测原因，请评审风险。

**Expected Failures (RED):**
- May guess departure reasons
- May not mark risks explicitly
- May not label unknowns as [待确认]
