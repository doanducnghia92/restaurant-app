# Ảnh thật cho từng dự án

Tạo thư mục trùng tên slug dự án và chép ảnh vào (jpg, png, webp, avif):

```
bds-site/src/images/grand-marina-saigon/01-phoi-canh-tong-the.jpg
bds-site/src/images/grand-marina-saigon/02-ho-boi-vo-cuc.jpg
bds-site/src/images/grand-marina-saigon/03-nha-mau-2pn.jpg
```

- Ảnh được sắp theo tên file; **ảnh đầu tiên** dùng làm ảnh bìa (thẻ dự án + phần đầu trang).
- Tên file (bỏ số thứ tự, gạch ngang → khoảng trắng) dùng làm chú thích ảnh.
- Nên nén ảnh trước (rộng ~1600px, < 300 KB, định dạng webp) để trang tải nhanh – tốt cho SEO.
- Chỉ dùng ảnh có quyền sử dụng (chủ đầu tư/đại lý cung cấp, hoặc tự chụp).

Danh sách slug: xem `slug` trong `bds-site/src/data.mjs` (ví dụ `vinhomes-grand-park`, `the-global-city`, `orchard-hill-sycamore`…).

Sau khi thêm ảnh chạy `npm run build:bds`.
