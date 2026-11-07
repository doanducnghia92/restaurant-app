import { memo } from "react";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { mat, geo } from "./materials";
import {
  ZONE_LIST, ZONE_W, ZONE_D, CORRIDOR, FLOOR_W, FLOOR_D, ZONES, MEETING_TABLE, MEETING_SEATS, PANTRY, STUDIO, COLS,
} from "./layout";

function Box({ p, s, c, r, cast = true, opts }) {
  return <mesh geometry={geo.box} material={mat(c, opts)} position={p} scale={s} rotation={r} castShadow={cast} receiveShadow />;
}
function Cyl({ p, s, c, cast = true, opts }) {
  return <mesh geometry={geo.cyl} material={mat(c, opts)} position={p} scale={s} castShadow={cast} receiveShadow />;
}
function Ball({ p, s, c, cast = true }) {
  return <mesh geometry={geo.sphere} material={mat(c)} position={p} scale={s} castShadow={cast} />;
}

// ---- đồ nội thất ----
function Plant({ x, z, big }) {
  const k = big ? 1.3 : 1;
  return (
    <group position={[x, 0, z]} scale={k}>
      <Cyl p={[0, 0.2, 0]} s={[0.22, 0.4, 0.22]} c="#e9a37a" />
      <Ball p={[0, 0.62, 0]} s={[0.34, 0.34, 0.34]} c="#6cc788" />
      <Ball p={[0.15, 0.85, 0.05]} s={[0.24, 0.24, 0.24]} c="#7fd69a" />
      <Ball p={[-0.14, 0.8, -0.06]} s={[0.22, 0.22, 0.22]} c="#5dbb7b" />
    </group>
  );
}

export function Chair({ x, z, rot, color = "#7c86a8" }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Cyl p={[0, 0.17, 0]} s={[0.05, 0.3, 0.05]} c="#555a6e" />
      <Cyl p={[0, 0.02, 0]} s={[0.26, 0.04, 0.26]} c="#555a6e" />
      <Box p={[0, 0.36, 0]} s={[0.5, 0.08, 0.46]} c={color} />
      <Box p={[0, 0.66, -0.25]} s={[0.48, 0.5, 0.08]} c={color} />
    </group>
  );
}

const SCREEN = { aff: "#9ff0e2", tech: "#8fd3ff", mkt: "#ffb3d1", sales: "#ffd59a", fin: "#a8f0c2", ceo: "#cbb8ff", hr: "#fff0a0" };

function Desk({ seat, dept }) {
  // nhóm bàn quay theo hướng nhân viên ngồi (local +z = phía trước mặt nhân viên)
  return (
    <group position={[seat.deskX, 0, seat.deskZ]} rotation={[0, seat.rot, 0]}>
      <Box p={[0, 0.7, 0]} s={[1.6, 0.07, 0.8]} c="#f4d6ae" />
      {[[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]].map(([lx, lz], i) => (
        <Box key={i} p={[lx, 0.34, lz]} s={[0.07, 0.68, 0.07]} c="#d9b98f" cast={false} />
      ))}
      {/* màn hình */}
      <Box p={[0, 0.76, 0.2]} s={[0.22, 0.04, 0.16]} c="#3b3f52" />
      <Box p={[0, 0.88, 0.22]} s={[0.05, 0.22, 0.05]} c="#3b3f52" />
      <Box p={[0, 1.07, 0.2]} s={[0.78, 0.46, 0.05]} c="#3b3f52" />
      <mesh position={[0, 1.07, 0.172]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.7, 0.38]} />
        <meshBasicMaterial color={SCREEN[dept] || "#bde"} toneMapped={false} />
      </mesh>
      {/* bàn phím + cốc */}
      <Box p={[0, 0.75, -0.15]} s={[0.5, 0.03, 0.16]} c="#ffffff" cast={false} />
      <Cyl p={[0.6, 0.8, -0.05]} s={[0.06, 0.12, 0.06]} c={SCREEN[dept] || "#fff"} cast={false} />
    </group>
  );
}

function Wall({ x, z, w, d, h = 1.1 }) {
  return (
    <group>
      <Box p={[x, h / 2, z]} s={[w, h, d]} c="#fffaf3" />
      <Box p={[x, h + 0.03, z]} s={[w + 0.02, 0.06, d + 0.02]} c="#e9ddcc" cast={false} />
    </group>
  );
}

// Biển tên phòng vẽ bằng canvas -> co giãn tự nhiên theo 3D, không đè lên UI
const signCache = new Map();
function signTexture(zone) {
  if (signCache.has(zone.id)) return signCache.get(zone.id);
  const W = 512;
  const H = 128;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  const r = 52;
  const pill = (y, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(8, y, W - 16, H - 28, r);
    ctx.fill();
  };
  pill(18, zone.accent);
  pill(8, "#ffffff");
  ctx.fillStyle = zone.accent;
  ctx.font = "800 54px Nunito, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${zone.emoji} ${zone.name}`, W / 2, 8 + (H - 28) / 2 + 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  signCache.set(zone.id, tex);
  return tex;
}

function ZoneShell({ zone }) {
  const dir = zone.row === "top" ? 1 : -1;
  const back = zone.z - (dir * ZONE_D) / 2;
  const front = zone.z + (dir * ZONE_D) / 2;
  const gap = 2.6;
  const seg = (ZONE_W - gap) / 2;
  return (
    <group>
      <Box p={[zone.x, 0.015, zone.z]} s={[ZONE_W - 0.5, 0.03, ZONE_D - 0.5]} c={zone.carpet} cast={false} />
      <Wall x={zone.x} z={back} w={ZONE_W} d={0.16} h={1.5} />
      <Wall x={zone.x - ZONE_W / 2 + seg / 2} z={front} w={seg} d={0.12} h={0.55} />
      <Wall x={zone.x + ZONE_W / 2 - seg / 2} z={front} w={seg} d={0.12} h={0.55} />
      <Billboard position={[zone.x, 2.3, back]}>
        <mesh>
          <planeGeometry args={[3.2, 0.8]} />
          <meshBasicMaterial map={signTexture(zone)} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  );
}

function SideWalls() {
  // vách ngăn giữa các phòng + tường ngoài hai đầu
  const walls = [];
  const xs = [...COLS.map((x) => x - ZONE_W / 2), FLOOR_W / 2];
  xs.forEach((x, i) => {
    const h = i === 0 || i === xs.length - 1 ? 1.5 : 1.1;
    walls.push(<Wall key={`t${i}`} x={x} z={-(CORRIDOR + ZONE_D / 2)} w={0.16} d={ZONE_D} h={h} />);
    walls.push(<Wall key={`b${i}`} x={x} z={CORRIDOR + ZONE_D / 2} w={0.16} d={ZONE_D} h={h} />);
  });
  return <>{walls}</>;
}

function MeetingRoom() {
  const t = MEETING_TABLE;
  const z = ZONES.meeting;
  return (
    <group>
      <Box p={[t.x, 0.72, t.z]} s={[t.w, 0.08, t.d]} c="#ffffff" />
      <Cyl p={[t.x - 1.2, 0.36, t.z]} s={[0.1, 0.7, 0.1]} c="#c9ced8" />
      <Cyl p={[t.x + 1.2, 0.36, t.z]} s={[0.1, 0.7, 0.1]} c="#c9ced8" />
      {MEETING_SEATS.map((s, i) => (
        <Chair key={i} x={s.x} z={s.z} rot={s.rot} color={i === 0 ? "#8a6cf0" : "#9fb1c4"} />
      ))}
      {/* bảng trắng + TV */}
      <Box p={[z.x - 1.8, 1.25, z.z + ZONE_D / 2 - 0.2]} s={[2.2, 1.0, 0.06]} c="#ffffff" />
      <Box p={[z.x - 1.8, 1.25, z.z + ZONE_D / 2 - 0.16]} s={[2.35, 1.12, 0.04]} c="#9fb1c4" cast={false} />
      <Box p={[z.x + 1.8, 1.2, z.z + ZONE_D / 2 - 0.2]} s={[1.8, 1.0, 0.08]} c="#2d3142" />
      <mesh position={[z.x + 1.8, 1.2, z.z + ZONE_D / 2 - 0.25]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.65, 0.85]} />
        <meshBasicMaterial color="#9fe0ff" toneMapped={false} />
      </mesh>
      <Plant x={z.x - ZONE_W / 2 + 0.6} z={z.z + ZONE_D / 2 - 0.6} />
    </group>
  );
}

function Pantry() {
  const c = PANTRY.counter;
  const t = PANTRY.table;
  const s = PANTRY.sofa;
  return (
    <group>
      <Box p={[c.x, 0.5, c.z]} s={[4.6, 1.0, 0.8]} c="#ffffff" />
      <Box p={[c.x, 1.02, c.z]} s={[4.7, 0.06, 0.9]} c="#c9915f" cast={false} />
      {/* máy pha cà phê */}
      <Box p={[c.x - 1.2, 1.3, c.z + 0.1]} s={[0.5, 0.5, 0.4]} c="#3b3f52" />
      <Cyl p={[c.x - 1.2, 1.12, c.z - 0.15]} s={[0.07, 0.12, 0.07]} c="#ffffff" />
      {/* lò vi sóng + bánh */}
      <Box p={[c.x + 0.6, 1.22, c.z + 0.1]} s={[0.6, 0.35, 0.4]} c="#e8e8f0" />
      <Cyl p={[c.x + 1.6, 1.1, c.z]} s={[0.3, 0.06, 0.3]} c="#ffffff" />
      <Ball p={[c.x + 1.55, 1.17, c.z]} s={[0.1, 0.06, 0.1]} c="#d9935a" />
      <Ball p={[c.x + 1.7, 1.17, c.z + 0.08]} s={[0.1, 0.06, 0.1]} c="#f0c27a" />
      {/* tủ lạnh */}
      <Box p={[c.x + 3.4, 0.95, c.z + 0.2]} s={[0.9, 1.9, 0.8]} c="#bfe6ff" />
      {/* bàn tròn */}
      <Cyl p={[t.x, 0.72, t.z]} s={[0.6, 0.06, 0.6]} c="#ffffff" />
      <Cyl p={[t.x, 0.36, t.z]} s={[0.07, 0.7, 0.07]} c="#c9915f" />
      {/* sofa */}
      <group position={[s.x, 0, s.z]}>
        <Box p={[0, 0.25, 0]} s={[1.0, 0.4, 2.4]} c="#ffb38a" />
        <Box p={[-0.42, 0.6, 0]} s={[0.25, 0.6, 2.4]} c="#ff9e70" />
        <Box p={[0, 0.5, -1.15]} s={[1.0, 0.35, 0.2]} c="#ff9e70" />
        <Box p={[0, 0.5, 1.15]} s={[1.0, 0.35, 0.2]} c="#ff9e70" />
      </group>
      <Plant x={s.x - 0.1} z={s.z + 2.1} big />
    </group>
  );
}

function Studio() {
  const b = STUDIO.backdrop;
  const t = STUDIO.table;
  const c = STUDIO.camera;
  return (
    <group>
      {/* phông nền + biển ON AIR */}
      <Box p={[b.x, 1.2, b.z]} s={[4.2, 2.4, 0.1]} c="#ffb3bd" />
      <Box p={[b.x, 1.2, b.z - 0.06]} s={[3.6, 1.8, 0.02]} c="#ffd6dc" cast={false} />
      <Box p={[b.x, 2.15, b.z - 0.1]} s={[1.1, 0.3, 0.06]} c="#e5484d" opts={{ emissive: "#ff2d3b", emissiveIntensity: 0.9 }} />
      {/* bàn sản phẩm */}
      <Box p={[t.x, 0.42, t.z]} s={[2.4, 0.84, 0.7]} c="#ffffff" />
      <Box p={[t.x - 0.8, 0.98, t.z]} s={[0.35, 0.28, 0.3]} c="#f2a03d" />
      <Box p={[t.x - 0.3, 0.95, t.z]} s={[0.25, 0.22, 0.25]} c="#12a594" />
      <Cyl p={[t.x + 0.3, 1.0, t.z]} s={[0.09, 0.32, 0.09]} c="#ef6fa3" />
      <Cyl p={[t.x + 0.55, 0.96, t.z]} s={[0.08, 0.24, 0.08]} c="#8a6cf0" />
      <Box p={[t.x + 0.9, 0.97, t.z]} s={[0.3, 0.26, 0.3]} c="#5b8def" />
      {/* vòng đèn + điện thoại quay */}
      <group position={[c.x, 0, c.z]}>
        <Cyl p={[0, 0.75, 0]} s={[0.03, 1.5, 0.03]} c="#3b3f52" />
        <Cyl p={[0, 0.02, 0]} s={[0.3, 0.04, 0.3]} c="#3b3f52" />
        <mesh position={[0, 1.6, 0]}>
          <torusGeometry args={[0.32, 0.05, 10, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff4d6" emissiveIntensity={1.2} />
        </mesh>
        <Box p={[0, 1.6, 0]} s={[0.12, 0.22, 0.02]} c="#2d3142" />
      </group>
      {/* ghế trợ lý + cây */}
      <Plant x={b.x - 3.6} z={b.z + 0.1} />
      <Plant x={b.x + 3.6} z={b.z + 0.1} big />
    </group>
  );
}

function AffiliateCorner() {
  const z = ZONES.aff;
  return (
    <group>
      {/* màn hình bảng xếp hạng KOC */}
      <Box p={[z.x + 4.1, 1.1, z.z + 1.5]} s={[0.08, 1.0, 1.7]} c="#2d3142" />
      <mesh position={[z.x + 4.05, 1.1, z.z + 1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.55, 0.85]} />
        <meshBasicMaterial color="#9ff0e2" toneMapped={false} />
      </mesh>
      {/* kệ hàng mẫu */}
      <group position={[z.x - 3.9, 0, z.z + 1.6]}>
        <Box p={[0, 0.7, 0]} s={[0.5, 1.4, 1.4]} c="#d9f5f0" />
        <Box p={[0, 0.5, -0.35]} s={[0.35, 0.25, 0.35]} c="#f2a03d" cast={false} />
        <Box p={[0, 0.5, 0.25]} s={[0.35, 0.3, 0.4]} c="#ef6fa3" cast={false} />
        <Box p={[0, 1.0, -0.2]} s={[0.35, 0.25, 0.5]} c="#5b8def" cast={false} />
        <Box p={[0, 1.0, 0.35]} s={[0.35, 0.2, 0.3]} c="#12a594" cast={false} />
      </group>
      <Plant x={z.x + ZONE_W / 2 - 0.6} z={z.z - ZONE_D / 2 + 0.6} />
    </group>
  );
}

function CeoRoom() {
  const z = ZONES.ceo;
  return (
    <group>
      {/* tủ sách */}
      <group position={[z.x - 3.4, 0, z.z + ZONE_D / 2 - 0.4]}>
        <Box p={[0, 0.8, 0]} s={[1.4, 1.6, 0.4]} c="#c9915f" />
        {[0.45, 0.95, 1.4].map((y, i) => (
          <group key={i}>
            <Box p={[-0.35, y, -0.1]} s={[0.12, 0.35, 0.25]} c={["#ef6fa3", "#5b8def", "#3fb873"][i]} cast={false} />
            <Box p={[-0.15, y, -0.1]} s={[0.12, 0.3, 0.25]} c={["#f2a03d", "#8a6cf0", "#ef6fa3"][i]} cast={false} />
            <Box p={[0.2, y, -0.1]} s={[0.12, 0.33, 0.25]} c={["#5b8def", "#f0c419", "#f2a03d"][i]} cast={false} />
          </group>
        ))}
      </group>
      {/* bàn tiếp khách */}
      <Cyl p={[z.x + 2.5, 0.35, z.z - 1.2]} s={[0.55, 0.06, 0.55]} c="#ffffff" />
      <Box p={[z.x + 2.5, 0.22, z.z - 0.1]} s={[1.8, 0.4, 0.7]} c="#b9a7f5" />
      <Plant x={z.x + 3.8} z={z.z + ZONE_D / 2 - 0.6} big />
      <Ball p={[z.x + 2.5, 0.45, z.z - 1.2]} s={[0.12, 0.12, 0.12]} c="#ffd166" />
    </group>
  );
}

function Decorations() {
  const t = ZONES;
  return (
    <group>
      <Plant x={t.tech.x - ZONE_W / 2 + 0.6} z={t.tech.z - ZONE_D / 2 + 0.6} big />
      <Plant x={t.mkt.x + ZONE_W / 2 - 0.6} z={t.mkt.z - ZONE_D / 2 + 0.6} />
      <Plant x={t.sales.x - ZONE_W / 2 + 0.6} z={t.sales.z - ZONE_D / 2 + 0.6} />
      <Plant x={t.fin.x + ZONE_W / 2 - 0.6} z={t.fin.z - ZONE_D / 2 + 0.6} big />
      <Plant x={t.hr.x + ZONE_W / 2 - 0.6} z={t.hr.z + ZONE_D / 2 - 0.6} />
      {/* tủ hồ sơ HR + kế toán */}
      <Box p={[t.hr.x - 3.6, 0.55, t.hr.z + 1.0]} s={[0.6, 1.1, 0.6]} c="#d0d6e2" />
      <Box p={[t.fin.x - 3.6, 0.55, t.fin.z - 1.0]} s={[0.6, 1.1, 0.6]} c="#d0d6e2" />
      {/* bảng ý tưởng marketing */}
      <Box p={[t.mkt.x + 4.1, 0.9, t.mkt.z + 1.8]} s={[0.06, 1.0, 1.4]} c="#ffffff" />
      <Box p={[t.mkt.x + 4.06, 1.1, t.mkt.z + 1.5]} s={[0.02, 0.2, 0.2]} c="#ffd166" cast={false} />
      <Box p={[t.mkt.x + 4.06, 0.8, t.mkt.z + 2.0]} s={[0.02, 0.2, 0.2]} c="#ff8fb8" cast={false} />
      <Box p={[t.mkt.x + 4.06, 1.15, t.mkt.z + 2.1]} s={[0.02, 0.2, 0.2]} c="#8fd3ff" cast={false} />
      {/* server rack của team tech */}
      <Box p={[t.tech.x + 4.0, 0.9, t.tech.z + 2.6]} s={[0.7, 1.8, 0.7]} c="#3b3f52" />
      {[0.5, 0.9, 1.3].map((y) => (
        <Box key={y} p={[t.tech.x + 4.0, y, t.tech.z + 2.96]} s={[0.4, 0.06, 0.02]} c="#6dff9e" cast={false} opts={{ emissive: "#3cff7a", emissiveIntensity: 0.8 }} />
      ))}
      {/* hành lang: bình nước + cây */}
      <group position={[-FLOOR_W / 2 + 0.6, 0, 0]}>
        <Box p={[0, 0.45, 0]} s={[0.4, 0.9, 0.4]} c="#ffffff" />
        <Cyl p={[0, 1.1, 0]} s={[0.18, 0.4, 0.18]} c="#9fdcff" opts={{ transparent: true, opacity: 0.8 }} />
      </group>
      <Plant x={FLOOR_W / 2 - 0.6} z={0} big />
    </group>
  );
}

export const Office = memo(function Office({ desks }) {
  return (
    <group>
      {/* nền ngoài trời */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#bfe6c6" />
      </mesh>
      {/* sàn văn phòng */}
      <Box p={[0, -0.06, 0]} s={[FLOOR_W + 0.6, 0.12, FLOOR_D + 0.6]} c="#f3e6d4" cast={false} />
      {/* thảm hành lang */}
      <Box p={[0, 0.005, 0]} s={[FLOOR_W - 0.6, 0.01, CORRIDOR * 2 - 0.6]} c="#eadac3" cast={false} />
      {ZONE_LIST.map((z) => <ZoneShell key={z.id} zone={z} />)}
      <SideWalls />
      {desks.map((s, i) => (
        <group key={i}>
          <Desk seat={s} dept={s.zone} />
          <Chair x={s.x} z={s.z} rot={s.rot} color={ZONES[s.zone].accent} />
        </group>
      ))}
      <MeetingRoom />
      <Pantry />
      <CeoRoom />
      <Studio />
      <AffiliateCorner />
      <Decorations />
    </group>
  );
});
