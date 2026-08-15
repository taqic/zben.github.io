# ZBENS（zbens.com）

个人独立开发者站点：消费级软件与 App 产品页。

## 架构（最低成本）

| 层 | 方案 |
|----|------|
| 域名 / DNS / CDN / SSL | Cloudflare |
| 静态站 | Cloudflare Pages（本仓库） |
| 大文件下载 | R2 或 GitHub Releases |
| 反馈收集 | Pages Functions + D1 + Turnstile |
| 邮件 | 网易企业邮（`matt@zbens.com`），不经 Cloudflare 发信 |

## 不可删除的公开路径

现有产品/法务页须保持可访问（可调整内容，不可删 URL）：

- `/` `index.html`
- `/mobile-apps.html` `/pc-apps.html` `/hdrecover.html` `/electronics.html` `/iot.html` `/careers.html`
- `/pricing.html` `/privacy.html` `/privacy-app1.html` `/privacy-app2.html` `/privacy-app3.html`
- `/skincare-cycle-privacy.html` `/terms.html` `/cookies.html` `/refunds.html`

## 本地开发

```bash
npm install
npm test
npx wrangler pages dev . --d1=DB=zbens-feedback
```

反馈 API：`POST /api/feedback`（需绑定 D1；Turnstile 可在本地用 mock）。

## 部署

见 `development_plan.md` 中的 Cloudflare Dashboard 清单。  
推荐：GitHub `gh-pages` → Cloudflare Pages 自动构建（输出目录：仓库根目录）。

## 许可证与约束

- 仅使用开源免费组件（MIT / Apache-2.0 / GPL-compatible 商业可用）
- 禁止付费 API；禁止上传用户隐私到第三方分析以外的用途
