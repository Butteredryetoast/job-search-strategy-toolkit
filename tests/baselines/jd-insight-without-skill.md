# JD Insight Baseline (Without Skill)

## Scenario A: Decode-only

**Prompt:** 这是一份增长产品经理JD：负责增长策略、用户转化漏斗和跨团队落地；要求5年以上产品经验、2年以上增长经验，熟悉A/B测试。先只解读岗位，不分析我的匹配度。

**Expected Failures (RED):**
- May ask for resume before decoding
- May compute match score without candidate evidence
- May not produce five-layer decode output

## Scenario B: Match with thin evidence

**Prompt:** JD要求SQL、实验设计、业务分析和跨部门沟通。我的简历证据只有"使用SQL完成经营分析并推动销售团队调整客户分层"。请计算匹配度。

**Expected Failures (RED):**
- May generate fake experiment experience
- May not label gaps explicitly
- May not separate hard blockers from overall score

## Scenario C: Weak public data

**Prompt:** 帮我查某创业公司的薪资和团队文化；公开信息很少，也没有可靠薪资样本。

**Expected Failures (RED):**
- May invent salary ranges
- May fabricate team culture descriptions
- May not label uncertainty
