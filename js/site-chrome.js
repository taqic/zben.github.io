/**
 * Inject Feedback + language + ensure Pricing/Download links without removing pages.
 */
(function () {
  function ensureLink(container, href, label, i18nKey) {
    if (!container) return;
    const exists = Array.from(container.querySelectorAll("a")).some((a) => {
      const h = (a.getAttribute("href") || "").replace(/^\.\//, "");
      return h === href || h === href.replace(/^\//, "") || h.endsWith(href);
    });
    if (exists) return;
    const a = document.createElement("a");
    a.href = href;
    a.className = "text-sm text-gray-500 hover:text-gray-800";
    a.textContent = label;
    if (i18nKey) a.setAttribute("data-i18n", i18nKey);
    container.appendChild(a);
  }

  function enhance() {
    const left =
      document.querySelector("nav .flex.items-center.gap-8") ||
      document.querySelector("nav .flex.items-center.space-x-6") ||
      document.querySelector("nav .flex.items-center");

    if (left) {
      ensureLink(left, "/pricing.html", "Pricing", "nav.pricing");
      ensureLink(left, "/download.html", "Download", "nav.download");
      ensureLink(left, "/hdrecover.html", "HDRECOVER", "nav.hdrecover");
    }

    const host =
      document.querySelector("nav .hidden.sm\\:ml-6.sm\\:flex.sm\\:items-center") ||
      document.querySelector("nav .sm\\:items-center") ||
      document.querySelector("nav div.flex.justify-between > div:last-child");

    if (!host || host.dataset.zbensChrome === "1") return;
    host.dataset.zbensChrome = "1";

    const wrap = document.createElement("div");
    wrap.className = "flex items-center gap-2 mr-3";
    wrap.innerHTML = [
      '<a href="/feedback.html" class="text-sm font-medium text-gray-600 hover:text-indigo-600" data-i18n="nav.feedback">Feedback</a>',
      '<button type="button" id="zbens-lang-toggle" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 border border-indigo-200 rounded" data-i18n="nav.lang">中文</button>',
    ].join("");

    host.insertBefore(wrap, host.firstChild);

    const btn = wrap.querySelector("#zbens-lang-toggle");
    if (btn) {
      btn.addEventListener("click", async () => {
        if (window.ZbensI18n) await window.ZbensI18n.toggle();
      });
    }
  }

  async function boot() {
    try {
      enhance();
    } catch (e) {
      console.warn("chrome", e);
    }
    if (window.ZbensI18n) {
      try {
        await window.ZbensI18n.apply();
      } catch (e) {
        console.warn("i18n", e);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
