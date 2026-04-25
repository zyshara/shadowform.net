(function() {
  'use strict';
  window.Blizzard = window.Blizzard || {};
  window.Blizzard.SiteNav = { init: function() {} };
  window.BlzNav = window.BlzNav || { init: function() {} };
  window.BlzFooter = window.BlzFooter || { init: function() {} };

  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('.blz-nav, #blz-nav, nav[data-navbar], [data-blz-nav]');
    if (nav) {
      nav.innerHTML = '<div style="padding:12px 24px;background:#1a1a2e;color:#9fd4f0;font-family:sans-serif;">' +
        '<span style="font-weight:bold;">World of Warcraft: Wrath of the Lich King Classic</span>' +
        '</div>';
    }
    var footer = document.querySelector('.blz-footer, #blz-footer, footer[data-footer], [data-blz-footer]');
    if (footer) {
      footer.innerHTML = '<div style="padding:24px;background:#111;color:#888;font-family:sans-serif;text-align:center;">' +
        '&copy; 2022 Blizzard Entertainment, Inc. &mdash; Local Archive' +
        '</div>';
    }
  });
})();