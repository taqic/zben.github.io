# Cloudflare 部署清单（P0）

按顺序在 Dashboard 操作（本机可不 push；也可稍后用 HTTPS 推 `gh-pages`）。

## 1. Pages 项目

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → Connect to Git
2. 选仓库 `taqic/zben.github.io`，分支 **`gh-pages`**
3. 构建设置：
   - Framework preset: **None**
   - Build command: （留空）
   - Build output directory: `/` 或 `.`
4. 部署后，在项目 **Custom domains** 添加 `zbens.com` 与 `www.zbens.com`  
   （DNS 已在 Cloudflare 时会自动提示）

> 若 Git 连接不便：可用 `npx wrangler pages deploy . --project-name=zbens`（需先 `wrangler login`）。

## 2. D1 数据库

```bash
npx wrangler d1 create zbens-feedback
npx wrangler d1 execute zbens-feedback --file=./migrations/0001_feedback.sql --remote
```

把输出的 `database_id` 写入 `wrangler.toml`。  
Pages 项目 → **Settings** → **Functions** → **D1 bindings**：binding 名 `DB`，选 `zbens-feedback`。

## 3. Turnstile

1. Cloudflare → **Turnstile** → Add widget（域名 `zbens.com`）
2. 把 **Site Key** 填进 `feedback.html` 里 `data-sitekey="..."`
3. Pages → **Settings** → **Environment variables**：  
   - `TURNSTILE_SECRET_KEY` = Secret Key  
   - `FEEDBACK_IP_SALT` = 任意随机字符串

未配置 Secret 时，仅接受 token `dev-bypass`（仅本地调试）。

## 4. Web Analytics

Cloudflare → **Web Analytics** → Add site `zbens.com` → 按提示加一段 beacon（可选，贴到 `index.html` `</head>` 前）。

## 5. R2（可选，大文件）

1. 创建 bucket `zbens-downloads`
2. 开启公开访问或用自定义域 `dl.zbens.com`
3. 在 `downloads/catalog.json` 填 `url`

## 6. 邮件

保持网易企业邮 MX（已是 `mx.ym.163.com`），**不要**改成 Cloudflare Email 除非你有意迁移。

## 7. 验证

- [ ] `https://zbens.com/` 与旧产品/隐私页均可打开  
- [ ] `/feedback.html` 提交成功（D1 有行）  
- [ ] 语言切换中/英  
- [ ] `/download.html` 能读 catalog  
