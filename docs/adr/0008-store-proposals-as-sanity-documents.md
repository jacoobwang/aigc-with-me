---
status: accepted
---

# 将内容更新提案保存为独立的 Sanity 文档

内容更新提案和内容快照使用独立的 `itemUpdateProposal` 文档保存，并通过引用关联正式 item。提案文档保存来源、快照 hash、生成时的当前内容、候选内容、diff、状态和审核信息；正式 item 只有在提案被接受后才会被修改。这样可以保留审核历史，并在 Sanity Studio 中独立查询待处理提案。

## Considered Options

- **把提案字段放在 item 上**：模型简单，但只能保存当前提案，历史和并发审核边界不清楚。
- **使用独立 Sanity 文档**：增加一个文档类型，但支持审计、唯一 pending 约束和独立审核工作区，当前采用此方案。
