// Bố cục văn phòng: 2 dãy phòng (trên / dưới) và 1 hành lang ở giữa (z ≈ 0).
// Mọi toạ độ là mét trên mặt sàn (x, z).

export const ZONE_W = 9;
export const ZONE_D = 8;
export const CORRIDOR = 1.5; // nửa bề rộng hành lang
export const COLS = [-18, -9, 0, 9, 18];
export const FLOOR_W = ZONE_W * COLS.length;
export const FLOOR_D = ZONE_D * 2 + CORRIDOR * 2;

const TOP = -(CORRIDOR + ZONE_D / 2); // tâm dãy trên
const BOTTOM = CORRIDOR + ZONE_D / 2; // tâm dãy dưới

export const ZONES = {
  tech: { id: "tech", name: "Kỹ thuật", emoji: "💻", carpet: "#cfe3ff", accent: "#5b8def", x: COLS[0], z: TOP, row: "top", type: "dept" },
  mkt: { id: "mkt", name: "Marketing", emoji: "🎨", carpet: "#ffd9e8", accent: "#ef6fa3", x: COLS[1], z: TOP, row: "top", type: "dept" },
  aff: { id: "aff", name: "Affiliate", emoji: "🔗", carpet: "#c9f3ec", accent: "#12a594", x: COLS[2], z: TOP, row: "top", type: "dept" },
  sales: { id: "sales", name: "Kinh doanh", emoji: "🤝", carpet: "#ffe8c2", accent: "#f2a03d", x: COLS[3], z: TOP, row: "top", type: "dept" },
  fin: { id: "fin", name: "Kế toán", emoji: "📊", carpet: "#d6f5e0", accent: "#3fb873", x: COLS[4], z: TOP, row: "top", type: "dept" },
  ceo: { id: "ceo", name: "Giám đốc", emoji: "👑", carpet: "#e8dcff", accent: "#8a6cf0", x: COLS[0], z: BOTTOM, row: "bottom", type: "dept" },
  hr: { id: "hr", name: "Nhân sự", emoji: "🧑‍🤝‍🧑", carpet: "#fff3b8", accent: "#e0b500", x: COLS[1], z: BOTTOM, row: "bottom", type: "dept" },
  meeting: { id: "meeting", name: "Phòng họp", emoji: "📋", carpet: "#dfe7ee", accent: "#6f8aa3", x: COLS[2], z: BOTTOM, row: "bottom", type: "meeting" },
  studio: { id: "studio", name: "Studio Live", emoji: "🎥", carpet: "#ffe0e3", accent: "#e5484d", x: COLS[3], z: BOTTOM, row: "bottom", type: "studio" },
  pantry: { id: "pantry", name: "Pantry", emoji: "☕", carpet: "#f4e1cf", accent: "#b97a4b", x: COLS[4], z: BOTTOM, row: "bottom", type: "pantry" },
};

export const ZONE_LIST = Object.values(ZONES);

// Hướng từ trong phòng ra hành lang: dãy trên = +z, dãy dưới = -z
export const towardCorridor = (zone) => (zone.row === "top" ? 1 : -1);

export function doorPoint(zone) {
  return { x: zone.x, z: towardCorridor(zone) === 1 ? -CORRIDOR - 0.4 : CORRIDOR + 0.4 };
}

export function corridorPoint(zone) {
  return { x: zone.x, z: 0 };
}

// Bàn làm việc: bàn nằm sát tường trong, nhân viên ngồi quay mặt vào bàn
const DESK_OFFSETS = { 1: [0], 2: [-1.6, 1.6], 3: [-2.8, 0, 2.8], 5: [-3.4, -1.7, 0, 1.7, 3.4] };

export function makeDesks(zone, count) {
  const dir = towardCorridor(zone);
  const deskZ = zone.z - dir * 2.3; // phía trong
  const seatZ = deskZ + dir * 0.95;
  const rot = dir === 1 ? Math.PI : 0; // quay mặt vào tường trong
  return DESK_OFFSETS[count].map((dx) => ({
    zone: zone.id,
    deskX: zone.x + dx,
    deskZ,
    x: zone.x + dx,
    z: seatZ,
    rot,
    sit: true,
    via: [{ x: zone.x + dx, z: seatZ + dir * 1.3 }],
  }));
}

// Chỗ đứng của người đến trao đổi, cạnh ghế của người được hỏi
export function visitorSpot(seat) {
  const zone = ZONES[seat.zone];
  const dir = towardCorridor(zone);
  const x = seat.x + 0.65;
  const z = seat.z + dir * 0.85;
  return {
    zone: seat.zone,
    x,
    z,
    rot: Math.atan2(seat.x - x, seat.z - z),
    sit: false,
    via: [{ x, z: seat.z + dir * 1.6 }],
  };
}

// Phòng họp
const M = ZONES.meeting;
export const MEETING_TABLE = { x: M.x, z: M.z + 0.3, w: 4, d: 1.6 };
const T = MEETING_TABLE;
export const MEETING_SEATS = [
  { x: T.x + 2.6, z: T.z, rot: -Math.PI / 2, via: [{ x: T.x + 2.6, z: T.z - 1.6 }] }, // đầu bàn (chủ trì)
  { x: T.x - 1.3, z: T.z - 1.1, rot: 0, via: [{ x: T.x - 1.3, z: T.z - 2.1 }] },
  { x: T.x, z: T.z - 1.1, rot: 0, via: [{ x: T.x, z: T.z - 2.1 }] },
  { x: T.x + 1.3, z: T.z - 1.1, rot: 0, via: [{ x: T.x + 1.3, z: T.z - 2.1 }] },
  { x: T.x - 2.6, z: T.z, rot: Math.PI / 2, via: [{ x: T.x - 2.6, z: T.z - 1.6 }] },
  { x: T.x - 0.8, z: T.z + 1.1, rot: Math.PI, via: [{ x: T.x - 3.4, z: T.z - 1.6 }, { x: T.x - 3.4, z: T.z + 1.9 }, { x: T.x - 0.8, z: T.z + 1.9 }] },
  { x: T.x + 0.8, z: T.z + 1.1, rot: Math.PI, via: [{ x: T.x + 3.4, z: T.z - 1.6 }, { x: T.x + 3.4, z: T.z + 1.9 }, { x: T.x + 0.8, z: T.z + 1.9 }] },
].map((s) => ({ ...s, zone: "meeting", sit: true }));

// Pantry
const P = ZONES.pantry;
export const PANTRY = {
  counter: { x: P.x, z: P.z + 3.2 },
  table: { x: P.x + 2.6, z: P.z - 0.6 },
  sofa: { x: P.x - 2.8, z: P.z - 0.3 },
};
export const PANTRY_SPOTS = [
  { x: P.x - 1.2, z: P.z + 2.3, rot: 0 },
  { x: P.x + 0.2, z: P.z + 2.3, rot: 0 },
  { x: P.x + 1.6, z: P.z + 2.3, rot: 0 },
  { x: P.x + 1.6, z: P.z - 0.6, rot: Math.PI / 2 },
  { x: P.x + 2.6, z: P.z - 1.6, rot: 0 },
  { x: P.x + 3.6, z: P.z - 0.6, rot: -Math.PI / 2 },
].map((s) => ({ ...s, zone: "pantry", sit: false, via: [] }));

// Studio livestream: chỗ đứng trước máy quay + chỗ trợ lý
const S = ZONES.studio;
export const STUDIO = {
  backdrop: { x: S.x, z: S.z + 3.6 },
  table: { x: S.x, z: S.z + 2.3 },
  camera: { x: S.x, z: S.z - 0.6 },
};
export const STUDIO_SPOTS = [
  { x: S.x - 0.5, z: S.z + 1.5, rot: Math.PI, via: [{ x: S.x - 1.6, z: S.z + 0.2 }] },
  { x: S.x + 1.4, z: S.z + 1.3, rot: Math.PI * 1.1, via: [{ x: S.x + 1.8, z: S.z + 0.2 }] },
  { x: S.x + 2.6, z: S.z - 0.2, rot: -Math.PI * 0.75, via: [] },
].map((s) => ({ ...s, zone: "studio", sit: false }));

// Danh sách nhân viên (agent)
const SKIN = ["#ffdcc2", "#f6c9a4", "#eab58f", "#ffe3cf"];
const ROSTER = [
  { dept: "tech", name: "Minh", role: "Tech Lead", hair: "#2b2b3a", shirt: "#5b8def" },
  { dept: "tech", name: "Khoa", role: "Lập trình viên", hair: "#6b3e26", shirt: "#7aa5f5" },
  { dept: "tech", name: "Vy", role: "QA Tester", hair: "#1e1e28", shirt: "#4c7be0", long: true },
  { dept: "mkt", name: "Linh", role: "Trưởng Marketing", hair: "#8a4b2a", shirt: "#ef6fa3", long: true },
  { dept: "mkt", name: "Tú", role: "Designer", hair: "#ff9f6b", shirt: "#f58cb8" },
  { dept: "mkt", name: "Hà", role: "Content Writer", hair: "#2b2b3a", shirt: "#e8548f", long: true },
  // Phòng Affiliate: agent AI thật (Claude), mỗi người một vai trong quy trình làm video TikTok
  { dept: "aff", name: "Ngọc", role: "AI Biên kịch", aiRole: "script", hair: "#c46a3a", shirt: "#3cc4b2", long: true },
  { dept: "aff", name: "Hiếu", role: "AI Kiểm duyệt", aiRole: "audit", hair: "#1e1e28", shirt: "#0e8a7c" },
  { dept: "aff", name: "Quân", role: "AI Thiết kế ảnh", aiRole: "image", hair: "#2b2b3a", shirt: "#12a594" },
  { dept: "aff", name: "Tâm", role: "AI Dựng video", aiRole: "video", hair: "#3a2a1a", shirt: "#18b8a5" },
  { dept: "aff", name: "Thảo", role: "AI Đăng TikTok", aiRole: "post", hair: "#5a3220", shirt: "#0b7a6e", long: true },
  { dept: "sales", name: "Nam", role: "Trưởng Kinh doanh", hair: "#1e1e28", shirt: "#f2a03d" },
  { dept: "sales", name: "Trang", role: "Account Manager", hair: "#5a3220", shirt: "#f7b65e", long: true },
  { dept: "sales", name: "Bảo", role: "Sales Executive", hair: "#3a2a1a", shirt: "#e48d22" },
  { dept: "fin", name: "Hương", role: "Kế toán trưởng", hair: "#2b2b3a", shirt: "#3fb873", long: true },
  { dept: "fin", name: "Đức", role: "Kế toán viên", hair: "#4a2f1d", shirt: "#5cc98a" },
  { dept: "ceo", name: "Sếp Long", role: "Giám đốc (CEO)", hair: "#9a9aa8", shirt: "#3b3561", tie: true },
  { dept: "hr", name: "Mai", role: "Trưởng Nhân sự", hair: "#6b3e26", shirt: "#f0c419", long: true },
  { dept: "hr", name: "Phúc", role: "Chuyên viên tuyển dụng", hair: "#1e1e28", shirt: "#e0b500" },
];

export function buildRoster() {
  const byDept = {};
  ROSTER.forEach((r) => (byDept[r.dept] = (byDept[r.dept] || 0) + 1));
  const desks = {};
  Object.entries(byDept).forEach(([d, n]) => (desks[d] = makeDesks(ZONES[d], n)));
  const used = {};
  return ROSTER.map((r, i) => {
    const k = used[r.dept] || 0;
    used[r.dept] = k + 1;
    return {
      ...r,
      id: `a${i}`,
      skin: SKIN[i % SKIN.length],
      real: !!r.aiRole,
      seat: desks[r.dept][k],
    };
  });
}

export function allDesks(roster) {
  return roster.map((a) => a.seat);
}
