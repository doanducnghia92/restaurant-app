// Kịch bản hội thoại. Mỗi dòng: [người nói (0 = người chủ động, 1 = người được hỏi), nội dung]
// Placeholder: {A} {B} tên, {p} tên dự án, {c} khách hàng, {a} giá trị hợp đồng

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const PROJECT_NAMES = [
  "App đặt món", "Website bán hàng", "Chatbot CSKH", "Hệ thống CRM", "App giao hàng",
  "Landing page Tết", "Ví điện tử mini", "App đặt lịch spa", "Cổng tuyển dụng", "Dashboard bán lẻ",
  "Game khuyến mãi", "App học tiếng Anh",
];
export const CLIENTS = [
  "Phở Ngon", "Cà phê Mây", "Shop Bé Xinh", "Nhà sách Tri Thức", "Spa Hoa Sen",
  "Gym 24h", "Trà sữa Mochi", "Nội thất Gỗ Việt", "Du lịch Biển Xanh", "Bánh mì Saigon",
];

export const TALKS = {
  "sales>tech": [
    [[0, "Chào {B}! Khách {c} muốn làm {p} 🙌"], [1, "Hay quá! Họ cần tính năng gì?"], [0, "Đăng nhập, thanh toán và báo cáo. Deadline 2 tuần."], [1, "Ok, mình ước lượng rồi bắt tay làm luôn 💪"]],
    [[0, "{B} ơi, có deal mới: {p} cho {c}!"], [1, "Ngân sách thế nào anh?"], [0, "Khoảng {a}, khách rất gấp 😅"], [1, "Được, để mình lên kiến trúc hệ thống ngay."]],
  ],
  "tech>mkt": [
    [[0, "{B} ơi, bản demo {p} chạy ngon rồi 🚀"], [1, "Tuyệt! Gửi mình vài screenshot nhé"], [0, "Gửi qua Slack rồi đó"], [1, "Để mình làm poster và kế hoạch truyền thông 🎨"]],
    [[0, "{p} đã lên môi trường staging rồi nha"], [1, "Ui nhanh thế! Có tính năng nào nổi bật?"], [0, "Tốc độ load dưới 1 giây ⚡"], [1, "Đó sẽ là thông điệp chính của chiến dịch!"]],
  ],
  "mkt>sales": [
    [[0, "Bộ tài liệu giới thiệu {p} xong rồi 📑"], [1, "Đẹp quá! Mình gửi khách {c} ngay"], [0, "Có cả video demo 30 giây nữa nhé"], [1, "Chắc chắn chốt được hợp đồng 😎"]],
    [[0, "{B} ơi, landing page {p} đã live!"], [1, "Tuyệt, khách đang chờ xem đó"], [0, "Mình đã chạy thử A/B test, tỉ lệ chuyển đổi tốt"], [1, "Để mình hẹn khách ký hợp đồng 🤝"]],
  ],
  "sales>fin": [
    [[0, "Khách {c} đã ký hợp đồng {p}! 🎉"], [1, "Giá trị bao nhiêu vậy?"], [0, "{a}, thanh toán 2 đợt."], [1, "Ok, mình xuất hoá đơn ngay 🧾"]],
    [[0, "Chị {B} ơi, hợp đồng {p} đây ạ"], [1, "Đã có chữ ký và đóng dấu chưa em?"], [0, "Đủ cả rồi chị, {a} ạ"], [1, "Chị ghi nhận doanh thu luôn nhé 📊"]],
  ],
  "fin>ceo": [
    [[0, "Sếp ơi, dự án {p} đã thu về {a} 💰"], [1, "Xuất sắc! Cảm ơn cả team nhé 👏"], [0, "Em sẽ gửi báo cáo chi tiết qua email ạ"], [1, "Tối nay cả team đi ăn mừng nhé! 🍕"]],
    [[0, "Báo cáo sếp: {c} đã thanh toán {a}"], [1, "Tốt lắm! Dòng tiền quý này ổn rồi 📈"], [0, "Lợi nhuận dự án khoảng 35% ạ"], [1, "Đề xuất thưởng cho team {p} nhé!"]],
  ],
  "peer:tech": [
    [[0, "Bug này lạ quá, local chạy được mà 😵"], [1, "Thử xoá cache build xem?"], [0, "Ơ được thật! Cảm ơn nha 😂"]],
    [[0, "{B} review giúp mình pull request với"], [1, "Ok, đợi mình 5 phút"], [1, "Code sạch đấy, approve nhé ✅"]],
    [[0, "Nên dùng thư viện nào cho phần chart?"], [1, "Recharts dễ dùng, nhẹ nữa"], [0, "Chuẩn, thử luôn 👍"]],
  ],
  "peer:mkt": [
    [[0, "Màu này có chói quá không nhỉ?"], [1, "Hơi chói, thử tông pastel xem"], [0, "Ừ dễ thương hơn hẳn 🌸"]],
    [[0, "Bài post hôm qua được 2k like đó!"], [1, "Đỉnh! Viết thêm series đi"], [0, "Ok, mình lên lịch đăng tuần sau 📅"]],
  ],
  "peer:sales": [
    [[0, "Tháng này còn thiếu 2 hợp đồng là đạt KPI 😤"], [1, "Cố lên! Có lead mới từ hội chợ đó"], [0, "Chia mình vài lead với 🙏"]],
    [[0, "Khách {c} hỏi giảm giá 10% kìa"], [1, "Tặng thêm 1 tháng bảo trì thay vì giảm giá"], [0, "Ý hay đó!"]],
  ],
  "peer:fin": [
    [[0, "Báo cáo thuế quý này nộp chưa?"], [1, "Mai mình nộp nhé, đang soát lại số liệu"], [0, "Ok, cần gì cứ hỏi mình 📊"]],
    [[0, "Chi phí văn phòng phẩm tháng này tăng nha"], [1, "Do pantry mua thêm bánh đó 😆"], [0, "Thôi khoản đó chấp nhận được 🍪"]],
  ],
  "peer:hr": [
    [[0, "Tuần sau có 3 ứng viên phỏng vấn"], [1, "Mình xếp lịch với các trưởng phòng nhé"], [0, "Cảm ơn bạn 🙌"]],
  ],
  hr: [
    [[0, "Dạo này công việc ổn không {B}?"], [1, "Ổn ạ, hơi nhiều task chút 😅"], [0, "Nhớ nghỉ giải lao nhé, pantry có bánh mới 🍪"]],
    [[0, "{B} ơi, nhớ điền form đánh giá quý nhé"], [1, "Dạ, chiều nay em gửi ạ"], [0, "Cảm ơn em 💛"]],
    [[0, "Sinh nhật {B} tuần sau đúng không? 🎂"], [1, "Ơ sao chị biết 😳"], [0, "Bí mật nhân sự mà 🤫"]],
  ],
  ceo: [
    [[0, "Tiến độ thế nào rồi {B}?"], [1, "Đúng kế hoạch sếp ạ!"], [0, "Tốt, cần hỗ trợ gì cứ nói nhé 👍"]],
    [[0, "{B} có ý tưởng gì cho quý tới không?"], [1, "Em nghĩ mình nên thử mảng AI agent ạ 🤖"], [0, "Hay đấy, viết đề xuất gửi anh nhé!"]],
  ],
};

export const COFFEE_LINES = ["☕ Cà phê thôi!", "Nạp năng lượng tí ⚡", "Bánh mới ngon quá 🍪", "Nghỉ 5 phút nào~", "🧋 Trà sữa!", "Hôm nay nắng đẹp ghê ☀️"];
export const COFFEE_CHAT = [
  [[0, "Ê, hôm nay trưa ăn gì?"], [1, "Bún chả đầu ngõ đi 🤤"]],
  [[0, "Cuối tuần đi đâu chơi không?"], [1, "Đi Đà Lạt nè 🌲"]],
  [[0, "Máy pha cà phê mới xịn ghê"], [1, "Ừ, latte ngon hẳn ☕"]],
];

export const WORK_THOUGHTS = {
  tech: ["💻", "⌨️ code code...", "🐛 debug...", "🚀 deploy!", "🤔"],
  mkt: ["🎨", "✏️ viết content...", "📈 phân tích", "📸"],
  sales: ["📞 Alo anh ơi...", "📧 gửi báo giá", "🤝", "🗓️ hẹn khách"],
  fin: ["📊", "🧮 tính toán...", "🧾", "💵"],
  ceo: ["📋", "🤔 chiến lược...", "📈", "☎️"],
  hr: ["📝 lọc CV...", "👥", "📅", "💌"],
};

export const MEETING_REPORT = {
  ceo: ["Họp nhanh 10 phút nhé cả nhà! 📋", "Bắt đầu họp giao ban nào!"],
  tech: ["Kỹ thuật: {n} dự án đang chạy, tiến độ tốt 💻", "Team tech vừa fix xong 12 bug 🐛"],
  mkt: ["Marketing: lượt tiếp cận tăng 20% 📈", "Chiến dịch mới sẽ ra mắt thứ Hai 🎨"],
  sales: ["Kinh doanh: đã chốt {d} hợp đồng 🤝", "Có thêm 5 khách hàng tiềm năng!"],
  fin: ["Kế toán: doanh thu đạt {r} 💰", "Chi phí trong tầm kiểm soát 📊"],
  hr: ["Nhân sự: tuần sau đón 2 bạn mới 🎉", "Team building tháng này đi biển nhé 🏖️"],
  end: ["Tốt lắm, cố gắng nhé! Tan họp 👍", "Cảm ơn mọi người, quay lại làm việc thôi! 🚀"],
};

export function fill(text, ctx) {
  return text.replace(/\{(\w)\}/g, (_, k) => (ctx[k] ?? ""));
}
