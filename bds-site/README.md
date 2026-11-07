# LUXE Estates – Website dự án BĐS cao cấp miền Nam

Website tĩnh chuẩn SEO tổng hợp dự án của **Vinhomes, Masterise Homes, MIKGroup, Sun Group, CapitaLand, Hướng Việt, BlueMarq** khu vực miền Nam.

## Cấu trúc
- `src/data.mjs` – **toàn bộ nội dung** (domain, hotline, Zalo, email, dự án, chủ đầu tư, khu vực, FAQ). Sửa ở đây.
- `src/build.mjs` – trình sinh trang tĩnh (không cần thư viện).
- `src/assets/` – CSS, JS hiệu ứng, favicon, ảnh OG.
- `site/` – **kết quả build, upload thư mục này lên hosting** (Netlify, Vercel, GitHub Pages, cPanel…).

## Nội dung từng trang dự án
Tổng quan · Hình ảnh (xem toàn màn hình) · Thông số · Mặt bằng tổng thể & mặt bằng căn (dạng tab) · Loại căn & giá · Tiện ích · Video · Vị trí & kết nối · Tiến độ · Chính sách bán hàng & tiến độ thanh toán · Công cụ tính lãi vay · Nguồn tham khảo · Hỏi đáp.

- `src/details.mjs` – thông số, loại căn, kết nối, tiến độ, nguồn của từng dự án.
- `src/media.mjs` – **ID video YouTube**, chính sách bán hàng, lãi suất mặc định của công cụ tính lãi.
- `src/images/<slug>/` – **ảnh thật** của dự án (xem `src/images/README.md`). Chưa có ảnh thật thì dùng phối cảnh minh hoạ tự sinh.
- Trang công cụ riêng: `/cong-cu/tinh-lai-vay/`.

## Build
```bash
npm run build:bds      # hoặc: node bds-site/src/build.mjs
```

## Trước khi đưa lên mạng
1. Sửa `SITE.url` trong `src/data.mjs` thành domain thật (dùng cho canonical, sitemap, Open Graph).
2. Sửa hotline, Zalo, email, địa chỉ.
3. (Tuỳ chọn) điền `formEndpoint` (Google Apps Script / Formspree) để form gửi về Google Sheet; nếu để trống form sẽ mở email.
4. Build lại, upload `site/`, khai báo `sitemap.xml` trên Google Search Console.
5. Thay ảnh minh hoạ SVG bằng ảnh phối cảnh thật (có quyền sử dụng) để tăng chuyển đổi.

## SEO đã có
- 40 trang: trang chủ, danh sách + bảng giá, 24 trang dự án, 7 trang chủ đầu tư, 7 trang khu vực.
- Title/description/keywords riêng từng trang, canonical, hreflang, Open Graph, Twitter card.
- JSON-LD: RealEstateAgent, WebSite + SearchAction, ItemList, BreadcrumbList, ApartmentComplex/Residence, FAQPage, Organization.
- `sitemap.xml`, `robots.txt`, HTML render sẵn (không phụ thuộc JS), liên kết nội bộ dày, bảng giá dạng `<table>`.
