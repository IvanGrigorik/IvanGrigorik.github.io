document.addEventListener('DOMContentLoaded', function () {
  initNavToggle();
  initScrollSpy();
  initThemeToggle();
  initPhdYear();
  initNewsToggle();
  initBibtexCopy();
});

function initNavToggle() {
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initScrollSpy() {
  var navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  var sections = document.querySelectorAll('main section[id]');
  var links = navLinks.querySelectorAll('a');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(function (s) { observer.observe(s); });
}

var ORDINAL_WORDS = [
  'First', 'Second', 'Third', 'Fourth', 'Fifth',
  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'
];

function initPhdYear() {
  var el = document.getElementById('phdYear');
  if (!el) return;

  var startYear = 2024;
  var years = new Date().getFullYear() - startYear + 1;
  years = years > 0 ? years : 1;
  el.textContent = ORDINAL_WORDS[years - 1] || years + 'th';
}

function initNewsToggle() {
  var VISIBLE_COUNT = 3;

  var list = document.querySelector('#news .news-list');
  if (!list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll('.news-item'));
  if (items.length <= VISIBLE_COUNT) return;

  var extra = items.slice(VISIBLE_COUNT);
  extra.forEach(function (item) {
    item.classList.add('news-item-hidden');
  });

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'news-more-btn';
  btn.textContent = 'Show all news';
  list.insertAdjacentElement('afterend', btn);

  var expanded = false;
  btn.addEventListener('click', function () {
    expanded = !expanded;
    extra.forEach(function (item) {
      item.classList.toggle('news-item-hidden', !expanded);
    });
    btn.textContent = expanded ? 'Show less' : 'Show all news';
    btn.classList.toggle('expanded', expanded);
  });
}

function initBibtexCopy() {
  var buttons = document.querySelectorAll('.bibtex-copy');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.parentElement.querySelector('.bibtex-code');
      if (!pre) return;
      copyText(pre.textContent, function () {
        var original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  });
}

function copyText(text, onDone) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onDone);
    return;
  }
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  onDone();
}

function initThemeToggle() {
  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}
