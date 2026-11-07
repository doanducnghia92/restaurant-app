import { createRoot } from "react-dom/client";
import OfficeApp from "./OfficeApp.jsx";

// Không dùng StrictMode ở đây: Html overlay của drei mount/unmount root riêng,
// chạy hai lần trong dev gây cảnh báo race condition.
createRoot(document.getElementById("root")).render(<OfficeApp />);
