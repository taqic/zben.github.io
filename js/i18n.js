/**
 * Lightweight i18n for ZBENS static pages.
 * Usage: add data-i18n="key" on elements; call ZbensI18n.apply()
 */
(function (global) {
  const STORAGE_KEY = 'zbens_locale';
  const cache = {};

  function detect() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('zh') ? 'zh' : 'en';
  }

  async function load(locale) {
    if (cache[locale]) return cache[locale];
    const res = await fetch(`/locales/${locale}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('locale_load_failed');
    cache[locale] = await res.json();
    return cache[locale];
  }

  function t(dict, key) {
    return (dict && dict[key]) || key;
  }

  async function apply(locale) {
    const lang = locale || detect();
    const dict = await load(lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const value = t(dict, key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.getAttribute('data-i18n-attr') === 'placeholder') {
          el.setAttribute('placeholder', value);
        } else {
          el.value = value;
        }
      } else {
        el.textContent = value;
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = t(dict, key);
    });
    localStorage.setItem(STORAGE_KEY, lang);
    global.dispatchEvent(new CustomEvent('zbens:locale', { detail: { locale: lang, dict } }));
    return lang;
  }

  async function toggle() {
    const next = detect() === 'zh' ? 'en' : 'zh';
    return apply(next);
  }

  global.ZbensI18n = { detect, apply, toggle, t: (key) => {
    const lang = detect();
    return t(cache[lang], key);
  } };
})(window);
