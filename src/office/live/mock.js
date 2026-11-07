// CHỈ dùng khi phát triển (npm run dev + ?mock): phát lại một chuỗi tin mẫu để kiểm tra giao diện
// mà không cần Firestore. Không được đóng gói vào bản thật (feed.js chỉ nạp file này khi DEV).
const SAMPLE = [
  ["anh", "", "Triển khai sản phẩm này https://vt.tiktok.com/ZS9fdfcuNMj8B-8ScSg/"],
  ["bot", "", "Đã nhận 2 ảnh + link. Bắt đầu chạy pipeline cho mã 20261106-2131-sp."],
  ["step", "script", "Xong phân tích 20261106-2131-sp: kb1 «tiệm đĩa than», kb2 «dạo phố chiều», kb3 «đi arcade»", "kb1"],
  ["step", "image", "kb1 · Xong ảnh D1 (ChatGPT)", "kb1"],
  ["step", "image", "kb1 · Xong ảnh D2 (ChatGPT)", "kb1"],
  ["step", "audit", "kb1 · Ảnh D1: ĐẠT ✅", "kb1"],
  ["step", "audit", "kb1 · Ảnh D2: CHƯA ĐẠT ❌ — tay trái bị dính vào túi quần", "kb1"],
  ["step", "image", "kb1 · Xong ảnh D2 (ChatGPT)", "kb1"],
  ["step", "audit", "kb1 · Ảnh D2: ĐẠT ✅", "kb1"],
  ["step", "video", "kb1 · Xong clip D1 (Flow)", "kb1"],
  ["step", "video", "kb1 · Xong clip D2 (Flow)", "kb1"],
  ["step", "video", "kb1 · Ghép xong video 16s (final.mp4)", "kb1"],
  ["step", "audit", "kb1 · Audit video: ĐẠT ✅", "kb1"],
  ["step", "post", "kb1 · Đăng TikTok: đã lên lịch 14:30 07/11", "kb1"],
  ["bot", "post", "kb1 đã lên lịch 14:30 trên @andycogu, có giỏ hàng + nhãn AI."],
  ["anh", "", "Ok em"],
];

export function openMockFeed(onEvent, onStatus) {
  let i = 0;
  onStatus("live");
  const base = Date.now();
  const tick = () => {
    if (i >= SAMPLE.length) return;
    const [kind, agent, text, kb] = SAMPLE[i];
    onEvent({ id: `m${i}`, at: base + i * 6000, kind, agent, text, ma_sp: "20261106-2131-sp", kb: kb || "" }, true);
    i += 1;
    timer = setTimeout(tick, 6000);
  };
  let timer = setTimeout(tick, 1500);
  return () => clearTimeout(timer);
}
