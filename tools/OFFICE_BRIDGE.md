# Nối Văn phòng 3D với pipeline affiliate thật (Telegram + aff-do-nam)

Văn phòng 3D ở chế độ **Live** hiển thị đúng những gì đang xảy ra thật:

- Anh nhắn bot Telegram → nhân vật **Anh** (phòng Giám đốc) hiện bong bóng tin đó.
- Bot trả lời / pipeline chạy tới bước nào → đúng agent hiện bong bóng câu đó, ngồi gõ, mang việc sang bàn người kế tiếp:

| Nhân vật | Bước thật trong skill `aff-do-nam` | Nhận ra từ |
|---|---|---|
| Ngọc · Content · Kịch bản | Phân tích + 3 kịch bản | `plan.json` |
| Quân · Tạo ảnh · ChatGPT | Ảnh D1/D2 trên ChatGPT web | `kbN/d1.png`, `d2.png` |
| Hiếu · Audit nội dung | Audit ảnh, audit video | `status.json`: `d1_img`, `d2_img`, `audit_video` |
| Tâm · Video · Flow | Clip 8s trên Flow, ghép 16s (ra Studio) | `d1.mp4`, `d2.mp4`, `final.mp4`, `d1_vid`, `d2_vid`, `final` |
| Thảo · Đăng TikTok | Lên lịch đăng TikTok Studio | `posted`, `ket_qua.json` |

```
máy anh (Windows)                                   điện thoại anh
telegram_bot.py ──push()──┐
office_bridge.py watch ───┼──► Firestore (office_rooms/<mã phòng>/feed) ──► Văn phòng 3D (Firebase Hosting)
claude -p (skill) ──say───┘
```

Trang Artifact trên claude.ai **không** dùng được chế độ này: trang đó bị chặn kết nối ra ngoài, nên văn phòng
Live chạy trên Firebase Hosting của dự án `restaurant-app-24e87`.

## 1. Mở quyền Firestore cho phòng (làm 1 lần, trên Firebase Console)

Firebase Console → dự án **restaurant-app-24e87** → Firestore Database → **Rules**.
Thêm khối sau vào **bên trong** `match /databases/{database}/documents { ... }` (giữ nguyên các quy tắc khác), rồi **Publish**:

```
    // Văn phòng 3D: ai có mã phòng (>= 24 ký tự, bí mật) mới đọc/ghi được. Chỉ thêm tin, không sửa/xoá.
    match /office_rooms/{room}/feed/{msg} {
      allow read: if room.size() >= 24;
      allow create: if room.size() >= 24
        && request.resource.data.keys().hasOnly(['at', 'kind', 'agent', 'text', 'ma_sp', 'kb'])
        && request.resource.data.at is int
        && request.resource.data.kind in ['anh', 'bot', 'say', 'step']
        && request.resource.data.text is string
        && request.resource.data.text.size() <= 4000;
      allow update, delete: if false;
    }
```

Lưu ý: hiện Firestore của dự án đang chặn mọi truy cập không đăng nhập (kể cả bộ sưu tập `restaurant`
của app nhà hàng) — có thể chế độ thử nghiệm đã hết hạn. Khối trên chỉ mở riêng cho văn phòng.

## 2. Cài cầu nối trên máy chạy bot

1. Chép `tools/office_bridge.py` vào `AFFILIATE/automation/office_bridge.py`.
2. Chạy thử: `python automation/office_bridge.py test` → in ra **link văn phòng** (có `?room=...`). Mã phòng lưu ở
   `automation/office_bridge.json` — giữ bí mật, ai có link là xem được tin.
3. Trong `automation/telegram_bot.py`:
   ```python
   from office_bridge import push   # đầu file

   # nơi nhận tin anh gửi (text, ảnh kèm chú thích, link TikTok Shop):
   push(text, kind="anh")

   # trong hàm send(chat, text, ...) — mọi tin bot gửi anh:
   push(text, kind="bot")
   ```
   `push()` chạy nền và nuốt mọi lỗi mạng, không làm chậm hay dừng bot.
4. Chạy theo dõi thư mục song song với bot (cùng lúc khởi động bot):
   `python automation/office_bridge.py watch` — lần đầu chỉ ghi nhận hiện trạng, từ đó mỗi thay đổi thật trong
   `san_pham/` mới được đẩy lên.
5. (Tuỳ chọn) Thêm vào SKILL.md của `aff-do-nam` để agent tự báo bằng giọng của mình, ví dụ cuối bước 1:
   `python automation/office_bridge.py say ngoc "Xong 3 kịch bản cho <ma_sp>: ..."`
   (tên: `ngoc` kịch bản, `quan` ảnh, `hieu` audit, `tam` video, `thao` đăng).

## 3. Đưa văn phòng lên mạng (Firebase Hosting)

Trên máy có quyền Firebase của dự án:
```
git clone <repo> && cd restaurant-app && git checkout claude/virtual-office-3d-agents-ycc9al
npm install
npm run build
npx firebase-tools login           # lần đầu
npx firebase-tools deploy --only hosting
```
Sau đó mở link mà bước 2.2 in ra trên điện thoại:
`https://restaurant-app-24e87.web.app/office.html?room=<mã phòng>`.

## Kiểm tra trên máy dev (không cần Firestore)

`npm run dev` rồi mở `http://localhost:5173/office.html?room=thu_nghiem_abcdefghijklmnop&mock` — phát lại một chuỗi
tin mẫu để xem giao diện. Tham số `mock` chỉ có tác dụng khi chạy dev.
