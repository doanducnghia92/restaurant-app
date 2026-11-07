/* LUXE Estates — interactions (vanilla, không thư viện) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---- split text (words / chars) ----
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) return frag.append(t);
            const w = document.createElement('span');
            w.className = 'w';
            w.innerHTML = `<span>${t}</span>`;
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    $$('.w>span', el).forEach((s, i) => s.style.setProperty('--i', i));
  };
  $$('.split').forEach(splitWords);
  let ci = 0;
  $$('.split-chars').forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((ch) => {
            if (ch === ' ') return frag.append(' ');
            const c = document.createElement('span');
            c.className = 'c';
            c.textContent = ch;
            c.style.setProperty('--i', ci++);
            frag.append(c);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('loaded'), 60));

  // ---- reveal on scroll ----
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  $$('.reveal, .split').forEach((el) => io.observe(el));

  // ---- counters ----
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const fmt = (n) => n.toLocaleString('vi-VN');
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 4)))); if (k < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = fmt(to)) : requestAnimationFrame(step);
    cio.unobserve(el);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  // ---- rotator ----
  const rot = $$('.rot b');
  if (rot.length > 1 && !reduce) {
    let k = 0;
    setInterval(() => {
      const cur = rot[k]; k = (k + 1) % rot.length; const nx = rot[k];
      cur.classList.remove('on'); cur.classList.add('out');
      nx.classList.remove('out'); nx.classList.add('on');
      setTimeout(() => cur.classList.remove('out'), 800);
    }, 2600);
  }

  // ---- header / progress / dock / parallax (one rAF loop) ----
  const hdr = $('.hdr'), prog = $('.progress'), dock = $('.dock');
  const l1 = $('.skyline.l1'), l2 = $('.skyline.l2'), orb = $('.orb');
  const plx = $$('.parallax');
  const devs = $('.devs'), track = $('.devs-track');
  let lastY = scrollY, ticking = false;
  const setDevsHeight = () => {
    if (!devs || !track) return;
    if (innerWidth <= 900 || reduce) { devs.style.height = ''; track.style.transform = ''; return; }
    const dist = track.scrollWidth - innerWidth;
    devs.style.height = `${innerHeight + Math.max(0, dist)}px`;
  };
  const onScroll = () => {
    const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    prog && prog.style.setProperty('--p', H > 0 ? y / H : 0);
    if (hdr) {
      hdr.classList.toggle('solid', y > 40);
      hdr.classList.toggle('hide', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
    }
    dock && dock.classList.toggle('show', y > 300);
    if (!reduce) {
      if (l1) l1.style.transform = `translate3d(0,${y * 0.18}px,0)`;
      if (l2) l2.style.transform = `translate3d(0,${y * 0.08}px,0)`;
      if (orb) orb.style.translate = `0 ${y * 0.3}px`;
      plx.forEach((el) => { el.style.transform = `translate3d(0,${y * (+el.dataset.speed || 0.2)}px,0)`; });
      if (devs && track && innerWidth > 900) {
        const r = devs.getBoundingClientRect();
        const dist = track.scrollWidth - innerWidth;
        const k = Math.min(1, Math.max(0, -r.top / (devs.offsetHeight - innerHeight || 1)));
        track.style.transform = `translate3d(${-k * Math.max(0, dist)}px,0,0)`;
      }
    }
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { setDevsHeight(); onScroll(); });
  addEventListener('load', setDevsHeight);
  setDevsHeight(); onScroll();

  // ---- menu ----
  const burger = $('.burger');
  burger && burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    $('.menu').setAttribute('aria-hidden', !open);
  });
  $$('.menu a').forEach((a) => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }));

  // ---- custom cursor + magnetic + tilt (desktop only) ----
  if (fine && !reduce) {
    const cur = $('.cursor'), dot = $('.cursor-dot'), label = $('.cursor-label');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate3d(${mx}px,${my}px,0)`; }, { passive: true });
    const loop = () => { cx = lerp(cx, mx, 0.16); cy = lerp(cy, my, 0.16); cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('a,button,summary,select,input,[data-cursor]');
      const lab = t && t.closest('[data-cursor]');
      cur.classList.toggle('is-hover', !!t && !lab);
      cur.classList.toggle('is-label', !!lab);
      label.textContent = lab ? lab.dataset.cursor : '';
    });
    document.addEventListener('mouseleave', () => { cur.style.opacity = 0; dot.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = 1; dot.style.opacity = 1; });

    $$('.magnetic').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', `${(e.clientX - r.left - r.width / 2) * 0.28}px`);
        b.style.setProperty('--by', `${(e.clientY - r.top - r.height / 2) * 0.38}px`);
      });
      b.addEventListener('mouseleave', () => { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });

    $$('.tilt').forEach((c) => {
      const link = $('.card-link', c);
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        link.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
        link.style.setProperty('--ry', `${(px - 0.5) * 10}deg`);
        link.style.setProperty('--mx', `${px * 100}%`);
        link.style.setProperty('--my', `${py * 100}%`);
      });
      c.addEventListener('mouseleave', () => { link.style.setProperty('--rx', '0deg'); link.style.setProperty('--ry', '0deg'); });
    });
  }

  // ---- hero: gold dust particles + constellation lines that follow pointer ----
  const cv = $('.hero-canvas');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let W, H, dpr, pts = [], run = true;
    const pointer = { x: -999, y: -999 };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (W * H) / 14000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: -0.1 - Math.random() * 0.3, r: Math.random() * 1.6 + 0.3, a: Math.random() * 0.6 + 0.2, t: Math.random() * 6.28 }));
    };
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; }, { passive: true });
    cv.parentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = -999; });
    new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run) requestAnimationFrame(draw); }).observe(cv);
    function draw() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.t += 0.02; p.x += p.vx + Math.sin(p.t) * 0.15; p.y += p.vy;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { const f = (16000 - d2) / 16000; p.x += (dx / Math.sqrt(d2 + 1)) * f * 2.2; p.y += (dy / Math.sqrt(d2 + 1)) * f * 2.2; }
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        const tw = p.a * (0.6 + Math.sin(p.t * 2) * 0.4);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(176,138,76,${tw})`; ctx.shadowColor = 'rgba(196,160,106,.6)'; ctx.shadowBlur = 6; ctx.fill();
      }
      ctx.shadowBlur = 0;
      for (const p of pts) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy);
        if (d < 170) { ctx.strokeStyle = `rgba(168,132,74,${(1 - d / 170) * 0.3})`; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke(); }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // ---- filtering (home chips + listing toolbar) ----
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const cards = $$('.grid.cards .card');
  const animateFilter = (test) => {
    const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
    let n = 0;
    cards.forEach((c) => { const ok = test(c); c.classList.toggle('hidden', !ok); if (ok) n++; });
    if (!reduce) cards.forEach((c) => {
      if (c.classList.contains('hidden')) return;
      const a = first.get(c), b = c.getBoundingClientRect();
      if (!a.width) { c.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' }); return; }
      c.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
    cards.forEach((c) => c.classList.add('in'));
    return n;
  };
  $$('.chip').forEach((ch) => ch.addEventListener('click', () => {
    $$('.chip').forEach((x) => x.classList.toggle('on', x === ch));
    const f = ch.dataset.f;
    animateFilter((c) => f === 'all' || c.dataset.dev === f);
  }));
  const tb = $('.toolbar');
  if (tb) {
    const q = $('.tb-q', tb), dv = $('.tb-dev', tb), ar = $('.tb-area', tb), ty = $('.tb-type', tb);
    const params = new URLSearchParams(location.search);
    if (params.get('q')) q.value = params.get('q');
    if (params.get('dev')) dv.value = params.get('dev');
    const apply = () => {
      const qq = norm(q.value);
      const n = animateFilter((c) =>
        (!qq || norm(c.textContent).includes(qq)) && (!dv.value || c.dataset.dev === dv.value) && (!ar.value || c.dataset.area === ar.value) && (!ty.value || c.dataset.types.split('|').includes(ty.value)));
      $('.tb-count b', tb).textContent = n;
      $('.empty').hidden = n > 0;
    };
    [q, dv, ar, ty].forEach((el) => el.addEventListener('input', apply));
    if (params.get('q') || params.get('dev')) apply();
  }

  // ---- lead form ----
  const toast = (msg) => { const t = $('.toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 4200); };
  $$('.form').forEach((f) => f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = f.name.value.trim(), phone = f.phone.value.replace(/\s/g, '');
    f.name.parentElement.classList.toggle('err', !name);
    f.phone.parentElement.classList.toggle('err', !/^\+?\d{9,12}$/.test(phone));
    if (!name || !/^\+?\d{9,12}$/.test(phone)) return toast('Vui lòng nhập họ tên và số điện thoại hợp lệ');
    const data = { name, phone, project: f.project.value || 'Tất cả', budget: f.budget.value, page: location.href };
    const S = window.__SITE || {};
    if (S.preview) { toast('Bản xem thử: form chưa kết nối máy chủ. Vui lòng gọi hotline để được tư vấn.'); return; }
    if (S.endpoint) {
      try { await fetch(S.endpoint, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain' } }); toast('Cảm ơn anh/chị! Chuyên viên sẽ liên hệ trong 15 phút.'); f.reset(); return; } catch { /* fallback */ }
    }
    const body = encodeURIComponent(`Họ tên: ${data.name}\nSĐT: ${data.phone}\nDự án: ${data.project}\nNgân sách: ${data.budget}\nTrang: ${data.page}`);
    location.href = `mailto:${S.email}?subject=${encodeURIComponent('Đăng ký nhận bảng giá ' + data.project)}&body=${body}`;
    toast('Cảm ơn anh/chị! Chúng tôi sẽ liên hệ sớm.');
    f.reset();
  }));
})();
