# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# 🏢 Văn phòng Agent 3D (`/office.html`)

Văn phòng ảo 3D phong cách chibi dễ thương: 17 nhân viên là các agent làm việc trong 6 phòng ban
(Kỹ thuật, Marketing, Affiliate, Kinh doanh, Kế toán, Giám đốc, Nhân sự) cùng Phòng họp, Studio Live và Pantry.
Các agent tự làm việc, đi lại và trao đổi với nhau theo thời gian thực.

```bash
npm install
npm run dev        # mở http://localhost:5173/office.html (trên điện thoại: npm run dev -- --host)
```

## Mô phỏng
- **Dự án đi qua các phòng ban**: khách gửi yêu cầu → Kinh doanh trao đổi với Kỹ thuật → Kỹ thuật lập trình
  → bàn giao Marketing → Marketing làm truyền thông → Affiliate chạy chiến dịch qua KOC → báo số đơn cho Kinh doanh chốt hợp đồng → Kế toán xuất hoá đơn → báo cáo CEO.
- **Sự kiện ngẫu nhiên**: hỏi ý kiến đồng nghiệp cùng phòng, nghỉ cà phê ở pantry (đi một mình hoặc rủ nhau),
  HR đi hỏi thăm, sếp đi một vòng, họp giao ban định kỳ, team Affiliate ra Studio livestream chốt đơn.
- Đồng hồ: 1 giây thực = 1 phút trong văn phòng (08:00 → 18:00), có thể tăng tốc 2x/4x hoặc tạm dừng.

## Điều khiển trên điện thoại
- 1 ngón kéo bản đồ, 2 ngón chụm để zoom / xoay (nút ✋/🔄 để đổi sang 1 ngón xoay camera).
- Chạm vào nhân viên để xem thẻ thông tin, camera tự theo dõi; có thể cho nghỉ ☕ hoặc đi trao đổi 💬.
- Thanh chip phía trên để bay nhanh tới từng phòng; nút 📩 tạo dự án mới, 📣 triệu tập họp, 🔴 bắt đầu livestream.
- Bảng dưới: 💬 nhật ký trao đổi, 👥 trạng thái nhân viên, 📁 tiến độ dự án.

## Cấu trúc mã (`src/office`)
| File | Vai trò |
| --- | --- |
| `layout.js` | Bố cục phòng, bàn ghế, chỗ ngồi họp/pantry, danh sách nhân viên |
| `sim.js` | Bộ máy mô phỏng (hàng đợi hành động của agent, điều phối dự án, sự kiện) — thuần JS, không phụ thuộc React |
| `dialogues.js` | Kịch bản hội thoại tiếng Việt |
| `Scene.jsx` / `Agent.jsx` | Đồ hoạ 3D (react-three-fiber) |
| `OfficeApp.jsx` | Canvas, camera cảm ứng và giao diện |

Muốn agent "thông minh" thật: thay các câu thoại mẫu trong `sim.js` (`visit` / `talk`) bằng lời gọi tới một LLM API
qua backend của bạn.
