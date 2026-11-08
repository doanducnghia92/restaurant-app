// chukieu engine — dựng cụm typo bằng DOM, render từng khung theo thời gian (deterministic).
// API: await CK.init(spec, templates, palettes, fonts); CK.renderAt(t) -> số cụm đang hiện; CK.info()
(function () {
  const BASE = 200;                       // H (cỡ chữ gốc) trong không gian cụm, px
  const SCRIPT_ROLES = { R4: 1, R5: 1 };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const E = {
    outCubic: p => 1 - Math.pow(1 - p, 3),
    outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
    inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outBack: p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
  };
  const hash = (i, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  function rgba(hex, a) {
    if (!hex || hex[0] !== '#') return hex;
    let h = hex.slice(1); if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const graphemes = s => (seg ? Array.from(seg.segment(s), x => x.segment) : Array.from(s));

  let SPEC, TPL, PAL, FONTS, W, Hc, stage, defs, clusters = [], fcount = 0;

  function palette(name, style) {
    if (!name) return null;
    if (typeof name === 'object') return name;
    if (name[0] === '#') return { solid: name, glow: name };
    return (PAL[style] && PAL[style][name]) || PAL.B[name] || PAL.A[name] || PAL.neutral[name] || null;
  }
  function color(key, cl) {
    if (!key) return PAL.neutral.white;
    if (key === 'p1') return cl.p1;
    if (key === 'p2') return cl.p2;
    if (key.startsWith('solid:')) { const p = color(key.slice(6), cl); return { solid: p.solid, glow: p.glow }; }
    return palette(key, cl.style) || PAL.neutral.white;
  }
  function gradient(stops, padY) {
    // padY = tỉ lệ đệm trên/dưới so với chiều cao hộp; ánh xạ gradient vào vùng thân chữ
    const ct = padY, cont = 1 - 2 * ct, a = (ct + 0.1 * cont) * 100, b = (ct + 0.93 * cont) * 100;
    const mapped = stops.map(s => {
      const m = s.match(/^(\S+)\s+([\d.]+)%$/);
      return m ? `${m[1]} ${(a + (b - a) * parseFloat(m[2]) / 100).toFixed(2)}%` : s;
    });
    return `linear-gradient(180deg, ${mapped.join(', ')})`;
  }
  function applyFill(node, fill, cl, padYfrac, L) {
    const s = node.style;
    if (fill === 'img') {
      const img = cl.image;
      if (img) {
        s.backgroundImage = `url("${img}")`; s.backgroundSize = 'cover'; s.backgroundPosition = '50% 50%';
        s.webkitBackgroundClip = 'text'; s.backgroundClip = 'text'; s.color = 'transparent';
        s.webkitTextStroke = '0.012em rgba(255,255,255,0.35)';
        L.imgNodes.push(node); return;
      }
      fill = 'p1';
    }
    const c = color(fill, cl);
    if (c.stops) {
      s.backgroundImage = gradient(c.stops, padYfrac);
      s.webkitBackgroundClip = 'text'; s.backgroundClip = 'text'; s.color = 'transparent';
    } else { s.color = c.solid; }
  }
  function fontCSS(roleKey, def) {
    const r = FONTS.roles[roleKey] || FONTS.roles.R1;
    return {
      family: r.stack.map(f => `"${f}"`).join(', ') + ', sans-serif',
      weight: def.weight || r.weight || 400,
      italic: def.italic !== undefined ? def.italic : !!r.italic,
      upper: def.upper !== undefined ? def.upper : !!r.upper
    };
  }
  function styleText(el, def, fs) {
    const f = fontCSS(def.role, def);
    Object.assign(el.style, {
      fontFamily: f.family, fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal',
      fontSize: fs + 'px', lineHeight: '1', whiteSpace: 'nowrap',
      letterSpacing: (def.tracking || 0) + 'em', textTransform: f.upper ? 'uppercase' : 'none'
    });
  }
  function glowCSS(L, mult = 1) {
    const g = L.glowColor, str = L.glow * mult, fs = L.fs;
    const out = [`drop-shadow(0 ${(0.02 * fs).toFixed(1)}px ${(0.045 * fs).toFixed(1)}px rgba(0,0,0,0.55))`];
    if (str > 0 && g && g !== '#000000') {
      out.push(`drop-shadow(0 0 ${(0.035 * fs * str).toFixed(1)}px ${rgba(g, 0.85)})`);
      out.push(`drop-shadow(0 0 ${(0.14 * fs * str).toFixed(1)}px ${rgba(g, 0.55)})`);
    }
    return out.join(' ');
  }
  function newFilter() {
    const id = 'ckf' + (fcount++);
    const f = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    f.setAttribute('id', id); f.setAttribute('x', '-60%'); f.setAttribute('y', '-120%');
    f.setAttribute('width', '220%'); f.setAttribute('height', '340%');
    const b = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    b.setAttribute('stdDeviation', '0 0'); f.appendChild(b); defs.appendChild(f);
    return { id, blur: b };
  }

  // ---------- dựng từng loại lớp ----------
  function buildText(L, text, cl) {
    const def = L.def, fs = def.size * BASE; L.fs = fs;
    const script = SCRIPT_ROLES[def.role];
    const padX = script ? 0.55 : 0.25, padY = 0.5;
    const t = document.createElement('div'); t.className = 'ck-text';
    styleText(t, def, fs);
    t.style.padding = `${padY}em ${padX}em`;
    L.pad = { x: padX * fs, y: padY * fs };
    const padFrac = padY / (1 + 2 * padY);
    const needSplit = def.split || ['A06', 'A07', 'A14'].includes(def.anim);
    if (def.type === 'ghost') {
      t.textContent = text; t.style.color = 'transparent';
      t.style.webkitTextStroke = `${(def.strokeW || 0.02)}em ${def.color || '#FFFFFF'}`;
    } else if (needSplit) {
      const mode = def.split || 'char';
      const parts = mode === 'word' ? text.split(/(\s+)/).filter(x => x.length) : graphemes(text);
      L.parts = [];
      parts.forEach(p => {
        const sp = document.createElement('span'); sp.textContent = p;
        Object.assign(sp.style, { display: 'inline-block', whiteSpace: 'pre', padding: '0.5em 0.12em', margin: '-0.5em -0.12em' });
        if (/^\s+$/.test(p)) { t.appendChild(sp); return; }
        applyFill(sp, def.fill || 'white', cl, 0.5 / 2, L);
        t.appendChild(sp); L.parts.push(sp);
      });
    } else {
      t.textContent = text;
      applyFill(t, def.fill || 'white', cl, padFrac, L);
    }
    if (def.anim === 'A13') {   // bóng kéo theo: 2 bản sao
      L.echo = [0, 1].map(() => { const c = t.cloneNode(true); c.style.position = 'absolute'; c.style.left = '0'; c.style.top = '0'; return c; });
      L.echo.forEach(c => L.el.appendChild(c));
    }
    L.inner = t; L.el.appendChild(t);
    L.measure = () => { L.w = t.offsetWidth - 2 * L.pad.x; L.h = t.offsetHeight - 2 * L.pad.y; };
  }
  function pillNode(text, def, cl, fs) {
    const p = document.createElement('div');
    styleText(p, def, fs);
    const bg = color(def.bg || 'p1', cl);
    const rad = def.radius !== undefined ? def.radius + 'em' : '999px';
    Object.assign(p.style, {
      display: 'inline-block', padding: '0.2em 0.65em 0.24em', borderRadius: rad, color: def.color || '#FFFFFF',
      background: bg.stops ? `linear-gradient(180deg, ${bg.stops.join(', ')})` : bg.solid,
      boxShadow: `inset 0 ${0.06 * fs}px ${0.08 * fs}px rgba(255,255,255,0.45), inset 0 -${0.05 * fs}px ${0.08 * fs}px rgba(0,0,0,0.25)`
    });
    p.textContent = text; return p;
  }
  function buildPill(L, text, cl) {
    const def = L.def, fs = def.size * BASE; L.fs = fs; L.pad = { x: 0, y: 0 };
    const p = pillNode(text, def, cl, fs); L.inner = p; L.el.appendChild(p);
    L.measure = () => { L.w = p.offsetWidth; L.h = p.offsetHeight; };
  }
  function buildBars(L, text, cl) {
    const def = L.def, fs = def.size * BASE; L.fs = fs; L.pad = { x: 0, y: 0 };
    const items = Array.isArray(text) ? text : String(text).split('|');
    const col = document.createElement('div');
    Object.assign(col.style, { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: (def.gap || 0.1) * BASE + 'px' });
    L.parts = items.map(it => { const p = pillNode(it.trim(), Object.assign({ radius: 0.18 }, def), cl, fs); col.appendChild(p); return p; });
    L.inner = col; L.el.appendChild(col);
    L.measure = () => { L.w = col.offsetWidth; L.h = col.offsetHeight; };
  }
  function buildTiles(L, text, cl) {
    const def = L.def, sz = def.size * BASE; L.fs = sz; L.pad = { x: 0, y: 0 };
    const n = Math.max(1, Math.min(9, parseInt(String(text).match(/\d+/) || ['3'], 10)));
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: (def.gap || 0.14) * BASE + 'px' });
    const bg = color(def.bg || 'p1', cl);
    L.parts = [];
    for (let i = 1; i <= n; i++) {
      const tl = document.createElement('div');
      styleText(tl, Object.assign({}, def, { tracking: 0 }), sz * 0.62);
      Object.assign(tl.style, {
        width: sz + 'px', height: sz + 'px', borderRadius: 0.2 * sz + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: def.color || '#fff', background: bg.stops ? `linear-gradient(160deg, ${bg.stops.join(', ')})` : bg.solid,
        boxShadow: `inset 0 ${0.06 * sz}px ${0.1 * sz}px rgba(255,255,255,0.5), inset 0 -${0.08 * sz}px ${0.12 * sz}px rgba(0,0,0,0.35)`
      });
      tl.textContent = i; row.appendChild(tl); L.parts.push(tl);
    }
    L.inner = row; L.el.appendChild(row);
    L.measure = () => { L.w = row.offsetWidth; L.h = row.offsetHeight; };
  }
  function buildIcon(L, name, cl) {
    const def = L.def, sz = def.size * BASE; L.fs = sz; L.pad = { x: 0, y: 0 };
    const c = color(def.color || 'p1', cl);
    const box = document.createElement('div'); box.style.width = box.style.height = sz + 'px';
    if (window.CK_STICKERS[name]) { box.innerHTML = window.CK_STICKERS[name]; box.firstChild.style.width = box.firstChild.style.height = '100%'; }
    else {
      const body = window.CK_ICONS[name] || window.CK_ICONS.star;
      box.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="${c.solid}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
      L.paths = Array.from(box.querySelectorAll('path,circle,rect')).map(p => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; return p; });
    }
    L.glowColor = c.glow; L.inner = box; L.el.appendChild(box);
    L.measure = () => { L.w = sz; L.h = sz; };
  }
  const SWOOSH = {
    arc: 'M2,36 C30,40 66,30 98,4', under: 'M2,18 C25,34 70,34 98,12',
    brush: 'M2,30 C35,22 62,22 98,8', wave: 'M2,24 C20,4 40,40 60,20 S90,10 98,14'
  };
  function buildSwoosh(L, _t, cl) {
    const def = L.def; L.fs = def.size * BASE; L.pad = { x: 0, y: 0 };
    const c = color(def.color || 'p2', cl);
    const box = document.createElement('div');
    const d0 = SWOOSH[def.shape] || SWOOSH.arc, th = (def.thick || 0.06) * BASE;
    L.glowColor = c.glow; L.inner = box; L.el.appendChild(box);
    L.measure = (target) => {
      L.w = (target ? target.w : BASE * 2) * (def.width || 1); L.h = L.fs;
      // đổi toạ độ 100×40 sang px thật để nét đều và vẽ dần (dash) chính xác
      let k = 0; const d = d0.replace(/-?[\d.]+/g, n => (k++ % 2 === 0 ? (parseFloat(n) / 100) * L.w : (parseFloat(n) / 40) * L.h).toFixed(1));
      box.style.width = L.w + 'px'; box.style.height = L.h + 'px';
      box.innerHTML = `<svg width="${L.w}" height="${L.h}" viewBox="0 0 ${L.w} ${L.h}" fill="none" stroke-linecap="round" style="overflow:visible">
        <path d="${d}" stroke="${c.solid}" stroke-width="${th}"/><path d="${d}" stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="${th * 0.3}"/></svg>`;
      L.paths = Array.from(box.querySelectorAll('path')).map(p => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; return p; });
    };
  }
  function buildSpread(L, text, cl) {
    L.def = Object.assign({ split: 'word' }, L.def);
    buildText(L, text, cl);
    L.inner.style.display = 'flex'; L.inner.style.justifyContent = 'space-between';
    const m0 = L.measure;
    L.measure = (target) => { if (target) L.inner.style.width = (target.w * (L.def.width || 1)) + 'px'; L.inner.style.boxSizing = 'content-box'; m0(); };
  }

  // ---------- dựng cụm ----------
  function buildCluster(c, idx) {
    const tpl = TPL[c.template];
    if (!tpl) throw new Error(`Không có mẫu ${c.template}`);
    const style = c.style || tpl.style || 'B';
    const cl = {
      spec: c, idx, style, tpl,
      p1: palette(c.palette || tpl.palette || (style === 'A' ? 'mint' : 'ice'), style),
      p2: palette(c.palette2 || tpl.palette2 || (style === 'A' ? 'gold' : 'gold'), style),
      image: c.image || (c.texts && c.texts.image) || null,
      layers: [], t_in: c.t_in, t_out: c.t_out,
      exit: c.exit || (style === 'A' ? 'blur' : 'cut'),
      stagger: c.stagger !== undefined ? c.stagger : (style === 'A' ? 0.16 : 0.12)
    };
    const root = document.createElement('div'); root.className = 'ck-cluster';
    Object.assign(root.style, { position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', visibility: 'hidden' });
    stage.appendChild(root); cl.root = root;
    const texts = c.texts || {};
    const overrides = c.layers || {};          // ghi đè thuộc tính theo id lớp
    tpl.layers.forEach((d0, i) => {
      const type = d0.type || 'text';
      const id = d0.id || (type === 'text' ? d0.slot : type + i);
      const def = Object.assign({}, d0, overrides[id] || {});
      if (c.anims && c.anims[id]) def.anim = c.anims[id];
      let content = def.slot ? texts[def.slot] : null;
      if (type === 'icon') content = texts.icon || c.icon || def.icon;
      if (type === 'swoosh') content = 'x';
      if (content === undefined || content === null || content === '') return;
      if (typeof content === 'string') content = content.normalize('NFC');
      const L = { def, id, type, cl, imgNodes: [], el: document.createElement('div') };
      Object.assign(L.el.style, { position: 'absolute', left: 0, top: 0, zIndex: 10 + (def.z || 0) });
      root.appendChild(L.el);
      const isWhite = !def.fill || def.fill === 'white';
      L.glow = def.glow !== undefined ? def.glow : (def.fill === 'grey' ? 0 : isWhite ? 0.45 : (style === 'A' ? 0.7 : 0.95));
      L.glowColor = def.fill === 'grey' ? null : color(def.fill === 'img' ? 'p1' : (def.fill || 'white'), cl).glow;
      ({ text: buildText, ghost: buildText, pill: buildPill, bars: buildBars, tiles: buildTiles, icon: buildIcon, swoosh: buildSwoosh, spread: buildSpread }[type] || buildText)(L, content, cl);
      if (type === 'ghost') L.glow = 0;
      if (type === 'pill' || type === 'bars' || type === 'tiles') { L.glow = def.glow !== undefined ? def.glow : 0.6; L.glowColor = color(def.bg || 'p1', cl).glow; }
      L.filter = newFilter();
      L.phase = hash(idx * 31 + i) * 6.28;
      cl.layers.push(L);
    });
    // thời điểm bắt đầu từng lớp
    const times = c.times || {};
    cl.layers.forEach((L, k) => {
      const key = L.def.slot && L.type !== 'ghost' ? L.def.slot : L.id;
      const tExplicit = times[L.id] !== undefined ? times[L.id] : times[key];
      L.start = tExplicit !== undefined ? tExplicit + (L.def.delay || 0)
        : Math.max(cl.t_in, cl.t_in + k * cl.stagger + (L.def.delay || 0));
    });
    return cl;
  }
  function pt(b, code) {
    const v = code[0], h = code[1];
    return { x: b.x + (h === 'l' ? 0 : h === 'c' ? b.w / 2 : b.w), y: b.y + (v === 't' ? 0 : v === 'm' ? b.h / 2 : b.h) };
  }
  function layoutCluster(cl) {
    const byId = {};
    cl.layers.forEach((L, i) => {
      const at = L.def.at;
      let target = at ? (byId[at[0]] || byId.hero || cl.layers[0]) : null;
      L.measure(target);
      if (!at || i === 0) { L.x = 0; L.y = 0; }
      else {
        const P = pt(target, at[1]), S = pt({ x: 0, y: 0, w: L.w, h: L.h }, at[2]);
        L.x = P.x - S.x + (at[3] || 0) * BASE; L.y = P.y - S.y + (at[4] || 0) * BASE;
      }
      byId[L.id] = L;
      L.el.style.left = (L.x - L.pad.x) + 'px'; L.el.style.top = (L.y - L.pad.y) + 'px';
      L.origin = `${L.pad.x + L.w / 2}px ${L.pad.y + L.h / 2}px`;
    });
    // khung bao + co giãn vừa vùng an toàn
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    cl.layers.forEach(L => { if (L.def.nobox) return; x0 = Math.min(x0, L.x); y0 = Math.min(y0, L.y); x1 = Math.max(x1, L.x + L.w); y1 = Math.max(y1, L.y + L.h); });
    const c = cl.spec, k = W / 1080;
    const heroPx = (c.size || (cl.style === 'A' ? 150 : 165)) * k;
    const maxW = (c.maxW || 780) * k, maxH = (c.maxH || 560) * k;
    const bw = x1 - x0, bh = y1 - y0;
    const s = Math.min(heroPx / BASE, maxW / bw, maxH / bh);
    const POS = { upper: { x: 540, y: 470 }, middle: { x: 468, y: 880 }, lower: { x: 468, y: 1130 } };
    let pos = typeof c.pos === 'object' ? c.pos : POS[c.pos || 'lower'] || POS.lower;
    pos = { x: pos.x * k, y: pos.y * (Hc / 1920) };
    let tx = pos.x - (x0 + bw / 2) * s, ty = pos.y - (y0 + bh / 2) * s;
    // ép vào vùng an toàn TikTok (thang 1080×1920)
    const top = 235 * Hc / 1920, bot = 1390 * Hc / 1920, left = 60 * k;
    let fy0 = ty + y0 * s, fy1 = ty + y1 * s;
    if (fy0 < top) ty += top - fy0; if (fy1 > bot) ty -= fy1 - bot;
    fy1 = ty + y1 * s;
    const right = (fy1 > 800 * Hc / 1920 ? 875 : 1020) * k;
    let fx0 = tx + x0 * s, fx1 = tx + x1 * s;
    if (fx0 < left) tx += left - fx0; if (fx1 > right) tx -= fx1 - right;
    cl.root.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    cl.bbox = { x: tx + x0 * s, y: ty + y0 * s, w: bw * s, h: bh * s, scale: s };
  }

  // ---------- animation ----------
  function animState(L, lt, t) {
    const d = L.def, cl = L.cl, st = { op: 1, x: 0, y: 0, sc: 1, scx: 1, scy: 1, rot: 0, bx: 0, by: 0, blur: 0, ghost: 0, mask: null, draw: null, extra: '', bright: 1, track: null };
    const name = d.anim || 'A01';
    if (lt < 0) {
      if (name === 'A02' && t >= cl.t_in) { st.ghost = 1; st.op = 0.45; return st; }
      st.op = 0; return st;
    }
    const fs = L.fs;
    switch (name) {
      case 'A01': { const p = E.outCubic(clamp(lt / 0.3)); st.op = p; st.blur = (1 - p) * 0.06 * fs; st.y = (1 - p) * 0.06 * BASE; break; }
      case 'A02': { const p = clamp(lt / 0.15); st.ghost = 1 - p; st.op = 0.45 + 0.55 * p; break; }
      case 'A03': case 'A11': {
        const dur = d.dur || (L.paths ? 0.45 : clamp(0.22 + 0.045 * (L.inner.textContent || '').length, 0.35, 0.8));
        const p = (L.paths ? E.inOutCubic : E.inOutSine)(clamp(lt / dur));
        if (L.paths) st.draw = p; else st.mask = p;
        st.op = clamp(lt / 0.05); break;
      }
      case 'A04': {
        const q = 1 - clamp(lt / 0.14);
        st.by = 0.35 * fs * q; st.scy = 1 + 0.45 * q;
        st.op = q > 0 ? [0.55, 1, 0.65, 1][Math.floor(lt / 0.035) % 4] : 1;
        if (q > 0) st.extra = `drop-shadow(${(0.04 * fs * q).toFixed(1)}px 0 0 rgba(255,0,90,0.8)) drop-shadow(${(-0.04 * fs * q).toFixed(1)}px 0 0 rgba(0,210,255,0.8))`;
        break;
      }
      case 'A05': { const p = E.outExpo(clamp(lt / 0.3)); const dir = d.dir || -1; st.x = dir * (1 - p) * 0.7 * BASE; st.bx = (1 - p) * 0.3 * fs; st.op = clamp(lt / 0.08); break; }
      case 'A06': case 'A07': case 'A14': break;  // xử lý theo từng ký tự bên dưới
      case 'A08': {
        const K = [[0, 0], [0.05, 0.7], [0.09, 0.15], [0.15, 0.9], [0.2, 0.35], [0.27, 1]];
        let v = 1; for (let i = 0; i < K.length - 1; i++) if (lt >= K[i][0] && lt < K[i + 1][0]) { const f = (lt - K[i][0]) / (K[i + 1][0] - K[i][0]); v = K[i][1] + (K[i + 1][1] - K[i][1]) * f; }
        st.op = v; st.bright = 1 + 0.6 * (1 - clamp(lt / 0.3)); break;
      }
      case 'A09': { const p = E.outCubic(clamp(lt / 0.38)); st.sc = 2.4 - 1.4 * p; st.op = p; break; }
      case 'A10': { const p = clamp(lt / 0.3); st.sc = Math.max(0, E.outBack(p)); st.op = clamp(lt / 0.06); break; }
      case 'A12': { const p = E.outCubic(clamp(lt / 0.45)); st.track = (1 - p) * 0.55; st.op = p; st.blur = (1 - p) * 0.05 * fs; break; }
      case 'A13': { const p = E.outCubic(clamp(lt / 0.35)); st.op = p; st.echo = 1 - p; break; }
      default: break;
    }
    return st;
  }
  function partAnims(L, lt) {
    const d = L.def, name = d.anim, parts = L.parts; if (!parts) return;
    if (L.type === 'bars' || L.type === 'tiles') {
      parts.forEach((p, i) => {
        const l = lt - i * (d.per || 0.1), q = clamp(l / 0.28);
        p.style.opacity = clamp(l / 0.06); p.style.transform = `scale(${Math.max(0, E.outBack(q))})`;
        p.style.transformOrigin = L.type === 'bars' ? '0% 50%' : '50% 50%';
      }); return;
    }
    const word = d.split === 'word';
    parts.forEach((p, i) => {
      let op = 1, tr = '';
      if (name === 'A06') { const per = d.per || (word ? 0.14 : 0.045); const l = lt - i * per; op = clamp(l / 0.07); tr = `translateY(${(1 - E.outCubic(clamp(l / 0.2))) * 0.15}em)`; }
      else if (name === 'A07') {
        const l = lt - i * (d.per || 0.04), q = clamp(l / 0.36), r = (hash(i, 3) - 0.5) * 36;
        op = clamp(l / 0.06); tr = `translateY(${-(1 - E.outBack(q)) * 0.5}em) rotate(${r * (1 - q)}deg) scale(${0.6 + 0.4 * E.outBack(q)})`;
      } else if (name === 'A14') {
        const order = Math.floor(hash(i, 7) * parts.length), l = lt - order * (d.per || 0.05);
        op = l < 0 ? 0 : l < 0.12 ? (Math.floor(l / 0.03) % 2 ? 0.3 : 1) : 1;
      }
      p.style.opacity = lt < 0 ? 0 : op; p.style.transform = tr;
    });
  }
  function apply(L, st, t, exitQ) {
    const s = L.el.style, fs = L.fs;
    let op = st.op * (L.def.opacity !== undefined ? L.def.opacity : 1) * (1 - exitQ);
    if (op <= 0.001) { s.visibility = 'hidden'; return; }
    s.visibility = 'visible'; s.opacity = op.toFixed(3);
    s.transformOrigin = L.origin;
    const rot = (L.def.rot || 0) + st.rot;
    s.transform = `translate(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px) rotate(${rot}deg) scale(${(st.sc * st.scx).toFixed(4)}, ${(st.sc * st.scy).toFixed(4)})`;
    const f = [];
    if (st.bx > 0.3 || st.by > 0.3) { L.filter.blur.setAttribute('stdDeviation', `${st.bx.toFixed(1)} ${st.by.toFixed(1)}`); f.push(`url(#${L.filter.id})`); }
    const blur = st.blur + exitQ * 0.06 * fs;
    if (blur > 0.3) f.push(`blur(${blur.toFixed(1)}px)`);
    const ghost = Math.max(st.ghost, exitQ * 0.8);
    if (ghost > 0.01) f.push(`grayscale(${ghost.toFixed(2)}) brightness(${(1 - 0.45 * ghost).toFixed(2)})`);
    if (st.bright !== 1) f.push(`brightness(${st.bright.toFixed(2)})`);
    if (st.extra) f.push(st.extra);
    const breathe = 1 + 0.07 * Math.sin(t * 3.4 + L.phase);
    f.push(glowCSS(L, (1 - ghost) * breathe));
    s.filter = f.join(' ');
    if (L.inner && L.type !== 'icon' && L.type !== 'swoosh') {
      if (st.mask !== null && st.mask < 1) {
        const F = 14, x = -F + (100 + F) * st.mask;
        L.inner.style.webkitMaskImage = L.inner.style.maskImage = `linear-gradient(90deg, #000 ${x.toFixed(1)}%, transparent ${(x + F).toFixed(1)}%)`;
      } else { L.inner.style.webkitMaskImage = L.inner.style.maskImage = 'none'; }
      if (st.track !== null) {
        L.inner.style.letterSpacing = ((L.def.tracking || 0) + st.track) + 'em';
        const n = (L.inner.textContent || '').length;
        s.transform = `translate(${(st.x - st.track * fs * (n - 1) / 2).toFixed(2)}px, ${st.y.toFixed(2)}px) rotate(${rot}deg) scale(${st.sc})`;
      } else if (L.def.anim === 'A12') L.inner.style.letterSpacing = (L.def.tracking || 0) + 'em';
    }
    if (L.paths) { const dr = st.draw === null ? 1 : st.draw; L.paths.forEach(p => { p.style.strokeDashoffset = (1 - dr).toFixed(4); }); }
    if (L.echo) L.echo.forEach((c, i) => {
      const e = st.echo || 0; c.style.opacity = (0.4 * e).toFixed(3);
      c.style.transform = `translateY(${((i ? 1 : -1) * e * 0.55 * fs).toFixed(1)}px)`;
    });
    L.imgNodes.forEach(n => { n.style.backgroundPosition = `${(50 + 18 * Math.sin(t * 0.6 + L.phase)).toFixed(1)}% 50%`; });
  }

  async function init(spec, templates, palettes, fonts) {
    SPEC = spec; TPL = templates; PAL = palettes; FONTS = fonts;
    W = (spec.canvas && spec.canvas.w) || 1080; Hc = (spec.canvas && spec.canvas.h) || 1920;
    stage = document.getElementById('stage');
    Object.assign(stage.style, { width: W + 'px', height: Hc + 'px', position: 'relative', overflow: 'hidden' });
    defs = document.getElementById('ckdefs');
    clusters = (spec.clusters || []).map(buildCluster);
    const imgs = clusters.map(c => c.image).filter(Boolean);
    await Promise.all(imgs.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })));
    await document.fonts.ready; await new Promise(r => setTimeout(r, 250)); await document.fonts.ready;
    clusters.forEach(layoutCluster);
    clusters.forEach(c => { c.root.style.visibility = 'visible'; c.root.style.display = 'none'; });
    return info();
  }
  function renderAt(t, only) {
    let n = 0;
    clusters.forEach((cl, i) => {
      const exitDur = cl.exit === 'cut' ? 0 : 0.3;
      const on = t >= cl.t_in && t < cl.t_out && (only === undefined || only === i);
      cl.root.style.display = on ? 'block' : 'none';
      if (!on) return; n++;
      const exitQ = exitDur ? clamp((t - (cl.t_out - exitDur)) / exitDur) : 0;
      cl.layers.forEach(L => { const lt = t - L.start; apply(L, animState(L, lt, t), t, exitQ); partAnims(L, lt); });
    });
    return n;
  }
  function info() {
    return clusters.map(c => ({ id: c.spec.id, template: c.spec.template, style: c.style, t_in: c.t_in, t_out: c.t_out,
      bbox: c.bbox, layers: c.layers.map(L => L.id), palette: c.spec.palette || c.tpl.palette || null }));
  }
  window.CK = { init, renderAt, info };
})();
