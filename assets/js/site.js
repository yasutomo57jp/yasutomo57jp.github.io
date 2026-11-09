/* site.js — 川西康友 Webサイト共通スクリプト（依存なし）
 * 1. モバイルメニューの開閉
 * 2. 業績ページ：件数表示・キーワード絞り込み・現在位置のハイライト
 * 要素が存在しないページでは何もしない。
 */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* 1. Menu toggle */
  function initMenu() {
    var btn = document.querySelector('.menu-button');
    var panel = btn && document.getElementById(btn.getAttribute('aria-controls'));
    if (!btn || !panel) return;
    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      panel.setAttribute('data-collapsed', String(!open));
    }
    setOpen(false);
    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
  }

  /* 2. Publications */
  function initPublications() {
    var root = document.querySelector('.pub-sections');
    if (!root) return;
    var articles = Array.prototype.slice.call(root.querySelectorAll('article'));
    var items = Array.prototype.slice.call(root.querySelectorAll('.publication-item'));
    var form = document.querySelector('.filter');
    var input = document.getElementById('pub-filter');
    var status = document.getElementById('filter-status');
    var noResults = document.getElementById('no-results');
    var texts = items.map(function (li) { return li.textContent.replace(/\s+/g, ' ').toLowerCase(); });

    var sections = articles.map(function (a) {
      var h = a.querySelector('h2');
      var count = document.createElement('span');
      count.className = 'h-count';
      if (h) h.appendChild(count);
      return {
        el: a,
        id: h ? h.id : '',
        count: count,
        badge: h ? document.querySelector('[data-count-for="' + h.id + '"]') : null
      };
    });

    var en = (document.documentElement.lang || '').indexOf('en') === 0;
    var fmt = en ? {
      count: function (n) { return n + (n === 1 ? ' item' : ' items'); },
      hits: function (n, all) { return n + ' of ' + all + ' shown'; },
      all: function (all) { return all + ' items'; }
    } : {
      count: function (n) { return n + '件'; },
      hits: function (n, all) { return n + '件が該当（全' + all + '件）'; },
      all: function (all) { return '全' + all + '件'; }
    };

    function update() {
      var terms = input ? input.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];
      var total = 0;
      items.forEach(function (li, i) {
        li.hidden = !terms.every(function (t) { return texts[i].indexOf(t) !== -1; });
      });
      sections.forEach(function (s) {
        var n = s.el.querySelectorAll('.publication-item:not([hidden])').length;
        total += n;
        s.el.hidden = n === 0;
        s.count.textContent = fmt.count(n);
        if (s.badge) {
          s.badge.textContent = n;
          s.badge.parentNode.classList.toggle('is-empty', n === 0);
        }
      });
      if (noResults) noResults.hidden = total !== 0;
      if (status) {
        status.textContent = terms.length ? fmt.hits(total, items.length) : fmt.all(items.length);
      }
    }

    if (form && input) {
      form.hidden = false;
      form.addEventListener('submit', function (e) { e.preventDefault(); });
      input.addEventListener('input', update);
    }
    update();

    if ('IntersectionObserver' in window) {
      var links = {};
      Array.prototype.forEach.call(document.querySelectorAll('.toc-list a'), function (a) {
        links[a.getAttribute('href').slice(1)] = a;
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
          var h = e.target.querySelector('h2');
          if (h && links[h.id]) links[h.id].classList.add('is-active');
        });
      }, { rootMargin: '-10% 0px -80% 0px' });
      sections.forEach(function (s) { io.observe(s.el); });
    }
  }

  function init() {
    initMenu();
    initPublications();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
