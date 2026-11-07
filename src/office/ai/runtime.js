// Kết nối các năng lực của trang khi chạy trong claude.ai:
//  - sample: gọi Claude thật (bằng tài khoản Claude của người xem)
//  - db: lưu brief + kết quả của từng job, mở lại trang vẫn còn
//  - assets: lưu ảnh bìa, video, ảnh sản phẩm
//  - downloads: tải video về máy để đăng TikTok
// Chạy ngoài claude.ai (npm run dev) thì không có Claude: dùng chế độ DEMO với
// kết quả mẫu, được ghi rõ trên giao diện để không nhầm với AI thật.
import { mockSample } from "./prompts.js";

async function use(name) {
  try {
    return (await window.claude?.use?.(name)) ?? null;
  } catch {
    return null;
  }
}

export async function connectRuntime() {
  if (typeof window === "undefined" || !window.claude?.use) return demoRuntime();
  const [sample, db, assets, downloads] = await Promise.all(["sample", "db", "assets", "downloads"].map(use));
  // Không lưu kết quả mẫu vào kho dữ liệu thật: demo chạy hoàn toàn trong bộ nhớ
  if (!sample) return { ...demoRuntime(), reason: "Trang này chưa được phép gọi Claude." };
  const canSeeImages = await sample.limits().then((l) => !!l?.images, () => false);
  return { mode: "claude", sample, db, assets, downloads, canSeeImages };
}

function demoRuntime() {
  return { mode: "demo", sample: mockSample, db: null, assets: null, downloads: null, canSeeImages: false };
}

// Lỗi của Claude -> câu tiếng Việt cho người xem
export function aiErrorText(e) {
  const code = e?.code;
  const map = {
    not_granted: "Anh chưa cho phép trang dùng Claude. Bấm Thử lại và chọn Cho phép.",
    sampling_disabled: "Tài khoản này chưa dùng được Claude trong trang.",
    rate_limited: "Đang gọi Claude quá nhiều hoặc hết lượt dùng. Đợi một lát rồi bấm Thử lại.",
    session_expired: "Phiên đăng nhập claude.ai đã hết hạn, hãy đăng nhập lại.",
    refused: "Claude từ chối nội dung này. Thử sửa mô tả sản phẩm rồi chạy lại.",
    invalid_json: "Claude trả về sai định dạng. Bấm Thử lại.",
    empty_completion: "Claude không trả lời. Bấm Thử lại.",
    prompt_too_large: "Brief quá dài, hãy rút gọn mô tả.",
    image_rejected: "Ảnh sản phẩm không dùng được, hãy chọn ảnh JPG/PNG khác.",
    cancelled: "Đã dừng.",
    UNSUPPORTED_VIDEO: "Trình duyệt này không dựng được video (thiếu MediaRecorder). Thử Chrome hoặc Safari mới.",
  };
  return map[code] || e?.message || "Có lỗi không xác định. Bấm Thử lại.";
}
