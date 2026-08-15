# CONTEXT

更新时间：2026-07-18

## 当前阶段

P0 代码侧已就绪；待你在 Cloudflare Dashboard 按 `DEPLOY.md` 完成 Pages / D1 / Turnstile 绑定。

## 本次完成

- 确认架构：CF 域名/DNS/CDN；Pages 静态站；下载按体量用 Releases/R2；邮件仍网易企业邮
- 以现有 `gh-pages` 静态站为基线，保留全部产品/法务 HTML
- 增加：反馈 API、D1 schema、i18n、下载 catalog、Coming soon 占位、文档与测试（7 项通过）

## 核心文件

- `functions/api/feedback.ts` — 反馈写入 D1
- `migrations/0001_feedback.sql` — D1 表结构
- `js/i18n.js` / `locales/*.json` — 中英切换
- `js/site-chrome.js` — 导航增强（Feedback / 语言）
- `feedback.html` — 反馈页
- `downloads/catalog.json` — 下载源配置
- `wrangler.toml` — Pages / D1 绑定

## 遗留 / 下一步

1. 用户在 Cloudflare 创建 Pages 项目、D1、Turnstile，填入 `database_id` 与密钥
2. 将 `gh-pages` 推送到 GitHub（用户本地 SSH 暂不便时，可用 HTTPS 或 Dashboard 直连）
3. 自定义域 `zbens.com` / `www` 绑到 Pages
4. P1：补 App 商店链接与 6 个待上架占位

## 备注

- 工作区路径：`C:\Users\fua\Desktop\zben.github.io-remote`（原「迁移到 cloudflare」空目录因编码问题未用）
- 远程：`git@github.com:taqic/zben.github.io.git`，分支 `gh-pages`
