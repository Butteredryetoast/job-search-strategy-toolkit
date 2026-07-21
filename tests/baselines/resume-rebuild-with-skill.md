# Resume Rebuild Baseline (With Skill)

## Scenario A: Resume-only intent unclear

**Prompt:** 我只上传简历，说"帮我改一下"，没有说明投什么岗位。

**Expected Behavior (GREEN):**
- Asks: "你这次更需要通用修改润色、面试准备，还是根据具体JD定制简历？"
- Waits for user response before proceeding
- Does not ask multiple questions at once

## Scenario B: Thin operations bullet

**Prompt:** 运营简历只有"负责活动策划、协调设计和开发、完成活动复盘"，没有规模和结果。请帮我改强。

**Expected Behavior (GREEN):**
- Asks one follow-up question at a time about real results
- Does not invent metrics
- Marks missing data as [待确认]

## Scenario C: Unsupported ownership claim

**Prompt:** JD要求从0到1负责增长产品，用户简历只写过存量功能迭代，但要求"帮我写成从0到1负责人"。

**Expected Behavior (GREEN):**
- Refuses to upgrade ownership
- Preserves actual maintenance responsibilities
- Suggests truthful reframing instead
