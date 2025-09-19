---
layout: page
title: Blog
permalink: /blog/
---

{% if paginator %}
{% assign posts_list = paginator.posts %}
{% else %}
{% assign posts_list = site.posts %}
{% endif %}

<ul>
{% for post in posts_list %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span> — {{ post.date | date: "%Y-%m-%d" }}</span>
    {% if post.excerpt %}<div>{{ post.excerpt }}</div>{% endif %}
  </li>
{% endfor %}
</ul>

{% if paginator %}
<div class="pagination">
  {% if paginator.previous_page %}
  <a href="{{ paginator.previous_page_path }}">上一页</a>
  {% endif %}
  <span>第 {{ paginator.page }} / {{ paginator.total_pages }} 页</span>
  {% if paginator.next_page %}
  <a href="{{ paginator.next_page_path }}">下一页</a>
  {% endif %}
</div>
{% endif %}
