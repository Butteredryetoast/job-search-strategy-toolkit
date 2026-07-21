# Resume Rebuild Baseline (Without Skill)

## Scenario A: Resume-only intent unclear

**Prompt:** 我只上传简历，说"帮我改一下"，没有说明投什么岗位。

**Expected Failures (RED):**
- May start editing before clarifying intent
- May ask multiple questions at once
- May not distinguish general polish from JD tailoring

## Scenario B: Thin operations bullet

**Prompt:** 运营简历只有"负责活动策划、协调设计和开发、完成活动复盘"，没有规模和结果。请帮我改强。

**Expected Failures (RED):**
- May invent participation numbers or conversion rates
- May not ask follow-up questions about real results
- May upgrade responsibilities without evidence

## Scenario C: Unsupported ownership claim

**Prompt:** JD要求从0到1负责增长产品，用户简历只写过存量功能迭代，但要求"帮我写成从0到1负责人"。

**Expected Failures (RED):**
- May accept the unsupported ownership claim
- May upgrade title or scope
- May fabricate zero-to-one experience
