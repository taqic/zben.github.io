# ZBENS 开发计划

更新：2026-07-18

## 目标

在 Cloudflare 免费层上，稳定托管 zbens.com：保留现有产品页 URL，增加中英切换、反馈收集、下载约定，为后续 6 个 App Store 上架预留入口。

## 阶段

### P0 — 基建（当前）

- [x] 域名转入 Cloudflare Registrar
- [x] DNS / CDN Active
- [ ] Cloudflare Pages 绑定本仓库 `gh-pages`（见 DEPLOY.md）
- [x] 保留全部现有 HTML 路径（仅增强，未删除）
- [x] 反馈 API（D1 + Turnstile）+ `/feedback.html`
- [x] 中英 UI 切换（localStorage + locales）
- [x] 下载配置（GitHub Releases / 未来 R2）`downloads/catalog.json` + `/download.html`
- [ ] Web Analytics（Dashboard 手动加 beacon）
- [x] 文档与单元测试

### P1 — 产品页增强

- [ ] 现有 App 卡片补齐商店链接 / 下载链接
- [ ] 为待上架 6 个 App 增加「Coming soon」条目（不删旧页）
- [ ] App 隐私政策 URL 与 App Store Connect 对齐核对

### P2 — 下载与运营

- [ ] R2 bucket `zbens-downloads` + 公开读或签名 URL
- [ ] 反馈简易导出（wrangler / 受保护接口）
- [ ] DNSSEC 在 Cloudflare 重新开启（可选）

## 非目标（本阶段不做）

- 用户账号系统 / 完整 CMS
- 付费邮件 API（Resend 等）
- 重写为 SPA / 删除旧 HTML
- 自建服务器

## 验收标准（P0）

1. `https://zbens.com/` 与全部既有产品/隐私页 200
2. `POST /api/feedback` 合法请求写入 D1；缺字段/无 Turnstile 返回 4xx
3. 中/英切换后导航与反馈页文案正确，刷新保持语言
4. `downloads/catalog.json` 可配置 Releases 或 R2 链接
5. `npm test` 通过

## 技术约束

- Cloudflare Free：Pages + Functions + D1 + Turnstile + Analytics；R2 10GB
- 邮件继续网易企业邮
- 源码 GitHub：`taqic/zben.github.io`，分支 `gh-pages`
