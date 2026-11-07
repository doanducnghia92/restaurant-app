// Xử lý hình ảnh & video ngay trong trình duyệt:
//  - SVG do AI Thiết kế vẽ -> ảnh (raster) -> ghép ảnh thật của sản phẩm -> ảnh bìa PNG
//  - Dựng video 9:16 từ kịch bản (canvas + MediaRecorder), có phụ đề, chữ động, nhãn tiếp thị

export const W = 540;
export const H = 960;
const FONT = "Nunito, 'Segoe UI', system-ui, -apple-system, Arial, sans-serif";

// Bỏ những phần không an toàn/không cần trong SVG (ảnh render qua <img> nên script không chạy,
// nhưng làm sạch vẫn tốt hơn), và đảm bảo có xmlns + kích thước.
export function cleanSvg(svg) {
  let s = svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/<image[\s\S]*?(\/>|<\/image>)/gi, "")
    .replace(/\son\w+\s*=\s*(".*?"|'.*?')/gi, "")
    .replace(/(href\s*=\s*["'])(?!#)[^"']*(["'])/gi, "$1#$2");
  if (!/xmlns=/.test(s)) s = s.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  if (!/\swidth=/.test(s.slice(0, s.indexOf(">")))) s = s.replace(/<svg/i, '<svg width="1080" height="1920"');
  return s;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không tải được ảnh"));
    img.src = src;
  });
}

export async function svgToImage(svg) {
  const url = URL.createObjectURL(new Blob([cleanSvg(svg)], { type: "image/svg+xml" }));
  try {
    return await loadImage(url);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s;
  const ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function drawPhotoCard(ctx, photo, cx, cy, w, h, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, -w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 30);
  ctx.fill();
  ctx.shadowColor = "transparent";
  roundRect(ctx, -w / 2, -h / 2, w, h, 24);
  ctx.clip();
  drawCover(ctx, photo, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// Ảnh bìa = nền AI vẽ + ảnh thật của sản phẩm đặt vào vùng giữa (x 140-940, y 640-1360 ở khổ 1080)
export function composeCover(art, photo) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(art, 0, 0, W, H);
  if (photo) drawPhotoCard(ctx, photo, W / 2, 500, 380, 340);
  return c;
}

export const canvasBlob = (c, type = "image/png", q = 0.9) =>
  new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Không xuất được ảnh"))), type, q));

function wrap(ctx, text, maxW) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};

export function planScenes(script) {
  let scenes = (script.scenes || []).filter(Boolean).slice(0, 7).map((s) => ({
    ...s,
    sec: Math.min(6, Math.max(2.2, Number(s.sec) || 3.5)),
  }));
  if (!scenes.length) scenes = [{ sec: 4, text: script.hook, voice: script.hook, emoji: "✨" }];
  let total = scenes.reduce((a, s) => a + s.sec, 0);
  if (total > 30) {
    const k = 30 / total;
    scenes.forEach((s) => (s.sec *= k));
    total = 30;
  }
  let t = 0;
  return {
    total,
    scenes: scenes.map((s) => {
      const r = { ...s, start: t, end: t + s.sec };
      t += s.sec;
      return r;
    }),
  };
}

function drawFrame(ctx, t, d) {
  const { plan, art, cover, photo, palette, script } = d;
  const [bg1, bg2, accent, ink] = palette;
  const i = Math.max(0, plan.scenes.findIndex((s) => t < s.end));
  const idx = t >= plan.total ? plan.scenes.length - 1 : i;
  const sc = plan.scenes[idx];
  const local = t - sc.start;
  const isLast = idx === plan.scenes.length - 1;

  // Nền: cảnh đầu là ảnh bìa đầy đủ, các cảnh sau là nền AI vẽ phủ màu + chuyển động nhẹ
  ctx.fillStyle = bg1;
  ctx.fillRect(0, 0, W, H);
  if (idx === 0 && cover) {
    const z = 1 + 0.05 * (local / sc.sec);
    ctx.drawImage(cover, (W - W * z) / 2, (H - H * z) / 2, W * z, H * z);
  } else {
    const z = 1.15 + 0.06 * Math.sin(t * 0.5);
    ctx.drawImage(art, (W - W * z) / 2, (H - H * z) / 2 - 30, W * z, H * z);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `${bg2}f2`);
    g.addColorStop(1, `${bg1}f7`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Sản phẩm: ảnh thật nếu có, nếu không là emoji của cảnh
    const pop = easeOutBack(Math.min(1, local / 0.45));
    const float = Math.sin(t * 2.2) * 6;
    if (photo) drawPhotoCard(ctx, photo, W / 2, 470 + float, 360, 330, 0.75 + 0.25 * pop);
    else {
      ctx.save();
      ctx.translate(W / 2, 470 + float);
      ctx.scale(pop, pop);
      ctx.font = `150px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sc.emoji || "✨", 0, 0);
      ctx.restore();
    }

    // Chữ to trên màn hình
    const k = easeOutBack(Math.min(1, local / 0.35));
    ctx.save();
    ctx.translate(W / 2, 175);
    ctx.scale(k, k);
    ctx.font = `900 46px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    const lines = wrap(ctx, sc.text || "", W - 70).slice(0, 3);
    lines.forEach((ln, n) => {
      const y = (n - (lines.length - 1) / 2) * 56;
      ctx.lineWidth = 10;
      ctx.strokeStyle = ink;
      ctx.strokeText(ln, 0, y);
      ctx.fillStyle = n === 0 ? "#ffffff" : accent;
      ctx.fillText(ln, 0, y);
    });
    ctx.restore();

    if (isLast && script.cta) {
      const pulse = 1 + 0.05 * Math.sin(t * 7);
      ctx.save();
      ctx.translate(W / 2, 690);
      ctx.scale(pulse, pulse);
      ctx.font = `900 28px ${FONT}`;
      const label = `🛒 ${script.cta}`;
      const bw = Math.min(W - 40, ctx.measureText(label).width + 56);
      ctx.fillStyle = accent;
      roundRect(ctx, -bw / 2, -32, bw, 64, 32);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 2, W - 70);
      ctx.restore();
    }
  }

  // Phụ đề
  if (sc.voice) {
    ctx.font = `800 23px ${FONT}`;
    const lines = wrap(ctx, sc.voice, W - 90).slice(0, 3);
    const bh = lines.length * 31 + 24;
    const y0 = H - 150 - bh;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, 30, y0, W - 60, bh, 18);
    ctx.fill();
    ctx.fillStyle = "#1f1b2e";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    lines.forEach((ln, n) => ctx.fillText(ln, W / 2, y0 + 12 + n * 31));
  }

  // Thanh tiến độ kiểu story + nhãn tiếp thị (luôn hiện)
  const segW = (W - 32 - (plan.scenes.length - 1) * 5) / plan.scenes.length;
  plan.scenes.forEach((s, n) => {
    const x = 16 + n * (segW + 5);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    roundRect(ctx, x, 14, segW, 5, 3);
    ctx.fill();
    const f = Math.min(1, Math.max(0, (t - s.start) / s.sec));
    if (f > 0) {
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, x, 14, segW * f, 5, 3);
      ctx.fill();
    }
  });
  ctx.font = `800 15px ${FONT}`;
  const tag = "Có liên kết tiếp thị";
  const tw = ctx.measureText(tag).width + 20;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(ctx, 16, 30, tw, 26, 13);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(tag, 26, 44);
}

function pickMime() {
  const opts = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return opts.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || "";
}

// Dựng video theo thời gian thực (video 20 giây mất ~20 giây). Giữ trang mở trong lúc dựng.
export async function renderVideo({ art, cover, photo, palette, script, onProgress, signal }) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  if (!c.captureStream || typeof window.MediaRecorder === "undefined") {
    throw Object.assign(new Error("unsupported"), { code: "UNSUPPORTED_VIDEO" });
  }
  try {
    await document.fonts?.ready;
  } catch {
    /* dùng font dự phòng */
  }
  const ctx = c.getContext("2d");
  const plan = planScenes(script);
  const data = { plan, art, cover, photo, palette, script };
  const mime = pickMime();
  const stream = c.captureStream(30);
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 3_000_000 } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => e.data?.size && chunks.push(e.data);
  const stopped = new Promise((r) => (rec.onstop = r));
  drawFrame(ctx, 0, data);
  rec.start(500);

  const shots = [];
  const marks = [plan.scenes[Math.min(1, plan.scenes.length - 1)].start + 1, plan.total - 0.6];
  const t0 = performance.now();
  try {
    await new Promise((resolve, reject) => {
      const tick = () => {
        if (signal?.aborted) return reject({ code: "cancelled", message: "cancelled" });
        const t = Math.min(plan.total, (performance.now() - t0) / 1000);
        drawFrame(ctx, t, data);
        onProgress?.(t / plan.total);
        if (shots.length < marks.length && t >= marks[shots.length]) shots.push(canvasBlob(c, "image/jpeg", 0.85));
        if (t >= plan.total) return resolve();
        setTimeout(tick, 1000 / 30);
      };
      tick();
    });
  } finally {
    if (rec.state !== "inactive") rec.stop();
    await stopped;
    stream.getTracks().forEach((tr) => tr.stop());
  }
  const type = (rec.mimeType || mime || "video/webm").split(";")[0];
  return { blob: new Blob(chunks, { type }), type, seconds: Math.round(plan.total), frames: await Promise.all(shots) };
}
