// Các khối nội dung mở rộng cho trang dự án: thư viện ảnh, mặt bằng,
// chính sách bán hàng, video, công cụ tính lãi vay
import { VIDEOS, LEGAL_SCHEDULE, DEV_POLICY, PROJECT_POLICY, RATES } from './media.mjs';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt1 = (n) => (Math.round(n * 100) / 100).toLocaleString('vi-VN');

function rng(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507), h = Math.imul(h ^ (h >>> 13), 3266489909), (h ^= h >>> 16) >>> 0) / 4294967296);
}

// ---------- giá mặc định cho công cụ tính lãi ----------
export function defaultPrice(p) {
  const texts = [...(p.units || []).map((u) => u[2]), p.price];
  for (const t of texts) {
    const m = String(t).match(/(\d+(?:[.,]\d+)?)\s*(?:–\s*\d+(?:[.,]\d+)?\s*)?tỷ/);
    if (m) return Math.max(1, parseFloat(m[1].replace(',', '.')));
  }
  return 5;
}

// ---------- mặt bằng tổng thể (minh hoạ) ----------
export function masterplan(p) {
  const r = rng(p.slug + 'mp');
  const [c1, c2, ac] = p.palette;
  const W = 800, H = 560;
  const low = p.types.some((t) => /Biệt thự|Nhà phố|Đất nền|Shophouse/.test(t));
  const high = p.types.some((t) => /Căn hộ|Branded/.test(t));
  const riverY = 470 + r() * 30;
  let s = `<rect width="${W}" height="${H}" fill="#eef2e8"/>`;
  // sông / biển
  s += `<path d="M0 ${riverY} C ${W * 0.3} ${riverY - 40}, ${W * 0.6} ${riverY + 40}, ${W} ${riverY - 20} L${W} ${H} L0 ${H}Z" fill="#c9dfe8"/>`;
  s += `<path d="M0 ${riverY + 18} C ${W * 0.3} ${riverY - 22}, ${W * 0.6} ${riverY + 58}, ${W} ${riverY}" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-dasharray="10 14"/>`;
  // đường chính
  const roads = [];
  for (let x = 160; x < W; x += 200 + r() * 40) roads.push(`<rect x="${x.toFixed(0)}" y="0" width="14" height="${riverY - 10}" fill="#fff"/>`);
  for (let y = 130; y < riverY - 40; y += 150 + r() * 30) roads.push(`<rect x="0" y="${y.toFixed(0)}" width="${W}" height="14" fill="#fff"/>`);
  s += roads.join('');
  // công viên trung tâm
  const px = 260 + r() * 200, py = 170 + r() * 80;
  s += `<rect x="${px.toFixed(0)}" y="${py.toFixed(0)}" width="170" height="110" rx="30" fill="#c5dcb6"/>`;
  s += `<ellipse cx="${(px + 85).toFixed(0)}" cy="${(py + 55).toFixed(0)}" rx="42" ry="24" fill="#bcd6e3"/>`;
  for (let i = 0; i < 14; i++) s += `<circle cx="${(px + 12 + r() * 146).toFixed(0)}" cy="${(py + 10 + r() * 90).toFixed(0)}" r="${(4 + r() * 5).toFixed(1)}" fill="#8fb57c" opacity=".85"/>`;
  // khối công trình
  for (let i = 0; i < 26; i++) {
    const bx = 20 + r() * (W - 80), by = 20 + r() * (riverY - 90);
    if (bx > px - 60 && bx < px + 180 && by > py - 50 && by < py + 120) continue;
    const isHigh = high && (!low || r() > 0.5);
    const bw = isHigh ? 34 + r() * 18 : 60 + r() * 40, bh = isHigh ? 34 + r() * 18 : 26 + r() * 10;
    s += `<rect x="${bx.toFixed(0)}" y="${by.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" rx="${isHigh ? 6 : 3}" fill="${isHigh ? c2 : '#e6d6b8'}" fill-opacity="${isHigh ? 0.75 : 0.95}" stroke="${isHigh ? c1 : '#b99c6b'}" stroke-opacity=".5"/>`;
    if (!isHigh) for (let k = 1; k < 4; k++) s += `<line x1="${(bx + (bw * k) / 4).toFixed(0)}" y1="${by.toFixed(0)}" x2="${(bx + (bw * k) / 4).toFixed(0)}" y2="${(by + bh).toFixed(0)}" stroke="#b99c6b" stroke-opacity=".5"/>`;
  }
  // tiện ích
  const ax = px + 200 > W - 80 ? px - 90 : px + 200, ay = py + 20;
  s += `<circle cx="${ax.toFixed(0)}" cy="${ay.toFixed(0)}" r="26" fill="${ac}"/><text x="${ax.toFixed(0)}" y="${(ay + 5).toFixed(0)}" text-anchor="middle" font-size="16" fill="#fff">★</text>`;
  // nhãn
  const lab = (x, y, t) => `<g><rect x="${x - 4}" y="${y - 15}" width="${t.length * 7.4 + 12}" height="22" rx="11" fill="#fff" fill-opacity=".92"/><text x="${x + 2}" y="${y}" font-size="12" font-family="Inter,Arial" fill="#14213d">${t}</text></g>`;
  s += lab(px + 10, py - 12, 'Công viên trung tâm') + lab(ax - 30, ay + 46, 'Tiện ích') + lab(30, riverY + 40, 'Sông / mặt nước');
  // la bàn & chú giải
  s += `<g transform="translate(${W - 60} 50)"><circle r="24" fill="#fff" stroke="#14213d" stroke-opacity=".2"/><path d="M0 -18 L6 0 L0 -4 L-6 0Z" fill="${ac}"/><text y="14" text-anchor="middle" font-size="10" font-family="Inter,Arial" fill="#14213d">N</text></g>`;
  s += `<g transform="translate(20 ${H - 34})" font-family="Inter,Arial" font-size="11" fill="#14213d"><rect width="${high && low ? 330 : 210}" height="26" rx="13" fill="#fff" fill-opacity=".92"/>${high ? `<rect x="12" y="8" width="12" height="10" rx="2" fill="${c2}" opacity=".8"/><text x="30" y="17">Cao tầng</text>` : ''}${low ? `<rect x="${high ? 100 : 12}" y="8" width="12" height="10" fill="#e6d6b8" stroke="#b99c6b"/><text x="${high ? 118 : 30}" y="17">Thấp tầng</text>` : ''}<text x="${high && low ? 196 : high ? 100 : 100}" y="17" fill="#717a8a">Minh hoạ – không theo tỷ lệ</text></g>`;
  return `<svg class="mp" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sơ đồ mặt bằng tổng thể minh hoạ ${esc(p.name)}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

// ---------- mặt bằng căn hộ / nhà phố (minh hoạ) ----------
const BEDS = (t) => (/Studio/i.test(t) ? 0 : /Penthouse|Sky Villa|4PN/i.test(t) ? 4 : /3PN|Duplex/i.test(t) ? 3 : /2PN/i.test(t) ? 2 : /1PN/i.test(t) ? 1 : null);
const DEF_AREA = [33, 50, 70, 100, 160];
function parseArea(s, n) {
  const nums = String(s).match(/\d+(?:[.,]\d+)?/g);
  if (!nums) return DEF_AREA[n];
  const v = nums.slice(0, 2).map((x) => parseFloat(x.replace(',', '.')));
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}
function room(x, y, w, h, name, m2, kind) {
  let f = '';
  const cx = x + w / 2, cy = y + h / 2;
  if (kind === 'bed') f = `<rect x="${cx - w * 0.22}" y="${y + 14}" width="${w * 0.44}" height="${h * 0.5}" rx="6" fill="#efe6d4" stroke="#c4a06a" stroke-opacity=".6"/><rect x="${cx - w * 0.18}" y="${y + 18}" width="${w * 0.36}" height="${Math.min(14, h * 0.1)}" rx="4" fill="#fff" stroke="#c4a06a" stroke-opacity=".5"/>`;
  if (kind === 'liv') f = `<path d="M${x + 18} ${y + h - 70} h${w * 0.36} v14 h-${w * 0.36 - 14} v48 h-14z" fill="#efe6d4" stroke="#c4a06a" stroke-opacity=".6"/><rect x="${x + w * 0.55}" y="${y + 24}" width="${w * 0.3}" height="${h * 0.32}" rx="${h * 0.16}" fill="none" stroke="#c4a06a" stroke-opacity=".6"/>`;
  if (kind === 'kit') f = `<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="16" fill="#e3e8ef" stroke="#94a3b8" stroke-opacity=".6"/>`;
  if (kind === 'wc') f = `<ellipse cx="${x + w - 22}" cy="${y + h - 22}" rx="9" ry="12" fill="#fff" stroke="#94a3b8"/>`;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${kind === 'bal' ? '#eaf2ea' : '#fff'}" stroke="#14213d" stroke-width="3"/>${f}<text x="${cx}" y="${cy + (kind === 'bed' ? h * 0.22 : 0)}" text-anchor="middle" font-family="Inter,Arial" font-size="${w < 90 ? 10 : 12}" font-weight="600" fill="#14213d">${name}</text><text x="${cx}" y="${cy + 15 + (kind === 'bed' ? h * 0.22 : 0)}" text-anchor="middle" font-family="Inter,Arial" font-size="10.5" fill="#717a8a">~${m2} m²</text></g>`;
}
export function floorplan(type, sizeText) {
  const n = BEDS(type);
  const W = 600, H = 420, X = 20, Y = 20, w = 560, h = 320;
  let s = `<rect width="${W}" height="${H}" fill="#faf7f1"/>`;
  if (n === null) {
    // nhà phố / shophouse / biệt thự – mặt bằng tầng 1
    const A = parseArea(sizeText, 2) || 100;
    const a = (k) => Math.max(4, Math.round(A * k));
    s += room(X, Y, w * 0.2, h, 'Sân trước', a(0.18), 'bal');
    s += room(X + w * 0.2, Y, w * 0.45, h, /Shophouse|Thương mại/i.test(type) ? 'Kinh doanh' : 'Phòng khách', a(0.38), 'liv');
    s += room(X + w * 0.65, Y, w * 0.25, h * 0.62, 'Bếp + ăn', a(0.18), 'kit');
    s += room(X + w * 0.65, Y + h * 0.62, w * 0.13, h * 0.38, 'WC', a(0.04), 'wc');
    s += room(X + w * 0.78, Y + h * 0.62, w * 0.12, h * 0.38, 'Thang', a(0.05), '');
    s += room(X + w * 0.9, Y, w * 0.1, h, 'Sân sau', a(0.07), 'bal');
    s += `<text x="${X}" y="${H - 50}" font-family="Inter,Arial" font-size="13" font-weight="600" fill="#14213d">Mặt bằng tầng 1 – ${esc(type)}</text>`;
  } else {
    const A = parseArea(sizeText, n);
    const net = A * 0.92;
    const a = (k) => Math.max(3, Math.round(net * k));
    if (n === 0) {
      s += room(X, Y, w * 0.66, h, 'Phòng ở + khách', a(0.62), 'liv');
      s += room(X + w * 0.66, Y, w * 0.34, h * 0.45, 'WC', a(0.12), 'wc');
      s += room(X + w * 0.66, Y + h * 0.45, w * 0.34, h * 0.55, 'Bếp', a(0.16), 'kit');
    } else {
      const top = h * 0.5;
      const wcw = w * 0.2;
      const bw = (w - wcw) / n;
      for (let i = 0; i < n; i++) s += room(X + i * bw, Y, bw, top, i === 0 && n > 1 ? 'PN master' : `Phòng ngủ ${n > 1 ? i + 1 : ''}`.trim(), a(i === 0 ? 0.2 : 0.15), 'bed');
      s += room(X + n * bw, Y, wcw, top, 'WC', a(0.06), 'wc');
      const lw = n >= 2 ? w * 0.58 : w * 0.66;
      s += room(X, Y + top, lw, h - top, 'Khách + ăn', a(n >= 2 ? 0.3 : 0.4), 'liv');
      s += room(X + lw, Y + top, n >= 2 ? w * 0.24 : w - lw, h - top, 'Bếp', a(0.1), 'kit');
      if (n >= 2) s += room(X + lw + w * 0.24, Y + top, w * 0.18, h - top, 'WC 2', a(0.05), 'wc');
    }
    s += room(X + w * 0.4, Y + h, w * 0.6, 36, 'Ban công / logia', a(0.07), 'bal');
    s += `<text x="${X}" y="${H - 34}" font-family="Inter,Arial" font-size="13" font-weight="600" fill="#14213d">${esc(type)} · ~${A} m²</text>`;
  }
  s += `<text x="${X}" y="${H - 14}" font-family="Inter,Arial" font-size="11" fill="#717a8a">Mặt bằng minh hoạ bố cục điển hình – không phải bản vẽ chính thức của chủ đầu tư</text>`;
  return `<svg class="fp" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mặt bằng minh hoạ ${esc(type)}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

export function plansSection(p) {
  const rows = (p.units || []).filter(([t]) => !/Đơn giá/.test(t)).slice(0, 5);
  if (!rows.length) return '';
  return `<h2 class="h3" id="mat-bang">Mặt bằng ${esc(p.name)}</h2>
  <div class="plans reveal">
    <div class="tabs" role="tablist" aria-label="Chọn mặt bằng">
      <button role="tab" class="tab on" aria-selected="true" data-tab="0">Tổng thể</button>
      ${rows.map(([t], i) => `<button role="tab" class="tab" aria-selected="false" data-tab="${i + 1}">${esc(t)}</button>`).join('')}
    </div>
    <div class="tab-panels">
      <figure class="panel on" data-panel="0">${masterplan(p)}<figcaption>Sơ đồ mặt bằng tổng thể minh hoạ ${esc(p.name)} – ${esc(p.scale)}</figcaption></figure>
      ${rows.map(([t, s2, pr], i) => `<figure class="panel" data-panel="${i + 1}">${floorplan(t, s2)}<figcaption>${esc(t)} · ${esc(s2)} · Giá tham khảo: ${esc(pr)}</figcaption></figure>`).join('')}
    </div>
    <p class="small muted">* Mặt bằng minh hoạ bố cục điển hình theo diện tích. Liên hệ để nhận mặt bằng chính thức (layout từng tòa, từng căn) từ chủ đầu tư.</p>
  </div>`;
}

// ---------- thư viện ảnh ----------
export function gallerySection(p, art, real, R) {
  const gen = [
    ['Phối cảnh minh hoạ ban ngày', art(p, { w: 1200, h: 800 })],
    ['Phối cảnh minh hoạ hoàng hôn', art(p, { w: 1200, h: 800, seed: 'b', dusk: true })],
    ['Phối cảnh minh hoạ về đêm', art(p, { w: 1200, h: 800, night: true })],
    ['Sơ đồ tổng thể minh hoạ', masterplan(p)],
  ];
  const items = [
    ...real.map((f) => [f.caption, `<img src="${R}${f.src}" alt="${esc(p.name)} – ${esc(f.caption)}" loading="lazy" decoding="async">`, true]),
    ...gen.map(([c, h]) => [c, h, false]),
  ];
  return `<h2 class="h3" id="hinh-anh">Hình ảnh ${esc(p.name)}</h2>
  <div class="gal reveal">${items.map(([c, h, isReal], i) => `<button class="gal-item${i === 0 ? ' big' : ''}" data-i="${i}" data-cap="${esc(c)}" data-cursor="Phóng to" aria-label="Xem ảnh: ${esc(c)}">${h}<span class="gal-cap">${esc(c)}${isReal ? '' : ' <em>· minh hoạ</em>'}</span></button>`).join('')}</div>
  ${real.length ? '' : `<p class="small muted">* Hình minh hoạ được tạo tự động. Phối cảnh, ảnh thực tế & nhà mẫu chính thức sẽ được gửi khi anh/chị <a href="#dang-ky">đăng ký nhận tài liệu</a>.</p>`}`;
}

// ---------- video ----------
export function videoSection(p, art) {
  const v = VIDEOS[p.slug];
  const q = encodeURIComponent(`${p.name} ${p.dev === 'masterise' ? 'Masterise Homes' : ''}`.trim());
  const yt = `https://www.youtube.com/results?search_query=${q}`;
  if (v) {
    return `<h2 class="h3" id="video">Video ${esc(p.name)}</h2>
    <div class="video reveal"><button class="yt" data-id="${esc(v.id)}" aria-label="Phát video: ${esc(v.title)}">
      <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="${esc(v.title)}" loading="lazy">
      <span class="yt-play" aria-hidden="true"><svg viewBox="0 0 68 48"><path d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.6c-3 .7-4.7 3.2-5.4 6.1C.1 13 0 24 0 24s.1 11 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.5c2.9-.8 4.6-3.3 5.4-6.2C67.9 35 68 24 68 24s-.1-11-1.5-16.3z" fill="#c4a06a"/><path d="M45 24 27 14v20" fill="#fff"/></svg></span>
      <span class="yt-title">${esc(v.title)}</span>
    </button></div>
    <p class="small muted">Video tham khảo từ YouTube. <a href="${yt}" target="_blank" rel="noopener nofollow">Xem thêm video ${esc(p.name)} trên YouTube →</a></p>`;
  }
  return `<h2 class="h3" id="video">Video ${esc(p.name)}</h2>
  <a class="video video-cine reveal" href="${yt}" target="_blank" rel="noopener nofollow" data-cursor="YouTube">
    <div class="cine">${art(p, { w: 1200, h: 675, night: true })}</div>
    <span class="yt-play" aria-hidden="true"><svg viewBox="0 0 68 48"><path d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.6c-3 .7-4.7 3.2-5.4 6.1C.1 13 0 24 0 24s.1 11 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.5c2.9-.8 4.6-3.3 5.4-6.2C67.9 35 68 24 68 24s-.1-11-1.5-16.3z" fill="#c4a06a"/><path d="M45 24 27 14v20" fill="#fff"/></svg></span>
    <span class="yt-title">Xem video ${esc(p.name)} trên YouTube</span>
  </a>
  <p class="small muted">Video flycam, nhà mẫu & tiến độ thực tế được cập nhật liên tục – liên hệ để nhận video mới nhất.</p>`;
}

// ---------- chính sách bán hàng ----------
export function policySection(p, devName) {
  const dp = DEV_POLICY[p.dev] || { options: [], recent: [] };
  const recent = [...(PROJECT_POLICY[p.slug] || []), ...dp.recent.filter(([, t]) => !(PROJECT_POLICY[p.slug] || []).some(([, x]) => x === t))];
  const resale = /chuyển nhượng|Đã bàn giao|Đang vận hành/i.test(p.status) && !/mở bán/i.test(p.status);
  const sched = resale ? LEGAL_SCHEDULE.resale : p.dev === 'capitaland' ? LEGAL_SCHEDULE.foreign : LEGAL_SCHEDULE.domestic;
  const price = defaultPrice(p);
  const pct = resale ? [0.1, 0.9] : p.dev === 'capitaland' ? [0.05, 0.25, 0.2, 0.45, 0.05] : [0.05, 0.25, 0.4, 0.25, 0.05];
  return `<h2 class="h3" id="chinh-sach">Chính sách bán hàng ${esc(p.name)}</h2>
  <div class="pol reveal">
    <div class="pol-cards">${dp.options.map(([t, d]) => `<div class="pol-card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
    ${recent.length ? `<div class="pol-recent"><h3>Chính sách & ưu đãi gần nhất được ghi nhận</h3><ul>${recent.map(([when, txt, src]) => `<li><time>${esc(when)}</time><span>${esc(txt)} <a href="${esc(src)}" target="_blank" rel="noopener nofollow">(nguồn)</a></span></li>`).join('')}</ul><p class="small muted">Chương trình có thời hạn – vui lòng liên hệ để xác nhận chính sách đang áp dụng.</p></div>` : ''}
    <h3 class="pol-h">${resale ? 'Quy trình thanh toán khi mua chuyển nhượng' : `Tiến độ thanh toán theo Luật Kinh doanh BĐS 2023${p.dev === 'capitaland' ? ' (CĐT vốn nước ngoài)' : ''}`}</h3>
    <div class="table-wrap"><table class="ptable utable"><thead><tr><th>Đợt</th><th>Tỷ lệ</th><th>Ví dụ căn ${fmt1(price)} tỷ</th><th>Ghi chú</th></tr></thead><tbody>${sched.map(([a, b, c], i) => `<tr><td>${esc(a)}</td><td class="gold">${esc(b)}</td><td>~${fmt1(price * (pct[i] ?? 0))} tỷ</td><td>${esc(c)}</td></tr>`).join('')}</tbody></table></div>
    <p class="small muted">* Bảng mô phỏng theo khung pháp luật; tỷ lệ thực tế theo chính sách ${esc(devName)} từng đợt mở bán.</p>
  </div>`;
}

// ---------- công cụ tính lãi vay ----------
export function calcWidget(price, { id = 'calc', title = 'Tính thử khoản vay mua nhà', projects = null } = {}) {
  const f = (n, lbl, min, max, step, val, unit, extra = '') => `<label class="cf"><span>${lbl}</span><div class="cf-row"><input type="range" name="${n}" min="${min}" max="${max}" step="${step}" value="${val}" ${extra}><output><input type="number" data-for="${n}" min="${min}" max="${max}" step="${step}" value="${val}" inputmode="decimal"><i>${unit}</i></output></div></label>`;
  return `<div class="calc reveal" id="${id}" data-calc>
  <div class="calc-in">
    <h3>${esc(title)}</h3>
    ${projects ? `<label class="cf"><span>Chọn dự án (tự điền giá tham khảo)</span><select data-preset><option value="">— Nhập giá tự do —</option>${projects.map((p) => `<option value="${defaultPrice(p)}">${esc(p.name)} (~${fmt1(defaultPrice(p))} tỷ)</option>`).join('')}</select></label>` : ''}
    ${f('price', 'Giá trị bất động sản', 0.5, 100, 0.1, price, 'tỷ')}
    ${f('ltv', 'Tỷ lệ vay', 10, 80, 5, 70, '%')}
    ${f('years', 'Thời hạn vay', 5, 35, 1, 20, 'năm')}
    ${f('promo', 'Lãi suất ưu đãi', 0, 15, 0.1, RATES.promo, '%/năm')}
    ${f('promoMonths', 'Thời gian ưu đãi', 0, 60, 1, RATES.promoMonths, 'tháng')}
    ${f('float', 'Lãi suất sau ưu đãi', 5, 18, 0.1, RATES.floating, '%/năm')}
    ${f('grace', 'Ân hạn nợ gốc', 0, 36, 1, 0, 'tháng')}
    <fieldset class="cf-method"><legend>Cách trả nợ</legend>
      <label><input type="radio" name="method" value="decl" checked> Gốc đều, lãi giảm dần</label>
      <label><input type="radio" name="method" value="ann"> Trả đều hằng tháng</label>
    </fieldset>
  </div>
  <div class="calc-out" aria-live="polite">
    <div class="kpis">
      <div class="kpi main"><span>Trả tháng đầu</span><b data-o="first">–</b></div>
      <div class="kpi"><span>Vốn tự có cần chuẩn bị</span><b data-o="equity">–</b></div>
      <div class="kpi"><span>Số tiền vay</span><b data-o="loan">–</b></div>
      <div class="kpi"><span>Trả tháng cao nhất</span><b data-o="max">–</b></div>
      <div class="kpi"><span>Tổng lãi phải trả</span><b data-o="interest">–</b></div>
      <div class="kpi"><span>Tổng gốc + lãi</span><b data-o="total">–</b></div>
    </div>
    <p class="calc-income">Thu nhập khuyến nghị: <b data-o="income">–</b>/tháng <small>(nghĩa vụ trả nợ ≤ 50% thu nhập)</small></p>
    <div class="chart" data-o="chart" role="img" aria-label="Biểu đồ số tiền trả hằng tháng theo năm"></div>
    <div class="legend"><span class="lg-p">Gốc</span><span class="lg-i">Lãi</span><small>Trung bình mỗi tháng theo từng năm</small></div>
    <details class="sched"><summary>Xem lịch trả nợ theo năm</summary><div class="table-wrap"><table class="ptable"><thead><tr><th>Năm</th><th>Gốc trả</th><th>Lãi trả</th><th>TB/tháng</th><th>Dư nợ cuối năm</th></tr></thead><tbody data-o="table"></tbody></table></div></details>
    <a class="btn btn-gold magnetic w100" href="#dang-ky"><span>Nhận tư vấn gói vay ưu đãi</span></a>
  </div>
  <p class="small muted calc-note">Kết quả mang tính tham khảo. Lãi mặc định: ưu đãi ${RATES.promo}%/năm trong ${RATES.promoMonths} tháng, sau đó ${RATES.floating}%/năm. ${esc(RATES.note)} Nguồn: ${RATES.sources.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener nofollow">${esc(t)}</a>`).join(', ')}.</p>
</div>`;
}
