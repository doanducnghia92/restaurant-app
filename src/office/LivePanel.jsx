import { useEffect, useRef, useSyncExternalStore } from "react";

const STATUS = {
  connecting: { cls: "idle", text: "Đang kết nối…" },
  live: { cls: "ok", text: "● Đang nhận tin" },
  "permission-denied": { cls: "err", text: "Firestore chặn quyền đọc" },
};

const time = (ms) => (ms ? new Date(ms).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "");

export default function LivePanel({ live, onClose, onMinimize, onPick }) {
  useSyncExternalStore(live.subscribe, live.getVersion);
  const box = useRef();
  const stick = useRef(true);
  const n = live.items.length;
  useEffect(() => {
    if (stick.current && box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [n]);
  const st = STATUS[live.status] || { cls: "err", text: `Lỗi kết nối (${live.status})` };

  return (
    <div className="ai-panel" role="dialog" aria-label="Telegram của phòng Affiliate">
      <header className="ai-head">
        <div>
          <b>📱 Telegram · Phòng Affiliate</b>
          <span className={`chip ${st.cls}`}>{st.text}</span>
        </div>
        <div className="ai-head-btns">
          <button className="icon" onClick={onMinimize} aria-label="Thu nhỏ để xem văn phòng">▾</button>
          <button className="icon" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
      </header>
      <div
        className="ai-body tg"
        ref={box}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
        }}
      >
        {live.status === "permission-denied" && (
          <p className="notice">
            Firestore đang từ chối quyền đọc. Anh thêm quy tắc <b>office_rooms</b> trong Firebase Console → Firestore → Rules
            (xem <code>tools/OFFICE_BRIDGE.md</code>) rồi tải lại trang.
          </p>
        )}
        {live.status === "live" && !n && (
          <p className="muted small how">
            Chưa có tin nào. Khi anh nhắn bot Telegram hoặc pipeline <b>aff-do-nam</b> chạy, tin sẽ hiện ở đây và trên đầu nhân vật.
          </p>
        )}
        {live.items.map((m) => {
          const me = m.role === "boss";
          const a = me ? live.boss : live.agents[m.role];
          return (
            <div key={m.id} className={`tg-msg ${me ? "me" : ""}`}>
              {!me && (
                <button className="tg-who" onClick={() => onPick(a.id)} style={{ color: a.shirt }}>
                  {a.name} <small>{a.role}</small>
                </button>
              )}
              <div className="tg-bubble">
                {m.text}
                <span className="tg-meta">
                  {m.kind === "step" ? "tiến độ · " : ""}{m.kb ? `${m.kb} · ` : ""}{time(m.at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
