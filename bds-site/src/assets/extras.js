/* ===== Gallery lightbox · Plan tabs · YouTube facade · Loan calculator ===== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // ---- lightbox ----
  const items = $$('.gal-item');
  if (items.length) {
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Xem ảnh');
    lb.innerHTML = '<button class="lb-x" aria-label="Đóng">×</button><button class="lb-prev" aria-label="Ảnh trước">‹</button><figure class="lb-fig"><div class="lb-media"></div><figcaption></figcaption></figure><button class="lb-next" aria-label="Ảnh sau">›</button><span class="lb-count"></span>';
    document.body.append(lb);
    let cur = 0, lastFocus = null;
    const show = (i) => {
      cur = (i + items.length) % items.length;
      const it = items[cur];
      const media = it.querySelector('img,svg').cloneNode(true);
      const box = $('.lb-media', lb);
      box.replaceChildren(media);
      box.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
      $('figcaption', lb).textContent = it.dataset.cap;
      $('.lb-count', lb).textContent = `${cur + 1} / ${items.length}`;
    };
    const open = (i) => { lastFocus = document.activeElement; show(i); lb.classList.add('on'); document.body.style.overflow = 'hidden'; $('.lb-x', lb).focus(); };
    const close = () => { lb.classList.remove('on'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    items.forEach((it, i) => it.addEventListener('click', () => open(i)));
    $('.lb-x', lb).onclick = close;
    $('.lb-prev', lb).onclick = () => show(cur - 1);
    $('.lb-next', lb).onclick = () => show(cur + 1);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    addEventListener('keydown', (e) => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
    let sx = null;
    lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  // ---- tabs (mặt bằng) ----
  $$('.plans').forEach((wrap) => {
    const tabs = $$('.tab', wrap), panels = $$('.panel', wrap);
    const go = (i) => {
      tabs.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', String(k === i)); });
      panels.forEach((p, k) => {
        const on = k === i;
        p.classList.toggle('on', on);
        if (on) p.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
      });
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
    wrap.querySelector('[role=tablist]').addEventListener('keydown', (e) => {
      const i = tabs.findIndex((t) => t.classList.contains('on'));
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (j !== null) { go(j); tabs[j].focus(); }
    });
  });

  // ---- YouTube facade (chỉ tải iframe khi bấm) ----
  $$('.yt').forEach((b) => b.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.id)}?autoplay=1&rel=0`;
    f.title = b.getAttribute('aria-label') || 'Video';
    f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    b.replaceWith(f);
  }));

  // ---- loan calculator ----
  const money = (v) => {
    if (v >= 1e9) return (v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
    if (v >= 1e6) return (v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' triệu';
    return Math.round(v).toLocaleString('vi-VN') + ' đ';
  };

  $$('[data-calc]').forEach((root) => {
    const range = (n) => root.querySelector(`input[type=range][name=${n}]`);
    const val = (n) => parseFloat(range(n).value);
    const out = (k) => root.querySelector(`[data-o=${k}]`);

    $$('input[type=range]', root).forEach((r) => {
      const num = root.querySelector(`input[data-for=${r.name}]`);
      const paint = () => r.style.setProperty('--fill', `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
      r.addEventListener('input', () => { num.value = r.value; paint(); calc(); });
      num.addEventListener('change', () => {
        const v = Math.min(+r.max, Math.max(+r.min, parseFloat(num.value) || +r.min));
        num.value = v; r.value = v; paint(); calc();
      });
      paint();
    });
    $$('input[name=method]', root).forEach((x) => x.addEventListener('change', calc));
    const preset = root.querySelector('[data-preset]');
    if (preset) preset.addEventListener('change', () => {
      if (!preset.value) return;
      const r = range('price');
      r.value = preset.value;
      r.dispatchEvent(new Event('input'));
    });

    function calc() {
      const price = val('price') * 1e9, ltv = val('ltv') / 100, n = Math.round(val('years') * 12);
      const promo = val('promo') / 100 / 12, pm = val('promoMonths'), fl = val('float') / 100 / 12;
      const grace = Math.min(val('grace'), n - 1);
      const method = root.querySelector('input[name=method]:checked').value;
      const loan = price * ltv;
      const principalEach = loan / (n - grace);
      let bal = loan, totalI = 0, first = 0, max = 0;
      const years = [];
      for (let m = 0; m < n; m++) {
        const r = m < pm ? promo : fl;
        const interest = bal * r;
        let prin = 0;
        if (m >= grace) {
          if (method === 'decl') prin = Math.min(bal, principalEach);
          else {
            const left = n - m;
            const pay = r === 0 ? bal / left : (bal * r) / (1 - Math.pow(1 + r, -left));
            prin = Math.min(bal, pay - interest);
          }
        }
        const pay = prin + interest;
        if (m === 0) first = pay;
        if (pay > max) max = pay;
        bal -= prin;
        totalI += interest;
        const y = Math.floor(m / 12);
        years[y] = years[y] || { p: 0, i: 0, months: 0, bal: 0 };
        years[y].p += prin; years[y].i += interest; years[y].months++; years[y].bal = Math.max(0, bal);
      }
      out('first').textContent = money(first);
      out('equity').textContent = money(price - loan);
      out('loan').textContent = money(loan);
      out('max').textContent = money(max);
      out('interest').textContent = money(totalI);
      out('total').textContent = money(loan + totalI);
      out('income').textContent = money(max / 0.5);

      const W = 600, H = 220, pad = 24, bw = (W - pad * 2) / years.length;
      const peak = Math.max(...years.map((y) => (y.p + y.i) / y.months)) || 1;
      let bars = '';
      years.forEach((y, k) => {
        const hp = (y.p / y.months / peak) * (H - 40), hi = (y.i / y.months / peak) * (H - 40);
        const x = pad + k * bw + bw * 0.15, w = bw * 0.7;
        bars += `<g><title>Năm ${k + 1}: TB ${money((y.p + y.i) / y.months)}/tháng</title><rect class="b-i" x="${x}" y="${H - 20 - hi - hp}" width="${w}" height="${hi}" rx="2"/><rect class="b-p" x="${x}" y="${H - 20 - hp}" width="${w}" height="${hp}" rx="2"/></g>`;
        if (years.length <= 12 || k % 5 === 0 || k === years.length - 1) bars += `<text x="${x + w / 2}" y="${H - 5}" text-anchor="middle">${k + 1}</text>`;
      });
      out('chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}">${bars}<line x1="${pad}" x2="${W - pad}" y1="${H - 20}" y2="${H - 20}" class="axis"/></svg>`;
      out('table').innerHTML = years.map((y, k) => `<tr><td>${k + 1}</td><td>${money(y.p)}</td><td>${money(y.i)}</td><td>${money((y.p + y.i) / y.months)}</td><td>${money(y.bal)}</td></tr>`).join('');
    }
    calc();
  });
})();
