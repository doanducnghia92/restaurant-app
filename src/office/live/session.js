// Biến tin thật (Telegram + tiến độ pipeline aff-do-nam) thành hành động của nhân vật 3D.
// Nguyên tắc: bong bóng & nhật ký chỉ hiện CÂU THẬT; hoạt hình (ngồi gõ, đi bàn giao, ra Studio)
// chỉ là minh hoạ cho bước đang diễn ra.
import { openFeed } from "./feed.js";
import { STUDIO_SPOTS } from "../layout.js";

const ORDER = ["script", "image", "audit", "video", "post"];
const ALIAS = { ngoc: "script", quan: "image", hieu: "audit", tam: "video", thao: "post" };

// Đoán agent theo nội dung khi tin không ghi rõ (thứ tự kiểm tra quan trọng)
const RULES = [
  ["post", /(đăng|lên lịch|giỏ hàng|caption|hashtag|tiktok studio|@\w+)/i],
  ["audit", /(audit|kiểm duyệt|chưa đạt|cho_duyet|chờ duyệt)/i],
  ["video", /(video|clip|flow|ghép|final\.mp4|tín dụng|token|veo)/i],
  ["image", /(ảnh|chatgpt|d1\.png|d2\.png)/i],
  ["script", /(kịch bản|phân tích|plan\.json|sản phẩm|nhận link)/i],
];

export function classify(text) {
  for (const [role, re] of RULES) if (re.test(text || "")) return role;
  return null;
}

const bubbleDur = (t) => Math.min(9, 2.8 + String(t).length * 0.045);

export class LiveSession {
  constructor(sim, room) {
    this.sim = sim;
    this.room = room;
    this.items = [];
    this.status = "connecting";
    this.version = 0;
    this.listeners = new Set();
    this.agents = Object.fromEntries(sim.agents.filter((a) => a.aiRole).map((a) => [a.aiRole, a]));
    this.lastRole = null;
    this.walking = false;
    this.clearTimers = {};
    this.studioTimer = null;

    // Nhân vật Giám đốc đóng vai "Anh" — người nhắn Telegram cho team
    const boss = sim.inDept("ceo")[0];
    boss.name = "Anh";
    boss.role = "Chủ kênh · Telegram";
    boss.real = true;
    boss.status = "Nhắn việc qua Telegram";
    this.boss = boss;
    // Phòng Affiliate chờ tin thật
    Object.values(this.agents).forEach((a) => (a.status = "Chờ tin từ Telegram"));
  }

  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getVersion = () => this.version;

  emit() {
    this.version++;
    this.listeners.forEach((f) => f());
  }

  async start() {
    try {
      this.stop = await openFeed(this.room, (ev, fresh) => this.handle(ev, fresh), (s) => {
        this.status = s;
        this.emit();
      });
    } catch (e) {
      this.status = e?.code || "error";
      this.emit();
    }
  }

  roleOf(ev) {
    const a = String(ev.agent || "").toLowerCase();
    if (ORDER.includes(a)) return a;
    if (ALIAS[a]) return ALIAS[a];
    return classify(ev.text) || this.lastRole || "script";
  }

  handle(ev, fresh) {
    const text = String(ev.text || "").trim();
    if (!text) return;
    const sim = this.sim;
    const item = { ...ev, text };

    if (ev.kind === "anh") {
      item.role = "boss";
      this.items.push(item);
      sim.log(this.boss, text, "tg", null);
      if (fresh) sim.aiBubble(this.boss.id, `📱 ${text}`, bubbleDur(text));
      this.trim();
      return;
    }

    const role = this.roleOf(ev);
    const a = this.agents[role];
    item.role = role;
    this.items.push(item);
    this.trim();
    sim.log(a, text, ev.kind === "bot" ? "tg" : "ai", ev.kind === "bot" ? this.boss : null);
    if (!fresh) {
      this.lastRole = role;
      return;
    }

    // Đang làm việc: ngồi gõ với nhãn là việc thật vừa báo, tự tắt sau 2 phút không có tin mới
    sim.aiSetTask(a.id, text.length > 40 ? `${text.slice(0, 39)}…` : text);
    clearTimeout(this.clearTimers[role]);
    this.clearTimers[role] = setTimeout(() => sim.aiSetTask(a.id, null), 120000);

    // Tâm làm clip ở Studio (Flow)
    if (role === "video") {
      if (a.at === "home" && !a.stayAway) sim.aiGo(a.id, STUDIO_SPOTS[0], "Ra Studio làm clip trên Flow");
      clearTimeout(this.studioTimer);
      this.studioTimer = setTimeout(() => sim.aiHome(a.id), 180000);
    }

    const prev = this.lastRole && this.lastRole !== role ? this.agents[this.lastRole] : null;
    this.lastRole = role;
    const show = () => sim.aiBubble(a.id, text.length > 140 ? `${text.slice(0, 138)}…` : text, bubbleDur(text));

    // Chuyển sang người khác trong quy trình -> người trước mang việc sang bàn (minh hoạ, không thêm lời thoại)
    if (prev && !this.walking && prev.at === "home") {
      this.walking = true;
      sim.aiHandoff(prev.id, a.id, [[0, `📦 ${ev.kb || ev.ma_sp || "bàn giao"}`]], { silent: true })
        .then(() => {
          this.walking = false;
          show();
        });
    } else show();
    this.emit();
  }

  trim() {
    if (this.items.length > 200) this.items.splice(0, this.items.length - 200);
    this.emit();
  }
}
