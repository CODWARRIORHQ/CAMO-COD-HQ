(function () {
  'use strict';

  var key = 'camo-theme';
  var allowed = ['dark', 'light', 'neon', 'black'];
  var theme;
  var root = document.documentElement;

  function readCookie() {
    var match = document.cookie.match(/(?:^|;\s*)camo-theme=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function readStoredTheme() {
    var saved = '';
    try { saved = localStorage.getItem(key) || ''; } catch (_) {}
    if (!saved) saved = readCookie();
    return allowed.indexOf(saved) !== -1 ? saved : 'dark';
  }

  function persist(value) {
    try { localStorage.setItem(key, value); } catch (_) {}
    try {
      document.cookie = `${key}=${encodeURIComponent(value)}; max-age=31536000; path=/; SameSite=Lax`;
    } catch (_) {}
  }

  function applyTheme(value) {
    if (allowed.indexOf(value) === -1) value = 'dark';
    theme = value;
    root.dataset.theme = value;
    root.style.setProperty('--active-theme', value);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', value === 'light' ? '#eef2f7' : value === 'neon' ? '#10051b' : value === 'black' ? '#000000' : '#060b13');
  }

  function removeLegacyThemeControl() {
    document.querySelectorAll('.camo-theme-control').forEach(function (control) {
      control.remove();
    });
  }

  // Apply before the body paints and repeat after the document is ready so
  // templates that set their own inline styles cannot reset the preference.
  applyTheme(readStoredTheme());
  removeLegacyThemeControl();
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(readStoredTheme());
    removeLegacyThemeControl();
  });
  new MutationObserver(removeLegacyThemeControl).observe(document.documentElement, { childList: true, subtree: true });

  function setTheme(value) {
    if (allowed.indexOf(value) === -1) return;
    applyTheme(value);
    persist(value);
  }

  window.addEventListener('storage', function (event) {
    if (event.key === key) applyTheme(readStoredTheme());
  });

  window.CamoTheme = { set: setTheme, get: function () { return document.documentElement.dataset.theme; } };
}());
