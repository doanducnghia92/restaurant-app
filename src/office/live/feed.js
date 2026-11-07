// Chế độ LIVE: đọc tin thật do cầu nối office_bridge.py (chạy trên máy anh, cạnh bot Telegram)
// đẩy lên Firestore tại office_rooms/<room>/feed, rồi cho các nhân vật 3D nói/làm đúng như vậy.
//
// Một tin (document) có dạng:
//   { at: <ms>, kind: "anh" | "bot" | "say" | "step", agent: "script|image|audit|video|post|" ,
//     text: "...", ma_sp: "...", kb: "kb1" }
//   anh  = anh nhắn bot Telegram          bot  = bot Telegram trả lời anh
//   say  = agent tự báo (skill gọi lệnh)   step = tiến độ do cầu nối tự nhận ra từ thư mục san_pham/

export function liveRoom() {
  if (typeof window === "undefined") return null;
  const r = new URLSearchParams(window.location.search).get("room");
  return r && /^[A-Za-z0-9_-]{20,64}$/.test(r) ? r : null;
}

export async function openFeed(room, onEvent, onStatus) {
  const mock = import.meta.env.DEV && new URLSearchParams(window.location.search).has("mock");
  if (mock) return (await import("./mock.js")).openMockFeed(onEvent, onStatus);

  const [{ db }, fs] = await Promise.all([import("../../firebase.js"), import("firebase/firestore")]);
  const q = fs.query(fs.collection(db, "office_rooms", room, "feed"), fs.orderBy("at", "desc"), fs.limit(80));
  let first = true;
  return fs.onSnapshot(
    q,
    (snap) => {
      const added = snap.docChanges()
        .filter((c) => c.type === "added")
        .map((c) => ({ id: c.doc.id, ...c.doc.data() }))
        .sort((a, b) => (a.at || 0) - (b.at || 0));
      added.forEach((ev) => onEvent(ev, !first));
      first = false;
      onStatus("live");
    },
    (err) => onStatus(err?.code || "error"),
  );
}
