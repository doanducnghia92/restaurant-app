// ============================================================
//  THÔNG TIN CHI TIẾT TỪNG DỰ ÁN (gộp vào PROJECTS khi build)
//  Số liệu tổng hợp từ báo chí & nguồn công khai (11/2026).
//  Giá là giá tham khảo/giá rao thị trường, không phải bảng giá CĐT.
//  Các trường override (price, scale, address...) sẽ ghi đè data.mjs
// ============================================================
export const DETAILS = {
  // ======================= VINHOMES =======================
  'vinhomes-green-paradise-can-gio': {
    scale: '~2.870 ha',
    specs: [
      ['Tên pháp lý', 'Khu đô thị du lịch lấn biển Cần Giờ'],
      ['Vị trí', 'Xã Long Hòa & thị trấn Cần Thạnh cũ, Cần Giờ'],
      ['Tổng diện tích', '~2.870 ha'],
      ['Tổng vốn đầu tư', '~11 tỷ USD (ước tính)'],
      ['Khởi công', '19/04/2025'],
      ['Tiêu chuẩn', 'ESG++, BREEAM (bền vững), ISO 37122 (đô thị thông minh)'],
      ['Thương hiệu lưu trú', 'JW Marriott, Grand Hyatt, InterContinental, MGallery…'],
      ['Phân khu', '4 phân khu chức năng chính (trong đó có HeartBay)'],
      ['Loại hình', 'Biệt thự, nhà phố, shophouse, căn hộ (Imperia)'],
    ],
    overview: [
      'Vinhomes Green Paradise là siêu đô thị lấn biển lớn nhất Việt Nam với tổng vốn đầu tư ước tính khoảng 11 tỷ USD, khởi công ngày 19/04/2025 tại bờ biển Cần Giờ – vùng biển duy nhất của TP.HCM, ôm trọn bởi Khu dự trữ sinh quyển rừng ngập mặn Cần Giờ được UNESCO công nhận.',
      'Trung tâm cảnh quan là hồ lagoon nước mặn quy mô lớn, xung quanh là quần thể khách sạn mang các thương hiệu JW Marriott, Grand Hyatt, InterContinental, MGallery, cùng sân golf, trung tâm hội nghị, khu vui chơi và tổ hợp thương mại. Dự án hướng tới bộ tiêu chuẩn ESG++, BREEAM cho phát triển bền vững và ISO 37122 cho đô thị thông minh.',
      'Sản phẩm đa dạng gồm biệt thự đảo, nhà phố, shophouse thương mại và căn hộ (phân khu Imperia Green Paradise), phù hợp cả nhu cầu nghỉ dưỡng thứ hai, kinh doanh du lịch lẫn an cư lâu dài khi hạ tầng kết nối hoàn thiện.',
    ],
    units: [
      ['Liền kề / nhà phố', '75 – 100 m²', '~10 – 12 tỷ/căn (tin rao)'],
      ['Biệt thự song lập', '~225 m²', '~24 tỷ/căn (tin rao)'],
      ['Đơn giá đất tham khảo', '—', '105 – 197 triệu/m²'],
      ['Căn hộ Imperia', '33 – 209 m²', '56,8 – 59,9 triệu/m²'],
    ],
    connect: [
      ['Cầu Cần Giờ (Bình Khánh) – đang triển khai', 'nối thẳng Nhà Bè – Quận 7'],
      ['Phà Bình Khánh hiện hữu', '~45 – 60 phút về Quận 1'],
      ['Metro Bến Thành – Cần Giờ (quy hoạch)', '~30 phút về trung tâm khi hoàn thành'],
      ['Cao tốc Bến Lức – Long Thành', 'kết nối vùng Đông & Tây Nam'],
      ['Rừng ngập mặn UNESCO', 'liền kề dự án'],
    ],
    timeline: [
      ['04/2025', 'Khởi công siêu đô thị'],
      ['2025', 'Mở bán các phân khu thấp tầng đầu tiên'],
      ['2026', 'Thi công san lấp, hạ tầng & hồ lagoon; mở bán phân khu căn hộ Imperia'],
      ['Tương lai', 'Hoàn thiện tổ hợp khách sạn, tiện ích & kết nối cầu – metro'],
    ],
    fit: ['Nghỉ dưỡng & ngôi nhà thứ hai', 'Đầu tư dài hạn đón hạ tầng', 'Kinh doanh lưu trú – thương mại'],
    sources: [
      ['Lao Động – Khởi công siêu đô thị 2.870 ha', 'https://news.laodong.vn/bat-dong-san/khoi-cong-sieu-do-thi-lan-bien-2870-ha-tai-can-gio-1493846.ldo'],
      ['Tạp chí Kinh tế Tài chính', 'https://tapchikinhtetaichinh.vn/sieu-do-thi-2870-ha-cua-vinhomes-dang-ve-lai-dien-mao-bien-can-gio-156363.html'],
      ['Batdongsan.com.vn – Vinhomes Green Paradise', 'https://batdongsan.com.vn/du-an-khu-do-thi-moi-can-gio/vinhomes-green-paradise-pj5789'],
    ],
  },

  'vinhomes-grand-park': {
    price: 'Căn hộ ~45 – 75 triệu/m² (tham khảo, tùy phân khu)',
    specs: [
      ['Vị trí', 'Phường Long Bình & Long Thạnh Mỹ (Quận 9 cũ)'],
      ['Tổng diện tích', '271 ha'],
      ['Quy mô căn hộ', '~44.000 căn, ~71 tòa (tham khảo)'],
      ['Công viên', 'Công viên Ánh Sáng 36 ha'],
      ['Phân khu', 'The Rainbow (2019), The Origami (21 tòa), The Beverly (10 tòa, 5.088 căn), The Beverly Solari, The Opus One (4 tòa, ~2.000 căn)'],
      ['Thấp tầng', 'The Manhattan, The Manhattan Glory (nhà phố, biệt thự)'],
      ['Đối tác', 'Samty (Nhật Bản) – The Opus One; Masterise Homes – Masteri Centre Point, Lumière Boulevard'],
      ['Pháp lý', 'Sổ hồng theo phân khu (The Rainbow đã bàn giao sổ)'],
    ],
    overview: [
      'Vinhomes Grand Park là “thành phố thông minh – công viên” quy mô 271 ha tại cửa ngõ phía Đông TP.HCM, ra mắt năm 2019 với phân khu đầu tiên The Rainbow (khoảng 10.000 căn bán hết trong 17 ngày). Toàn đô thị dự kiến khoảng 44.000 căn hộ trên hơn 70 tòa tháp, cùng khu thấp tầng The Manhattan.',
      'Điểm nhấn là Công viên Ánh Sáng 36 ha, Vincom Mega Mall Grand Park, hệ thống Vinschool, bệnh viện – phòng khám Vinmec và xe buýt điện VinBus nội khu. Các phân khu được thiết kế theo phong cách riêng: The Origami (Nhật Bản), The Beverly (Mỹ), The Opus One (hợp tác Samty, Nhật Bản).',
      'Dự án nằm sát Vành đai 3, cao tốc TP.HCM – Long Thành – Dầu Giây và ga Metro số 1 (Suối Tiên), thuận lợi cho chuyên gia khu công nghệ cao và các trường đại học khu Thủ Đức thuê ở – yếu tố giúp thanh khoản thứ cấp luôn sôi động.',
    ],
    units: [
      ['Studio / 1PN', '30 – 50 m²', 'từ ~2 tỷ'],
      ['2PN', '59 – 75 m²', '~3 – 4,5 tỷ'],
      ['3PN', '80 – 100 m²', '~4,5 – 6,5 tỷ'],
      ['Nhà phố The Manhattan', '75 – 120 m² đất', 'liên hệ'],
    ],
    connect: [
      ['Ga Metro số 1 Suối Tiên', '~5 – 7 phút'],
      ['Khu Công nghệ cao TP.HCM', '~5 phút'],
      ['Vành đai 3 & cao tốc Long Thành – Dầu Giây', 'liền kề'],
      ['Quận 1', '~35 – 40 phút'],
      ['Sân bay Long Thành', '~30 phút qua cao tốc'],
    ],
    timeline: [
      ['07/2019', 'Ra mắt phân khu The Rainbow'],
      ['2020', 'Ra mắt The Origami'],
      ['2022 – 2023', 'Mở bán The Beverly, The Beverly Solari'],
      ['02/2024', 'Khởi công The Opus One (Vinhomes × Samty)'],
      ['2026', 'Bàn giao The Opus One theo kế hoạch'],
    ],
    fit: ['Gia đình trẻ an cư', 'Đầu tư cho thuê chuyên gia KCN cao', 'Mua lần đầu ngân sách 2 – 6 tỷ'],
    sources: [
      ['Vietnamnet – Vinhomes Grand Park', 'https://vietnamnet.vn/vinhomes-grand-park-tiep-tuc-gay-sot-voi-can-ho-dam-chat-nhat-ban-the-origami-660452.html'],
      ['VnBusiness – Khởi công The Opus One', 'https://vnbusiness.vn/chinh-thuc-khoi-cong-du-an-the-opus-one-tai-vinhomes-grand-park.html'],
      ['VietnamFinance – Cất nóc The Opus One', 'https://vietnamfinance.vn/vinhomes-va-samty-to-chuc-le-cat-noc-4-toa-thap-the-opus-one-du-kien-ban-giao-tu-quy-i-2026-d130524.html'],
    ],
  },

  'vinhomes-central-park': {
    price: '~65 – 140 triệu/m² (giá rao chuyển nhượng 2026)',
    specs: [
      ['Vị trí', '720A Điện Biên Phủ, P. Thạnh Mỹ Tây (Bình Thạnh cũ)'],
      ['Tổng diện tích', '43,91 ha'],
      ['Mật độ xây dựng', '~16%'],
      ['Quy mô', '18 tòa căn hộ + ~88 biệt thự + Landmark 81'],
      ['Phân khu', 'The Park, The Central, The Landmark, Landmark Plus, Landmark 81'],
      ['Landmark 81', '81 tầng, 461,2 m – tòa nhà cao nhất Việt Nam'],
      ['Công viên', 'Công viên ven sông ~14 ha'],
      ['Pháp lý', 'Sổ hồng'],
    ],
    overview: [
      'Vinhomes Central Park (Vinhomes Tân Cảng) là khu đô thị 43,91 ha bên sông Sài Gòn, mật độ xây dựng chỉ khoảng 16%, gồm 18 tòa căn hộ, khoảng 88 biệt thự và tháp Landmark 81 cao 461,2 m – biểu tượng mới của TP.HCM.',
      'Cư dân được hưởng công viên ven sông khoảng 14 ha, Vincom Center Landmark 81 (sân trượt băng, rạp chiếu phim), bệnh viện Vinmec Central Park, trường Vinschool và bến du thuyền. Đây là một trong những cộng đồng chuyên gia nước ngoài đông nhất TP.HCM.',
      'Dự án đã bàn giao và có sổ hồng, giao dịch chủ yếu là chuyển nhượng thứ cấp; giá rao năm 2026 dao động khoảng 65 – 140 triệu/m² tùy tòa, tầng và view sông.',
    ],
    units: [
      ['1PN', '50 – 55 m²', '~4,5 – 6 tỷ'],
      ['2PN', '75 – 90 m²', '~7 – 11 tỷ'],
      ['3PN', '105 – 130 m²', '~11 – 18 tỷ'],
      ['Biệt thự ven sông', '200 – 500 m² đất', 'liên hệ'],
    ],
    connect: [
      ['Quận 1 (qua Nguyễn Hữu Cảnh)', '~5 – 7 phút'],
      ['Ga Metro số 1 Tân Cảng', '~5 phút đi bộ'],
      ['Thảo Điền – Thủ Thiêm', '~10 phút'],
      ['Sân bay Tân Sơn Nhất', '~25 phút'],
    ],
    timeline: [
      ['2014', 'Khởi công dự án & Landmark 81'],
      ['2016 – 2017', 'Bàn giao các phân khu The Park, The Central, The Landmark'],
      ['2018', 'Khai trương Landmark 81'],
      ['Hiện tại', 'Chuyển nhượng – cho thuê, đã có sổ hồng'],
    ],
    fit: ['Cho thuê chuyên gia (lấp đầy cao)', 'Gia đình cần tiện ích hoàn chỉnh', 'Tích sản lõi trung tâm'],
    sources: [
      ['Thư viện Pháp luật – Tổng quan Vinhomes Central Park', 'https://thuvienphapluat.vn/phap-luat-nha-dat/tong-quan-du-an-vinhomes-central-park-vinhomes-tan-cang-170.html'],
      ['VnEconomy – Khởi công tòa nhà cao nhất Việt Nam', 'https://vneconomy.vn/chinh-thuc-khoi-cong-toa-nha-cao-nhat-viet-nam.htm'],
    ],
  },

  'vinhomes-golden-river-ba-son': {
    scale: '~25 ha (khu Ba Son)',
    price: '1PN từ ~7,5 tỷ · 2PN ~11 – 16 tỷ (giá rao 2026)',
    specs: [
      ['Vị trí', '2 Tôn Đức Thắng, P. Sài Gòn (Bến Nghé, Quận 1 cũ)'],
      ['Tổng diện tích', '~25 ha'],
      ['Quy mô', '13 tòa cao tầng + ~63 biệt thự ven sông'],
      ['Phân khu', 'The Aqua (Aqua 1–4, 36–50 tầng), The Luxury (Luxury 1–6), The Victoria'],
      ['Số căn', '~3.000 căn hộ & officetel 1–4PN'],
      ['Pháp lý', 'Sổ hồng'],
    ],
    overview: [
      'Vinhomes Golden River nằm trên khu đất xưởng đóng tàu Ba Son lịch sử, mặt tiền Tôn Đức Thắng và sông Sài Gòn, ngay trung tâm Quận 1 cũ. Dự án gồm 13 tòa cao tầng chia thành các phân khu The Aqua, The Luxury và khoảng 63 biệt thự ven sông.',
      'Nhờ vị trí ngay ga Metro Ba Son, cạnh cầu Thủ Thiêm 2 và view trực diện Thủ Thiêm – Landmark 81, đây là địa chỉ được giới doanh nhân và chuyên gia nước ngoài ưa chuộng. Dự án đã bàn giao, có sổ hồng, giao dịch chủ yếu chuyển nhượng.',
    ],
    units: [
      ['1PN', '~50 m²', '~7,5 – 8,2 tỷ'],
      ['2PN', '70 – 83 m²', '~11 – 16 tỷ'],
      ['3PN', '110 – 121 m²', '~22 – 26 tỷ'],
      ['Biệt thự ven sông', '~225 m²+', 'từ ~235 tỷ'],
    ],
    connect: [
      ['Ga Metro Ba Son', 'ngay dự án'],
      ['Nhà hát Thành phố – Nguyễn Huệ', '~5 phút'],
      ['Thủ Thiêm (cầu Thủ Thiêm 2)', '~3 phút'],
      ['Sân bay Tân Sơn Nhất', '~25 phút'],
    ],
    timeline: [['2015', 'Ra mắt dự án'], ['Đã bàn giao', 'The Aqua, The Luxury, biệt thự ven sông'], ['Hiện tại', 'Chuyển nhượng – cho thuê']],
    fit: ['Tích sản lõi Quận 1', 'Cho thuê cao cấp', 'Doanh nhân cần ở trung tâm'],
    sources: [
      ['CBRE – Vinhomes Golden River', 'https://residential.cbrevietnam.com/en-US/vinhomes-golden-river-EN'],
      ['Muaban.net – Vinhomes Golden River', 'https://muaban.net/bat-dong-san/ban-can-ho-du-an-vinhome-golden-river-quan-1-ho-chi-minh'],
    ],
  },

  // ======================= MASTERISE =======================
  'grand-marina-saigon': {
    price: 'Từ ~15.000 USD/m² · 1PN ~19 – 21 tỷ (tham khảo)',
    specs: [
      ['Vị trí', '2 Tôn Đức Thắng, P. Sài Gòn (Ba Son, Quận 1 cũ)'],
      ['Tổng diện tích', '~10 ha'],
      ['Thương hiệu', 'Marriott Residences & JW Marriott Residences'],
      ['Các tòa', 'Lake (Legacy), Sea (47 tầng), Cove, Lagoon, Spring, Bay, Strait, Lumière Essence Peak'],
      ['Kiến trúc & cảnh quan', 'Atkins (Anh)'],
      ['Nội thất', 'AB Concept (Hồng Kông)'],
      ['Thi công', 'Newtecons'],
      ['Phí quản lý', '~8 USD/m² (Marriott) · ~9 USD/m² (JW Marriott)'],
      ['Pháp lý', 'Sổ hồng (đã trao sổ cho cư dân tòa Lake)'],
    ],
    overview: [
      'Grand Marina, Saigon là khu căn hộ hàng hiệu mang thương hiệu Marriott và JW Marriott quy mô khoảng 10 ha tại Ba Son – được Masterise Homes định vị là khu branded residence Marriott lớn nhất thế giới. Tòa Lake là tòa đầu tiên vận hành; tòa Sea hình chữ L cao 47 tầng là tòa JW Marriott đầu tiên tại châu Á – Thái Bình Dương.',
      'Kiến trúc và cảnh quan do Atkins (Anh) thiết kế, nội thất bởi AB Concept (Hồng Kông), tổng thầu Newtecons. Cư dân được phục vụ bởi đội ngũ Marriott với dịch vụ quản gia, concierge 24/7, nhà hàng riêng, spa và bến du thuyền.',
      'Mức giá thuộc nhóm cao nhất Việt Nam, khởi điểm khoảng 15.000 USD/m²; căn 1 phòng ngủ rao khoảng 19 – 21 tỷ. Dự án đã bàn giao và trao sổ hồng cho các căn Marriott đầu tiên.',
    ],
    units: [
      ['1PN', '57 – 65 m²', '~19 – 21 tỷ'],
      ['2PN', '85 – 110 m²', 'liên hệ'],
      ['3PN – 4PN', '130 – 250 m²', 'liên hệ'],
      ['Penthouse / Sky Villa', '300 m²+', 'liên hệ'],
    ],
    connect: [
      ['Ga Metro Ba Son', 'ngay dự án'],
      ['Phố đi bộ Nguyễn Huệ', '~5 phút'],
      ['Thủ Thiêm', '~3 phút'],
      ['Sân bay Tân Sơn Nhất', '~25 phút'],
    ],
    timeline: [
      ['2022', 'Khởi công'],
      ['06/2024', 'Trao sổ hồng các căn Marriott đầu tiên (tòa Lake)'],
      ['02/2025', 'Khai trương tòa Sea – JW Marriott Residences'],
      ['2026', 'Ra mắt Lumière Essence Peak & các tòa tiếp theo'],
    ],
    fit: ['Giới siêu giàu & doanh nhân quốc tế', 'Tích sản hàng hiệu giữ giá', 'Cho thuê cao cấp'],
    sources: [
      ['VIR – Khởi công Marriott Branded Residences lớn nhất thế giới', 'https://www.vir.com.vn/masterise-homes-breaks-ground-on-worlds-largest-marriott-branded-residences-in-vietnam-83317.html'],
      ['Masterise Homes – JW Marriott Residences', 'https://masterisehomes.com/en/truyen-thong/media-releases/masterise-homes-opens-first-ever-jw-marriott-urban-branded-residences-in-asia-pacific'],
      ['Newtecons – Grand Marina Saigon', 'https://newtecons.vn/en/project/grand-marina-saigon/'],
      ['Thư viện Pháp luật – Tổng quan Grand Marina', 'https://thuvienphapluat.vn/phap-luat-nha-dat/tong-quan-du-an-grand-marina-saigon--du-an-can-ho-hang-hieu-dat-do-987.html'],
    ],
  },

  'one-central-saigon': {
    address: '1 Phạm Ngũ Lão, Phường Bến Thành, TP. Hồ Chí Minh (Quận 1 cũ)',
    status: 'Ra mắt 05/2026',
    scale: '~8.600 m² · 2 tháp 48 & 55 tầng',
    tagline: 'Tháp đôi The Ritz-Carlton đối diện chợ Bến Thành',
    summary: 'One Central Saigon là tổ hợp tháp đôi 48 và 55 tầng tại khu tứ giác Bến Thành, do Masterise Homes ra mắt ngày 13/05/2026, gồm khách sạn The Ritz-Carlton, Saigon (231 phòng), căn hộ hàng hiệu The Ritz-Carlton Residences và khối thương mại gần 20.000 m².',
    specs: [
      ['Vị trí', '1 Phạm Ngũ Lão (khu tứ giác Bến Thành), 4 mặt tiền Phạm Ngũ Lão – Calmette – Lê Thị Hồng Gấm – Phó Đức Chính'],
      ['Diện tích khu đất', '~8.600 m²'],
      ['Quy mô', '2 tháp 48 & 55 tầng'],
      ['Thương hiệu', 'The Ritz-Carlton, Saigon (khách sạn 231 phòng) & The Ritz-Carlton Residences'],
      ['Thương mại', '~19.990 m², 7 tầng nổi + 6 tầng hầm'],
      ['Vận hành', 'Marriott International'],
      ['Thi công', 'Newtecons'],
      ['Ra mắt', '13/05/2026'],
    ],
    overview: [
      'One Central Saigon tọa lạc tại khu đất “tứ giác Bến Thành” khoảng 8.600 m² với bốn mặt tiền Phạm Ngũ Lão – Calmette – Lê Thị Hồng Gấm – Phó Đức Chính, đối diện chợ Bến Thành và ga trung tâm Metro số 1. Sau nhiều năm đình trệ, dự án được Masterise Group tái khởi động và chính thức ra mắt ngày 13/05/2026.',
      'Tổ hợp gồm hai tòa tháp cao 48 và 55 tầng, mang thương hiệu The Ritz-Carlton – khách sạn 231 phòng và khu căn hộ hàng hiệu The Ritz-Carlton Residences do Marriott International vận hành, cùng khối thương mại gần 20.000 m² trải trên 7 tầng nổi và 6 tầng hầm.',
      'Với vị trí “điểm 0” của TP.HCM và thương hiệu siêu sang, One Central Saigon được kỳ vọng thiết lập mặt bằng giá mới cho căn hộ hàng hiệu Việt Nam.',
    ],
    units: [
      ['The Ritz-Carlton Residences', 'đang cập nhật', 'liên hệ'],
      ['Penthouse', 'đang cập nhật', 'liên hệ'],
    ],
    connect: [
      ['Ga Metro Bến Thành', '~2 phút đi bộ'],
      ['Chợ Bến Thành – phố đi bộ Nguyễn Huệ', 'liền kề'],
      ['Thủ Thiêm', '~7 phút'],
      ['Sân bay Tân Sơn Nhất', '~20 phút'],
    ],
    timeline: [['2010s', 'Dự án đình trệ nhiều năm'], ['2025', 'Masterise tái khởi động, Newtecons thi công'], ['13/05/2026', 'Chính thức ra mắt One Central Saigon']],
    fit: ['Khách hàng siêu giàu', 'Tích sản hàng hiệu biểu tượng', 'Nhà đầu tư quốc tế'],
    sources: [
      ['Tuổi Trẻ News – Masterise unveils One Central Saigon', 'https://news.tuoitre.vn/masterise-group-unveils-one-central-saigon-twin-tower-project-in-ho-chi-minh-city-103260514152906123.htm'],
      ['Vietnam News – One Central Saigon', 'https://vietnamnews.vn/life-style/1781315/one-central-saigon-a-new-iconic-tower-to-be-developed-in-heart-of-hcm-city.html'],
      ['EdgeProp – One Central Saigon', 'https://www.edgeprop.sg/property-news/vietnams-masterise-group-launches-mixed-use-project-one-central-saigon-ho-chi-minh-city'],
    ],
  },

  'the-global-city': {
    price: 'Masteri Grand View từ ~120 triệu/m² · SOHO liên hệ',
    specs: [
      ['Vị trí', 'Đỗ Xuân Hợp, P. Bình Trưng (An Phú, Quận 2 cũ)'],
      ['Tổng diện tích', '117,4 ha'],
      ['Quy hoạch', 'Foster + Partners (Anh)'],
      ['Thấp tầng', 'Nhà phố SOHO (đã bàn giao 2024), biệt thự vườn'],
      ['Cao tầng', 'Masteri Grand View (ra mắt 02/11/2024) – tòa Spark & Glow, mỗi tòa ~308 căn, 20 tầng căn hộ'],
      ['Tiện ích', 'Kênh đào & nhạc nước, trung tâm thương mại, Sales Gallery “Kiệm Lifestyle Hub”'],
      ['F&B', 'Hợp tác nhiều thương hiệu F&B nổi tiếng tại khu SOHO'],
    ],
    overview: [
      'The Global City là đô thị 117,4 ha do Masterise Homes phát triển, quy hoạch bởi Foster + Partners – văn phòng kiến trúc hàng đầu thế giới. Dự án được định vị là “trung tâm mới” của TP.HCM với trục kênh đào trung tâm, show nhạc nước và trung tâm thương mại quy mô lớn.',
      'Giai đoạn đầu là khu nhà phố thương mại SOHO, đã hoàn thiện mặt tiền và bàn giao từ cuối 2023 – đầu 2024, thu hút nhiều thương hiệu F&B. Ngày 02/11/2024, Masterise ra mắt Masteri Grand View – phân khu cao tầng đầu tiên với hai tòa Spark và Glow.',
      'Vị trí mặt tiền Đỗ Xuân Hợp – Liên Phường, cạnh cao tốc TP.HCM – Long Thành – Dầu Giây và Vành đai 2, kết nối nhanh Thủ Thiêm, Thảo Điền và sân bay Long Thành.',
    ],
    units: [
      ['Căn hộ 1PN', '~50 m²', 'liên hệ'],
      ['Căn hộ 2PN', '70 – 85 m²', 'liên hệ'],
      ['Căn hộ 3PN', '~100 m²+', 'liên hệ'],
      ['Nhà phố SOHO', '5 tầng', 'liên hệ'],
    ],
    connect: [
      ['Cao tốc TP.HCM – Long Thành – Dầu Giây', '~2 phút'],
      ['Thủ Thiêm', '~10 phút'],
      ['Quận 1', '~20 phút'],
      ['Sân bay Long Thành', '~30 phút'],
    ],
    timeline: [
      ['2022', 'Masterise Homes chính thức phát triển dự án'],
      ['Cuối 2023 – 2024', 'Bàn giao nhà phố SOHO'],
      ['11/2024', 'Ra mắt Masteri Grand View'],
      ['2026', 'Thi công các tòa cao tầng, mở bán đợt tiếp theo'],
    ],
    fit: ['Kinh doanh thương mại (SOHO)', 'An cư khu Đông cao cấp', 'Đầu tư tăng giá dài hạn'],
    sources: [
      ['Lao Động – The Global City sau 2 năm', 'https://news.laodong.vn/bat-dong-san/the-global-city-phat-trien-than-toc-sau-hai-nam-ve-tay-masterise-homes-1414630.ldo'],
      ['Lao Động – Ra mắt dự án cao tầng đầu tiên', 'https://news.laodong.vn/bat-dong-san/masterise-homes-chinh-thuc-ra-mat-du-an-cao-tang-dau-tien-o-the-global-city-1416350.ldo'],
      ['World Architecture – Foster + Partners masterplan', 'https://worldarchitecture.org/architecture-news/emvzf/foster-partners-to-design-new-masterplan-in-vietnam.html'],
    ],
  },

  'lumiere-riverside': {
    price: '~156 – 330 triệu/m² (giá rao)',
    scale: '2 tòa 36 & 44 tầng · ~1.030 căn',
    specs: [
      ['Vị trí', '259 Võ Nguyên Giáp, P. An Khánh (Thảo Điền cũ)'],
      ['Chủ đầu tư pháp lý', 'Công ty CP Địa ốc Thảo Điền (Masterise Homes phát triển)'],
      ['Quy mô', '2 tòa: West (44 tầng), East (36 tầng)'],
      ['Số căn', '~1.030 căn'],
      ['Kiến trúc', 'Leafscape – vườn đứng 3D'],
      ['Thi công', 'Newtecons'],
      ['Bàn giao', '09/12/2023'],
      ['Pháp lý', 'Sổ hồng lâu dài (đã trao sổ 08/2024)'],
    ],
    overview: [
      'LUMIÈRE Riverside là dự án Lumière Series đầu tiên tại TP.HCM, gồm hai tòa West 44 tầng và East 36 tầng với khoảng 1.030 căn hộ ngay mặt tiền Võ Nguyên Giáp, sát ga Metro Thảo Điền. Kiến trúc “leafscape” với hệ vườn đứng 3D tạo nên mảng xanh phủ khắp mặt đứng.',
      'Masterise Homes bàn giao dự án ngày 09/12/2023 – dự án thứ tư bàn giao trong năm. Sau 6 tháng đã có 92% cư dân dọn về, và 50 sổ hồng đầu tiên được trao vào tháng 8/2024 đúng cam kết.',
    ],
    units: [
      ['1PN', '~50 m²', 'liên hệ'],
      ['2PN', '70 – 85 m²', 'liên hệ'],
      ['3PN', '~100 – 120 m²', 'liên hệ'],
      ['Penthouse / Duplex', '200 m²+', 'liên hệ'],
    ],
    connect: [
      ['Ga Metro Thảo Điền', '~2 phút đi bộ'],
      ['Quận 1', '~10 phút'],
      ['Thủ Thiêm', '~7 phút'],
      ['Trường quốc tế khu Thảo Điền – An Phú', '~5 phút'],
    ],
    timeline: [['2020', 'Ra mắt dự án'], ['12/2023', 'Bàn giao căn hộ'], ['08/2024', 'Trao sổ hồng đợt đầu']],
    fit: ['Chuyên gia nước ngoài thuê', 'Gia đình cần gần trường quốc tế', 'Tích sản có sổ'],
    sources: [
      ['SGGP – Masterise bàn giao LUMIÈRE riverside', 'https://www.sggp.org.vn/masterise-homes-chinh-thuc-ban-giao-lumiere-riverside-du-an-thu-4-trong-nam-2023-post717976.html'],
      ['VnBusiness – Bàn giao sổ hồng Lumière Riverside', 'https://vnbusiness.vn/masterise-homes-ban-giao-so-hong-cho-cu-dan-lumiere-riverside-theo-dung-cam-ket.html'],
      ['Batdongsan.com.vn – Lumiere Riverside', 'https://batdongsan.com.vn/du-an-can-ho-chung-cu-quan-2/lumiere-riverside-pj4114'],
    ],
  },

  'masteri-centre-point': {
    specs: [
      ['Vị trí', 'Trung tâm Vinhomes Grand Park, P. Long Bình'],
      ['Dòng sản phẩm', 'Masteri Collection'],
      ['Loại hình', 'Căn hộ 1–3PN, Duplex, Penthouse'],
      ['Liền kề', 'Công viên 36 ha, Vincom Mega Mall'],
      ['Bàn giao', '23/12/2023'],
      ['Vận hành', 'Masterise Property Management'],
    ],
    overview: [
      'Masteri Centre Point là khu căn hộ compound cao cấp thuộc Masteri Collection, nằm ngay trung tâm đại đô thị Vinhomes Grand Park, liền kề công viên 36 ha và Vincom Mega Mall. Dự án ra mắt năm 2020 và được bàn giao ngày 23/12/2023.',
      'Sản phẩm gồm căn hộ 1 – 3 phòng ngủ cùng dòng Duplex, Penthouse giới hạn; hệ tiện ích nội khu riêng biệt (hồ bơi, sky lounge, gym, BBQ) tách biệt với khu dân cư đại trà – điểm khác biệt giúp giá thuê và giá chuyển nhượng cao hơn mặt bằng chung Grand Park.',
    ],
    units: [
      ['1PN', '~47 m²', 'liên hệ'],
      ['2PN', '65 – 75 m²', 'liên hệ'],
      ['3PN', '~90 m²+', 'liên hệ'],
      ['Duplex / Penthouse', '150 m²+', 'liên hệ'],
    ],
    connect: [['Công viên 36 ha & Vincom Mega Mall', 'liền kề'], ['Ga Metro Suối Tiên', '~7 phút'], ['Vành đai 3', '~3 phút'], ['Quận 1', '~35 phút']],
    timeline: [['10/2020', 'Ra mắt dự án'], ['23/12/2023', 'Lễ bàn giao căn hộ']],
    fit: ['Chuyên gia KCN cao thuê', 'Gia đình muốn compound riêng', 'Đầu tư cho thuê'],
    sources: [
      ['Tuoi Tre News – Launch of Masteri Centre Point', 'https://tuoitrenews.vn/news/business/20201028/masterise-homes-revives-ho-chi-minh-city-realty-market-with-launch-of-masteri-centre-point/57472.html'],
      ['Saigon Luxury – Duplex/Penthouse Masteri Centre Point', 'https://saigonluxury.com.vn/en/duplex-penthouse-masteri-center-point-and-lumiere-boulevard-luxury-products-affirming-an-upscale-lifestyle/'],
    ],
  },

  'lumiere-boulevard': {
    specs: [
      ['Vị trí', 'Vinhomes Grand Park, mặt tiền Vành đai 3, phía sau công viên 36 ha'],
      ['Dòng sản phẩm', 'Lumière Series'],
      ['Phân phối', 'Vinhomes (độc quyền, hợp tác 2022)'],
      ['Kiến trúc', 'Xanh đa chiều 3D'],
      ['Cất nóc', '03/2023'],
      ['Giá thuê 2PN', '~11 – 15,5 triệu/tháng'],
    ],
    overview: [
      'LUMIÈRE Boulevard là dự án Lumière Series của Masterise Homes trong Vinhomes Grand Park, được Vinhomes phân phối độc quyền từ năm 2022. Dự án nằm trên tuyến Vành đai 3, phía sau là công viên 36 ha, được mệnh danh là khu “xanh đa chiều” lớn nhất TP.HCM.',
      'Chỉ trong 30 sự kiện mở bán dịp 26 – 27/6, dự án ghi nhận hơn 2.000 giao dịch. Dự án cất nóc tháng 3/2023 và đã bàn giao; giá thuê căn 2 phòng ngủ khoảng 11 – 15,5 triệu/tháng.',
    ],
    units: [['1PN', '~50 m²', 'liên hệ'], ['2PN', '70 – 80 m²', 'liên hệ'], ['3PN', '~95 m²', 'liên hệ'], ['Duplex', '150 m²+', 'liên hệ']],
    connect: [['Vành đai 3', 'mặt tiền'], ['Công viên 36 ha', 'liền kề'], ['Ga Metro Suối Tiên', '~8 phút'], ['Quận 1', '~35 phút']],
    timeline: [['06/2022', 'Mở bán – hơn 2.000 giao dịch'], ['03/2023', 'Cất nóc'], ['Đã bàn giao', 'Cư dân về ở – khai thác cho thuê']],
    fit: ['Đầu tư cho thuê', 'An cư gia đình trẻ', 'Mua ở thực trong Grand Park'],
    sources: [
      ['Masterise Homes – Hợp tác Vinhomes phân phối', 'https://masterisehomes.com/en/news/masterise-homes-va-vinhomes-hop-tac-phan-phoi-du-an-lumiere-boulevard'],
      ['Tạp chí Toà án – Cất nóc LUMIÈRE Boulevard', 'https://tapchitoaan.vn/masterise-homes-chinh-thuc-cat-noc-lumiere-boulevard8119.html'],
      ['Batdongsan.com.vn – Lumiere Boulevard', 'https://batdongsan.com.vn/du-an-can-ho-chung-cu-lumiere-boulevard/lumiere-boulevard-pj5598'],
    ],
  },

  // ======================= MIKGROUP =======================
  'imperia-green-paradise': {
    scale: 'GĐ1 phân khu B2 · ~5.000 căn',
    specs: [
      ['Vị trí', 'Long Hòa, Cần Giờ – trong Vinhomes Green Paradise'],
      ['Tên gọi khác', 'Imperia Cần Giờ, MIK Cần Giờ'],
      ['Giai đoạn 1', 'Phân khu District B2, ~5.000 căn hộ'],
      ['Chiều cao', '22 – 27 tầng (tham khảo)'],
      ['Loại căn', 'Studio, 1PN, 2PN, 2PN+, 3PN, 3PN+, Duplex, Penthouse'],
      ['Giá tham khảo', '56,8 – 59,9 triệu/m² (08/2026)'],
      ['Chủ đầu tư', 'MIKGroup (thành lập 2014, trụ sở Hà Nội)'],
    ],
    overview: [
      'Imperia Green Paradise (Imperia Cần Giờ) là phân khu căn hộ thương hiệu Imperia của MIKGroup trong siêu đô thị Vinhomes Green Paradise. Giai đoạn 1 là phân khu District B2 với khoảng 5.000 căn hộ, các tòa cao khoảng 22 – 27 tầng.',
      'Đây là “cửa ngõ” dễ tiếp cận nhất để sở hữu bất động sản tại siêu đô thị biển Cần Giờ: căn 1 phòng ngủ từ khoảng 1,85 tỷ, đơn giá tham khảo 56,8 – 59,9 triệu/m², trong khi vẫn thừa hưởng biển hồ, khách sạn quốc tế và hạ tầng chung của Vinhomes.',
    ],
    units: [
      ['Studio', '~33 m²', 'liên hệ'],
      ['1PN', '~48 m²', '~1,85 – 2,47 tỷ'],
      ['2PN / 2PN+', '57 – 79 m²', 'liên hệ'],
      ['3PN / 3PN+', '81 – 113 m²', 'liên hệ'],
      ['Duplex / Penthouse', '114 – 209 m²', 'liên hệ'],
    ],
    connect: [['Biển hồ & bãi biển Cần Giờ', 'trong nội khu'], ['Cầu Cần Giờ (đang triển khai)', 'nối Nhà Bè – Quận 7'], ['Quận 1 (hiện qua phà Bình Khánh)', '~45 – 60 phút']],
    timeline: [['2025', 'Công bố phân khu căn hộ Imperia'], ['2026', 'Mở bán GĐ1 – District B2'], ['Tương lai', 'Bàn giao theo tiến độ CĐT']],
    fit: ['Ngân sách 2 – 4 tỷ', 'Cho thuê du lịch – nghỉ dưỡng', 'Đầu tư đón hạ tầng Cần Giờ'],
    sources: [
      ['CafeLand – Imperia Green Paradise', 'https://cafeland.vn/du-an/imperia-green-paradise-phan-khu-can-ho-thuoc-vinhomes-green-paradise-tphcm-5328.html'],
      ['Batdongsan.com.vn – Imperia Green Paradise', 'https://batdongsan.com.vn/du-an-can-ho-chung-cu-can-gio/imperia-green-paradise-pj6666'],
    ],
  },

  'imperia-grand-plaza-duc-hoa': {
    types: ['Nhà phố', 'Shophouse'],
    scale: '~11,3 ha · 426 shophouse',
    status: 'Đã hoàn thiện – sẵn sàng bàn giao',
    address: 'Đường 3/2, Hậu Nghĩa, Đức Hòa, Tỉnh Tây Ninh (Long An cũ)',
    specs: [
      ['Vị trí', 'Mặt tiền đường 3/2 – trục chính thị trấn Hậu Nghĩa, Đức Hòa'],
      ['Tổng diện tích', '~11,3 ha'],
      ['Số sản phẩm', '426 nhà phố thương mại (shophouse)'],
      ['Phân khu', 'Phố Đông (Á Đông đương đại), Phố Trung tâm (Đông Dương hiện đại), Phố Tây (tân cổ điển)'],
      ['Phân phối', 'Đông Tây Land (từ 03/2022)'],
      ['Chủ đầu tư', 'MIKGroup'],
    ],
    overview: [
      'Imperia Grand Plaza Đức Hòa là khu nhà phố thương mại quy mô khoảng 11,3 ha với 426 căn shophouse của MIKGroup, nằm trên đường 3/2 – trục huyết mạch thị trấn Hậu Nghĩa, Đức Hòa (Long An cũ, nay thuộc Tây Ninh).',
      'Dự án chia thành ba phân khu kiến trúc đặc trưng: Phố Đông theo phong cách Á Đông đương đại, Phố Trung tâm phong cách Đông Dương hiện đại và Phố Tây tân cổ điển. Nhu cầu kinh doanh từ cư dân và công nhân các khu công nghiệp Đức Hòa giúp sản phẩm có khả năng khai thác ngay.',
    ],
    units: [['Shophouse 3 – 4 tầng', '~80 – 120 m² đất', 'liên hệ']],
    connect: [['Trung tâm Hậu Nghĩa', 'ngay dự án'], ['Vành đai 3 & 4', '~15 – 20 phút'], ['Ranh TP.HCM (Củ Chi – Bình Chánh)', '~15 phút'], ['Quận 1', '~60 phút']],
    timeline: [['03/2022', 'Ra mắt & ký kết phân phối'], ['2022 – 2024', 'Thi công hạ tầng & nhà phố'], ['2025', 'Sẵn sàng bàn giao']],
    fit: ['Kinh doanh mặt phố', 'Đầu tư vùng ven giá dễ tiếp cận', 'Ở kết hợp buôn bán'],
    sources: [
      ['Báo Đầu tư – MIKGroup tại Long An', 'https://baodautu.vn/batdongsan/mikgroup-danh-dau-buoc-di-manh-me-tai-long-an-voi-du-an-imperia-grand-plaza-duc-hoa-d167892.html'],
      ['PLO – Shophouse lõi đô thị Long An', 'https://plo.vn/shophouse-loi-do-thi-long-an-mieng-banh-ngon-ngay-giai-doan-dau-tang-truong-post678582.html'],
      ['Nhà Đầu tư – BĐS sẵn sàng bàn giao cửa ngõ Tây', 'https://nhadautu.vn/dau-tu-an-toan-voi-bds-san-sang-ban-giao-tai-cua-ngo-tay-tphcm-d97923.html'],
    ],
  },

  // ======================= SUN GROUP =======================
  'sun-premier-village-primavera': {
    scale: 'Thị trấn Địa Trung Hải ~40 ha',
    specs: [
      ['Vị trí', 'Mũi Ông Bốn, An Thới, Nam Phú Quốc – cạnh ga cáp treo Hòn Thơm'],
      ['Loại hình', 'Shophouse, mini-hotel phong cách Địa Trung Hải'],
      ['Kết cấu', 'Shophouse 3 – 5 tầng, nhiều diện tích'],
      ['Phân khu', 'Sorrento, Amalfi… (theo phong cách các thị trấn Ý)'],
      ['Ra mắt', '07/2018 (~70% giỏ hàng được giữ chỗ khi ra mắt)'],
      ['Chủ đầu tư', 'Sun Group'],
    ],
    overview: [
      'Sun Premier Village Primavera là khu shophouse và mini-hotel phong cách Địa Trung Hải tại Mũi Ông Bốn – An Thới, ngay ga cáp treo Hòn Thơm. Dự án được Sun Group ra mắt tháng 7/2018 và ghi nhận khoảng 70% giỏ hàng được giữ chỗ ngay khi ra mắt.',
      'Nằm trong thị trấn Địa Trung Hải (Sunset Town) khoảng 40 ha, sản phẩm shophouse 3 – 5 tầng phù hợp kinh doanh lưu trú, nhà hàng, café phục vụ lượng khách lớn từ cáp treo Hòn Thơm, Cầu Hôn, show Kiss of the Sea và chợ đêm Vui Phết.',
    ],
    units: [['Shophouse / mini-hotel', '3 – 5 tầng', '~17 – 35 tỷ/căn (tham khảo khu vực)']],
    connect: [['Ga cáp treo Hòn Thơm', 'liền kề'], ['Sân bay Phú Quốc', '~20 phút'], ['Dương Đông', '~30 phút'], ['Tuyến LRT Phú Quốc (quy hoạch)', 'kết nối sân bay – đại lộ APEC']],
    timeline: [['07/2018', 'Ra mắt Sun Premier Village Primavera'], ['2019 – 2022', 'Bàn giao & vận hành thị trấn Địa Trung Hải'], ['2026 – 2027', 'Hưởng lợi hạ tầng phục vụ APEC 2027']],
    fit: ['Kinh doanh lưu trú – F&B du lịch', 'Đầu tư dòng tiền', 'Nhà đầu tư đón APEC 2027'],
    sources: [
      ['Bizhub – Sun Group launches Sun Premier Village Primavera', 'https://bizhub.vietnamnews.vn/sun-group-launches-sun-premier-village-primavera-post297887.html'],
      ['Sun Group – Sun Premier Village Primavera', 'https://sungroup.com.vn/en/du-an/sun-premier-village-primavera-143'],
      ['VnBusiness – Shophouse Sun Premier Village Primavera', 'https://vnbusiness.vn/chop-thoi-co-vang-so-huu-shophouse-sun-premier-village-primavera.html'],
    ],
  },

  'sun-grand-city-hillside-residence': {
    scale: '16 ha · 8 tòa căn hộ',
    price: '~68 – 123 triệu/m² · 1PN ~3,3 – 5,5 tỷ (giá rao 08/2026)',
    specs: [
      ['Vị trí', 'An Thới, Nam Phú Quốc – cạnh ga cáp treo Hòn Thơm'],
      ['Tổng diện tích', '~16 ha (khối cao tầng ~15.600 m²)'],
      ['Số tòa', '8 tòa: S1–S2, S3–S4 (The Sky), H1–H2, H3–H4 (The Hill)'],
      ['Phân khu', 'The Hill, The Sea, The Sky (cao tầng) · The Center (shophouse)'],
      ['Điểm nhấn', 'Bể bơi vô cực ở độ cao ~124 m – cao nhất Phú Quốc'],
      ['Tổng thầu', 'SOL E&C (cất nóc S3 – 05/2022)'],
      ['Sở hữu', 'Lâu dài (căn hộ & shophouse)'],
    ],
    overview: [
      'Sun Grand City Hillside Residence là tổ hợp căn hộ cao tầng đầu tiên của Sun Group tại Phú Quốc, quy mô khoảng 16 ha trên sườn đồi An Thới, gồm 8 tòa tháp thuộc các phân khu The Hill, The Sea, The Sky và khu shophouse The Center.',
      'Điểm nhấn là bể bơi vô cực ở độ cao khoảng 124 m – cao nhất đảo, sky lounge ngắm hoàng hôn và tầm nhìn quần đảo An Thới. Căn hộ và shophouse mặt biển được sở hữu lâu dài – yếu tố hiếm tại thị trường nghỉ dưỡng.',
      'Giá rao tháng 8/2026 khoảng 67,8 – 123,3 triệu/m²; căn 1PN khoảng 3,26 – 5,46 tỷ, 2PN 5,47 – 8,78 tỷ, tăng khoảng 18% trong 12 tháng.',
    ],
    units: [['1PN', '~40 – 55 m²', '~3,26 – 5,46 tỷ'], ['2PN', '~60 – 80 m²', '~5,47 – 8,78 tỷ'], ['Shophouse The Center', '3 – 5 tầng', 'liên hệ']],
    connect: [['Ga cáp treo Hòn Thơm', '~2 phút'], ['Sân bay Phú Quốc', '~20 phút'], ['Trung tâm hội nghị APEC (Bãi Đất Đỏ)', '~10 phút'], ['Dương Đông', '~30 phút']],
    timeline: [['2021', 'Ra mắt dự án & phân khu The Center'], ['05/2022', 'Cất nóc tháp S3 – The Sky'], ['Đã bàn giao', 'Bàn giao căn hộ theo giai đoạn'], ['2026', 'Giá tăng ~18%/năm theo tin rao']],
    fit: ['Ngôi nhà thứ hai ven biển', 'Cho thuê du lịch', 'Sở hữu lâu dài tại đảo ngọc'],
    sources: [
      ['VnEconomy – Tổ hợp cao tầng đầu tiên Phú Quốc', 'https://vneconomy.vn/tu-cu-hich-to-hop-cao-tang-dau-tien-phu-quoc-buoc-vao-giai-doan-phat-trien-moi.htm'],
      ['Sun Group – Sun Grand Hillside Residence', 'https://sungroup.com.vn/en/du-an/sun-grand-hillside-residence-145'],
      ['SOL E&C – Cất nóc tháp S3', 'https://solenc.vn/en/news/sol-ec-topped-of-tower-s3-in-the-sky-sun-grand-city-hillside'],
      ['Batdongsan.com.vn – Sun Grand City Hillside', 'https://batdongsan.com.vn/nha-dat-ban-sun-grand-city-hillside-residence'],
    ],
  },

  'sunset-town-phu-quoc': {
    scale: '~39,9 ha',
    price: 'Shophouse ~17 – 35 tỷ · căn hộ ~4,9 – 11,7 tỷ (tham khảo)',
    status: 'Đang vận hành – phát triển giai đoạn mới',
    specs: [
      ['Vị trí', 'Bờ Tây Nam, phường An Thới, Phú Quốc'],
      ['Tổng diện tích', '~39,9 ha'],
      ['Loại hình', 'Căn hộ, shophouse, khách sạn'],
      ['Điểm đến', 'Cầu Hôn, tháp đồng hồ, show Kiss of the Sea, chợ đêm'],
      ['Phân khu căn hộ', 'The Sunset (thuộc Sun Grand City Hillside)'],
      ['Liên kết', 'Gần khu Bãi Đất Đỏ – trung tâm hội nghị APEC 2027'],
    ],
    overview: [
      'Sunset Town (Thị trấn Hoàng Hôn) là quần thể khoảng 39,9 ha phong cách Địa Trung Hải tại bờ Tây Nam Phú Quốc, nơi có Cầu Hôn, tháp đồng hồ và các show diễn đêm thu hút hàng triệu lượt khách mỗi năm.',
      'Khu vực liền kề Bãi Đất Đỏ – nơi Sun Group cùng 13 thương hiệu khách sạn quốc tế xây dựng “thành phố khách sạn” và trung tâm hội nghị phục vụ APEC 2027, kết nối sân bay qua tuyến LRT gần 18 km. Shophouse tham khảo khoảng 17 – 35 tỷ/căn, căn hộ 4,9 – 11,7 tỷ/căn.',
    ],
    units: [['Căn hộ', '—', '~4,9 – 11,7 tỷ'], ['Shophouse', '3 – 5 tầng', '~17 – 35 tỷ']],
    connect: [['Cầu Hôn & ga cáp treo Hòn Thơm', '~3 phút'], ['Trung tâm hội nghị APEC', '~10 phút'], ['Sân bay Phú Quốc (LRT ~18 km quy hoạch)', '~20 phút']],
    timeline: [['2023', 'Khai trương Cầu Hôn – Thị trấn Hoàng Hôn'], ['2025', 'Khởi công hạ tầng APEC 2027'], ['2027', 'Phú Quốc đăng cai APEC']],
    fit: ['Kinh doanh du lịch đêm', 'Đầu tư đón APEC 2027', 'Nghỉ dưỡng cao cấp'],
    sources: [
      ['CafeLand – Sunset Town', 'https://cafeland.vn/du-an/sunset-town-du-an-to-hop-tai-phu-quoc-4028.html'],
      ['VnExpress – Sun Group & 13 thương hiệu khách sạn', 'https://e.vnexpress.net/news/travel/sun-group-and-13-elite-brands-join-hands-to-shape-hotel-city-in-phu-quoc-5012027.html'],
      ['Vietnam News – Phú Quốc chuẩn bị APEC 2027', 'https://vietnamnews.vn/brandinfo/1765015/phu-quoc-poised-for-apec-2027-with-sun-group-s-world-class-infrastructure-project.html'],
    ],
  },

  // ======================= CAPITALAND =======================
  'orchard-hill-sycamore': {
    scale: '1,1 ha · 2 tháp 24 tầng · 774 căn',
    specs: [
      ['Vị trí', 'Sycamore, thành phố mới Bình Dương (nay P. Bình Dương, TP.HCM)'],
      ['Diện tích phân khu', '~1,1 ha'],
      ['Quy mô', '2 tòa 24 tầng – 774 căn hộ'],
      ['Tổng thể Sycamore', '~18,9 ha, ~3.500 căn (7 phân khu)'],
      ['Tỷ lệ hấp thụ', '90% (694/774 căn) tính đến 06/11/2024'],
      ['Hoàn thành', 'Quý IV/2026'],
      ['Chủ đầu tư', 'CapitaLand Development (Singapore)'],
    ],
    overview: [
      'Orchard Hill là giai đoạn 2 của đại dự án Sycamore (khoảng 18,9 ha) do CapitaLand Development phát triển tại thành phố mới Bình Dương. Phân khu rộng khoảng 1,1 ha, gồm hai tòa 24 tầng với 774 căn hộ.',
      'Ra mắt tháng 8/2024, dự án ghi nhận 90% căn hộ (694/774) được đặt chỗ tính đến ngày 06/11/2024. Theo kế hoạch, Orchard Hill hoàn thành và chào đón cư dân trong quý IV/2026, nằm trong kế hoạch bàn giao gần 3.000 căn của CapitaLand tại Việt Nam năm 2026.',
    ],
    units: [['1PN – 1PN+', '~50 – 60 m²', 'liên hệ'], ['2PN', '~75 – 85 m²', 'liên hệ'], ['3PN', '~100 m²+', 'liên hệ']],
    connect: [['Trung tâm hành chính Bình Dương', '~3 phút'], ['Đại học Quốc tế Miền Đông, KCN VSIP 2', '~10 phút'], ['Vành đai 3 & 4', '~10 – 15 phút'], ['Trung tâm TP.HCM', '~45 – 60 phút']],
    timeline: [['08/2024', 'Ra mắt Orchard Hill'], ['11/2024', 'Đạt 90% giỏ hàng'], ['Q4/2026', 'Hoàn thành & bàn giao']],
    fit: ['Chuyên gia KCN Bình Dương', 'Gia đình ưu tiên chất lượng Singapore', 'Đầu tư cho thuê'],
    sources: [
      ['Vietnam News – CapitaLand unveils Orchard Hill', 'https://vietnamnews.vn/brandinfo/1660571/capitaland-development-unveils-orchard-hill-sycamore-s-2nd-phase-after-strong-sales-in-1st.html'],
      ['CapitaLand – Strong bookings of Orchard Hill', 'https://www.capitaland.com/en/about-capitaland/newsroom/news-releases/international/2024/november/cld-yields-strong-bookings-of-orchard-hill-sycamore-second-phase.html'],
      ['VietnamPlus – Kế hoạch bàn giao 2026', 'https://www.vietnamplus.vn/capitaland-development-chao-don-nhung-cu-dan-dau-tien-tai-lumi-hanoi-post1134836.amp'],
    ],
  },

  'the-orchard-sycamore': {
    scale: '9,1 ha · 368 căn thấp tầng',
    price: 'Từ ~8,5 tỷ (giá gốc) · chuyển nhượng ~9,8 tỷ/90 m²',
    specs: [
      ['Vị trí', 'Sycamore, thành phố mới Bình Dương'],
      ['Diện tích', '9,1 ha'],
      ['Số căn', '368 căn: nhà phố liên kế, biệt thự song lập & đơn lập'],
      ['Mô hình', 'Khu compound có cổng – bảo vệ 24/7'],
      ['Bàn giao', 'Từ Quý III/2025'],
      ['Chủ đầu tư', 'CapitaLand Development'],
    ],
    overview: [
      'The Orchard là giai đoạn 1 của Sycamore với 368 căn nhà thấp tầng cao cấp (nhà phố, biệt thự song lập, đơn lập) trên diện tích 9,1 ha, thiết kế dạng compound khép kín có cổng và bảo vệ.',
      'CapitaLand Development bắt đầu bàn giao từ quý III/2025 đúng cam kết. Giá gốc dự kiến từ khoảng 8,5 tỷ/căn; tin rao chuyển nhượng gần đây khoảng 9,8 tỷ cho căn 90 m² đất.',
    ],
    units: [['Nhà phố liên kế', '~90 – 110 m² đất', 'từ ~8,5 tỷ'], ['Biệt thự song lập', '~150 – 200 m² đất', 'liên hệ'], ['Biệt thự đơn lập', '~250 m² đất+', 'liên hệ']],
    connect: [['Trung tâm hành chính Bình Dương', '~3 phút'], ['KCN VSIP 2', '~10 phút'], ['Vành đai 3', '~15 phút']],
    timeline: [['Q3/2025', 'Bắt đầu bàn giao 368 căn'], ['2026', 'Cư dân về ở, hoàn thiện tiện ích Sycamore']],
    fit: ['Gia đình đa thế hệ', 'Chuyên gia nước ngoài', 'An cư nhà vườn'],
    sources: [
      ['CapitaLand – The Orchard handover', 'https://www.capitaland.com/en/about-capitaland/newsroom/news-releases/vietnam/2025/capitaland-development-delivers-refined-living-with-the-orchard-.html'],
      ['The Investor – CapitaLand starts handovers', 'https://theinvestor.vn/capitaland-development-starts-home-handovers-at-southern-vietnam-urban-complex-d16820.html'],
    ],
  },

  'de-la-sol': {
    scale: '3 tòa 21 – 23 tầng · 870 căn',
    price: '~74 triệu/m²+ (tham khảo chuyển nhượng)',
    specs: [
      ['Vị trí', '35 Tôn Đản, P. Khánh Hội (Quận 4 cũ)'],
      ['Quy mô', '3 tòa Alto, Bass, Cello – 21 đến 23 tầng, 2 tầng hầm'],
      ['Số căn', '870 căn hộ'],
      ['Chủ đề thiết kế', 'Âm nhạc'],
      ['Bàn giao', '11/2023'],
      ['Pháp lý', 'Sổ hồng'],
    ],
    overview: [
      'De La Sol là dự án căn hộ cao cấp của CapitaLand Development tại Quận 4 cũ, gồm ba tòa Alto, Bass và Cello cao 21 – 23 tầng với 870 căn hộ, lấy cảm hứng thiết kế từ âm nhạc.',
      'Dự án chỉ cách Quận 1 vài phút qua cầu Khánh Hội, bàn giao tháng 11/2023 với chất lượng chuẩn Singapore, phù hợp an cư và cho thuê chuyên gia làm việc tại trung tâm.',
    ],
    units: [['1PN', '~55 m²', 'liên hệ'], ['2PN', '~75 – 90 m²', 'liên hệ'], ['3PN', '~110 m²+', 'liên hệ'], ['Penthouse', '200 m²+', 'liên hệ']],
    connect: [['Quận 1 (cầu Khánh Hội)', '~5 phút'], ['Phú Mỹ Hưng – Quận 7', '~10 phút'], ['Thủ Thiêm', '~10 phút']],
    timeline: [['2022', 'Ra mắt De La Sol'], ['11/2023', 'Bàn giao chìa khóa'], ['Hiện tại', 'Chuyển nhượng – cho thuê']],
    fit: ['Làm việc tại Quận 1', 'Cho thuê chuyên gia', 'Gia đình nhỏ'],
    sources: [
      ['CapitaLand – De La Sol', 'https://www.capitaland.com/vn/vi/development/our-portfolio/residential/de-la-sol.html'],
      ['Bizhub – De La Sol set for handover', 'https://bizhub.vietnamnews.vn/de-la-sol-apartment-project-in-hcm-city-set-for-handover-post349126.html'],
      ['CBRE – De La Sol', 'https://residential.cbrevietnam.com/en-US/de-la-sol-EN'],
    ],
  },

  'dedge-thao-dien': {
    scale: '2 tòa 22 tầng · 273 căn',
    price: '~107 – 193 triệu/m² (giá rao)',
    specs: [
      ['Vị trí', '37 Nguyễn Văn Hưởng, P. An Khánh (Thảo Điền cũ)'],
      ['Quy mô', '2 tòa Aire & Breze, 22 tầng'],
      ['Số căn', '273 căn hộ'],
      ['Mở bán', '07/2017 – bán gần 100% trong chưa đầy 2 tháng'],
      ['Pháp lý', 'Sổ hồng'],
      ['Chủ đầu tư', 'CapitaLand Development'],
    ],
    overview: [
      'D’Edge Thảo Điền là dự án căn hộ giới hạn chỉ 273 căn trong hai tòa Aire và Breze cao 22 tầng, tọa lạc trên đường Nguyễn Văn Hưởng – khu “phố Tây” Thảo Điền. Mở bán tháng 7/2017, dự án bán gần 100% trong chưa đầy hai tháng.',
      'Số lượng căn ít, tiện ích riêng tư và chuẩn bàn giao CapitaLand giúp giá rao năm 2026 đạt khoảng 107 – 193 triệu/m², tăng khoảng 19% trong 12 tháng.',
    ],
    units: [['2PN', '82 – 93 m²', '~9 – 11,5 tỷ'], ['3PN', '~120 m²', 'liên hệ'], ['Penthouse', '200 m²+', 'liên hệ']],
    connect: [['Ga Metro Thảo Điền', '~5 phút'], ['Quận 1', '~12 phút'], ['Trường quốc tế BIS, AIS', '~5 phút']],
    timeline: [['07/2017', 'Mở bán – bán gần hết trong 2 tháng'], ['Đã bàn giao', 'CapitaLand trao chìa khóa cho cư dân'], ['Hiện tại', 'Chuyển nhượng – cho thuê']],
    fit: ['Chuyên gia nước ngoài', 'Khách ưu tiên riêng tư', 'Tích sản Thảo Điền'],
    sources: [
      ['Báo Đấu thầu – CapitaLand bàn giao d’Edge', 'https://baodauthau.vn/capitaland-ban-giao-dedge-thao-dien-cho-nguoi-mua-nha-post92692.html'],
      ['CBRE – d’Edge Thảo Điền', 'https://residential.cbrevietnam.com/en-US/dedge-thao-dien-EN'],
    ],
  },

  // ======================= HƯỚNG VIỆT =======================
  'palm-city-binh-trung': {
    scale: '~30 ha',
    status: 'Đang mở bán phân khu Palm River',
    types: ['Căn hộ', 'Shophouse', 'Nhà phố', 'Biệt thự'],
    specs: [
      ['Vị trí', 'Phường Bình Trưng (Quận 2 cũ), ven sông Rạch Chiếc'],
      ['Tổng diện tích', '~30 ha'],
      ['Chủ đầu tư pháp lý', 'Công ty TNHH Nam Rạch Chiếc'],
      ['Đơn vị phát triển', 'Hướng Việt Properties (tiếp quản từ Keppel)'],
      ['Phân khu hiện hữu', 'Palm Residence, Palm Heights (đã vận hành)'],
      ['Phân khu mới', 'Palm River – 1,9 ha, 630 căn hộ, 117 shophouse'],
      ['Hạ tầng', 'Khởi công công viên & đường chạy bộ ven sông, cầu Ba Dắt 2'],
    ],
    overview: [
      'Palm City là khu đô thị khoảng 30 ha ven sông tại phường Bình Trưng (Quận 2 cũ), trước đây do Keppel Land phát triển. Chủ đầu tư pháp lý là Công ty TNHH Nam Rạch Chiếc, đơn vị phát triển hiện nay là Hướng Việt Properties.',
      'Các phân khu Palm Residence và Palm Heights đã đi vào vận hành. Ngày 16/6/2026, Hướng Việt khởi động phân khu mới Palm River (1,9 ha, 630 căn hộ, 117 shophouse), đồng thời khởi công công viên, đường chạy bộ ven sông và cầu Ba Dắt 2.',
    ],
    units: [['Căn hộ Palm River', '1 – 3PN', 'liên hệ'], ['Shophouse Palm River', '117 căn', 'liên hệ'], ['Biệt thự / nhà phố', 'giới hạn', 'liên hệ']],
    connect: [['Cao tốc Long Thành – Dầu Giây', '~3 phút'], ['Thủ Thiêm', '~10 phút'], ['Quận 1', '~20 phút'], ['Metro số 1 (ga Rạch Chiếc)', '~5 phút']],
    timeline: [['2010s', 'Keppel phát triển Palm Residence, Palm Heights'], ['2025', 'Hướng Việt Properties tiếp quản'], ['06/2026', 'Khởi động phân khu Palm River & hạ tầng ven sông']],
    fit: ['An cư khu Đông', 'Đầu tư căn hộ ven sông', 'Kinh doanh shophouse'],
    sources: [
      ['The Saigon Times – Palm City mở rộng đón sóng hạ tầng', 'https://thesaigontimes.vn/palm-city-mo-rong-don-song-ha-tang-khu-dong/'],
      ['Tạp chí Công Thương – Khởi công công viên Palm City', 'https://tapchicongthuong.vn/palm-city-khoi-cong-cong-vien-va-duong-chay-bo-ven-song-556256.htm'],
      ['The Leader – Chủ mới thế chân Keppel', 'https://theleader.vn/chu-moi-the-chan-keppel-tai-the-palm-city-d39647.html'],
      ['CafeLand – Palm City', 'https://cafeland.vn/du-an/palm-city-du-an-khu-do-thi-tai-tphcm-5770.html'],
    ],
  },

  'la-home': {
    address: 'Xã Lương Hòa, Bến Lức, Tỉnh Tây Ninh (Long An cũ) – giáp Bình Chánh',
    price: 'Nhà phố ~3,4 – 4 tỷ · biệt thự 136 m² ~5,5 – 6,8 tỷ (giá rao)',
    types: ['Nhà phố', 'Biệt thự', 'Shophouse'],
    specs: [
      ['Vị trí', 'Xã Lương Hòa, Bến Lức (Long An cũ), giáp ranh Bình Chánh'],
      ['Tổng diện tích', '100 ha'],
      ['Mật độ xây dựng', '~31%'],
      ['Chủ đầu tư', 'Prodezi Long An'],
      ['Đơn vị phát triển', 'Hướng Việt'],
      ['Loại hình', 'Shophouse, nhà phố, biệt thự'],
      ['Lưu ý pháp lý', 'Một phần dự án điều chỉnh sang khu tái định cư – nhà ở (09/2023)'],
    ],
    overview: [
      'LA Home là khu đô thị 100 ha tại xã Lương Hòa, Bến Lức (Long An cũ), giáp ranh Bình Chánh – TP.HCM, do Prodezi Long An làm chủ đầu tư và Hướng Việt phát triển. Mật độ xây dựng chỉ khoảng 31%, phần lớn diện tích dành cho cây xanh, mặt nước và tiện ích.',
      'Sản phẩm gồm shophouse, nhà phố, biệt thự với giá rao từ khoảng 3,4 tỷ (nhà phố 90 m²) đến 5,5 – 6,8 tỷ (biệt thự 136 m²). Tháng 9/2023, tỉnh Long An điều chỉnh một phần dự án sang khu tái định cư – nhà ở; khách hàng nên kiểm tra kỹ pháp lý từng sản phẩm trước khi giao dịch.',
    ],
    units: [['Nhà phố / shophouse', '~90 m²', '~3,4 – 4 tỷ'], ['Biệt thự', '~136 m²', '~5,5 – 6,8 tỷ']],
    connect: [['Ranh Bình Chánh – TP.HCM', '~5 phút'], ['Cao tốc TP.HCM – Trung Lương', '~10 phút'], ['Vành đai 3 & 4', '~10 – 15 phút'], ['Quận 1', '~45 phút']],
    timeline: [['09/2023', 'Điều chỉnh một phần sang khu tái định cư – nhà ở'], ['2024 – 2026', 'Hoàn thiện hạ tầng, bàn giao từng phân khu']],
    fit: ['Ngân sách 3 – 7 tỷ', 'Ở thực giãn dân TP.HCM', 'Đầu tư vùng ven (cần thẩm định pháp lý)'],
    sources: [
      ['VIR – LA Home', 'https://vir.com.vn/la-home-a-dream-urban-living-area-131347.html'],
      ['The Investor – Lưu ý pháp lý LA Home', 'https://theinvestor.vn/southern-vietnam-residential-project-accepts-deposits-on-homes-without-permission-authorities-d11959.html'],
      ['Thư viện Pháp luật – Tổng quan LA Home', 'https://thuvienphapluat.vn/phap-luat-nha-dat/tien-do-du-an-la-home-tang-toc--tong-quan-du-an-khu-do-thi-la-home-long-an-956.html'],
    ],
  },

  // ======================= BLUEMARQ =======================
  'the-prive': {
    address: 'Khu Nam Rạch Chiếc, Phường Bình Trưng, TP. Hồ Chí Minh (An Phú – Quận 2 cũ)',
    scale: '~6,7 ha · 12 tòa · 3.000+ căn',
    price: '~100 – 137 triệu/m² · căn 7 – 10 tỷ (tham khảo)',
    specs: [
      ['Vị trí', 'Khu Nam Rạch Chiếc, An Phú (Quận 2 cũ)'],
      ['Tổng diện tích', '~6,7 ha'],
      ['Quy mô', '12 tòa 33 – 35 tầng, 3.000+ căn hộ'],
      ['Đang mở bán', 'Tòa 5, 6, 7, 8, 10, 11'],
      ['Diện tích căn', '49,8 – 98,5 m² (1 – 3PN) + Garden Duplex, Sky Duplex, Penthouse'],
      ['Pháp lý', 'Đã có giấy phép xây dựng & đủ điều kiện bán (2025)'],
      ['Chủ đầu tư', 'BLUEMARQ Group (Đất Xanh – DXG)'],
    ],
    overview: [
      'The Privé là dự án căn hộ trọng điểm của BLUEMARQ Group (tiền thân Tập đoàn Đất Xanh) tại khu Nam Rạch Chiếc – An Phú, quy mô khoảng 6,7 ha với 12 tòa cao 33 – 35 tầng và hơn 3.000 căn hộ.',
      'Năm 2025, dự án chính thức đủ điều kiện mở bán; hiện các tòa 5, 6, 7, 8, 10, 11 đang được chào bán với diện tích 49,8 – 98,5 m² (1 – 3 phòng ngủ) cùng dòng Garden Duplex, Sky Duplex và Penthouse giới hạn. Giá tham khảo khoảng 100 – 137 triệu/m².',
      'Dự án thể hiện chiến lược CBD – TOD của BLUEMARQ: gần ga Metro số 1 Rạch Chiếc, cao tốc Long Thành – Dầu Giây, kết nối nhanh Thủ Thiêm và Quận 7 qua cầu Phú Mỹ.',
    ],
    units: [['1PN', '~49,8 m²', 'từ ~5,5 tỷ'], ['2PN', '~65 – 75 m²', '~7 – 9 tỷ'], ['3PN', '~98,5 m²', '~10 tỷ+'], ['Duplex / Penthouse', 'giới hạn', 'liên hệ']],
    connect: [['Ga Metro Rạch Chiếc', '~5 phút'], ['Thủ Thiêm', '~10 phút'], ['Quận 1', '~20 phút'], ['Phú Mỹ Hưng (cầu Phú Mỹ)', '~15 phút']],
    timeline: [['2024', 'Tái định vị Gem Riverside thành The Privé'], ['2025', 'Đủ điều kiện mở bán'], ['05/2026', 'Đất Xanh đổi tên BLUEMARQ Group'], ['2026', 'Thi công & mở bán các tòa tiếp theo']],
    fit: ['An cư khu Đông giá hợp lý', 'Đầu tư căn hộ hình thành tương lai', 'Gia đình trẻ'],
    sources: [
      ['Thư viện Pháp luật – Bảng giá The Privé', 'https://thuvienphapluat.vn/phap-luat-nha-dat/du-an-the-prive-da-mo-ban-chua-bang-gia-ban-du-an-the-prive-moi-nhat-thang-52025-4189.html'],
      ['VnEconomy – BLUEMARQ tái cấu trúc', 'https://vneconomy.vn/bluemarq-group-tai-cau-truc-danh-muc-du-an-cho-chien-luoc-phat-trien-moi.htm'],
      ['Batdongsan.com.vn – The Privé', 'https://batdongsan.com.vn/ban-can-ho-chung-cu-the-prive'],
    ],
  },

  'gem-sky-world': {
    scale: '~92,2 ha · 4.022 sản phẩm',
    specs: [
      ['Vị trí', 'Long Đức, Long Thành, Đồng Nai'],
      ['Tổng diện tích', '~92,2 ha'],
      ['Số sản phẩm', '4.022 biệt thự, nhà phố, đất nền'],
      ['Phân khu', 'Diamond ParkView, Ruby ParkView, Garnet Town, Pearl Town, Emerald Town, Aquamarine Villas, Topaz Town, Sapphire ParkView'],
      ['Khoảng cách sân bay', '~4 – 5 km đến sân bay Long Thành'],
      ['Chủ đầu tư', 'Đất Xanh (BLUEMARQ) – Hà An'],
    ],
    overview: [
      'Gem Sky World là khu đô thị sân bay quy mô khoảng 92,2 ha tại Long Đức, Long Thành, cách sân bay quốc tế Long Thành chỉ 4 – 5 km, với 4.022 sản phẩm biệt thự, nhà phố và đất nền.',
      'Dự án chia thành 8 phân khu mang tên đá quý (Diamond, Ruby, Garnet, Pearl, Emerald, Aquamarine, Topaz, Sapphire), hiện đang bàn giao và hoàn thiện tiện ích – phù hợp nhà đầu tư đón sóng sân bay Long Thành đi vào khai thác.',
    ],
    units: [['Đất nền / nhà phố', '~100 m²', 'liên hệ'], ['Shophouse', '~100 – 150 m²', 'liên hệ'], ['Biệt thự', '~200 – 300 m²', 'liên hệ']],
    connect: [['Sân bay quốc tế Long Thành', '~4 – 5 km'], ['Cao tốc TP.HCM – Long Thành – Dầu Giây', '~3 phút'], ['Vành đai 3 & 4', '~10 phút'], ['Quận 1', '~45 phút']],
    timeline: [['2019', 'Ra mắt Gem Sky World'], ['2022 – 2025', 'Bàn giao từng phân khu'], ['2026', 'Sân bay Long Thành khai thác giai đoạn 1']],
    fit: ['Đầu tư đón sân bay Long Thành', 'Kinh doanh dịch vụ', 'An cư vùng ven'],
    sources: [
      ['Thư viện Pháp luật – Tổng quan Gem Sky World', 'https://thuvienphapluat.vn/phap-luat-nha-dat/tong-quan-du-an-gem-sky-world-long-thanh-dong-nai-3422.html'],
      ['SGGP – Gem Sky World', 'https://www.sggp.org.vn/gem-sky-world-tag147281.html'],
    ],
  },

  'opal-skyline': {
    scale: '2 tháp 36 tầng · 1.500+ sản phẩm',
    specs: [
      ['Vị trí', 'Thuận An (Bình Dương cũ), cửa ngõ TP.HCM – Bình Dương'],
      ['Quy mô', '2 tháp cao 36 tầng'],
      ['Số sản phẩm', '1.500+ căn hộ & shophouse'],
      ['Chủ đầu tư', 'Đất Xanh (BLUEMARQ)'],
    ],
    overview: [
      'Opal Skyline là dự án căn hộ của Đất Xanh (nay BLUEMARQ) tại Thuận An – cửa ngõ kết nối TP.HCM và Bình Dương cũ, gồm hai tháp cao 36 tầng với hơn 1.500 căn hộ và shophouse.',
      'Vị trí gần các khu công nghiệp VSIP, Việt Hương và trung tâm thương mại AEON Bình Dương giúp dự án có nguồn khách thuê ổn định từ chuyên gia và người lao động.',
    ],
    units: [['1PN', '~45 – 55 m²', 'liên hệ'], ['2PN', '~65 – 75 m²', 'liên hệ'], ['Shophouse', 'khối đế', 'liên hệ']],
    connect: [['AEON Mall Bình Dương', '~5 phút'], ['KCN VSIP 1', '~10 phút'], ['Quốc lộ 13', '~3 phút'], ['Trung tâm TP.HCM', '~35 – 45 phút']],
    timeline: [['Đã bàn giao', 'Cư dân về ở'], ['Hiện tại', 'Chuyển nhượng – cho thuê']],
    fit: ['Ngân sách dưới 3 tỷ', 'Cho thuê công nhân – chuyên gia', 'Mua nhà lần đầu'],
    sources: [['SGGP – Đất Xanh', 'https://www.sggp.org.vn/dat-xanh-tag118352.html']],
  },
};
