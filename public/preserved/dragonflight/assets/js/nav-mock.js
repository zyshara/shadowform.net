// Mocked Blizzard nav — no external API calls
(function() {
  'use strict';
  window.Blizzard = window.Blizzard || {};
  window.Blizzard.SiteNav = { init: function() {} };
  window.BlzNav = window.BlzNav || { init: function() {} };
  window.BlzFooter = window.BlzFooter || { init: function() {} };

  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('.blz-nav, #blz-nav, nav[data-navbar], [data-blz-nav]');
    if (nav) {
      nav.innerHTML = '<div style="padding:12px 24px;background:#1a1a2e;color:#fff;font-family:sans-serif;">' +
        '<a href="#" style="color:#f0a000;font-weight:bold;text-decoration:none;">World of Warcraft: Dragonflight</a>' +
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