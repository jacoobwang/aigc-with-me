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
   PORT=3000
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
aigcwith.me -> port 3000
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
GOOGLE_GENERATIVE_AI_API_KEY
DEEPSEEK_API_KEY
OPENAI_API_KEY
XAI_API_KEY
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

## 产品功能规划

Aigcwith.me 不继续做“大而全 AI 工具黄页”，而是定位为：

```txt
面向真实任务的 AI 工具决策导航：告诉用户某个场景该用什么、怎么搭配、避开什么坑。
```

差异化目标：

- 不和 MOGE、AI With Me 拼工具数量和分类数量。
- 从“工具目录”升级为“AI 使用决策 + 工作流导航站”。
- 重点解决用户不知道如何选择、组合、验证 AI 工具的问题。

### 核心功能方向

1. 任务式导航

   从用户任务进入，而不是从工具分类进入。

   ```txt
   我要做一个 Logo
   我要把会议录音变成纪要
   我要做短视频
   我要写 SEO 文章
   我要做 AI 编程项目
   我要把 PDF 变成知识库
   我要找可商用图片生成工具
   ```

   每个任务页提供：

   ```txt
   推荐工具组合
   免费方案
   付费高效方案
   新手步骤
   适合人群
   替代工具
   避坑提醒
   ```

2. AI 工具路线图

   用户选择身份后，生成对应的 AI 使用路线。

   ```txt
   独立开发者
   跨境电商卖家
   内容创作者
   设计师
   学生
   营销人员
   创业者
   ```

   示例输出：

   ```txt
   第 1 周：学会 ChatGPT / Claude 基础工作流
   第 2 周：用 AI 做内容生产
   第 3 周：用 AI 做自动化
   第 4 周：搭建自己的工具栈
   ```

3. AI Stack Builder

   让用户输入身份、预算、任务偏好，生成个人 AI 工具栈。

   输入维度：

   ```txt
   预算：免费 / $20 内 / $100 内
   平台：Web / Mac / Windows / Chrome 插件
   用途：写作、图片、视频、编程、自动化
   偏好：中文好用、无需登录、支持 API、可商用
   ```

   输出示例：

   ```txt
   聊天模型：Claude / ChatGPT / Gemini
   搜索研究：Perplexity
   图片：Ideogram / Midjourney
   视频：Runway / Kling
   自动化：Zapier / Make / n8n
   编程：Cursor / Windsurf
   ```

4. 替代品和对比页

   面向高意图搜索需求建设页面：

   ```txt
   Best ChatGPT Alternatives
   Best Midjourney Alternatives
   Free Runway Alternatives
   Cursor vs Windsurf
   Perplexity vs ChatGPT Search
   ```

   页面结构重点是场景判断：

   ```txt
   如果重视中文：选 A
   如果重视价格：选 B
   如果是团队：选 C
   如果需要 API：选 D
   ```

5. AI 工具可用性雷达

   给工具增加目录站少见的决策字段：

   ```txt
   是否有免费额度
   是否需要信用卡
   是否支持中文
   是否支持 API
   是否可商用
   是否支持团队协作
   是否有水印
   是否国内可访问
   最后验证日期
   ```

6. 工作流模板库

   让用户拿到可直接执行的 AI 工作流。

   ```txt
   用 AI 生成一篇 SEO 文章
   用 AI 做一条产品介绍视频
   用 AI 生成 SaaS Landing Page
   用 AI 分析竞品网站
   用 AI 创建小红书选题库
   用 AI 自动回复客户邮件
   ```

   每个模板包含：

   ```txt
   工具组合
   Prompt
   步骤
   预期输出
   适合谁
   耗时
   成本
   ```

7. 工具详情页决策卡

   工具详情页不只做介绍，而是帮助用户快速判断。

   ```txt
   一句话判断：适合谁，不适合谁
   最佳用途
   价格摘要
   免费额度
   优点
   缺点
   替代品
   同类对比
   快速开始 Prompt
   ```

### 优先级路线

第一阶段：

```txt
1. 任务式导航页
2. 工具详情页决策卡
3. 替代品/对比页
4. AI Stack Builder
```

第二阶段：

```txt
5. 工作流模板库
6. 可用性雷达
7. 用户收藏和个人工具栈
```

第三阶段：

```txt
8. 每周 AI 工具变化榜
9. 免费额度变更提醒
10. 提交工具后的自动评分/审核
```

### 最优先的差异化功能

优先做 `AI Stack Builder`：

```txt
输入你的身份、预算、任务，生成个人 AI 工具栈。
```

原因：

- 比普通工具目录更容易分享。
- 能直接体现 Aigcwith.me 的“选型顾问”定位。
- 适合做 SEO 页面和社交传播。
- 后续可以自然连接收藏、对比、提交、赞助转化。
