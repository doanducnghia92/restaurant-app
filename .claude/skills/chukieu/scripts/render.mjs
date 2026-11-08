#!/usr/bin/env node
// chukieu renderer — dựng cụm typo từ spec JSON bằng Chromium (Playwright) + FFmpeg.
//
//   node render.mjs --spec spec.json --out overlay.mov          # lớp chữ nền trong suốt (ProRes 4444)
//   node render.mjs --spec spec.json --out overlay.webm         # VP9 có alpha
//   node render.mjs --spec spec.json --base in.mp4 --composite out.mp4   # ghép thẳng vào video
//   node render.mjs --spec spec.json --board board.png          # bảng xem trước từng cụm
//   node render.mjs --spec spec.json --still 2.4 --png f.png    # chụp 1 khung (nền đen)
// Tuỳ chọn: --fps 30  --duration 12  --from 0 --to 5  --preview (render 540×960 cho nhanh)  --bg "#000"
import { createRequire } from 'module';
import { execSync, spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require('playwright'); } catch (e) {}
  try { const g = execSync('npm root -g').toString().trim(); return require(path.join(g, 'playwright')); } catch (e) {}
  console.error('Thiếu Playwright. Cài: npm i -g playwright && npx playwright install chromium'); process.exit(1);
}
const { chromium } = loadPlaywright();

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = {}; const av = process.argv.slice(2);
for (let i = 0; i < av.length; i++) { if (av[i].startsWith('--')) { const k = av[i].slice(2); const v = av[i + 1] && !av[i + 1].startsWith('--') ? av[++i] : true; args[k] = v; } }
if (!args.spec) { console.error('Cần --spec <file.json>'); process.exit(1); }

const readJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const specPath = path.resolve(args.spec), specDir = path.dirname(specPath);
const spec = readJSON(specPath);
const templates = readJSON(path.join(SKILL, 'presets/templates.json'));
const palettes = readJSON(path.join(SKILL, 'presets/palettes.json'));
const fonts = readJSON(path.join(SKILL, 'fonts/fonts.json'));
if (spec.fontRoles) for (const [r, v] of Object.entries(spec.fontRoles)) fonts.roles[r] = Object.assign({}, fonts.roles[r], v);

const probe = f => JSON.parse(execSync(`ffprobe -v error -print_format json -show_entries format=duration:stream=width,height,codec_type "${f}"`).toString());
let base = null;
if (args.base) {
  const p = probe(path.resolve(args.base)); const v = p.streams.find(s => s.codec_type === 'video');
  base = { path: path.resolve(args.base), w: v.width, h: v.height, dur: parseFloat(p.format.duration), audio: p.streams.some(s => s.codec_type === 'audio') };
}
spec.canvas = spec.canvas || { w: 1080, h: 1920 };
if (args.preview) spec.canvas = { w: Math.round(spec.canvas.w / 2), h: Math.round(spec.canvas.h / 2) };
const W = spec.canvas.w, H = spec.canvas.h, FPS = parseFloat(args.fps || spec.fps || 30);

// ảnh lồng trong chữ: đường dẫn tương đối theo file spec
for (const c of spec.clusters || []) {
  const img = c.image || (c.texts && c.texts.image);
  if (img && !/^(https?|file|data):/.test(img)) { const u = pathToFileURL(path.resolve(specDir, img)).href; if (c.image) c.image = u; else c.texts.image = u; }
}

// ---- kiểm tra quy tắc ----
const warn = [];
const cl = spec.clusters || [];
cl.forEach((c, i) => {
  if (!templates[c.template]) warn.push(`Cụm ${i} (${c.id || ''}): không có mẫu ${c.template}`);
  if (!(c.t_out > c.t_in)) warn.push(`Cụm ${i}: t_out phải lớn hơn t_in`);
  if (i > 0) {
    const p = cl[i - 1];
    if (p.template === c.template) warn.push(`Cụm ${i - 1} và ${i} trùng mẫu ${c.template}`);
    if (p.palette && p.palette === c.palette) warn.push(`Cụm ${i - 1} và ${i} trùng màu ${c.palette}`);
    if (c.t_in < p.t_out) warn.push(`Cụm ${i - 1} và ${i} chồng thời gian (${p.t_out} > ${c.t_in})`);
  }
});

// ---- trang HTML tạm ----
const fu = p => pathToFileURL(p).href;
let fontCSS = fonts.free.map(f => `<link rel="stylesheet" href="${fu(path.join(SKILL, 'fonts/free', f))}">`).join('\n');
const userDir = path.join(SKILL, 'fonts/user');
const userFaces = fs.existsSync(userDir) ? fs.readdirSync(userDir).filter(f => /\.(ttf|otf|woff2?)$/i.test(f)) : [];
fontCSS += '<style>' + userFaces.map(f => `@font-face{font-family:"${f.replace(/\.[^.]+$/, '')}";src:url("${fu(path.join(userDir, f))}");}`).join('\n') + '</style>';
const bg = args.board || args.still ? (args.bg || '#0b0b0b') : 'transparent';
const html = `<!doctype html><html><head><meta charset="utf-8">${fontCSS}
<style>html,body{margin:0;padding:0;background:${bg};overflow:hidden}</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs id="ckdefs"></defs></svg><div id="stage"></div>
<script src="${fu(path.join(SKILL, 'engine/icons.js'))}"></script><script src="${fu(path.join(SKILL, 'engine/chukieu.js'))}"></script></body></html>`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'chukieu-'));
const htmlPath = path.join(tmp, 'page.html'); fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('Lỗi trang:', e.message));
await page.goto(fu(htmlPath));
const info = await page.evaluate(([s, t, p, f]) => window.CK.init(s, t, p, f), [spec, templates, palettes, fonts]);
const sx = W / 1080, sy = H / 1920;
info.forEach((c, i) => {
  const b = c.bbox; if (!b) return;
  if (b.y < 234 * sy || b.y + b.h > 1391 * sy || b.x < 59 * sx) warn.push(`Cụm ${i} lấn vùng an toàn (bbox ${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}×${Math.round(b.h)})`);
});
warn.forEach(w => console.warn('⚠ ' + w));

const cdp = await page.context().newCDPSession(page);
if (bg === 'transparent') await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
const shot = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, optimizeForSpeed: true })).data, 'base64');
const renderAt = (t, only) => page.evaluate(([t, o]) => window.CK.renderAt(t, o === null ? undefined : o), [t, only === undefined ? null : only]);

async function done() { await browser.close(); fs.rmSync(tmp, { recursive: true, force: true }); }

// ---- chụp 1 khung ----
if (args.still !== undefined) {
  await renderAt(parseFloat(args.still));
  fs.writeFileSync(path.resolve(args.png || 'still.png'), await shot());
  console.log('Đã lưu', args.png || 'still.png'); await done(); process.exit(0);
}

// ---- bảng xem trước ----
if (args.board) {
  const dir = path.join(tmp, 'board'); fs.mkdirSync(dir);
  for (let i = 0; i < info.length; i++) {
    const c = cl[i];
    const t = Math.min(c.t_out - 0.04, (args.at ? c.t_in + parseFloat(args.at) : c.t_in + 1.4));
    await renderAt(t, i);
    fs.writeFileSync(path.join(dir, `b_${String(i).padStart(3, '0')}.png`), await shot());
  }
  const cols = Math.min(5, info.length), rows = Math.ceil(info.length / cols);
  const cw = Math.round(360 * W / 1080), chh = Math.round(cw * H / W);
  const crop = args.full ? '' : `crop=iw:ih*0.62:0:ih*0.1,`;
  execSync(`ffmpeg -v error -y -framerate 1 -i "${dir}/b_%03d.png" -vf "${crop}scale=${cw}:-2,drawbox=c=0x333333:t=1,tile=${cols}x${rows}" -frames:v 1 "${path.resolve(args.board)}"`);
  console.log('Đã lưu bảng', args.board); await done(); process.exit(0);
}

// ---- video ----
const lastOut = Math.max(0, ...cl.map(c => c.t_out || 0));
const duration = parseFloat(args.duration || spec.duration || (base ? base.dur : lastOut + 0.3));
const f0 = Math.round(parseFloat(args.from || 0) * FPS), f1 = Math.round(parseFloat(args.to || duration) * FPS);
let ff;
if (args.composite) {
  if (!base) { console.error('--composite cần --base <video>'); process.exit(1); }
  const fa = ['-v', 'error', '-y', '-i', base.path, '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-filter_complex', `[1:v]scale=${base.w}:${base.h},format=rgba,setpts=PTS+${(f0 / FPS).toFixed(3)}/TB[o];[0:v][o]overlay=0:0:eof_action=pass:format=auto[v]`,
    '-map', '[v]', ...(base.audio ? ['-map', '0:a', '-c:a', 'copy'] : []),
    '-c:v', 'libx264', '-crf', String(args.crf || 17), '-preset', 'medium', '-pix_fmt', 'yuv420p', path.resolve(args.composite)];
  ff = spawn('ffmpeg', fa, { stdio: ['pipe', 'inherit', 'inherit'] });
} else {
  const out = path.resolve(args.out || 'chukieu_overlay.mov');
  const codec = out.endsWith('.webm')
    ? ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4']
    : ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0'];
  ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...codec, out], { stdio: ['pipe', 'inherit', 'inherit'] });
}
const write = buf => new Promise(r => { if (!ff.stdin.write(buf)) ff.stdin.once('drain', r); else r(); });
await renderAt(-1); const blank = await shot();
const t0 = Date.now();
for (let f = f0; f < f1; f++) {
  const n = await renderAt(f / FPS);
  await write(n ? await shot() : blank);
  if ((f - f0) % 60 === 0) process.stdout.write(`\r  khung ${f - f0}/${f1 - f0}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
console.log(`\nXong ${f1 - f0} khung trong ${((Date.now() - t0) / 1000).toFixed(1)}s → ${args.composite || args.out || 'chukieu_overlay.mov'}`);
await done();
