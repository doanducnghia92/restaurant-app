import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { STEPS } from "./ai/affiliate";

const TONES = ["Vui nhộn, gần gũi", "Review chân thật", "Chuyên gia, đáng tin", "Sang trọng, tinh tế"];
const SAMPLE = {
  name: "Bình giữ nhiệt Lock&Lock 500ml",
  desc: "Giữ nóng 12 giờ, giữ lạnh 24 giờ, inox 304, nắp bật một tay, có 4 màu pastel, vừa hộc xe máy.",
  price: "259.000đ (đang giảm còn 219.000đ)",
  commission: "10%",
  audience: "Nhân viên văn phòng 22-35 tuổi, hay mang nước đi làm",
  tone: TONES[0],
};

function statusOf(studio, job) {
  if (studio.isRunning(job.id)) {
    const s = STEPS.find((x) => x.key === job.step);
    return { cls: "run", text: s ? `${s.icon} ${s.label}…` : "Đang làm…" };
  }
  if (job.status === "posted") return { cls: "ok", text: "✅ Đã đăng" };
  if (job.status === "ready") return { cls: "ok", text: "🚀 Sẵn sàng đăng" };
  if (job.status === "error") return { cls: "err", text: "⚠️ Lỗi" };
  if (job.status === "stopped") return { cls: "idle", text: "⏹ Đã dừng" };
  return { cls: "idle", text: "⏸ Gián đoạn" };
}

function stepState(job, step, running) {
  const order = STEPS.map((s) => s.key);
  const cur = job.step === "done" ? order.length : order.indexOf(job.step);
  const i = order.indexOf(step.key);
  if (i < cur) return "done";
  if (i === cur) return running ? "now" : job.status === "error" ? "err" : "todo";
  return "todo";
}

function Stepper({ studio, job }) {
  const running = studio.isRunning(job.id);
  return (
    <ol className="stepper">
      {STEPS.map((s) => (
        <li key={s.key} className={stepState(job, s, running)}>
          <span className="dot">{s.icon}</span>
          <span className="lbl">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

function Audit({ a, title }) {
  if (!a) return null;
  return (
    <section className="ai-sec">
      <h4>{title}</h4>
      {a.skipped ? (
        <p className="muted">{a.note}</p>
      ) : (
        <>
          <div className="audit-head">
            <span className={`score ${a.verdict}`}>{a.score}/100</span>
            <b>{a.verdict === "pass" ? "Đạt" : a.accepted ? "Cho qua kèm lưu ý" : "Cần sửa"}</b>
          </div>
          {a.note && <p>{a.note}</p>}
          {a.issues?.length > 0 && (
            <ul className="issues">
              {a.issues.map((i, n) => (
                <li key={n} className={`lv-${i.level}`}>
                  <span className="lv">{i.level}</span> {i.text}
                  {i.fix && <div className="fix">→ {i.fix}</div>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

async function copy(text, toast, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    toast("📋 Đã copy");
  } catch {
    if (fallbackEl) {
      const r = document.createRange();
      r.selectNodeContents(fallbackEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    }
    toast("Không copy tự động được — đã bôi đen, anh nhấn giữ để copy");
  }
}

function JobDetail({ studio, job, onBack, toast, onWatch }) {
  const running = studio.isRunning(job.id);
  const st = statusOf(studio, job);
  const cover = studio.coverUrl(job);
  const video = studio.videoUrl(job);
  const capRef = useRef();
  useEffect(() => {
    studio.prepareMedia(job.id);
  }, [studio, job.id, job.cover]);
  const post = job.post;
  const fullCaption = post ? `${post.caption}\n\n${post.hashtags.join(" ")}` : "";

  return (
    <div className="ai-detail">
      <div className="ai-row">
        <button className="ghost" onClick={onBack}>← Danh sách</button>
        <span className={`chip ${st.cls}`}>{st.text}</span>
      </div>
      <h3>{job.product.name}</h3>
      <Stepper studio={studio} job={job} />

      {running && (
        <div className="live-box">
          <div className="ai-row">
            <b>{job.active ? `${job.active.name}: ${job.active.label}` : "Đang bàn giao giữa các agent…"}</b>
            <button className="ghost sm" onClick={onWatch}>👀 Xem</button>
          </div>
          {job.videoProgress != null && <div className="bar"><i style={{ width: `${job.videoProgress * 100}%` }} /></div>}
          {job.live ? <pre className="live">{job.live}</pre> : job.active ? <p className="muted">Claude đang suy nghĩ… (thường 5-60 giây)</p> : null}
        </div>
      )}
      {job.error && <p className="err-box">⚠️ {job.error}</p>}
      <div className="ai-actions">
        {running && <button onClick={() => studio.stop(job.id)}>⏹ Dừng</button>}
        {!running && job.status !== "ready" && job.status !== "posted" && (
          <button className="primary" onClick={() => studio.run(job.id)}>▶ {job.status === "error" ? "Thử lại" : "Chạy tiếp"}</button>
        )}
        {!running && (
          <button className="danger" onClick={() => { studio.remove(job.id); onBack(); }}>🗑 Xoá</button>
        )}
      </div>

      {post && (
        <section className="ai-sec hl">
          <h4>📱 Gói đăng TikTok · {job.status === "posted" ? "đã đăng" : "chờ anh duyệt"}</h4>
          <p className="caption" ref={capRef}>{post.caption}<br /><span className="tags">{post.hashtags.join(" ")}</span></p>
          <dl>
            <dt>Giờ đăng</dt><dd>{post.bestTime}{post.timeReason && <small> — {post.timeReason}</small>}</dd>
            <dt>Bình luận ghim</dt><dd>{post.pinnedComment}</dd>
            <dt>Ghi rõ affiliate</dt><dd>{post.disclosure}</dd>
          </dl>
          <div className="ai-actions">
            <button onClick={() => copy(fullCaption, toast, capRef.current)}>📋 Copy caption</button>
            {video && <button onClick={() => studio.downloadVideo(job.id).then(() => toast("⬇️ Đã gửi lệnh tải video")).catch((e) => toast(e?.message || "Không tải được"))}>⬇️ Tải video</button>}
            <a className="btn" href="https://www.tiktok.com/tiktokstudio/upload" target="_blank" rel="noreferrer">Mở TikTok ↗</a>
            {job.status !== "posted" && <button className="primary" onClick={() => studio.markPosted(job.id)}>✅ Đã đăng</button>}
          </div>
          <p className="muted small">Chưa có kết nối API TikTok nên bước bấm đăng do anh làm: tải video, copy caption, đăng trên app TikTok.</p>
        </section>
      )}

      {(video || job.video) && (
        <section className="ai-sec">
          <h4>🎬 Video {job.video && `· ${job.video.seconds}s · ${job.video.sizeMB} MB`}</h4>
          {video ? <video className="vid" src={video} controls playsInline loop poster={cover || undefined} /> : <p className="muted">Video chỉ lưu trong phiên trước, hãy chạy lại bước dựng.</p>}
          <p className="muted small">Video chưa có giọng đọc/nhạc — thêm nhạc thịnh hành ngay trong app TikTok khi đăng.</p>
        </section>
      )}
      <Audit a={job.finalAudit} title="👀 Soát hình (AI xem ảnh bìa + khung hình)" />
      {job.cover && (
        <section className="ai-sec">
          <h4>🎨 Ảnh bìa</h4>
          {cover ? <img className="cover" src={cover} alt={`Ảnh bìa ${job.product.name}`} /> : <p className="muted">Đang dựng ảnh…</p>}
        </section>
      )}
      <Audit a={job.audit} title={`🔍 Kiểm duyệt kịch bản${job.revisions ? ` · đã sửa ${job.revisions} lần` : ""}`} />
      {job.script && (
        <section className="ai-sec">
          <h4>✍️ Kịch bản</h4>
          <p><b>Hook:</b> {job.script.hook}</p>
          {job.script.angle && <p className="muted">Góc: {job.script.angle}</p>}
          <ol className="scenes">
            {job.script.scenes.map((s, n) => (
              <li key={n}>
                <span className="sec">{s.sec}s</span>
                <div><b>{s.emoji} {s.text}</b><div>🗣 {s.voice}</div>{s.visual && <div className="muted">🎥 {s.visual}</div>}</div>
              </li>
            ))}
          </ol>
          <p><b>CTA:</b> {job.script.cta}</p>
        </section>
      )}
      <section className="ai-sec">
        <h4>🧾 Nhật ký job</h4>
        <ul className="events">
          {[...(job.events || [])].reverse().map((e, n) => (
            <li key={n}><time>{new Date(e.at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</time> {e.who && <b>{e.who}: </b>}{e.text}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BriefForm({ studio, onCreated, toast }) {
  const [f, setF] = useState({ name: "", desc: "", price: "", commission: "", audience: "", tone: TONES[0] });
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.desc.trim()) {
      toast("Cần tên sản phẩm và mô tả");
      return;
    }
    setBusy(true);
    try {
      const id = await studio.createJob({ ...f, name: f.name.trim(), desc: f.desc.trim() }, photo);
      onCreated(id);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="brief" onSubmit={submit}>
      <div className="ai-row">
        <h4>📩 Brief mới cho team</h4>
        <button type="button" className="ghost sm" onClick={() => setF(SAMPLE)}>Điền mẫu</button>
      </div>
      <label htmlFor="aff-name">Tên sản phẩm *</label>
      <input id="aff-name" value={f.name} onChange={set("name")} placeholder="VD: Bình giữ nhiệt 500ml" />
      <label htmlFor="aff-desc">Mô tả, điểm nổi bật *</label>
      <textarea id="aff-desc" rows={3} value={f.desc} onChange={set("desc")} placeholder="Chất liệu, công dụng, ưu đãi… (chỉ ghi thông tin đúng sự thật)" />
      <div className="grid2">
        <div>
          <label htmlFor="aff-price">Giá</label>
          <input id="aff-price" value={f.price} onChange={set("price")} placeholder="219.000đ" />
        </div>
        <div>
          <label htmlFor="aff-com">Hoa hồng</label>
          <input id="aff-com" value={f.commission} onChange={set("commission")} placeholder="10%" />
        </div>
      </div>
      <label htmlFor="aff-aud">Khách hàng mục tiêu</label>
      <input id="aff-aud" value={f.audience} onChange={set("audience")} placeholder="Nữ 20-30, dân văn phòng…" />
      <label htmlFor="aff-tone">Giọng điệu</label>
      <select id="aff-tone" value={f.tone} onChange={set("tone")}>
        {TONES.map((t) => <option key={t}>{t}</option>)}
      </select>
      <label htmlFor="aff-photo">Ảnh sản phẩm (tuỳ chọn, giúp ảnh bìa & video đẹp hơn)</label>
      <input id="aff-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
      <button className="primary big" disabled={busy}>{busy ? "Đang gửi…" : "🚀 Giao việc cho team AI"}</button>
    </form>
  );
}

export default function AiPanel({ studio, onClose, onMinimize, toast, onWatch }) {
  useSyncExternalStore(studio.subscribe, studio.getVersion);
  const [openId, setOpenId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const jobs = studio.list();
  const job = openId ? studio.jobs.get(openId) : null;
  const rt = studio.rt;

  return (
    <div className="ai-panel" role="dialog" aria-label="Phòng Affiliate AI">
      <header className="ai-head">
        <div>
          <b>🤖 Phòng Affiliate AI</b>
          <span className={`chip ${rt?.mode === "claude" ? "ok" : "idle"}`}>
            {!rt ? "Đang kết nối…" : rt.mode === "claude" ? "Claude thật" : "Demo — không có AI"}
          </span>
        </div>
        <div className="ai-head-btns">
          <button className="icon" onClick={onMinimize} aria-label="Thu nhỏ để xem văn phòng">▾</button>
          <button className="icon" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
      </header>
      <div className="ai-body">
        {rt?.mode === "demo" && (
          <p className="notice">
            {rt.reason || "Đang chạy ngoài claude.ai nên không gọi được Claude."} Kết quả dưới đây là <b>dữ liệu mẫu</b> để xem quy trình.
            Mở trang trên claude.ai để các agent dùng Claude thật.
          </p>
        )}
        {rt?.mode === "claude" && studio.dbError && (
          <p className="notice">Chưa lưu được vào kho dữ liệu ({studio.dbError}). Kết quả vẫn hiện trong phiên này.</p>
        )}
        {job ? (
          <JobDetail studio={studio} job={job} onBack={() => setOpenId(null)} toast={toast} onWatch={() => onWatch(job)} />
        ) : (
          <>
            {(showForm || !jobs.length) && rt ? (
              <BriefForm studio={studio} toast={toast} onCreated={(id) => { setShowForm(false); setOpenId(id); onWatch(studio.jobs.get(id)); }} />
            ) : (
              <button className="primary big" onClick={() => setShowForm(true)} disabled={!rt}>＋ Giao brief mới</button>
            )}
            {jobs.length > 0 && <h4 className="list-title">Công việc ({jobs.length})</h4>}
            {jobs.map((j) => {
              const st = statusOf(studio, j);
              return (
                <button key={j.id} className="job" onClick={() => setOpenId(j.id)}>
                  <div className="ai-row">
                    <b>{j.product.name}</b>
                    <span className={`chip ${st.cls}`}>{st.text}</span>
                  </div>
                  <Stepper studio={studio} job={j} />
                  {j.script?.hook && <div className="muted small">“{j.script.hook}”</div>}
                </button>
              );
            })}
            <p className="muted small how">
              Quy trình thật: <b>Ngọc</b> viết kịch bản → <b>Hiếu</b> kiểm duyệt (trả về sửa nếu vi phạm) → <b>Quân</b> vẽ ảnh bìa →
              <b> Tâm</b> dựng video ở Studio → <b>Hiếu</b> soát hình → <b>Thảo</b> soạn caption, hashtag, giờ đăng. Mỗi bước là một lần gọi Claude
              bằng tài khoản của anh.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function AiMini({ studio, onOpen }) {
  useSyncExternalStore(studio.subscribe, studio.getVersion);
  const running = studio.list().find((j) => studio.isRunning(j.id));
  const text = running
    ? running.active
      ? `${running.active.name}: ${running.active.label}`
      : `Đang bàn giao · ${running.product.name}`
    : "Phòng Affiliate AI";
  return (
    <button className={`ai-mini ${running ? "run" : ""}`} onClick={onOpen}>
      <span>🤖</span> {text} <b>▴</b>
    </button>
  );
}
