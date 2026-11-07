// Prompt cho từng agent AI của phòng Affiliate. Mỗi lần gọi Claude là độc lập
// (không có trí nhớ), nên prompt luôn chứa đủ: vai trò, dữ liệu, định dạng trả về.

const RULES = `Quy tắc nội dung (cộng đồng TikTok + luật quảng cáo Việt Nam):
- Không cam kết tuyệt đối hay phóng đại ("100%", "khỏi hẳn", "tốt nhất", "rẻ nhất", "cam kết hiệu quả") nếu không có bằng chứng.
- Không nói công dụng chữa bệnh cho thực phẩm, thực phẩm chức năng, mỹ phẩm.
- Không so sánh hạ thấp sản phẩm/thương hiệu khác. Không nội dung phản cảm, nguy hiểm.
- Video có link tiếp thị liên kết phải ghi rõ là nội dung affiliate/quảng cáo.
- Giá, khuyến mãi chỉ nêu đúng như brief, không bịa thêm.`;

export function productBlock(p) {
  return [
    `Tên sản phẩm: ${p.name}`,
    `Mô tả / điểm nổi bật (do người bán cung cấp): ${p.desc}`,
    `Giá: ${p.price || "không nêu"}`,
    `Hoa hồng affiliate: ${p.commission || "không nêu"}`,
    `Khách hàng mục tiêu: ${p.audience || "không nêu"}`,
    `Giọng điệu mong muốn: ${p.tone}`,
  ].join("\n");
}

const SCRIPT_SHAPE = `{"angle": "góc tiếp cận, 1 câu", "hook": "câu mở đầu giữ chân người xem trong 2 giây đầu, tối đa 12 từ", "scenes": [{"sec": 3, "text": "chữ to trên màn hình, tối đa 7 từ", "voice": "lời thoại/phụ đề của cảnh, 1-2 câu ngắn", "visual": "mô tả hình ảnh nên quay", "emoji": "1 emoji"}], "cta": "lời kêu gọi mua qua giỏ hàng/link, tối đa 10 từ", "summary": "1 câu tóm tắt kịch bản để báo đồng đội"}`;

export function scriptPrompt(p, { hasPhoto, previous, issues } = {}) {
  const base = `Bạn là AI Biên kịch của team TikTok affiliate tại Việt Nam. Viết kịch bản video ngắn 9:16 (15-30 giây) bán sản phẩm sau qua link affiliate.

${productBlock(p)}
${hasPhoto ? "\nẢnh đính kèm là ảnh thật của sản phẩm: dựa vào nó để mô tả đúng sản phẩm." : ""}

${RULES}

Yêu cầu: 4-6 cảnh, cảnh đầu chính là hook, cảnh cuối là CTA. Viết tiếng Việt tự nhiên, đúng chính tả, hợp giọng điệu yêu cầu. Tổng "sec" của các cảnh từ 15 đến 30.`;
  const fix = previous
    ? `\n\nĐây là bản kịch bản trước:\n${JSON.stringify(previous)}\n\nAI Kiểm duyệt yêu cầu sửa các lỗi sau:\n${issues
      .map((i, n) => `${n + 1}. [${i.level}] ${i.text} → Cách sửa: ${i.fix}`)
      .join("\n")}\n\nHãy viết lại kịch bản đã sửa hết các lỗi trên, giữ những phần tốt.`
    : "";
  return `${base}${fix}\n\nChỉ trả lời bằng một JSON đúng dạng sau, không thêm chữ nào khác:\n${SCRIPT_SHAPE}`;
}

const AUDIT_SHAPE = `{"score": 0-100, "verdict": "pass" hoặc "fix", "issues": [{"level": "cao" | "vừa" | "thấp", "text": "vấn đề cụ thể, trích câu có vấn đề", "fix": "cách sửa cụ thể"}], "note": "1 câu nhận xét gửi đồng đội"}`;

export function auditPrompt(p, script) {
  return `Bạn là AI Kiểm duyệt nội dung của team TikTok affiliate. Soát kịch bản dưới đây trước khi sản xuất.

${productBlock(p)}

Kịch bản (JSON):
${JSON.stringify(script)}

${RULES}

Chấm theo: tuân thủ quy tắc trên (quan trọng nhất), sức hút của hook, rõ lợi ích sản phẩm, CTA rõ ràng, chính tả tiếng Việt, độ dài 15-30 giây.
"verdict" là "fix" nếu có bất kỳ lỗi mức "cao" hoặc score dưới 75; ngược lại là "pass". Không bịa lỗi; nếu kịch bản tốt thì issues có thể rỗng hoặc chỉ góp ý mức "thấp".

Chỉ trả lời bằng một JSON đúng dạng sau, không thêm chữ nào khác:
${AUDIT_SHAPE}`;
}

export function imagePrompt(p, script, { hasPhoto }) {
  return `Bạn là AI Thiết kế ảnh của team TikTok affiliate. Hãy vẽ ẢNH BÌA video TikTok dạng SVG, khổ dọc 9:16.

${productBlock(p)}
Hook của video: "${script.hook}"
CTA: "${script.cta}"

Yêu cầu kỹ thuật SVG (bắt buộc):
- Thẻ mở: <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
- Chỉ dùng hình khối, gradient (linearGradient/radialGradient trong <defs>), path, text. KHÔNG dùng <image>, <script>, <style>, <foreignObject>, link ngoài, font ngoài. Mọi chữ dùng font-family="Arial, Helvetica, sans-serif" và font-weight đậm.
- Vùng trên (y 140-560): hook, chữ thật to (cỡ 84-110), tối đa 3 dòng, mỗi dòng là một <text> riêng, viền chữ (stroke) cho dễ đọc.
- ${hasPhoto
    ? "Vùng giữa (x 140-940, y 640-1360) ĐỂ TRỐNG cho ảnh thật của sản phẩm sẽ được ghép vào sau: chỉ vẽ một khung bo góc màu sáng làm nền, không vẽ gì đè lên."
    : "Vùng giữa (x 140-940, y 640-1360): vẽ minh hoạ sản phẩm cách điệu, dễ thương, nhiều màu, bằng hình khối."}
- Vùng dưới (y 1420-1780): một nút/nhãn CTA nổi bật chứa chữ CTA, thêm vài sticker trang trí (ngôi sao, tia sáng, trái tim) bằng hình khối.
- Góc dưới trái nhỏ: chữ "Có liên kết tiếp thị".
- Phong cách: tươi sáng, trẻ trung, tương phản cao, đúng tông sản phẩm. Toàn bộ SVG dưới 14000 ký tự.

Trả lời đúng định dạng 2 phần, không giải thích:
PALETTE: #màu-nền-1,#màu-nền-2,#màu-nhấn,#màu-chữ
<svg ...>...</svg>`;
}

export function visualAuditPrompt(p, script, imageCount) {
  return `Bạn là AI Kiểm duyệt nội dung của team TikTok affiliate. Đính kèm ${imageCount} ảnh: ảnh 1 là ảnh bìa, các ảnh sau là khung hình chụp từ video vừa dựng.

${productBlock(p)}
Kịch bản: ${JSON.stringify({ hook: script.hook, cta: script.cta })}

${RULES}

Kiểm tra trên HÌNH: chữ có đọc được không (cỡ, độ tương phản, bị che), chính tả tiếng Việt, có nhãn liên kết tiếp thị không, có gì vi phạm quy tắc hoặc gây hiểu nhầm không, tổng thể có hấp dẫn để đăng không.
"verdict" là "fix" nếu có lỗi mức "cao", ngược lại "pass".

Chỉ trả lời bằng một JSON đúng dạng sau, không thêm chữ nào khác:
${AUDIT_SHAPE}`;
}

export function postPrompt(p, script) {
  return `Bạn là AI phụ trách đăng TikTok của team affiliate. Soạn gói đăng cho video sau.

${productBlock(p)}
Kịch bản: ${JSON.stringify({ hook: script.hook, angle: script.angle, cta: script.cta })}

${RULES}

Yêu cầu: caption tiếng Việt tối đa 150 ký tự, mở bằng câu gây tò mò, có kêu gọi bấm giỏ hàng; 5-8 hashtag phù hợp ngách sản phẩm (có #affiliate hoặc #quangcao); khung giờ đăng tốt nhất cho khách hàng mục tiêu (giờ Việt Nam) kèm lý do ngắn; một bình luận ghim để trả lời thắc mắc phổ biến.

Chỉ trả lời bằng một JSON đúng dạng sau, không thêm chữ nào khác:
{"title": "tiêu đề nội bộ ngắn", "caption": "...", "hashtags": ["#..."], "bestTime": "ví dụ 20:00-22:00 tối thứ 6", "timeReason": "1 câu", "pinnedComment": "...", "disclosure": "câu ghi rõ nội dung có liên kết tiếp thị"}`;
}

// Lấy SVG + bảng màu từ câu trả lời của AI Thiết kế
export function parseImageAnswer(text) {
  const m = text.match(/<svg[\s\S]*<\/svg>/i);
  if (!m) throw Object.assign(new Error("AI Thiết kế không trả về SVG"), { code: "invalid_svg" });
  const pal = (text.match(/PALETTE:\s*([^\n<]+)/i)?.[1] || "")
    .split(/[,\s]+/)
    .filter((c) => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(c))
    .map((c) => (c.length === 4 ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : c.slice(0, 7)));
  while (pal.length < 4) pal.push(["#ff8fb8", "#8fd3ff", "#ffd166", "#2f2a44"][pal.length]);
  return { svg: m[0], palette: pal.slice(0, 4) };
}

// ---------------- Chế độ demo (không có Claude) ----------------
const wait = (ms, signal) => new Promise((res, rej) => {
  const t = setTimeout(res, ms);
  signal?.addEventListener("abort", () => {
    clearTimeout(t);
    rej({ code: "cancelled", message: "cancelled" });
  });
});

function demoAnswer(prompt) {
  const name = prompt.match(/Tên sản phẩm: (.*)/)?.[1] || "Sản phẩm";
  if (prompt.includes("AI Biên kịch")) {
    const revised = prompt.includes("yêu cầu sửa");
    return JSON.stringify({
      angle: "Review chân thật sau 1 tuần dùng",
      hook: revised ? `Dùng thử ${name} 7 ngày và đây là kết quả` : `${name} xịn nhất thế giới, 100% ai dùng cũng mê!`,
      scenes: [
        { sec: 3, text: "Thử 7 ngày liền 👀", voice: `Mình đã dùng ${name} suốt một tuần.`, visual: "Cầm sản phẩm lên trước camera", emoji: "👀" },
        { sec: 5, text: "Điểm mình thích nhất", voice: "Thiết kế gọn, dùng hằng ngày rất tiện.", visual: "Cận cảnh chi tiết sản phẩm", emoji: "✨" },
        { sec: 5, text: "Dùng thực tế", voice: "Đây là lúc mình dùng nó buổi sáng.", visual: "Cảnh dùng thực tế", emoji: "☀️" },
        { sec: 4, text: "Giá hợp lý", voice: "Giá đúng như trong giỏ hàng, có mã giảm thêm.", visual: "Màn hình giỏ hàng", emoji: "💸" },
        { sec: 4, text: "Link ở giỏ hàng 🛒", voice: "Ai cần thì bấm giỏ hàng nhé, video có liên kết tiếp thị.", visual: "Chỉ tay xuống giỏ hàng", emoji: "🛒" },
      ],
      cta: "Bấm giỏ hàng để xem giá ưu đãi",
      summary: revised ? "Đã bỏ câu phóng đại, giữ góc review thật" : "Kịch bản review 21 giây, hook mạnh",
    });
  }
  if (prompt.includes("Đính kèm")) {
    return JSON.stringify({ score: 86, verdict: "pass", issues: [{ level: "thấp", text: "Phụ đề cảnh 3 hơi dài", fix: "Rút còn 1 câu" }], note: "Hình rõ, chữ dễ đọc, có nhãn tiếp thị." });
  }
  if (prompt.includes("AI Kiểm duyệt")) {
    const bad = prompt.includes("100%");
    return JSON.stringify(bad
      ? { score: 58, verdict: "fix", issues: [{ level: "cao", text: 'Hook dùng "xịn nhất thế giới, 100%" là cam kết tuyệt đối', fix: "Đổi thành trải nghiệm thật, không so sánh tuyệt đối" }], note: "Hook vi phạm quy tắc quảng cáo, cần sửa." }
      : { score: 88, verdict: "pass", issues: [], note: "Kịch bản sạch, hook ổn, CTA rõ." });
  }
  if (prompt.includes("AI Thiết kế ảnh")) {
    const empty = prompt.includes("ĐỂ TRỐNG");
    return `PALETTE: #ff9ec7,#8ec5ff,#ffd166,#2f2a44
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ec7"/><stop offset="1" stop-color="#8ec5ff"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#g)"/><circle cx="160" cy="300" r="90" fill="#ffd166" opacity="0.7"/><circle cx="950" cy="1500" r="120" fill="#ffffff" opacity="0.35"/><text x="540" y="300" font-family="Arial, sans-serif" font-weight="900" font-size="96" text-anchor="middle" fill="#ffffff" stroke="#2f2a44" stroke-width="8" paint-order="stroke">DÙNG THỬ 7 NGÀY</text><text x="540" y="430" font-family="Arial, sans-serif" font-weight="900" font-size="80" text-anchor="middle" fill="#ffd166" stroke="#2f2a44" stroke-width="8" paint-order="stroke">VÀ ĐÂY LÀ KẾT QUẢ</text><rect x="140" y="640" width="800" height="720" rx="60" fill="#ffffff" opacity="0.9"/>${empty ? "" : '<circle cx="540" cy="1000" r="230" fill="#ffd166"/><rect x="430" y="860" width="220" height="300" rx="40" fill="#ff7aa8"/>'}<rect x="240" y="1480" width="600" height="150" rx="75" fill="#2f2a44"/><text x="540" y="1578" font-family="Arial, sans-serif" font-weight="900" font-size="58" text-anchor="middle" fill="#ffffff">BẤM GIỎ HÀNG 🛒</text><text x="60" y="1860" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#2f2a44">Có liên kết tiếp thị</text></svg>`;
  }
  return JSON.stringify({
    title: `Review ${name}`,
    caption: `Dùng ${name} 1 tuần, mình thấy sao? 👀 Xem tới cuối nhé, link ở giỏ hàng 🛒`,
    hashtags: ["#review", "#affiliate", "#xuhuong", "#muasamonline", "#tiktokshop"],
    bestTime: "20:00-22:00 tối thứ 6",
    timeReason: "Khách mục tiêu lướt TikTok nhiều nhất sau giờ làm.",
    pinnedComment: "Giá và mã giảm cập nhật trong giỏ hàng nha cả nhà 💖",
    disclosure: "Video có chứa liên kết tiếp thị, mình nhận hoa hồng khi bạn mua qua link.",
  });
}

async function mockCall(input, opts = {}) {
  const prompt = typeof input === "string" ? input : input.at(-1).content;
  const full = demoAnswer(prompt);
  await wait(900, opts.signal);
  for (let i = 0; i < full.length; i += 60) {
    opts.onText?.({ text: full.slice(0, i + 60), delta: full.slice(i, i + 60) });
    await wait(40, opts.signal);
  }
  return { text: full, truncated: false, modelTierApplied: "default" };
}

export const mockSample = Object.assign(mockCall, {
  json: async (input, opts) => JSON.parse((await mockCall(input, opts)).text),
  limits: async () => ({ maxPromptBytes: 262144 }),
});
