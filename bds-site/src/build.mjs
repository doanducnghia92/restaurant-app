// Static site generator — chạy: node bds-site/src/build.mjs
// Xuất ra bds-site/site (HTML tĩnh, chuẩn SEO, không cần server)
import { mkdirSync, writeFileSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, DEVELOPERS, AREAS, PROJECTS, FAQ_GENERAL } from './data.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '..', 'site');
const urls = [];

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => SITE.url.replace(/\/$/, '') + '/' + p.replace(/^\//, '').replace(/index\.html$/, '');
const byDev = (k) => PROJECTS.filter((p) => p.dev === k);
const byArea = (k) => PROJECTS.filter((p) => p.area === k);
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const yearsAgo = SITE.updatedText;

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507), h = Math.imul(h ^ (h >>> 13), 3266489909), (h ^= h >>> 16) >>> 0) / 4294967296);
}

// Ảnh minh hoạ kiến trúc sinh tự động (SVG) — không dùng ảnh bản quyền
function art(p, { w = 800, h = 560, cls = '' } = {}) {
  const r = hash(p.slug);
  const [c1, c2, ac] = p.palette;
  const id = p.slug.replace(/[^a-z0-9]/g, '');
  const low = p.types.some((t) => /Biệt thự|Nhà phố|Đất nền/.test(t)) && !p.types.includes('Căn hộ');
  const horizon = h * 0.7;
  let towers = '';
  let x = -10;
  while (x < w) {
    const tw = low ? 40 + r() * 60 : 34 + r() * 70;
    const th = low ? 40 + r() * 70 : 90 + r() * (h * 0.55);
    const y = horizon - th;
    const op = (0.55 + r() * 0.45).toFixed(2);
    towers += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${tw.toFixed(1)}" height="${th.toFixed(1)}" fill="url(#t${id})" opacity="${op}"/>`;
    if (low) towers += `<path d="M${x - 4} ${y} L${x + tw / 2} ${y - 22 - r() * 14} L${x + tw + 4} ${y} Z" fill="${c2}" opacity="${op}"/>`;
    else if (r() > 0.6) towers += `<rect x="${(x + tw / 2 - 1).toFixed(1)}" y="${(y - 30).toFixed(1)}" width="2" height="30" fill="${ac}" opacity=".7"/>`;
    // windows
    for (let wy = y + 10; wy < horizon - 8; wy += 14) {
      if (r() > 0.55) towers += `<rect x="${(x + 6).toFixed(1)}" y="${wy.toFixed(1)}" width="${(tw - 12).toFixed(1)}" height="2" fill="#fff6e0" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`;
    }
    x += tw + 4 + r() * 18;
  }
  const sunX = (0.2 + r() * 0.6) * w;
  return `<svg class="art ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Phối cảnh minh hoạ ${esc(p.name)}" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}" stop-opacity=".55"/><stop offset=".7" stop-color="#fbf6ec"/><stop offset="1" stop-color="${ac}" stop-opacity=".7"/></linearGradient>
<linearGradient id="t${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}" stop-opacity=".75"/><stop offset="1" stop-color="${c1}"/></linearGradient>
<linearGradient id="w${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}" stop-opacity=".45"/><stop offset="1" stop-color="${c1}" stop-opacity=".85"/></linearGradient>
<radialGradient id="g${id}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${ac}" stop-opacity=".55"/><stop offset="1" stop-color="${ac}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="#fbf7ef"/><rect width="${w}" height="${h}" fill="url(#s${id})"/>
<circle class="art-sun" cx="${sunX.toFixed(0)}" cy="${(horizon - 60).toFixed(0)}" r="160" fill="url(#g${id})"/>
<circle cx="${sunX.toFixed(0)}" cy="${(horizon - 60).toFixed(0)}" r="34" fill="#fffaf0" opacity=".95"/>
<g class="art-city">${towers}</g>
<rect y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#w${id})"/>
<g opacity=".18" transform="translate(0 ${horizon * 2}) scale(1 -1)">${towers}</g>
<rect y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#w${id})" opacity=".35"/>
<g stroke="#fff" stroke-opacity=".6" stroke-width="1.2">${Array.from({ length: 6 }, (_, i) => `<line x1="${(sunX - 60 + r() * 30).toFixed(0)}" x2="${(sunX + 40 + r() * 40).toFixed(0)}" y1="${(horizon + 12 + i * 12).toFixed(0)}" y2="${(horizon + 12 + i * 12).toFixed(0)}"/>`).join('')}</g>
</svg>`;
}

// ---------- layout ----------
const NAV = [
  ['Dự án', 'du-an/'],
  ['Chủ đầu tư', '#chu-dau-tu'],
  ['Khu vực', '#khu-vuc'],
  ['Bảng giá', 'du-an/#bang-gia'],
  ['Hỏi đáp', '#hoi-dap'],
];

function layout({ path, title, desc, keywords = [], body, jsonld = [], ogType = 'website' }) {
  const depth = path.split('/').length - 1;
  const R = depth ? '../'.repeat(depth) : './';
  const canonical = abs(path);
  urls.push(canonical);
  const navHref = (h) => (h.startsWith('#') ? `${R}${h}` : R + h);
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${keywords.length ? `<meta name="keywords" content="${esc(keywords.join(', '))}">` : ''}
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="vi-VN" href="${canonical}">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="vi_VN">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs('assets/og.svg')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f8f5ef">
<meta name="geo.region" content="VN-SG"><meta name="geo.placename" content="Hồ Chí Minh">
<link rel="icon" href="${R}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${R}assets/style.css">
${jsonld.map(ld).join('\n')}
</head>
<body>
<div class="progress" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><span class="cursor-label"></span></div><div class="cursor-dot" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<a class="skip" href="#main">Bỏ qua tới nội dung</a>
<header class="hdr" id="top">
  <a class="logo" href="${R}" aria-label="${esc(SITE.name)} – Trang chủ"><span class="logo-mark">L</span><span class="logo-text">LUXE<em>Estates</em></span></a>
  <nav class="nav" aria-label="Điều hướng chính">
    ${NAV.map(([t, h]) => `<a href="${navHref(h)}">${t}</a>`).join('')}
  </nav>
  <a class="btn btn-gold hdr-cta magnetic" href="tel:${SITE.hotlineRaw}"><span>${SITE.hotline}</span></a>
  <button class="burger" aria-label="Mở menu" aria-expanded="false"><i></i><i></i></button>
</header>
<div class="menu" aria-hidden="true">
  <nav>${NAV.map(([t, h], i) => `<a href="${navHref(h)}" style="--i:${i}"><small>0${i + 1}</small>${t}</a>`).join('')}</nav>
  <div class="menu-foot"><a href="tel:${SITE.hotlineRaw}">${SITE.hotline}</a><a href="mailto:${SITE.email}">${SITE.email}</a></div>
</div>
<main id="main">
${body}
${leadForm()}
</main>
<footer class="ftr">
  <div class="wrap ftr-grid">
    <div>
      <a class="logo" href="${R}"><span class="logo-mark">L</span><span class="logo-text">LUXE<em>Estates</em></span></a>
      <p class="muted">${esc(SITE.tagline)}: Vinhomes, Masterise Homes, MIKGroup, Sun Group, CapitaLand, Hướng Việt, BlueMarq. Cập nhật bảng giá, pháp lý, tiến độ ${yearsAgo}.</p>
      <p class="muted small">${esc(SITE.address)}</p>
    </div>
    <div><h3>Chủ đầu tư</h3>${Object.entries(DEVELOPERS).map(([k, d]) => `<a href="${R}chu-dau-tu/${k}/">Dự án ${esc(d.name)}</a>`).join('')}</div>
    <div><h3>Khu vực</h3>${Object.entries(AREAS).map(([k, a]) => `<a href="${R}khu-vuc/${k}/">BĐS ${esc(a.seo)}</a>`).join('')}</div>
    <div><h3>Dự án nổi bật</h3>${PROJECTS.slice(0, 8).map((p) => `<a href="${R}du-an/${p.slug}/">${esc(p.name)}</a>`).join('')}</div>
  </div>
  <div class="wrap ftr-bottom"><span>© 2026 ${esc(SITE.name)}. Thông tin mang tính tham khảo, không phải văn bản chào bán chính thức của chủ đầu tư.</span><a href="#top">Lên đầu trang ↑</a></div>
</footer>
<div class="dock" role="navigation" aria-label="Liên hệ nhanh">
  <a href="tel:${SITE.hotlineRaw}"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>Gọi</a>
  <a href="${SITE.zalo}" target="_blank" rel="noopener"><b>Zalo</b>Chat</a>
  <a href="#dang-ky" class="dock-main">Nhận bảng giá</a>
</div>
<div class="toast" role="status" aria-live="polite"></div>
<script>window.__SITE=${JSON.stringify({ email: SITE.email, endpoint: SITE.formEndpoint, zalo: SITE.zalo })}</script>
<script src="${R}assets/main.js" defer></script>
</body>
</html>`;

  // inner fn uses R
  function leadForm() {
    const opts = PROJECTS.map((p) => `<option>${esc(p.name)}</option>`).join('');
    return `<section class="lead" id="dang-ky">
  <div class="wrap lead-grid">
    <div class="reveal">
      <p class="eyebrow">Tư vấn 1:1 miễn phí</p>
      <h2 class="h2 split">Nhận bảng giá & chính sách <em>mới nhất</em></h2>
      <p class="muted">Chuyên viên sẽ gửi bảng giá gốc chủ đầu tư, chính sách chiết khấu, tiến độ thanh toán và mặt bằng căn hộ trong 15 phút.</p>
      <ul class="ticks"><li>Giá gốc – không chênh lệch</li><li>Hỗ trợ vay đến 70%, ân hạn gốc lãi</li><li>Đưa đón tham quan nhà mẫu</li></ul>
    </div>
    <form class="form reveal" novalidate>
      <label class="fld"><input name="name" required autocomplete="name" placeholder=" "><span>Họ và tên</span></label>
      <label class="fld"><input name="phone" required type="tel" inputmode="tel" pattern="[0-9 +]{9,13}" autocomplete="tel" placeholder=" "><span>Số điện thoại</span></label>
      <label class="fld"><select name="project"><option value="">Tất cả dự án</option>${opts}</select><span>Dự án quan tâm</span></label>
      <label class="fld"><select name="budget"><option>Dưới 3 tỷ</option><option>3 – 7 tỷ</option><option>7 – 15 tỷ</option><option>Trên 15 tỷ</option></select><span>Ngân sách</span></label>
      <button class="btn btn-gold btn-lg magnetic" type="submit"><span>Gửi yêu cầu</span></button>
      <p class="small muted">Thông tin của anh/chị được bảo mật tuyệt đối.</p>
    </form>
  </div>
</section>`;
  }
}

// ---------- components ----------
function card(p, R, i = 0) {
  const d = DEVELOPERS[p.dev];
  return `<article class="card tilt reveal" style="--d:${(i % 3) * 80}ms" data-dev="${p.dev}" data-area="${p.area}" data-types="${esc(p.types.join('|'))}">
  <a href="${R}du-an/${p.slug}/" class="card-link" data-cursor="Xem">
    <div class="card-media">${art(p, { w: 640, h: 440 })}<span class="badge">${esc(p.status)}</span></div>
    <div class="card-body">
      <p class="card-dev" style="--c:${d.color}">${esc(d.name)} · ${esc(AREAS[p.area].seo)}</p>
      <h3 class="card-title">${esc(p.name)}</h3>
      <p class="card-tag">${esc(p.tagline)}</p>
      <dl class="card-meta"><div><dt>Quy mô</dt><dd>${esc(p.scale)}</dd></div><div><dt>Giá</dt><dd>${esc(p.price)}</dd></div></dl>
    </div>
  </a>
</article>`;
}

function breadcrumb(items, R) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="${R}">Trang chủ</a>${items.map(([t, h]) => (h ? `<span>/</span><a href="${R}${h}">${esc(t)}</a>` : `<span>/</span><b>${esc(t)}</b>`)).join('')}</nav>`;
}
const crumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Trang chủ', ''], ...items].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: abs(u || '') })),
});
const faqLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
function faqBlock(faqs, title = 'Câu hỏi thường gặp') {
  return `<section class="sec" id="hoi-dap"><div class="wrap narrow">
  <p class="eyebrow reveal">FAQ</p><h2 class="h2 split">${title}</h2>
  <div class="faq">${faqs.map(([q, a], i) => `<details class="reveal" style="--d:${i * 60}ms"${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span><i></i></summary><div><p>${esc(a)}</p></div></details>`).join('')}</div>
</div></section>`;
}
function priceTable(list, R) {
  return `<div class="table-wrap reveal"><table class="ptable">
<caption class="sr">Bảng giá dự án bất động sản miền Nam cập nhật ${yearsAgo}</caption>
<thead><tr><th>Dự án</th><th>Chủ đầu tư</th><th>Khu vực</th><th>Loại hình</th><th>Giá tham khảo</th><th>Tình trạng</th></tr></thead>
<tbody>${list.map((p) => `<tr><td><a href="${R}du-an/${p.slug}/">${esc(p.name)}</a></td><td>${esc(DEVELOPERS[p.dev].name)}</td><td>${esc(AREAS[p.area].seo)}</td><td>${esc(p.types.join(', '))}</td><td class="gold">${esc(p.price)}</td><td>${esc(p.status)}</td></tr>`).join('')}</tbody>
</table></div>`;
}
const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  '@id': abs('') + '#org',
  name: SITE.name,
  url: abs(''),
  telephone: SITE.hotline,
  email: SITE.email,
  logo: abs('assets/favicon.svg'),
  image: abs('assets/og.svg'),
  address: { '@type': 'PostalAddress', streetAddress: SITE.address, addressLocality: 'Hồ Chí Minh', addressCountry: 'VN' },
  areaServed: ['TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Long An', 'Phú Quốc'],
  priceRange: '$$$',
};

// ---------- pages ----------
function home() {
  const R = './';
  const keyMarquee = ['Vinhomes Green Paradise', 'Grand Marina Saigon', 'The Global City', 'Vinhomes Grand Park', 'Căn hộ Thủ Thiêm', 'Branded Residence', 'Orchard Hill', 'Sun Group Phú Quốc', 'Imperia', 'The Privé', 'Căn hộ Quận 1', 'Biệt thự Cần Giờ'];
  const featured = PROJECTS;
  const devEntries = Object.entries(DEVELOPERS);
  const body = `
<section class="hero" aria-labelledby="h1">
  <canvas class="hero-canvas" aria-hidden="true"></canvas>
  <div class="hero-sky" aria-hidden="true">
    <div class="orb"></div>
    <svg class="skyline l1" viewBox="0 0 1600 400" preserveAspectRatio="none"><path d="M0 400V250h60v-60h40v80h50V120h30v-30h10v30h30v180h60v-90h70v120h40V60h20v-30h6v30h20v240h50v-140h80v160h40v-200h50v190h60V180h40v-50h40v240h70v-120h50v140h60V90h30v-40h8v40h30v260h40v-160h70v170h60v-90h50v-60h40v150h70V200h60v200z"/></svg>
    <svg class="skyline l2" viewBox="0 0 1600 400" preserveAspectRatio="none"><path d="M0 400V300h80v-50h60v80h90v-120h50v140h90v-90h60v-60h40v150h100v-110h70v130h80v-170h40v-40h10v40h40v190h90v-120h70v140h80v-80h60v100h90v-130h60v150h90v-70h80v100z"/></svg>
  </div>
  <div class="wrap hero-inner">
    <p class="eyebrow hero-eyebrow"><span class="pulse"></span> Cập nhật ${yearsAgo} · ${PROJECTS.length} dự án · 7 chủ đầu tư</p>
    <h1 id="h1" class="hero-title"><span class="split-chars">Dự án bất động sản</span><span class="split-chars serif">cao cấp <em>miền Nam</em></span></h1>
    <p class="hero-sub">Bảng giá, pháp lý, tiến độ & chính sách bán hàng các dự án <strong>Vinhomes, Masterise Homes, MIKGroup, Sun Group, CapitaLand, Hướng Việt, BlueMarq</strong> tại TP.HCM, Thủ Đức, Cần Giờ, Bình Dương, Phú Quốc.</p>
    <p class="rotator" aria-live="off">Tìm <span class="rot"><b class="on">căn hộ Thủ Thiêm</b><b>biệt thự Cần Giờ</b><b>branded residence Quận 1</b><b>nhà phố The Global City</b><b>nghỉ dưỡng Phú Quốc</b></span></p>
    <form class="search" action="${R}du-an/" role="search">
      <label class="sr" for="q">Tìm dự án</label>
      <input id="q" name="q" placeholder="Tìm theo tên dự án, khu vực, chủ đầu tư…" autocomplete="off">
      <select name="dev" aria-label="Chủ đầu tư"><option value="">Mọi chủ đầu tư</option>${devEntries.map(([k, d]) => `<option value="${k}">${esc(d.name)}</option>`).join('')}</select>
      <button class="btn btn-gold magnetic" type="submit"><span>Tìm kiếm</span></button>
    </form>
  </div>
  <a class="scroll-hint" href="#du-an" aria-label="Cuộn xuống"><span></span></a>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${[...keyMarquee, ...keyMarquee].map((k) => `<span>${k}</span><i>✦</i>`).join('')}</div></div>

<section class="stats wrap" aria-label="Số liệu">
  ${[[PROJECTS.length, '', 'Dự án cập nhật'], [7, '', 'Chủ đầu tư uy tín'], [2870, ' ha', 'Siêu đô thị lớn nhất'], [109, ' tr/m²', 'Giá sơ cấp TB căn hộ cao cấp']].map(([n, u, t], i) => `<div class="stat reveal" style="--d:${i * 90}ms"><b data-count="${n}">0</b><span class="u">${u}</span><p>${t}</p></div>`).join('')}
</section>

<section class="sec" id="du-an">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow reveal">Danh mục</p><h2 class="h2 split">Dự án <em>nổi bật</em> miền Nam</h2></div>
      <div class="filters reveal" role="group" aria-label="Lọc theo chủ đầu tư">
        <button class="chip on" data-f="all">Tất cả</button>
        ${devEntries.map(([k, d]) => `<button class="chip" data-f="${k}">${esc(d.name)}</button>`).join('')}
      </div>
    </div>
    <div class="grid cards">${featured.map((p, i) => card(p, R, i)).join('')}</div>
    <p class="center"><a class="btn btn-line magnetic" href="${R}du-an/"><span>Xem tất cả & bảng giá</span></a></p>
  </div>
</section>

<section class="devs" id="chu-dau-tu" aria-label="Chủ đầu tư">
  <div class="devs-sticky">
    <div class="wrap devs-head"><p class="eyebrow">7 thương hiệu</p><h2 class="h2">Chủ đầu tư <em>hàng đầu</em></h2><p class="muted hide-sm">Cuộn để khám phá →</p></div>
    <div class="devs-track">
      ${devEntries.map(([k, d], i) => `<a class="dev" href="${R}chu-dau-tu/${k}/" style="--c:${d.color}" data-cursor="Khám phá">
        <span class="dev-n">0${i + 1}</span>
        <h3>${esc(d.name)}</h3>
        <p>${esc(d.intro.slice(0, 170))}…</p>
        <ul>${d.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        <span class="dev-count">${byDev(k).length} dự án →</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="sec" id="khu-vuc">
  <div class="wrap">
    <p class="eyebrow reveal">Bản đồ đầu tư</p><h2 class="h2 split">Bất động sản theo <em>khu vực</em></h2>
    <div class="bento">
      ${Object.entries(AREAS).map(([k, a], i) => {
        const ps = byArea(k);
        return `<a class="area reveal a${i}" href="${R}khu-vuc/${k}/" style="--d:${i * 70}ms" data-cursor="Xem">
          ${ps[0] ? art(ps[0], { w: 600, h: 420, cls: 'area-art' }) : ''}
          <div class="area-body"><span>${ps.length} dự án</span><h3>Dự án ${esc(a.seo)}</h3><p>${esc(a.name)}</p></div>
        </a>`;
      }).join('')}
    </div>
  </div>
</section>

<section class="sec sec-ivory">
  <div class="wrap why">
    <div class="why-sticky"><p class="eyebrow reveal">Vì sao chọn chúng tôi</p><h2 class="h2 split">Đồng hành <em>trọn vẹn</em> từ chọn căn đến nhận sổ</h2></div>
    <div class="why-list">
      ${[['Bảng giá gốc chủ đầu tư', 'Cập nhật liên tục từng đợt mở bán, chính sách chiết khấu, quà tặng và tiến độ thanh toán.'], ['Thẩm định pháp lý', 'Kiểm tra chủ trương đầu tư, giấy phép xây dựng, văn bản đủ điều kiện bán, bảo lãnh ngân hàng.'], ['So sánh đa dự án', 'Phân tích vị trí, tiện ích, tỷ suất cho thuê và tiềm năng tăng giá giữa các dự án cùng phân khúc.'], ['Hỗ trợ tài chính', 'Kết nối ngân hàng đối tác, vay đến 70%, hỗ trợ lãi suất và ân hạn nợ gốc theo chính sách dự án.'], ['Ký gửi & cho thuê', 'Đồng hành sau bàn giao: hoàn thiện nội thất, cho thuê, chuyển nhượng thứ cấp.']].map(([t, d], i) => `<div class="why-item reveal"><span>0${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="sec" id="bang-gia">
  <div class="wrap">
    <p class="eyebrow reveal">Cập nhật ${yearsAgo}</p><h2 class="h2 split">Bảng giá dự án <em>tổng hợp</em></h2>
    ${priceTable(PROJECTS, R)}
    <p class="small muted">* Giá tham khảo tổng hợp từ thị trường, có thể thay đổi theo đợt mở bán. Liên hệ để nhận bảng giá chính thức.</p>
  </div>
</section>

<section class="sec seo-text">
  <div class="wrap narrow reveal">
    <h2 class="h3">Thị trường bất động sản miền Nam ${new Date(SITE.updated).getFullYear()}: dự án nào đáng mua?</h2>
    <p>Sau sáp nhập địa giới hành chính, <strong>TP. Hồ Chí Minh</strong> mở rộng gồm cả Bình Dương và Bà Rịa – Vũng Tàu cũ, tạo nên siêu đô thị với nhu cầu nhà ở rất lớn. Nguồn cung <strong>căn hộ cao cấp TP.HCM</strong> tập trung tại khu Đông với <a href="du-an/the-global-city/">The Global City</a>, <a href="du-an/vinhomes-grand-park/">Vinhomes Grand Park</a>, <a href="du-an/the-prive/">The Privé</a>; lõi <strong>Quận 1</strong> với căn hộ hàng hiệu <a href="du-an/grand-marina-saigon/">Grand Marina, Saigon</a> và <a href="du-an/one-central-saigon/">One Central Saigon</a>.</p>
    <p>Điểm nóng mới là <a href="du-an/vinhomes-green-paradise-can-gio/">Vinhomes Green Paradise Cần Giờ</a> – siêu đô thị lấn biển gần 2.870 ha – cùng phân khu căn hộ <a href="du-an/imperia-green-paradise/">Imperia Green Paradise</a> của MIKGroup. Tại Bình Dương cũ, CapitaLand bàn giao <a href="du-an/orchard-hill-sycamore/">Orchard Hill</a> cuối năm 2026. Với nhà đầu tư nghỉ dưỡng, hệ sinh thái <a href="chu-dau-tu/sungroup/">Sun Group Phú Quốc</a> đón sóng APEC 2027.</p>
    <p>Khi chọn mua, hãy ưu tiên chủ đầu tư có lịch sử bàn giao và cấp sổ đúng hẹn, kiểm tra kỹ pháp lý và so sánh <strong>bảng giá</strong>, <strong>chính sách bán hàng</strong>, <strong>tiến độ thanh toán</strong> giữa các dự án cùng phân khúc.</p>
  </div>
</section>

${faqBlock(FAQ_GENERAL)}
`;
  return layout({
    path: 'index.html',
    title: `Dự án BĐS cao cấp miền Nam ${yearsAgo} | Vinhomes, Masterise, CapitaLand, Sun Group`,
    desc: `Tổng hợp ${PROJECTS.length} dự án bất động sản cao cấp TP.HCM, Thủ Đức, Cần Giờ, Bình Dương, Phú Quốc của Vinhomes, Masterise Homes, MIKGroup, Sun Group, CapitaLand, Hướng Việt, BlueMarq. Bảng giá, pháp lý, tiến độ mới nhất.`,
    keywords: ['dự án bất động sản miền nam', 'căn hộ cao cấp tphcm', 'dự án vinhomes', 'masterise homes', 'capitaland việt nam', 'sun group phú quốc', 'mik group imperia', 'bluemarq', 'hướng việt', 'bảng giá căn hộ 2026', 'căn hộ thủ đức', 'vinhomes cần giờ'],
    body,
    jsonld: [
      orgLd,
      { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: abs(''), inLanguage: 'vi-VN', potentialAction: { '@type': 'SearchAction', target: abs('du-an/') + '?q={search_term_string}', 'query-input': 'required name=search_term_string' } },
      { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Dự án bất động sản miền Nam', itemListElement: PROJECTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`du-an/${p.slug}/`), name: p.name })) },
      faqLd(FAQ_GENERAL),
    ],
  });
}

function listing() {
  const R = '../';
  const body = `
<section class="phero phero-sm"><div class="wrap">
  ${breadcrumb([['Dự án', null]], R)}
  <h1 class="h1 split">Tất cả dự án <em>bất động sản miền Nam</em></h1>
  <p class="muted lead-p">${PROJECTS.length} dự án căn hộ, biệt thự, nhà phố, branded residence và nghỉ dưỡng của 7 chủ đầu tư hàng đầu. Lọc theo chủ đầu tư, khu vực, loại hình.</p>
</div></section>
<section class="sec pt0"><div class="wrap">
  <div class="toolbar reveal">
    <input class="tb-q" type="search" placeholder="Tìm dự án…" aria-label="Tìm dự án">
    <select class="tb-dev" aria-label="Chủ đầu tư"><option value="">Chủ đầu tư</option>${Object.entries(DEVELOPERS).map(([k, d]) => `<option value="${k}">${esc(d.name)}</option>`).join('')}</select>
    <select class="tb-area" aria-label="Khu vực"><option value="">Khu vực</option>${Object.entries(AREAS).map(([k, a]) => `<option value="${k}">${esc(a.seo)}</option>`).join('')}</select>
    <select class="tb-type" aria-label="Loại hình"><option value="">Loại hình</option>${[...new Set(PROJECTS.flatMap((p) => p.types))].map((t) => `<option>${esc(t)}</option>`).join('')}</select>
    <span class="tb-count"><b>${PROJECTS.length}</b> dự án</span>
  </div>
  <div class="grid cards">${PROJECTS.map((p, i) => card(p, R, i)).join('')}</div>
  <p class="empty" hidden>Không tìm thấy dự án phù hợp. <a href="#dang-ky">Để lại thông tin</a> để được tư vấn.</p>
</div></section>
<section class="sec" id="bang-gia"><div class="wrap">
  <h2 class="h2 split">Bảng giá dự án <em>${yearsAgo}</em></h2>
  ${priceTable(PROJECTS, R)}
</div></section>`;
  return layout({
    path: 'du-an/index.html',
    title: `Danh sách ${PROJECTS.length} dự án BĐS miền Nam & bảng giá ${yearsAgo}`,
    desc: `Danh sách dự án căn hộ, biệt thự, nhà phố TP.HCM, Thủ Đức, Cần Giờ, Bình Dương, Phú Quốc kèm bảng giá tham khảo ${yearsAgo}: Vinhomes, Masterise Homes, CapitaLand, Sun Group, MIKGroup, BlueMarq, Hướng Việt.`,
    keywords: ['danh sách dự án tphcm', 'bảng giá căn hộ tphcm', 'dự án căn hộ mới', 'dự án mở bán 2026'],
    body,
    jsonld: [crumbLd([['Dự án', 'du-an/']])],
  });
}

function projectFaq(p) {
  const d = DEVELOPERS[p.dev];
  return [
    [`Dự án ${p.name} ở đâu?`, `${p.name} tọa lạc tại ${p.address}, thuộc khu vực ${AREAS[p.area].name}.`],
    [`Chủ đầu tư ${p.name} là ai?`, `${p.name} do ${d.full} phát triển.`],
    [`Giá bán ${p.name} bao nhiêu?`, `Giá tham khảo: ${p.price}. Giá thay đổi theo vị trí căn, tầng, hướng và đợt mở bán — liên hệ hotline ${SITE.hotline} để nhận bảng giá chính thức.`],
    [`${p.name} có những loại hình sản phẩm nào?`, `Dự án gồm: ${p.types.join(', ')}. Các phân khu: ${p.subzones.join(', ')}.`],
    [`Pháp lý và tiến độ ${p.name} thế nào?`, `Pháp lý: ${p.legal}. Bàn giao: ${p.handover}. Tình trạng: ${p.status}.`],
  ];
}

function project(p) {
  const R = '../../';
  const d = DEVELOPERS[p.dev];
  const a = AREAS[p.area];
  const faqs = projectFaq(p);
  const related = [...PROJECTS.filter((x) => x.slug !== p.slug && x.dev === p.dev), ...PROJECTS.filter((x) => x.slug !== p.slug && x.area === p.area && x.dev !== p.dev)].slice(0, 3);
  const facts = [['Vị trí', p.address], ['Chủ đầu tư', d.full], ['Quy mô', p.scale], ['Loại hình', p.types.join(', ')], ['Giá tham khảo', p.price], ['Pháp lý', p.legal], ['Bàn giao', p.handover], ['Tình trạng', p.status]];
  const body = `
<section class="phero">
  <div class="phero-art parallax" data-speed="0.25">${art(p, { w: 1600, h: 900 })}</div>
  <div class="phero-veil"></div>
  <div class="wrap phero-inner">
    ${breadcrumb([['Dự án', 'du-an/'], [d.name, `chu-dau-tu/${p.dev}/`], [p.name, null]], R)}
    <p class="eyebrow"><span class="pulse"></span> ${esc(p.status)}</p>
    <h1 class="h1 split">${esc(p.name)}</h1>
    <p class="phero-tag">${esc(p.tagline)}</p>
    <div class="phero-cta"><a class="btn btn-gold btn-lg magnetic" href="#dang-ky"><span>Nhận bảng giá ${esc(p.name)}</span></a><a class="btn btn-line magnetic" href="tel:${SITE.hotlineRaw}"><span>Gọi ${SITE.hotline}</span></a></div>
  </div>
</section>

<section class="sec"><div class="wrap detail">
  <article class="detail-main">
    <nav class="toc reveal" aria-label="Mục lục"><a href="#tong-quan">Tổng quan</a><a href="#noi-bat">Điểm nổi bật</a><a href="#phan-khu">Phân khu</a><a href="#tien-ich">Tiện ích</a><a href="#vi-tri">Vị trí</a><a href="#hoi-dap">Hỏi đáp</a></nav>
    <h2 class="h3" id="tong-quan">Tổng quan dự án ${esc(p.name)}</h2>
    <p class="lead-p reveal">${esc(p.summary)}</p>
    <p class="reveal">Dự án thuộc danh mục của <a href="${R}chu-dau-tu/${p.dev}/">${esc(d.name)}</a> tại <a href="${R}khu-vuc/${p.area}/">${esc(a.name)}</a>. ${esc(a.intro)}</p>

    <h2 class="h3" id="noi-bat">Điểm nổi bật ${esc(p.name)}</h2>
    <ol class="hl">${p.highlights.map((h, i) => `<li class="reveal" style="--d:${i * 70}ms"><span>0${i + 1}</span>${esc(h)}</li>`).join('')}</ol>

    <h2 class="h3" id="phan-khu">Mặt bằng & phân khu</h2>
    <div class="pills reveal">${p.subzones.map((s) => `<span>${esc(s)}</span>`).join('')}</div>

    <h2 class="h3" id="tien-ich">Tiện ích nội khu</h2>
    <ul class="amen">${p.amenities.map((x, i) => `<li class="reveal" style="--d:${i * 50}ms">${esc(x)}</li>`).join('')}</ul>

    <h2 class="h3" id="vi-tri">Vị trí ${esc(p.name)}</h2>
    <p class="reveal">Địa chỉ: <strong>${esc(p.address)}</strong>.</p>
    <div class="map reveal"><iframe title="Bản đồ ${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(p.name + ', ' + p.address)}&z=14&output=embed"></iframe></div>

    <h2 class="h3">Bảng giá & chính sách bán hàng ${esc(p.name)}</h2>
    <p class="reveal">Giá tham khảo: <strong class="gold">${esc(p.price)}</strong>. Chính sách thanh toán, chiết khấu và hỗ trợ vay được cập nhật theo từng đợt mở bán của ${esc(d.name)}. <a href="#dang-ky">Đăng ký nhận bảng giá chi tiết</a>.</p>
    <p class="tags">${p.keywords.map((k) => `<span>#${esc(k)}</span>`).join('')}</p>
  </article>
  <aside class="detail-side">
    <div class="facts reveal">
      <h2 class="h4">Thông tin dự án</h2>
      <dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <a class="btn btn-gold magnetic w100" href="#dang-ky"><span>Tải bảng giá & mặt bằng</span></a>
      <a class="btn btn-line w100" href="${SITE.zalo}" target="_blank" rel="noopener"><span>Chat Zalo</span></a>
    </div>
  </aside>
</div></section>

${faqBlock(faqs, `Hỏi đáp về ${esc(p.name)}`)}

<section class="sec"><div class="wrap">
  <h2 class="h2 split">Dự án <em>liên quan</em></h2>
  <div class="grid cards">${related.map((x, i) => card(x, R, i)).join('')}</div>
</div></section>`;
  return layout({
    path: `du-an/${p.slug}/index.html`,
    title: `${p.name} – ${AREAS[p.area].seo} | Giá bán, pháp lý ${yearsAgo}`,
    desc: `${p.name} của ${d.name} tại ${p.address}. ${p.tagline}. Giá: ${p.price}. Quy mô ${p.scale}, loại hình ${p.types.join(', ')}. Cập nhật ${yearsAgo}.`.slice(0, 300),
    keywords: [...p.keywords, `giá ${p.name.toLowerCase()}`, `${p.name.toLowerCase()} ${d.name.toLowerCase()}`],
    ogType: 'article',
    body,
    jsonld: [
      crumbLd([['Dự án', 'du-an/'], [d.name, `chu-dau-tu/${p.dev}/`], [p.name, `du-an/${p.slug}/`]]),
      {
        '@context': 'https://schema.org',
        '@type': p.types.includes('Căn hộ') || p.types.includes('Branded Residence') ? 'ApartmentComplex' : 'Residence',
        name: p.name,
        description: p.summary,
        url: abs(`du-an/${p.slug}/`),
        image: abs('assets/og.svg'),
        address: { '@type': 'PostalAddress', streetAddress: p.address, addressCountry: 'VN' },
        amenityFeature: p.amenities.map((x) => ({ '@type': 'LocationFeatureSpecification', name: x, value: true })),
        containedInPlace: { '@type': 'Place', name: a.name },
      },
      faqLd(faqs),
    ],
  });
}

function developer(k) {
  const R = '../../';
  const d = DEVELOPERS[k];
  const ps = byDev(k);
  const faqs = [
    [`${d.name} có những dự án nào tại miền Nam?`, `${d.name} có các dự án: ${ps.map((p) => p.name).join(', ')}.`],
    [`Mua dự án ${d.name} có an toàn không?`, `${d.full}. ${d.strengths.join('. ')}. Khách hàng vẫn nên kiểm tra pháp lý từng phân khu trước khi xuống tiền.`],
    [`Giá dự án ${d.name} bao nhiêu?`, ps.map((p) => `${p.name}: ${p.price}`).join('; ') + '.'],
  ];
  const body = `
<section class="phero phero-sm" style="--c:${d.color}"><div class="wrap">
  ${breadcrumb([['Chủ đầu tư', '#chu-dau-tu'], [d.name, null]], R)}
  <p class="eyebrow">Chủ đầu tư</p>
  <h1 class="h1 split">Dự án <em>${esc(d.name)}</em> miền Nam</h1>
  <p class="muted lead-p">${esc(d.intro)}</p>
  <ul class="ticks inline">${d.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
</div></section>
<section class="sec pt0"><div class="wrap">
  <h2 class="h2 split">${ps.length} dự án của <em>${esc(d.name)}</em></h2>
  <div class="grid cards">${ps.map((p, i) => card(p, R, i)).join('')}</div>
</div></section>
<section class="sec"><div class="wrap"><h2 class="h3">Bảng giá dự án ${esc(d.name)} ${yearsAgo}</h2>${priceTable(ps, R)}</div></section>
${faqBlock(faqs, `Hỏi đáp về ${esc(d.name)}`)}`;
  return layout({
    path: `chu-dau-tu/${k}/index.html`,
    title: `Dự án ${d.name} TP.HCM & miền Nam | Bảng giá ${yearsAgo}`,
    desc: `Tổng hợp dự án ${d.name} tại miền Nam: ${ps.map((p) => p.name).join(', ')}. Bảng giá, pháp lý, tiến độ cập nhật ${yearsAgo}.`.slice(0, 300),
    keywords: [`dự án ${d.name.toLowerCase()}`, `${d.name.toLowerCase()} tphcm`, `chủ đầu tư ${d.name.toLowerCase()}`, ...ps.map((p) => p.name.toLowerCase())],
    body,
    jsonld: [crumbLd([[d.name, `chu-dau-tu/${k}/`]]), { '@context': 'https://schema.org', '@type': 'Organization', name: d.full, description: d.intro }, faqLd(faqs)],
  });
}

function area(k) {
  const R = '../../';
  const a = AREAS[k];
  const ps = byArea(k);
  const body = `
<section class="phero phero-sm"><div class="wrap">
  ${breadcrumb([['Khu vực', '#khu-vuc'], [a.seo, null]], R)}
  <p class="eyebrow">Khu vực</p>
  <h1 class="h1 split">Dự án bất động sản <em>${esc(a.seo)}</em></h1>
  <p class="muted lead-p">${esc(a.intro)}</p>
</div></section>
<section class="sec pt0"><div class="wrap">
  <h2 class="h2 split">${ps.length} dự án tại <em>${esc(a.name)}</em></h2>
  <div class="grid cards">${ps.map((p, i) => card(p, R, i)).join('')}</div>
</div></section>
<section class="sec"><div class="wrap"><h2 class="h3">Bảng giá dự án ${esc(a.seo)} ${yearsAgo}</h2>${priceTable(ps, R)}</div></section>`;
  return layout({
    path: `khu-vuc/${k}/index.html`,
    title: `Dự án ${a.seo} – Căn hộ, biệt thự, nhà phố | Bảng giá ${yearsAgo}`,
    desc: `Danh sách dự án bất động sản ${a.name}: ${ps.map((p) => p.name).join(', ')}. ${a.intro}`.slice(0, 300),
    keywords: [`dự án ${a.seo.toLowerCase()}`, `căn hộ ${a.seo.toLowerCase()}`, `bất động sản ${a.seo.toLowerCase()}`, `nhà đất ${a.seo.toLowerCase()}`],
    body,
    jsonld: [crumbLd([[a.seo, `khu-vuc/${k}/`]])],
  });
}

function notFound() {
  const html = layout({
    path: '404.html',
    title: 'Không tìm thấy trang | ' + SITE.name,
    desc: 'Trang không tồn tại.',
    body: `<section class="phero phero-sm"><div class="wrap center"><h1 class="h1">404 · <em>Lạc lối?</em></h1><p class="muted">Trang anh/chị tìm không tồn tại.</p><a class="btn btn-gold" href="./"><span>Về trang chủ</span></a></div></section>`,
  });
  urls.pop();
  return html.replace('content="index, follow, max-image-preview:large"', 'content="noindex"');
}

// ---------- write ----------
function write(rel, content) {
  const f = join(OUT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content);
}
rmSync(OUT, { recursive: true, force: true });
write('index.html', home());
write('du-an/index.html', listing());
PROJECTS.forEach((p) => write(`du-an/${p.slug}/index.html`, project(p)));
Object.keys(DEVELOPERS).forEach((k) => write(`chu-dau-tu/${k}/index.html`, developer(k)));
Object.keys(AREAS).forEach((k) => write(`khu-vuc/${k}/index.html`, area(k)));
write('404.html', notFound());

mkdirSync(join(OUT, 'assets'), { recursive: true });
for (const f of readdirSync(join(__dir, 'assets'))) copyFileSync(join(__dir, 'assets', f), join(OUT, 'assets', f));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc><lastmod>${SITE.updated}</lastmod><changefreq>weekly</changefreq><priority>${u === abs('') ? '1.0' : u.includes('/du-an/') ? '0.9' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${abs('sitemap.xml')}\n`);
console.log(`Built ${urls.length} pages → ${OUT}`);
