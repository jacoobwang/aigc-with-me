# Aigcwith.me

导航站 https://aigcwith.me/ 

## Railway 发布流程

生产环境部署在 Railway，使用仓库根目录的 `Dockerfile` 构建 Next.js standalone 服务。

### 首次部署

1. 登录 Railway CLI：

   ```bash
   npx @railway/cli@latest login
   ```

2. 绑定已有 Railway 项目和服务：

   ```bash
   npx @railway/cli@latest link
   ```

3. 配置 Railway Variables。至少需要 `.env.prod` 中的非空变量，并额外设置：

   ```txt
   PORT=3300
   AUTH_TRUST_HOST=true
   NEXT_PUBLIC_APP_URL=https://aigcwith.me
   NEXTAUTH_URL=https://aigcwith.me
   ```

   说明：Next.js 构建期会读取 Sanity、Resend、Auth、`NEXT_PUBLIC_APP_URL` 等变量。`Dockerfile` 已声明对应 `ARG`，用于 Railway Docker build。

4. 发布：

   ```bash
   npx @railway/cli@latest up --yes --detach --message "Deploy"
   ```

5. 查看状态和日志：

   ```bash
   npx @railway/cli@latest status
   npx @railway/cli@latest deployment list --json --limit 3
   npx @railway/cli@latest logs --latest --lines 100
   ```

### 自定义域名

当前生产域名：

```txt
https://aigcwith.me
```

Railway service 绑定的 custom domain：

```txt
aigcwith.me -> port 3300
```

Cloudflare DNS 需要以下记录：

```txt
Type: CNAME
Name: @
Target: hdc7ecrm.up.railway.app
Proxy: Proxied
```

```txt
Type: TXT
Name: _railway-verify
Content: railway-verify=6609269e2804a75087c2bf1ea569cf4eae1acc822dcc8ff9876c9c4d0abd4db8
Proxy: DNS only
```

验证 Railway 域名状态：

```bash
npx @railway/cli@latest domain status aigcwith.me --json
```

期望结果：

```txt
verification.verified=true
certificate.status=CERTIFICATE_STATUS_TYPE_VALID
```

### www 跳转

Railway 当前计划只绑定根域名，`www.aigcwith.me` 在 Cloudflare 侧做 301 跳转到根域名。

Cloudflare DNS：

```txt
Type: CNAME
Name: www
Target: aigcwith.me
Proxy: Proxied
```

Cloudflare Redirect Rule：

```txt
When hostname equals www.aigcwith.me
Then dynamic redirect:
concat("https://aigcwith.me", http.request.uri.path)
Status: 301
Preserve query string: enabled
```

验证：

```bash
curl -I 'https://aigcwith.me'
curl -I 'https://www.aigcwith.me/some/path?x=1'
```

### 后续发布

代码合并后，在本地执行：

```bash
npx @railway/cli@latest up --yes --detach --message "Deploy"
```

如果修改了 `NEXT_PUBLIC_*`、`NEXTAUTH_URL`、Sanity、Resend 等构建期变量，需要重新发布一次，让 Next.js 构建产物读取新值。

Stripe 和 AI 相关变量当前可按需在 Railway Variables 中补齐，补齐后重新发布：

```txt
STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID
DEFAULT_AI_PROVIDER
DASHSCOPE_API_KEY
QWEN_BASE_URL
QWEN_MODEL
DEEPSEEK_API_KEY
OPENAI_API_KEY
XAI_API_KEY
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

## 每日内容导入

每天手动执行以下命令，扫描所有来源并将最多 20 个候选内容真实写入生产 Sanity：

```bash
ENV_FILE=.env.prod pnpm auto-update:items -- --sources all --limit 20
```

新内容会以 `pending` 状态创建，之后在 Sanity Studio 中审核。`--limit` 表示本次最多检查的候选数量，不代表一定创建相同数量的内容；不传该参数时默认也是 20。

如果需要覆盖本次发现的全部候选，可提高数量：

```bash
ENV_FILE=.env.prod pnpm auto-update:items -- --sources all --limit 1000
```

## 产品功能规划

产品功能规划已拆分到 [PRODUCT_FEATURE_PLAN.md](./PRODUCT_FEATURE_PLAN.md)。
