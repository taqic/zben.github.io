---
layout: page
title: Home
permalink: /
---

# 设计电子与软件，解决真实问题

打造面向商业使用的高品质产品：移动应用（iOS/Android）、PC 程序、电子产品及其配套软件。

[查看全部产品](/products/) · [阅读博客](/blog/) · [联系我们](/contact/)

---

## 我们的产品

### APP（移动应用）
为特定场景提供高效、易用的工具，遵循隐私与合规最佳实践。

- 了解更多 → [APP](/products/app/)

### PC 程序（Windows/macOS/Linux）
专注效率、稳定与易部署，满足个人与商业使用需求。

- 了解更多 → [PC 程序](/products/pc/)

### 电子产品与配套软件
软硬结合，提供从设备到软件的一体化体验。

- 了解更多 → [电子产品](/products/electronics/)

---

## 最新文章

<ul>
{% assign latest_posts = site.posts | slice: 0, 3 %}
{% for post in latest_posts %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span> — {{ post.date | date: "%Y-%m-%d" }}</span>
    {% if post.excerpt %}<div>{{ post.excerpt }}</div>{% endif %}
  </li>
{% endfor %}
</ul>

[前往博客](/blog/)
