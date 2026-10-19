(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  var toFa = function (n) { return String(n).replace(/\d/g, function (d) { return FA_DIGITS[d]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = 'fa';

  /* ---------- language ---------- */
  var TITLES = {
    fa: 'مرتضی آقاسی‌زاده | برنامه‌ریزی، آمار، نظارت تصویری و رسانه',
    en: 'Morteza Aghasizadeh | Planning, Statistics, CCTV & Media'
  };
  var ATTRS = ['aria-label', 'alt', 'href', 'placeholder'];

  function setLang(next, save) {
    if (next === lang && save) return;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.fa === undefined) el.dataset.fa = el.innerHTML;
      el.innerHTML = next === 'en' ? el.dataset.en : el.dataset.fa;
    });
    ATTRS.forEach(function (attr) {
      document.querySelectorAll('[data-en-' + attr + ']').forEach(function (el) {
        var key = 'fa' + attr.replace(/(^|-)(\w)/g, function (m, p, c) { return c.toUpperCase(); });
        if (el.dataset[key] === undefined) el.dataset[key] = el.getAttribute(attr) || '';
        el.setAttribute(attr, next === 'en' ? el.getAttribute('data-en-' + attr) : el.dataset[key]);
      });
    });
    lang = next;
    root.lang = next;
    root.dir = next === 'en' ? 'ltr' : 'rtl';
    root.dataset.lang = next;
    document.title = TITLES[next];
    document.querySelectorAll('.count').forEach(function (el) {
      el.textContent = next === 'fa' ? toFa(el.dataset.to) : el.dataset.to;
    });
    updateThemeLabel();
    if (save) store.set('ma-lang', next);
  }

  /* ---------- theme ---------- */
  var themeBtn = document.getElementById('themeBtn');
  function updateThemeLabel() {
    var dark = root.dataset.theme === 'dark';
    var label = lang === 'en'
      ? (dark ? 'Switch to light mode' : 'Switch to dark mode')
      : (dark ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره');
    themeBtn.setAttribute('aria-label', label);
    themeBtn.setAttribute('title', label);
    var meta = document.querySelectorAll('meta[name="theme-color"]');
    meta.forEach(function (m) { m.setAttribute('content', dark ? '#0E1013' : '#F4F2ED'); });
  }
  themeBtn.addEventListener('click', function (e) {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    var apply = function () { root.dataset.theme = next; updateThemeLabel(); };
    store.set('ma-theme', next);
    if (document.startViewTransition && !reduced) {
      var r = themeBtn.getBoundingClientRect();
      root.style.setProperty('--vt-x', (r.left + r.width / 2) + 'px');
      root.style.setProperty('--vt-y', (r.top + r.height / 2) + 'px');
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!store.get('ma-theme')) { root.dataset.theme = e.matches ? 'dark' : 'light'; updateThemeLabel(); }
  });

  document.getElementById('langBtn').addEventListener('click', function () {
    setLang(lang === 'fa' ? 'en' : 'fa', true);
  });

  /* ---------- header: scrolled state, progress, scrollspy ---------- */
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.scroll-progress span');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = scrollY;
      var max = document.documentElement.scrollHeight - innerHeight;
      header.classList.toggle('scrolled', y > 8);
      bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = document.querySelectorAll('.nav a');
  var sections = Array.prototype.map.call(navLinks, function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
    var hero = document.getElementById('home');
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
    }, { rootMargin: '0px 0px -60% 0px' }).observe(hero);
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var sheet = document.getElementById('sheet');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
    sheet.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    document.querySelectorAll('main, .site-footer').forEach(function (el) { el.inert = open; });
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    var l = open ? (lang === 'en' ? 'Close menu' : 'بستن منو') : (lang === 'en' ? 'Open menu' : 'باز کردن منو');
    menuBtn.setAttribute('aria-label', l);
    if (open) { var first = sheet.querySelector('a'); if (first) first.focus(); }
  }
  sheet.querySelectorAll('li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 1081px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  /* ---------- reveal on scroll + count-up ---------- */
  var reveals = document.querySelectorAll('.reveal');
  document.querySelectorAll('.stats, .pillars, .grid, .xp, .skills, .edu, .svc').forEach(function (group) {
    group.querySelectorAll(':scope > .reveal').forEach(function (el, i) { el.style.setProperty('--stagger', i % 6); });
  });

  function countUp(el) {
    var to = +el.dataset.to;
    if (reduced || !to) return;
    var start = null, dur = 1100;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      var v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = lang === 'fa' ? toFa(v) : v;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        en.target.querySelectorAll('.count').forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- live camera feed: clock + tilt ---------- */
  var clock = document.getElementById('recClock');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tickClock() { var d = new Date(); clock.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  tickClock();
  setInterval(tickClock, 1000);
  var feed = document.getElementById('feed');
  var heroEl = document.getElementById('home');
  if (!reduced && matchMedia('(hover: hover)').matches) {
    heroEl.addEventListener('pointermove', function (e) {
      var r = feed.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      var dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      feed.style.setProperty('--ry', (dx * 14).toFixed(2) + 'deg');
      feed.style.setProperty('--rx', (-dy * 10).toFixed(2) + 'deg');
    });
    heroEl.addEventListener('pointerleave', function () { feed.style.setProperty('--ry', '0deg'); feed.style.setProperty('--rx', '0deg'); });
  }

  /* ---------- project-card spotlight ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- ticker pause ---------- */
  var tickerBtn = document.getElementById('tickerBtn');
  tickerBtn.addEventListener('click', function () {
    var wrap = tickerBtn.parentNode;
    var paused = !wrap.classList.contains('paused');
    wrap.classList.toggle('paused', paused);
    tickerBtn.setAttribute('aria-pressed', String(paused));
    tickerBtn.setAttribute('aria-label', paused
      ? (lang === 'en' ? 'Play the moving strip' : 'پخش نوار متحرک')
      : (lang === 'en' ? 'Pause the moving strip' : 'توقف نوار متحرک'));
  });
  if (reduced) tickerBtn.hidden = true;

  /* ---------- project filters ---------- */
  var grid = document.getElementById('projectGrid');
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      grid.classList.toggle('filtered', f !== 'all');
      grid.querySelectorAll('.card').forEach(function (card) {
        var show = f === 'all' || card.dataset.cat === f;
        card.hidden = !show;
        card.classList.remove('enter');
        if (show && !reduced) { void card.offsetWidth; card.classList.add('enter', 'in'); }
      });
    });
  });

  /* ---------- project dialogs ---------- */
  var lastOpener = null;
  function openDialog(id, opener) {
    var dlg = document.getElementById(id);
    if (!dlg || typeof dlg.showModal !== 'function') return;
    lastOpener = opener || null;
    dlg.showModal();
    dlg.scrollTop = 0;
    var title = dlg.querySelector('h2');
    if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
  document.querySelectorAll('.card-open').forEach(function (btn) {
    btn.addEventListener('click', function () { openDialog(btn.dataset.dialog, btn); });
  });
  document.querySelectorAll('dialog.proj').forEach(function (dlg) {
    dlg.querySelector('.proj-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () {
      dlg.querySelectorAll('video').forEach(function (v) { v.pause(); });
      if (history.replaceState && location.hash === '#' + dlg.id) history.replaceState(null, '', location.pathname + location.search + '#projects');
      if (lastOpener) lastOpener.focus();
    });
  });

  /* ---------- copy email ---------- */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      var done = function () {
        btn.classList.add('done');
        btn.setAttribute('aria-label', lang === 'en' ? 'Copied' : 'کپی شد');
        setTimeout(function () {
          btn.classList.remove('done');
          btn.setAttribute('aria-label', lang === 'en' ? 'Copy email' : 'کپی ایمیل');
        }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  /* ---------- contact form (FormSubmit, delivers to the owner's inbox) ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var formBtn = document.getElementById('formBtn');
  var OWNER = 'm22mash@gmail.com';
  var MSG = {
    fa: {
      sending: 'در حال ارسال…', wait: 'در حال ارسال پیام؛ ممکن است تا یک دقیقه طول بکشد. لطفاً صفحه را نبندید.', ok: 'پیام شما ارسال شد. به‌زودی پاسخ می‌دهم.',
      err: 'ارسال پیام انجام نشد.', net: 'اتصال به سرویس پیام برقرار نشد.',
      fallback: 'ارسال با برنامهٔ ایمیل', invalid: 'لطفاً نام، ایمیل معتبر و متن پیام را وارد کنید.',
      subject: 'پیام از سایت رزومه'
    },
    en: {
      sending: 'Sending…', wait: 'Sending your message — this can take up to a minute. Please keep this page open.', ok: 'Message sent. I’ll reply soon.',
      err: 'Couldn’t send the message.', net: 'Couldn’t reach the message service.',
      fallback: 'Send with your email app', invalid: 'Enter your name, a valid email and a message.',
      subject: 'Message from the résumé site'
    }
  };
  function setStatus(text, kind, withFallback) {
    status.textContent = text;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
    if (!withFallback) return;
    // the message is never lost: offer the visitor's own email app, pre-filled
    var body = form.elements.message.value + '\n\n— ' + form.elements.name.value + ' · ' + form.elements.email.value;
    var a = document.createElement('a');
    a.className = 'mail-fallback';
    a.href = 'mailto:' + OWNER + '?subject=' + encodeURIComponent(form.elements.subject.value || MSG[lang].subject) + '&body=' + encodeURIComponent(body);
    a.textContent = MSG[lang].fallback;
    status.appendChild(document.createTextNode(' '));
    status.appendChild(a);
  }
  form.querySelectorAll('.field input, .field textarea').forEach(function (f) {
    f.addEventListener('input', function () { f.closest('.field').classList.remove('invalid'); f.removeAttribute('aria-invalid'); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    form.querySelectorAll('[required]').forEach(function (f) {
      var ok = f.value.trim() !== '' && f.checkValidity();
      f.closest('.field').classList.toggle('invalid', !ok);
      if (ok) f.removeAttribute('aria-invalid'); else f.setAttribute('aria-invalid', 'true');
      if (!ok && !bad) { bad = true; f.focus(); }
    });
    if (bad) { setStatus(MSG[lang].invalid, 'err'); return; }
    if (form.elements._honey.value) { setStatus(MSG[lang].ok, 'ok'); form.reset(); return; }   // bot filled the trap
    var label = formBtn.querySelector('span');
    var original = label.innerHTML;
    formBtn.disabled = true;
    label.textContent = MSG[lang].sending;
    setStatus('');
    var endpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
    // the service often takes 30+ seconds; reassure the visitor instead of looking stuck
    var slow = setTimeout(function () { setStatus(MSG[lang].wait, 'wait'); }, 4000);
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          var sent = res.ok && (data.success === true || data.success === 'true');
          if (sent) { setStatus(MSG[lang].ok, 'ok'); form.reset(); }
          else { setStatus(MSG[lang].err, 'err', true); }
        });
      })
      .catch(function () { setStatus(MSG[lang].net, 'err', true); })
      .then(function () { clearTimeout(slow); formBtn.disabled = false; label.innerHTML = original; });
  });

  addEventListener('beforeprint', function () {
    document.querySelectorAll('.count').forEach(function (el) {
      el.textContent = lang === 'fa' ? toFa(el.dataset.to) : el.dataset.to;
    });
  });

  /* ---------- init ---------- */
  var initial = root.dataset.pendingLang || 'fa';
  delete root.dataset.pendingLang;
  if (initial === 'en') setLang('en', false); else updateThemeLabel();
  if (/^#p-[\w-]+$/.test(location.hash)) openDialog(location.hash.slice(1), null);
})();
