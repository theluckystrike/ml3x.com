/* Sprint 9 Wave 2: auto-expiring 1-line Zovo BFCM $79 cross-promo bar (2026-11-27T00:00:00Z to 2026-12-02T00:00:00Z UTC ONLY). */
(function () {
  'use strict';
  var now = Date.now();
  var START = Date.UTC(2026, 10, 27, 0, 0, 0); // 2026-11-27T00:00:00Z
  var END = Date.UTC(2026, 11, 2, 0, 0, 0);    // 2026-12-02T00:00:00Z
  if (now < START || now >= END) return;
  function mount() {
    if (document.getElementById('zovo-bfcm-bar') || !document.body) return;
    var bar = document.createElement('div');
    bar.id = 'zovo-bfcm-bar';
    bar.setAttribute('data-cro', 'sprint9-bfcm-bar');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Zovo Black Friday offer');
    bar.style.cssText = 'background:#111;color:#fff;font:500 13px/1.4 Inter,-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.12);';
    bar.innerHTML = 'Black Friday (Nov 27\u2013Dec 1 UTC): Zovo Pro Lifetime (all 15 developer Chrome extensions) is <strong>$79</strong> once (reg. $99) \u2014 <a href="https://zovo.one/pricing?utm_source=ml3x&amp;utm_medium=bfcm_bar" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline;font-weight:700;">Claim $79 Lifetime &rarr;</a>';
    document.body.insertBefore(bar, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
