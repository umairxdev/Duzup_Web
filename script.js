(() => {
  'use strict';
  const REPO = 'umairxdev/Duzup';
  const RELEASES = `https://github.com/${REPO}/releases/latest`;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Latest release: point every download button at the APK ---------- */
  function applyRelease(rel) {
    const apk = (rel.assets || []).find((a) => /\.apk$/i.test(a.name));
    if (apk) {
      $$('[data-download]').forEach((a) => {
        a.href = apk.browser_download_url;
        a.setAttribute('download', apk.name);
      });
    }
  }
  (async () => {
    try {
      const cached = sessionStorage.getItem('duzup-release');
      if (cached) { applyRelease(JSON.parse(cached)); return; }
    } catch (_) { /* storage unavailable */ }
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(res.status);
      const rel = await res.json();
      applyRelease(rel);
      try { sessionStorage.setItem('duzup-release', JSON.stringify(rel)); } catch (_) { /* ignore */ }
    } catch (_) {
      // Buttons keep their static link to /releases/latest.
      $$('[data-download]').forEach((a) => { a.href = RELEASES; });
    }
  })();

  /* ---------- Hero carousel ---------- */
  const slides = $$('#slides .slide');
  const dots = $$('#dots button');
  let cur = 0;
  let timer = null;
  const go = (n) => {
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('on', i === cur));
    dots.forEach((d, i) => { d.classList.toggle('on', i === cur); d.setAttribute('aria-selected', String(i === cur)); });
  };
  const play = () => { stop(); if (!reduce) timer = setInterval(() => go(cur + 1), 3400); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); play(); }));
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
  play();

  /* ---------- Hero phone: build the edge slices, then pointer tilt + scroll drift ---------- */
  const phone = document.getElementById('phone');
  const slices = document.getElementById('slices');
  if (slices) {
    const depth = 16;
    for (let k = 0; k < depth; k++) {
      const i = document.createElement('i');
      i.style.transform = `translateZ(${(depth / 2 - k).toFixed(1)}px)`;
      slices.appendChild(i);
    }
  }
  const device = document.querySelector('.hero-device');
  let scrollY = 0;
  if (phone && !reduce) {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const setTilt = (rx, ry) => { phone.style.setProperty('--rx', rx + 'deg'); phone.style.setProperty('--ry', ry + 'deg'); };
    if (fine && device) {
      device.addEventListener('pointermove', (e) => {
        const r = device.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        phone.classList.add('live');
        setTilt((4 - y * 10).toFixed(2), (-18 + x * 14).toFixed(2));
      });
      device.addEventListener('pointerleave', () => { phone.classList.remove('live'); setTilt(4, -18); });
    }
  }

  /* ---------- Scroll effects: progress bar, nav shadow, phone drift ---------- */
  const bar = document.getElementById('progress');
  const nav = document.querySelector('.nav');
  let ticking = false;
  const onScroll = () => {
    scrollY = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    if (nav) nav.classList.toggle('scrolled', scrollY > 8);
    if (phone && !reduce && scrollY < window.innerHeight) phone.style.setProperty('--py', (scrollY * -0.08).toFixed(1) + 'px');
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Gallery: highlight the centred card, arrow buttons ---------- */
  const gallery = document.getElementById('gallery');
  if (gallery) {
    const cards = $$('.shot-card', gallery);
    const mark = () => {
      const mid = gallery.scrollLeft + gallery.clientWidth / 2;
      let best = 0, bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    };
    let raf = 0;
    gallery.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark); }, { passive: true });
    const step = (dir) => {
      const i = Math.max(0, Math.min(cards.length - 1, mark() + dir));
      const c = cards[i];
      gallery.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - gallery.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    };
    document.getElementById('gal-prev')?.addEventListener('click', () => step(-1));
    document.getElementById('gal-next')?.addEventListener('click', () => step(1));
    gallery.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    window.addEventListener('resize', mark);
    // Start on the first card; centre it once layout is known.
    requestAnimationFrame(() => { gallery.scrollLeft = 0; mark(); });
  }

  /* ---------- Quick add demo ---------- */
  const textEl = document.getElementById('qa-text');
  const chipsEl = document.getElementById('qa-chips');
  if (textEl && chipsEl) {
    const demos = [
      { text: 'call mom tomorrow 6pm', kind: ['Task', 'i-task'], chips: ['Tomorrow', '6:00 PM'] },
      { text: 'team meeting friday 3pm', kind: ['Event', 'i-event'], chips: ['Friday', '3:00 PM'] },
      { text: 'netflix $12.99 every month', kind: ['Bill', 'i-bill'], chips: ['$12.99', 'Every month'] },
      { text: "sara's birthday mar 5", kind: ['Birthday', 'i-cake'], chips: ['Mar 5', 'Every year'] },
      { text: 'gym every mon wed fri 7am', kind: ['Routine', 'i-routine'], chips: ['Mon, Wed, Fri', '7:00 AM'] },
      { text: 'wifi password is in the drawer', kind: ['Note', 'i-note'], chips: ['No reminder'] },
    ];
    const ns = 'http://www.w3.org/2000/svg';
    const icon = (id) => {
      const s = document.createElementNS(ns, 'svg');
      const u = document.createElementNS(ns, 'use');
      u.setAttribute('href', '#' + id);
      s.appendChild(u);
      return s;
    };
    const chip = (label, cls, ic) => {
      const c = document.createElement('span');
      c.className = 'chip' + (cls ? ' ' + cls : '');
      if (ic) c.appendChild(icon(ic));
      c.appendChild(document.createTextNode(label));
      return c;
    };
    const showChips = (d) => {
      chipsEl.replaceChildren(chip(d.kind[0], 'kind-chip', d.kind[1]), ...d.chips.map((t) => chip(t)));
    };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let running = true;
    let token = 0;

    async function loop() {
      const mine = ++token;
      const live = () => running && token === mine;
      let i = 0;
      while (live()) {
        const d = demos[i % demos.length];
        chipsEl.replaceChildren();
        textEl.textContent = '';
        for (const ch of d.text) {
          if (!live()) return;
          textEl.textContent += ch;
          await sleep(48);
        }
        await sleep(260);
        showChips(d);
        await sleep(2400);
        i++;
      }
    }

    const qa = document.querySelector('.qa');
    if (reduce) {
      textEl.textContent = demos[0].text;
      showChips(demos[0]);
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          running = e.isIntersecting;
          if (running) loop();
        });
      }, { threshold: 0.35 }).observe(qa);
    } else {
      loop();
    }
  }
})();
