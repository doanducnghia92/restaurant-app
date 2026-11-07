// ============================================================
//  VIDEO · CHÍNH SÁCH BÁN HÀNG · HÌNH ẢNH
// ------------------------------------------------------------
//  HÌNH ẢNH THẬT: chép ảnh (jpg/png/webp) vào thư mục
//     bds-site/src/images/<slug-du-an>/
//  ví dụ bds-site/src/images/grand-marina-saigon/01-phoi-canh.jpg
//  → build tự đưa vào thư viện ảnh (ảnh thật hiển thị trước,
//    tên file dùng làm chú thích). Chỉ dùng ảnh có quyền sử dụng
//    (do CĐT/đại lý cung cấp hoặc tự chụp).
//
//  VIDEO: dán ID YouTube (phần sau "watch?v=") vào VIDEOS.
//  Dự án không có ID sẽ hiện liên kết tìm video trên YouTube.
// ============================================================

export const VIDEOS = {
  'vinhomes-green-paradise-can-gio': { id: 'g9r0iYFylQc', title: 'Giới thiệu Vinhomes Green Paradise Cần Giờ' },
  'grand-marina-saigon': { id: 'ArPYT-buYG4', title: 'Grand Marina, Saigon – Project Introduction' },
  'the-global-city': { id: 'd-XfQmaKO2U', title: 'Giới thiệu khu đô thị The Global City – Masterise Homes' },
  'vinhomes-grand-park': { id: '2UPZJIdtcls', title: 'Flycam 4K toàn cảnh Vinhomes Grand Park' },
};

// Khung thanh toán theo Luật Kinh doanh BĐS 2023 (nhà ở hình thành trong tương lai)
export const LEGAL_SCHEDULE = {
  domestic: [
    ['Đặt cọc', '≤ 5%', 'Khi dự án đủ điều kiện kinh doanh, ký thỏa thuận đặt cọc'],
    ['Ký HĐMB (lần đầu)', '≤ 30% (gồm cọc)', 'Ký hợp đồng mua bán với chủ đầu tư'],
    ['Thanh toán theo tiến độ', 'lũy kế ≤ 70%', 'Theo tiến độ xây dựng trước khi bàn giao'],
    ['Nhận bàn giao nhà', 'lũy kế ~95%', 'Ký biên bản bàn giao'],
    ['Nhận sổ hồng', '5% còn lại', 'Khi được cấp Giấy chứng nhận'],
  ],
  foreign: [
    ['Đặt cọc', '≤ 5%', 'Khi dự án đủ điều kiện kinh doanh'],
    ['Ký HĐMB (lần đầu)', '≤ 30% (gồm cọc)', 'Ký hợp đồng mua bán'],
    ['Thanh toán theo tiến độ', 'lũy kế ≤ 50%', 'CĐT có vốn đầu tư nước ngoài: tối đa 50% trước bàn giao'],
    ['Nhận bàn giao nhà', 'lũy kế ~95%', 'Ký biên bản bàn giao'],
    ['Nhận sổ hồng', '5% còn lại', 'Khi được cấp Giấy chứng nhận'],
  ],
  resale: [
    ['Đặt cọc', 'thỏa thuận (thường 5 – 10%)', 'Ký hợp đồng đặt cọc, kiểm tra sổ/HĐMB gốc'],
    ['Công chứng chuyển nhượng', 'thỏa thuận (thường 80 – 90%)', 'Công chứng hợp đồng chuyển nhượng'],
    ['Sang tên / nhận nhà', 'phần còn lại', 'Hoàn tất thủ tục sang tên, nhận bàn giao'],
  ],
};

// Phương án tài chính phổ biến theo chủ đầu tư (khung tham khảo)
export const DEV_POLICY = {
  vinhomes: {
    options: [
      ['Thanh toán chuẩn', 'Theo tiến độ, chiết khấu theo chính sách từng đợt'],
      ['Thanh toán sớm', 'Chiết khấu cao hơn khi thanh toán sớm 50 – 95%'],
      ['Vay ngân hàng', 'Ngân hàng đối tác cho vay đến 70 – 80%, hỗ trợ lãi suất theo chương trình'],
    ],
    recent: [
      ['04 – 07/2026', 'Chương trình hỗ trợ lãi suất 5 năm: khách hàng chịu tối đa ~6%/năm (áp dụng 20/4 – 20/7/2026, toàn quốc)', 'https://vietnamfinance.vn/vinhomes-trien-khai-sieu-chinh-sach-khoa-tran-lai-suat-toi-da-6-nam-trong-5-nam-d143677.html'],
      ['2026', 'Tại Green Paradise: Vinhomes chi trả phần lãi suất vượt 9%/năm theo chương trình', 'https://tienphong.vn/loi-ich-kep-tu-chuong-trinh-lai-suat-3-9nam-suot-5-nam-cua-vinhomes-post1886690.tpo'],
    ],
  },
  masterise: {
    options: [
      ['Thanh toán chuẩn', 'Theo tiến độ xây dựng'],
      ['Thanh toán sớm', 'Chiết khấu theo tỷ lệ thanh toán trước'],
      ['Vay ngân hàng', 'Hỗ trợ vay, hỗ trợ lãi suất & ân hạn nợ gốc theo từng chương trình'],
    ],
    recent: [
      ['01/08 – 30/09/2026', 'Chương trình hỗ trợ tài chính “Đồng hành kiến tạo giá trị” cho Masteri Collection & Lumière Series', 'https://vietnamnet.vn/masterise-homes-tag1867760898388399599.html'],
    ],
  },
  mikgroup: {
    options: [
      ['Thanh toán chuẩn', 'Theo tiến độ'],
      ['Vay ngân hàng', 'Ngân hàng bảo lãnh, hỗ trợ vay theo chính sách dự án tổng'],
    ],
    recent: [],
  },
  sungroup: {
    options: [
      ['Thanh toán chuẩn', 'Theo tiến độ / thỏa thuận'],
      ['Cam kết khai thác', 'Một số sản phẩm có chương trình hợp tác khai thác cho thuê (tùy đợt)'],
      ['Vay ngân hàng', 'Ngân hàng đối tác hỗ trợ vay'],
    ],
    recent: [],
  },
  capitaland: {
    options: [
      ['Thanh toán chuẩn', 'Theo tiến độ, tối đa 50% trước bàn giao (CĐT vốn nước ngoài)'],
      ['Thanh toán sớm', 'Chiết khấu theo chương trình'],
      ['Vay ngân hàng', 'Ngân hàng đối tác quốc tế & trong nước'],
    ],
    recent: [],
  },
  huongviet: {
    options: [
      ['Thanh toán chuẩn', 'Theo tiến độ'],
      ['Vay ngân hàng', 'Hỗ trợ vay đến 70% theo tin rao bán'],
    ],
    recent: [],
  },
  bluemarq: {
    options: [
      ['Thanh toán chuẩn', 'Theo tiến độ'],
      ['Vốn tự có thấp', 'Thanh toán ~10% đến khi nhận nhà, ngân hàng giải ngân phần còn lại (tùy đợt)'],
      ['Vay ngân hàng', 'Vay đến 80%, hỗ trợ lãi suất giai đoạn đầu'],
    ],
    recent: [],
  },
};

// Chính sách/ưu đãi ghi nhận theo từng dự án (ghi rõ thời hạn & nguồn)
export const PROJECT_POLICY = {
  'vinhomes-grand-park': [
    ['2025 – 2027', 'The Opus One: giãn thời hạn thanh toán đến 03/2027', 'https://www.sggp.org.vn/the-opus-one-can-ho-hang-hieu-gia-tot-duoc-gioi-nha-giau-sai-thanh-san-don-post790041.html'],
  ],
  'the-prive': [
    ['đến 30/08/2026', 'Vốn ~10% đến khi nhận nhà, vay 80%, 0% lãi suất 24 tháng đầu, cố định 9,9% 36 tháng tiếp theo (theo tin rao bán)', 'https://batdongsan.com.vn/ban-can-ho-chung-cu-the-prive'],
    ['2026', 'Nhiều ngân hàng đưa ra gói vay linh hoạt, người mua để ở có thêm 2 – 3 năm chuẩn bị tài chính', 'https://vneconomy.vn/the-prive-ghi-diem-nho-loat-chinh-sach-vay-mua-linh-hoat-tu-cac-ngan-hang.htm'],
  ],
  'the-global-city': [
    ['Cuối 2026', 'Masteri Grand View: quỹ căn bàn giao 12/2026, chiết khấu ~15 – 16% (theo tin rao bán)', 'https://batdongsan.com.vn/nha-dat-ban-masteri-grand-view'],
  ],
  'vinhomes-green-paradise-can-gio': [
    ['04 – 07/2026', 'Hỗ trợ lãi suất 5 năm, khách hàng chịu tối đa ~6%/năm; Vinhomes chi trả phần vượt 9%/năm', 'https://vietnamfinance.vn/vinhomes-trien-khai-sieu-chinh-sach-khoa-tran-lai-suat-toi-da-6-nam-trong-5-nam-d143677.html'],
  ],
};

// Lãi suất tham khảo cho công cụ tính (11/2026)
export const RATES = {
  promo: 9.5, // BIDV "Ngôi nhà đầu tiên" từ 9,5%/năm 12 tháng đầu
  promoMonths: 12,
  floating: 12, // lãi tham chiếu ~9,3% + biên độ 3 – 7%
  note: 'Lãi cố định 12 – 24 tháng bình quân ~10,9%/năm (DKRA, 08/2026); lãi thả nổi sau ưu đãi ≈ lãi tham chiếu ~9,3% + biên độ 3 – 7%.',
  sources: [
    ['Nhà Đầu tư – Lãi suất vay mua nhà bình quân vượt 10%/năm', 'https://nhadautu.vn/lai-suat-vay-mua-nha-binh-quan-da-vuot-10-nam-d107287.html'],
    ['Thời báo Tài chính – Lãi vay mua nhà “neo” hai con số', 'https://thoibaotaichinhvietnam.vn/lai-suat-vay-mua-nha-neo-hai-con-so-ky-vong-ha-nhiet-khong-de-201273-201273.html'],
  ],
};
