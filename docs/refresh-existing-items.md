# refresh-existing-items

`refresh-existing-items` 用于复查自动导入且已经发布的 item。它只抓取 item 的官方 `link`，不会读取 MOGE、AI With Me 等聚合站页面来生成更新内容。

## CLI

```bash
# 只发现和生成候选，不写入 Sanity
pnpm refresh-existing-items:dry-run -- --limit 10

# 正式创建 pending itemUpdateProposal 文档
pnpm refresh-existing-items -- --limit 50

# 只检查一个 item
pnpm refresh-existing-items:dry-run -- --item-id <sanity-item-id>
```

运行需要与现有自动导入任务相同的环境变量：

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN`
- `DEFAULT_AI_PROVIDER` 和对应的 provider API key

## 处理规则

1. 只选择 `autoImported == true`、已发布、未强制隐藏且有 `link` 的 item。
2. 同一个 item 已有 `pending` 提案时跳过。
3. 抓取官方页面并生成标准化内容快照 hash；hash 未变化时不调用 AI。
4. 页面发生变化后调用 AI，生成内容候选并与当前 item 做标准化 diff。
5. 没有实质差异时只更新 refresh state，不创建提案。
6. 有实质差异时创建一条独立的 `itemUpdateProposal`。
7. 同一个 item 的同一个 source hash 不重复创建提案。

## 审核与应用

Sanity Studio 的 `Item management → Pending Item Update Proposals` 展示待审核提案。打开提案后使用文档动作：

- `Accept update proposal`：整体应用内容字段变更；发布状态、审核状态、套餐、赞助和展示控制字段保持不变；
- `Reject update proposal`：记录拒绝结果，不修改正式 item。

接受时会重新校验 item 的 `_updatedAt` 和内容 hash。如果审核期间 item 被人工修改，提案会变为 `stale`，不会覆盖当前内容。

如果名称变化，会重新生成 slug 并检查冲突；如果链接或 slug 与其他 item 冲突，提案不会应用。分类和标签必须已经存在于 Sanity 中，自动复查不会创建新的分类或标签。

## 数据文档

- `itemUpdateProposal`：保存来源、快照 hash、正式 item 基线、候选内容、差异和审核结果。
- `itemRefreshState`：保存每个自动导入 item 最近一次检查的 source hash、检查时间、错误和最近提案。

GitHub Actions 工作流 `.github/workflows/refresh-existing-items.yml` 默认每天 UTC 19:00 执行，并支持手动 dry-run。
