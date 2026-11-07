// Bộ điều phối phòng Affiliate: mỗi brief là một "job" đi qua 5 agent AI thật.
//   Ngọc (Biên kịch) -> Hiếu (Kiểm duyệt, có thể trả về để sửa) -> Quân (Ảnh bìa)
//   -> Tâm (Dựng video ở Studio) -> Hiếu (Soát hình) -> Thảo (Gói đăng TikTok)
// Mỗi bước là một lần gọi Claude thật; nhân vật 3D làm việc / đi bàn giao đúng lúc đó.
import { connectRuntime, aiErrorText } from "./runtime.js";
import {
  scriptPrompt, auditPrompt, imagePrompt, visualAuditPrompt, postPrompt, parseImageAnswer,
} from "./prompts.js";
import { svgToImage, composeCover, canvasBlob, renderVideo, loadImage, cleanSvg } from "./media.js";
import { STUDIO_SPOTS } from "../layout.js";

export const STEPS = [
  { key: "script", role: "script", label: "Kịch bản", icon: "✍️" },
  { key: "audit", role: "audit", label: "Kiểm duyệt", icon: "🔍" },
  { key: "image", role: "image", label: "Ảnh bìa", icon: "🎨" },
  { key: "video", role: "video", label: "Video", icon: "🎬" },
  { key: "final", role: "audit", label: "Soát hình", icon: "👀" },
  { key: "post", role: "post", label: "Gói đăng", icon: "📱" },
];
const COLL = "aff_jobs";
const MAX_REVISIONS = 2;
const short = (s, n = 48) => (String(s || "").length > n ? `${String(s).slice(0, n - 1)}…` : String(s || ""));
export const blobUrl = (id) => (id ? `/_blob/${id}` : null);

function normScript(s) {
  if (!s || typeof s !== "object" || !s.hook || !Array.isArray(s.scenes) || !s.scenes.length) {
    throw { code: "invalid_json", message: "Kịch bản thiếu hook hoặc cảnh" };
  }
  return {
    angle: String(s.angle || ""),
    hook: String(s.hook),
    scenes: s.scenes.slice(0, 7).map((c) => ({
      sec: Number(c.sec) || 4,
      text: String(c.text || ""),
      voice: String(c.voice || ""),
      visual: String(c.visual || ""),
      emoji: String(c.emoji || "✨").slice(0, 4),
    })),
    cta: String(s.cta || "Bấm giỏ hàng để xem giá"),
    summary: String(s.summary || ""),
  };
}

function normAudit(a) {
  const issues = (Array.isArray(a?.issues) ? a.issues : []).slice(0, 8).map((i) => ({
    level: ["cao", "vừa", "thấp"].includes(i?.level) ? i.level : "vừa",
    text: String(i?.text || ""),
    fix: String(i?.fix || ""),
  }));
  const score = Math.max(0, Math.min(100, Math.round(Number(a?.score) || 0)));
  const verdict = a?.verdict === "pass" && !issues.some((i) => i.level === "cao") ? "pass" : "fix";
  return { score, verdict, issues, note: String(a?.note || "") };
}

function normPost(p) {
  const tags = (Array.isArray(p?.hashtags) ? p.hashtags : String(p?.hashtags || "").split(/\s+/))
    .map((t) => String(t).trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .slice(0, 10);
  return {
    title: String(p?.title || ""),
    caption: String(p?.caption || ""),
    hashtags: tags,
    bestTime: String(p?.bestTime || ""),
    timeReason: String(p?.timeReason || ""),
    pinnedComment: String(p?.pinnedComment || ""),
    disclosure: String(p?.disclosure || "Video có chứa liên kết tiếp thị."),
  };
}

export class AffiliateStudio {
  constructor(sim) {
    this.sim = sim;
    this.rt = null;
    this.jobs = new Map();
    this.media = new Map();
    this.ctrl = new Map();
    this.locks = new Map();
    this.writes = new Map();
    this.listeners = new Set();
    this.version = 0;
    this.agents = Object.fromEntries(sim.agents.filter((a) => a.aiRole).map((a) => [a.aiRole, a]));
  }

  // ---------- trạng thái cho giao diện ----------
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getVersion = () => this.version;

  emit() {
    this.version++;
    this.listeners.forEach((f) => f());
  }

  list() {
    return [...this.jobs.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  isRunning(id) {
    return this.ctrl.has(id);
  }

  mediaFor(id) {
    if (!this.media.has(id)) this.media.set(id, {});
    return this.media.get(id);
  }

  coverUrl(job) {
    return this.media.get(job.id)?.coverUrl || blobUrl(job.cover?.assetId);
  }

  videoUrl(job) {
    return this.media.get(job.id)?.videoUrl || blobUrl(job.video?.assetId);
  }

  async init() {
    this.rt = await connectRuntime();
    const db = this.rt.db;
    if (db) {
      try {
        db.collection(COLL).orderBy("createdAt", "desc").limit(30).onSnapshot(
          (snap) => {
            for (const d of snap.docs) {
              if (this.ctrl.has(d.id)) continue; // job đang chạy ở trang này: bản trong bộ nhớ mới hơn
              const data = d.data();
              if (data) this.jobs.set(d.id, { ...data, id: d.id });
            }
            for (const ch of snap.docChanges?.() || []) {
              if (ch.type === "removed" && !this.ctrl.has(ch.doc.id)) this.jobs.delete(ch.doc.id);
            }
            this.emit();
          },
          (e) => {
            this.dbError = e?.code || "unavailable";
            this.emit();
          },
        );
      } catch (e) {
        this.dbError = e?.code || "unavailable";
      }
    }
    this.emit();
  }

  save(job) {
    this.jobs.set(job.id, job);
    this.emit();
    const db = this.rt?.db;
    if (!db) return;
    const body = JSON.parse(JSON.stringify(job));
    delete body.id;
    delete body.live;
    delete body.videoProgress;
    const prev = this.writes.get(job.id) || Promise.resolve();
    const next = prev
      .then(() => db.collection(COLL).doc(job.id).set(body))
      .catch((e) => {
        this.dbError = e?.code || "unavailable";
        this.emit();
      });
    this.writes.set(job.id, next);
  }

  event(job, agent, text) {
    job.events = [...(job.events || []), { at: Date.now(), who: agent?.name || null, text }].slice(-60);
    this.emit();
  }

  // Mỗi agent chỉ làm một việc một lúc (các brief xếp hàng chờ)
  async withAgent(agent, fn) {
    const prev = this.locks.get(agent.id) || Promise.resolve();
    let release;
    const mine = new Promise((r) => (release = r));
    this.locks.set(agent.id, prev.then(() => mine));
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  // Một lượt "suy nghĩ" của agent = một lần gọi Claude thật
  think(agent, job, label, call) {
    return this.withAgent(agent, async () => {
      this.sim.aiSetTask(agent.id, label);
      this.sim.aiBubble(agent.id, "🤔 Đang suy nghĩ…", 5);
      job.active = { name: agent.name, label };
      job.live = "";
      this.emit();
      let last = 0;
      const onText = ({ text }) => {
        job.live = text.slice(-600);
        const now = performance.now();
        if (now - last > 1400) {
          last = now;
          this.sim.aiBubble(agent.id, `✍️ ${text.length.toLocaleString("vi-VN")} ký tự…`, 2.2);
        }
        this.emit();
      };
      try {
        return await call(onText);
      } finally {
        this.sim.aiSetTask(agent.id, null);
        job.active = null;
        job.live = null;
      }
    });
  }

  async handoff(job, from, to, say, reply) {
    this.event(job, from, `→ ${to.name}: ${say}`);
    await this.withAgent(from, () => this.sim.aiHandoff(from.id, to.id, [[0, say], [1, reply]]));
  }

  async photoFor(job) {
    const m = this.mediaFor(job.id);
    if (m.photoImg) return m.photoImg;
    if (!m.photo && job.photoId) {
      try {
        m.photo = await (await fetch(blobUrl(job.photoId))).blob();
      } catch {
        m.photo = null;
      }
    }
    if (!m.photo) return null;
    m.photoImg = await loadImage(URL.createObjectURL(m.photo));
    return m.photoImg;
  }

  // Dựng lại ảnh bìa từ SVG đã lưu (dùng khi mở lại trang)
  async ensureCover(job) {
    const m = this.mediaFor(job.id);
    if (!job.cover?.svg) return m;
    const photo = await this.photoFor(job).catch(() => null);
    if (!m.art) m.art = await svgToImage(job.cover.svg);
    if (!m.cover) m.cover = composeCover(m.art, photo);
    if (!m.coverBlob) {
      m.coverBlob = await canvasBlob(m.cover);
      m.coverUrl = URL.createObjectURL(m.coverBlob);
    }
    this.emit();
    return m;
  }

  async prepareMedia(id) {
    const job = this.jobs.get(id);
    if (!job?.cover || job.cover.assetId) return;
    try {
      await this.ensureCover(job);
    } catch {
      /* ảnh bìa lỗi: giao diện hiện chỗ trống */
    }
  }

  async upload(blob, type) {
    if (!this.rt?.assets) return null;
    try {
      return (await this.rt.assets.upload(blob, { type })).id;
    } catch {
      return null;
    }
  }

  // ---------- lệnh từ giao diện ----------
  async createJob(product, photoFile) {
    const id = `j${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const job = { id, createdAt: Date.now(), product, status: "running", step: "script", revisions: 0, events: [], photoId: null };
    if (photoFile) {
      this.mediaFor(id).photo = photoFile;
      job.photoId = await this.upload(photoFile, photoFile.type || "image/jpeg");
    }
    this.event(job, null, `📩 Nhận brief: ${product.name}`);
    this.sim.log(null, `📩 Phòng Affiliate nhận brief mới: "${product.name}"`, "system");
    this.save(job);
    this.run(id);
    return id;
  }

  stop(id) {
    this.ctrl.get(id)?.abort();
  }

  markPosted(id) {
    const job = { ...this.jobs.get(id), status: "posted", postedAt: Date.now() };
    this.event(job, null, "✅ Đã đăng lên TikTok");
    this.sim.log(this.agents.post, `✅ Đã đăng video "${job.product.name}" lên TikTok`, "ai");
    this.save(job);
  }

  async remove(id) {
    this.stop(id);
    this.jobs.delete(id);
    this.emit();
    try {
      await this.rt?.db?.collection(COLL).doc(id).delete();
    } catch {
      /* đã xoá khỏi danh sách hiện tại */
    }
  }

  async downloadVideo(id) {
    const job = this.jobs.get(id);
    const m = this.mediaFor(id);
    let blob = m.videoBlob;
    if (!blob && job.video?.assetId) blob = await (await fetch(blobUrl(job.video.assetId))).blob();
    if (!blob) throw new Error("Chưa có video");
    const ext = (job.video?.type || blob.type).includes("mp4") ? "mp4" : "webm";
    const name = `${job.product.name}`.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "video";
    const dl = this.rt?.downloads;
    if (!dl) throw new Error("Trang này chưa tải file được. Mở trên claude.ai để tải video.");
    return dl.save({ filename: `tiktok-${name}.${ext}`, data: blob });
  }

  // ---------- quy trình chính ----------
  async run(id) {
    if (this.ctrl.has(id) || !this.jobs.get(id)) return;
    const ctl = new AbortController();
    this.ctrl.set(id, ctl);
    const job = { ...this.jobs.get(id), status: "running", error: null, errorCode: null };
    const A = this.agents;
    const S = this.rt.sample;
    const signal = ctl.signal;
    const p = job.product;
    const stopIfAborted = () => {
      if (signal.aborted) throw { code: "cancelled", message: "cancelled" };
    };
    this.save(job);

    try {
      const photo = await this.photoFor(job).catch(() => null);
      const photoBlob = this.mediaFor(id).photo;
      const sendPhoto = !!(photoBlob && this.rt.canSeeImages);

      // 1-2. Kịch bản + kiểm duyệt (trả về sửa tối đa 2 lần)
      if (!job.script) {
        job.step = "script";
        const raw = await this.think(A.script, job, `✍️ Viết kịch bản: ${short(p.name, 24)}`, (onText) =>
          S.json(scriptPrompt(p, { hasPhoto: sendPhoto }), { signal, onText, cache: false, images: sendPhoto ? [photoBlob] : undefined }));
        job.script = normScript(raw);
        this.event(job, A.script, `Viết xong kịch bản: "${job.script.hook}"`);
        this.sim.aiLog(A.script.id, `✅ Xong kịch bản "${short(job.script.hook, 60)}"`);
        this.save(job);
      }
      for (;;) {
        stopIfAborted();
        if (!job.audit) {
          job.step = "audit";
          await this.handoff(job, A.script, A.audit, `Kịch bản "${short(job.script.hook, 40)}" xong rồi, ${A.audit.name} kiểm duyệt giúp nha`, "Ok, để mình soát 🔍");
          const raw = await this.think(A.audit, job, "🔍 Kiểm duyệt kịch bản", (onText) =>
            S.json(auditPrompt(p, job.script), { signal, onText, cache: false }));
          job.audit = normAudit(raw);
          job.auditHistory = [...(job.auditHistory || []), { round: job.revisions, ...job.audit }];
          this.event(job, A.audit, `Chấm ${job.audit.score}/100 — ${job.audit.verdict === "pass" ? "ĐẠT" : "CẦN SỬA"}. ${job.audit.note}`);
          this.save(job);
        }
        if (job.audit.verdict === "pass") break;
        if (job.revisions >= MAX_REVISIONS) {
          job.audit = { ...job.audit, accepted: true };
          this.event(job, A.audit, `Đã sửa ${MAX_REVISIONS} lần, cho qua kèm lưu ý để anh xem lại.`);
          this.save(job);
          break;
        }
        const top = job.audit.issues[0];
        await this.handoff(job, A.audit, A.script, `Chưa đạt ${job.audit.score}/100: ${short(top?.text || job.audit.note, 90)}`, "Nhận, mình sửa ngay ✍️");
        job.step = "script";
        const raw = await this.think(A.script, job, "✍️ Sửa kịch bản theo kiểm duyệt", (onText) =>
          S.json(scriptPrompt(p, { hasPhoto: sendPhoto, previous: job.script, issues: job.audit.issues }), {
            signal, onText, cache: false, images: sendPhoto ? [photoBlob] : undefined,
          }));
        job.script = normScript(raw);
        job.revisions += 1;
        job.audit = null;
        this.event(job, A.script, `Sửa xong (lần ${job.revisions}): "${job.script.hook}"`);
        this.save(job);
      }

      // 3. Ảnh bìa
      if (!job.cover) {
        stopIfAborted();
        job.step = "image";
        await this.handoff(job, A.audit, A.image, `Kịch bản đạt ${job.audit.score}/100. ${A.image.name} làm ảnh bìa nhé`, "Để mình thiết kế 🎨");
        const ans = await this.think(A.image, job, "🎨 Thiết kế ảnh bìa", (onText) =>
          S(imagePrompt(p, job.script, { hasPhoto: !!photo }), { signal, onText, cache: false }));
        const { svg, palette } = parseImageAnswer(ans.text);
        job.cover = { svg: cleanSvg(svg), palette };
        const m = await this.ensureCover(job);
        job.cover.assetId = await this.upload(m.coverBlob, "image/png");
        this.event(job, A.image, "Thiết kế xong ảnh bìa 9:16.");
        this.sim.aiLog(A.image.id, "✅ Xong ảnh bìa, gửi Tâm dựng video");
        this.save(job);
      }

      // 4. Video (dựng thật trong trình duyệt, ở Studio)
      if (!job.video) {
        stopIfAborted();
        job.step = "video";
        await this.handoff(job, A.image, A.video, "Ảnh bìa xong rồi, dựng video giúp mình 🎬", "Ok, mình ra Studio dựng luôn!");
        const m = await this.ensureCover(job);
        await this.withAgent(A.video, async () => {
          await this.sim.aiGo(A.video.id, STUDIO_SPOTS[0], "Ra Studio dựng video");
          this.sim.aiSetTask(A.video.id, "🎬 Dựng video", 0);
          this.sim.aiBubble(A.video.id, "🎬 Bắt đầu dựng!", 3);
          try {
            const res = await renderVideo({
              art: m.art, cover: m.cover, photo, palette: job.cover.palette, script: job.script, signal,
              onProgress: (f) => {
                job.videoProgress = f;
                this.sim.aiSetTask(A.video.id, `🎬 Dựng video ${Math.round(f * 100)}%`, f);
                this.emit();
              },
            });
            m.videoBlob = res.blob;
            m.videoUrl = URL.createObjectURL(res.blob);
            m.frames = res.frames;
            job.video = { type: res.type, seconds: res.seconds, sizeMB: +(res.blob.size / 1048576).toFixed(1) };
            this.save(job);
            job.video.assetId = await this.upload(res.blob, res.type);
          } finally {
            this.sim.aiSetTask(A.video.id, null);
            job.videoProgress = null;
          }
        });
        this.event(job, A.video, `Dựng xong video ${job.video.seconds}s (${job.video.sizeMB} MB).`);
        this.save(job);
      }

      // 5. Soát hình: AI Kiểm duyệt xem ảnh bìa + khung hình video
      if (!job.finalAudit) {
        stopIfAborted();
        job.step = "final";
        await this.handoff(job, A.video, A.audit, `Video ${job.video.seconds}s xong rồi, ${A.audit.name} soát hình lần cuối nha`, "Để mình xem từng khung hình 👀");
        const m = this.mediaFor(id);
        const imgs = [];
        if (m.cover) imgs.push(await canvasBlob(m.cover, "image/jpeg", 0.85));
        imgs.push(...(m.frames || []));
        if (this.rt.mode === "demo" || (this.rt.canSeeImages && imgs.length)) {
          const raw = await this.think(A.audit, job, "👀 Soát hình video", (onText) =>
            S.json(visualAuditPrompt(p, job.script, imgs.length), {
              signal, onText, cache: false, images: this.rt.mode === "demo" ? undefined : imgs,
            }));
          job.finalAudit = normAudit(raw);
          this.event(job, A.audit, `Soát hình: ${job.finalAudit.score}/100. ${job.finalAudit.note}`);
        } else {
          job.finalAudit = { skipped: true, score: null, verdict: "pass", issues: [], note: "Trình xem này không gửi được ảnh cho Claude nên chưa soát hình. Anh xem video trước khi đăng nhé." };
          this.event(job, A.audit, job.finalAudit.note);
        }
        this.save(job);
      }

      // 6. Gói đăng TikTok
      if (!job.post) {
        stopIfAborted();
        job.step = "post";
        const fa = job.finalAudit;
        const say = fa.verdict === "pass" ? "Hình ổn rồi, soạn gói đăng TikTok nhé 🚀" : `Hình còn lưu ý: ${short(fa.issues[0]?.text, 70)}. Anh duyệt trước khi đăng nha`;
        await this.handoff(job, A.audit, A.post, say, "Ok, mình soạn caption ngay ✍️");
        const raw = await this.think(A.post, job, "📱 Soạn gói đăng TikTok", (onText) =>
          S.json(postPrompt(p, job.script), { signal, onText, cache: false }));
        job.post = normPost(raw);
        this.event(job, A.post, `Gói đăng xong. Giờ đăng gợi ý: ${job.post.bestTime}`);
      }

      job.step = "done";
      job.status = "ready";
      this.sim.aiBubble(A.post.id, "Sẵn sàng đăng TikTok! 🚀", 4);
      this.sim.log(null, `🎬 Video "${p.name}" đã sẵn sàng đăng TikTok — chờ anh duyệt`, "system");
      this.save(job);
    } catch (e) {
      const cancelled = e?.code === "cancelled";
      job.status = cancelled ? "stopped" : "error";
      job.error = cancelled ? null : aiErrorText(e);
      job.errorCode = e?.code || null;
      const who = A[STEPS.find((s) => s.key === job.step)?.role] || A.script;
      if (!cancelled) {
        this.sim.aiBubble(who.id, `😵 ${short(job.error, 60)}`, 5);
        this.event(job, who, `Lỗi: ${job.error}`);
      } else this.event(job, null, "⏹ Đã dừng");
      Object.values(A).forEach((a) => this.sim.aiSetTask(a.id, null));
      if (A.video.stayAway) this.sim.aiHome(A.video.id);
      this.save(job);
    } finally {
      this.ctrl.delete(id);
      this.emit();
    }
  }
}
