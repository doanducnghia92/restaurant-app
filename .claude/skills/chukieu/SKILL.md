---
name: chukieu
description: Dựng cụm typo (chữ kiểu) động cho video dọc 9:16 TikTok/Reels/Shorts — cụm 3–4 lớp phối font (in hoa hẹp, sans tròn đậm, script chữ ký, script đuôi lượn, serif nghiêng), gradient kim loại/neon phát sáng, icon neon, nhãn bo tròn, nét gạch lượn, chữ nền viền rỗng, 14 kiểu chữ vào khớp từng từ lời thoại. Hai dòng phong cách — A "neon thanh lịch" và B "kim loại sôi động" — với 20 mẫu cụm CK-01..CK-20. Xuất lớp chữ nền trong suốt (MOV ProRes 4444 / WebM) hoặc ghép thẳng vào video. Dùng khi người dùng gọi chukieu, cần chữ kiểu / typo / text động cho video, hoặc khi một skill edit khác (nghia-edit, andy-edit…) cần lớp chữ.
---

# chukieu — cụm typo động

Skill này **chỉ làm lớp chữ**. Nó được thiết kế để chạy chung với các skill edit khác: skill edit dựng video (cắt, B-roll, màu), còn chukieu dựng các cụm chữ theo đúng mốc thời gian của video đã dựng, rồi ghép lên ở bước cuối.

## Cách dùng nhanh

1. Có **video đã dựng xong** (timeline cuối) và **lời thoại có mốc thời gian từng từ**.
2. **Claude tự chọn** từ khoá, mẫu cụm, màu (theo quy tắc ở mục 4), rồi viết file `spec.json`.
3. Render:
   ```bash
   node <skill>/scripts/render.mjs --spec spec.json --board board.png            # duyệt nhanh từng cụm
   node <skill>/scripts/render.mjs --spec spec.json --base edited.mp4 --composite final.mp4   # ghép thẳng
   node <skill>/scripts/render.mjs --spec spec.json --out overlay.mov            # lớp chữ trong suốt cho CapCut/Premiere
   ```
   Tuỳ chọn: `--preview` (540×960, nhanh gấp ~4 lần), `--from 3 --to 9` (render một đoạn), `--still 4.2 --png f.png` (chụp một khung), `--fps 30`.
4. Luôn xem `board.png` trước khi render video. Người dùng muốn đổi gì thì sửa `spec.json` rồi render lại **ra tên file mới** (`_v2`, `_v3`…).

**Cần có:** Node 18+, Playwright có Chromium (`npm i -g playwright && npx playwright install chromium`), FFmpeg. Trong máy cloud của Claude Code đã có sẵn cả ba.

**Ghép với skill edit khác:** skill kia xuất video timeline cuối, lấy mốc từ trong timeline đó (không lấy theo clip gốc). Sau đó gọi `render.mjs --base <video> --composite <out>`, hoặc xuất `--out overlay.mov` rồi tự overlay bằng FFmpeg: `[0:v][1:v]overlay=0:0`. Chữ đã tự nằm trong vùng an toàn TikTok: Y 235–1390, và X ≤ 875 khi Y ≥ 800 (cùng chuẩn với nghia-edit).

## 1. Bộ khung một cụm (4 lớp)

| Lớp | Vai trò | Ví dụ |
|---|---|---|
| Nền (tuỳ chọn) | chữ viền rỗng khổng lồ, số khổng lồ gradient — nằm sau chữ chính | 500.000.000, $$$, 3, 5 |
| **Chữ chính** (1 cụm chỉ có 1) | từ khoá, chiếm 60–70% diện tích | PHỒN VINH, Lưu lại, 100 TỶ |
| Chữ dẫn / chữ phụ | script mảnh đặt chéo góc trên trái; script lớn cắt qua đáy chữ chính; sans nhỏ giãn chữ dưới chân | Luôn · Suối tiên · BÊN SÔNG SÀI GÒN |
| Trang trí | icon neon, nhãn bo tròn, nét gạch lượn, cờ | 🔑 · "sở hữu ngay" · gạch lượn |

**Quy tắc vị trí:** các lớp đè lên nhau 15–35%; script nghiêng −8° đến −15°, chữ in hoa luôn thẳng; icon xoay ±15° và đè khoảng 20% lên góc chữ chính; bố cục lệch, không căn giữa đều.

## 2. Font — 6 vai trò (`fonts/fonts.json`)

| Vai trò | Dùng cho | Font dự phòng có sẵn (OFL, có tiếng Việt) |
|---|---|---|
| R1 sans gọn | chữ dẫn, chữ phụ, nhãn | Be Vietnam Pro |
| R2 in hoa hẹp đậm | chữ chính dòng B | Anton |
| R3 sans tròn rất đậm | chữ chính, số, VIRAL | Montserrat Black |
| R4 script chữ ký mảnh | chữ dẫn chéo (Luôn, Chỉ từ) | Ephesis |
| R5 script đuôi lượn | chữ chính dòng A (Lưu lại, Viral) | Great Vibes, Pinyon Script |
| R6 serif nghiêng | hành trình, tư duy, thu hút hơn | Playfair Display Italic |

**Dùng font của người dùng:** mỗi vai trò là một danh sách font, font đầu tiên tìm thấy sẽ được dùng. Có hai cách:
- Khi skill chạy trên PC, Chromium tự dùng font đã cài trong máy theo tên. Chỉ cần sửa tên ở đầu `stack` cho đúng tên font trong máy (ví dụ `"UTM Bebas"`, `"SVN-Gilroy"`).
- Chép file `.ttf/.otf` vào `fonts/user/`. Tên family chính là tên file, bỏ phần đuôi.

Muốn đổi font cho riêng một video thì thêm `"fontRoles": {"R2": {"stack": ["Tên font"]}}` vào spec.

**Cặp phối hay dùng:** R2+R4 (khoảng 60% số cụm dòng B), R3+R4, R1+R5, R3+R6. Mỗi cụm dùng tối đa 3 vai trò và không bao giờ có hai chữ lớn cùng loại font.

## 3. Màu (`presets/palettes.json`)

- **Dòng B, kim loại:** fire, ice, chrome, gold, toxic, royal, rose, copper, cyan. Gradient dọc 3–5 điểm, có dải sáng kiểu kim loại, glow cùng màu.
- **Dòng A, neon dịu:** blue, gold, mint, cyan, violet, lime, lemon. Đi kèm trắng và xám (#8A8A8A), tạo 3 mức sáng.
- Mỗi cụm có 1 màu chính (`palette` = p1). Có thể thêm 1 màu phụ **ngược nhiệt độ** (`palette2` = p2), ví dụ fire↔ice hoặc gold↔ice.
- Script hầu như luôn để trắng. Hai cụm liền nhau không được trùng màu.
- Chọn màu theo ý nghĩa: tiền và giá → gold/fire; vị trí, kết nối, công nghệ → ice/cyan; xanh, tiện ích, resort → toxic; sang trọng → chrome/royal; nóng, khẩn cấp → fire/rose.

## 4. Claude tự chọn từ khoá và mẫu

Đọc lời thoại theo từng câu. Mỗi **ý chính** thành 1 cụm, khoảng 1 cụm mỗi 2–4 giây. Không phải câu nào cũng cần cụm; ưu tiên câu có con số, lợi ích, câu hook và câu kêu gọi hành động.

- **Chữ chính** là từ mang nghĩa nặng nhất, dài 1–3 từ (danh từ hoặc con số).
- **Chữ dẫn** là 1–3 từ đứng ngay trước chữ chính.
- **Chữ phụ** là cụm bổ nghĩa đứng ngay sau. Chữ được giữ đúng như người nói, không viết lại.

| Nội dung câu | Mẫu nên dùng |
|---|---|
| Con số, giá tiền ("chỉ từ 500 triệu", "100 tỷ") | CK-14, CK-15, CK-01 |
| Tên dự án, địa danh, tiện ích | CK-11, CK-12, CK-20 |
| So sánh / hai vế ("để ở thì tiện, cho thuê thì tốt") | CK-13 |
| Xu hướng, cảm xúc mạnh ("tăng nhiệt", "hạng sang") | CK-16, CK-10 |
| Liệt kê ("3 lý do", "3 dự án") | CK-17, CK-18, CK-02 |
| Câu hook mở đầu | CK-01, CK-03, CK-05 |
| Kêu gọi (lưu lại, follow, liên hệ) | CK-07, CK-19 |
| Câu chuyển ý, triết lý | CK-04, CK-06, CK-08, CK-09 |

**Dòng phong cách:** nội dung bất động sản, bán hàng, năng lượng cao dùng **B**. Personal brand, chia sẻ, chậm rãi dùng **A**. Có thể trộn cả hai trong một video, nhưng không đổi dòng giữa hai cụm liền nhau quá nhiều lần. Hai cụm liền nhau không trùng mẫu. Khi người dùng yêu cầu riêng (từ khoá, màu, mẫu, vị trí), làm đúng theo yêu cầu đó.

## 5. Animation — 14 kiểu chữ vào (đo từ video mẫu)

**Nhịp:** cụm vào xong trong 0,4–0,6 giây, giữ yên, rồi ra. Dòng B ra bằng cắt ngang (`cut`); dòng A mờ nhòe và chuyển xám trong 0,3 giây (`blur`). Các lớp vào lần lượt, cách nhau 0,12 giây (B) hoặc 0,16 giây (A), hoặc đúng mốc từng từ nếu có `times`.

| Mã | Kiểu | Hợp với |
|---|---|---|
| A01 | mờ sang nét, nhích lên | mọi chữ |
| A02 | bóng xám → sáng đúng lúc nói (karaoke) | chữ dẫn dòng A |
| A03 | script tự viết (mặt nạ quét trái → phải) | R4, R5 |
| A04 | quét sọc dọc + lệch màu rồi khựng lại | in hoa R2 |
| A05 | trượt ngang kèm nhòe chuyển động (`dir` −1 từ trái, 1 từ phải) | R2, R3 |
| A06 | gõ chữ / hiện từng từ | chữ dẫn, dải từ rải |
| A07 | từng ký tự nảy vào, xoay | chữ phụ in hoa |
| A08 | neon bật điện, chớp tắt | số, giá |
| A09 | chữ nền đập vào (phóng 2,4 lần → 1) | lớp ghost |
| A10 | bật lên (back-out) | nhãn, icon, ô số, thanh |
| A11 | vẽ nét | icon, gạch lượn |
| A12 | giãn chữ thu lại | sans giãn chữ, serif |
| A13 | bóng kéo theo | điểm nhấn |
| A14 | ký tự nhảy loạn | hiệu ứng công nghệ |

Đổi kiểu chữ vào cho một lớp: `"anims": {"hero": "A07"}`. Đổi thuộc tính bất kỳ của một lớp: `"layers": {"hero": {"rot": -5, "fill": "p2"}}`.

## 6. 20 mẫu cụm (`presets/templates.json`)

- **Dòng A:** CK-01 số khổng lồ xếp chồng · CK-02 bậc thang · CK-03 kẹp giữa · CK-04 dẫn + script · CK-05 sans đậm + script đè · CK-06 serif + từ rải · CK-07 kêu gọi script đuôi lượn · CK-08 script đầu dòng + dòng đậm · CK-09 serif đè chéo sans · CK-10 script đổi màu + bậc thang.
- **Dòng B:** CK-11 script + in hoa + dòng giãn chữ · CK-12 in hoa + script màu cắt chéo · CK-13 hai dòng nóng–lạnh · CK-14 số + chữ nền viền rỗng + nhãn + icon · CK-15 chữ chính + icon neon · CK-16 chữ chính + nét gạch lượn + nhãn · CK-17 số khổng lồ + danh sách thanh · CK-18 tiêu đề + ô số · CK-19 kêu gọi liên hệ · CK-20 chữ lồng ảnh.

Mỗi mẫu có trường `example` liệt kê các slot cần điền. Slot nào bỏ trống thì lớp đó tự bị bỏ qua. Ví dụ đủ 20 mẫu nằm ở `examples/all_templates.json`.

Icon có sẵn: money, key, house, pin, bank, coin, chart, fire, star, phone, calendar, check, clock, arrowup, heart, gift, flagvn (sticker cờ).

## 7. Định dạng `spec.json`

```json
{
  "canvas": {"w": 1080, "h": 1920}, "fps": 30,
  "clusters": [
    {"id": "c1", "template": "CK-11", "style": "B", "palette": "gold",
     "t_in": 1.20, "t_out": 3.60,
     "texts": {"lead": "Luôn", "hero": "PHỒN VINH", "sub": "BÊN SÔNG SÀI GÒN"},
     "times": {"lead": 1.20, "hero": 1.45, "sub": 2.10},
     "pos": "lower"},
    {"id": "c2", "template": "CK-14", "palette": "gold", "t_in": 4.0, "t_out": 6.8,
     "texts": {"lead": "Chỉ từ", "hero": "500.000.000", "badge": "sở hữu ngay"}, "icon": "key"}
  ]
}
```

| Trường | Ý nghĩa |
|---|---|
| `t_in` / `t_out` | giây trên timeline của video **đã dựng** |
| `times` | mốc bắt đầu của từng slot, lấy theo từ được nói; không có thì các lớp vào lần lượt tự động |
| `pos` | `upper` (Y≈470) · `middle` (≈880) · `lower` (≈1130, mặc định) · hoặc `{"x":…, "y":…}`. Đặt sao cho không che mặt người nói (mặt thường ở Y 450–650) |
| `size` | cỡ chữ chính tính bằng px (mặc định 165 cho B, 150 cho A); cụm tự co lại cho vừa `maxW` 780 / `maxH` 560 |
| `exit` | `cut` hoặc `blur` |
| `image` | ảnh lồng trong chữ (CK-20), đường dẫn tương đối theo file spec |
| `fontRoles` | đổi font cho một vai trò riêng trong video này |

`render.mjs` cảnh báo khi: thiếu mẫu, hai cụm chồng thời gian, hai cụm liền nhau trùng mẫu hoặc trùng màu, cụm lấn vùng an toàn. Sửa hết cảnh báo trước khi render bản cuối.
