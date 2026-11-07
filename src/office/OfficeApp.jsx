import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OfficeSim, fmtClock, fmtMoney, projectStage, PIPELINE_LEN } from "./sim";
import { Office } from "./Scene";
import Agent from "./Agent";
import { ZONES, ZONE_LIST, FLOOR_W, FLOOR_D } from "./layout";
import { AffiliateStudio, STEPS } from "./ai/affiliate";
import AiPanel, { AiMini } from "./AiPanel";
import LivePanel from "./LivePanel";
import { liveRoom } from "./live/feed";
import { LiveSession } from "./live/session";
import "./office.css";

// Trạng thái camera dùng chung giữa UI và vòng render
const view = { follow: null, fly: null };

function SimRunner({ sim }) {
  useFrame((_, dt) => sim.update(dt));
  return null;
}

function CameraRig({ sim, touchMode }) {
  const controls = useRef();

  useFrame((state, dt) => {
    const camera = state.camera;
    const c = controls.current;
    if (!c) return;
    let goal = null;
    if (view.follow && sim) goal = sim.byId[view.follow]?.pos;
    else if (view.fly) goal = view.fly;
    if (goal) {
      const k = 1 - Math.exp(-dt * 4);
      const dx = (goal.x - c.target.x) * k;
      const dz = (goal.z - c.target.z) * k;
      c.target.x += dx;
      c.target.z += dz;
      camera.position.x += dx;
      camera.position.z += dz;
      const want = view.fly?.dist ?? (view.follow ? view.followDist : null);
      if (want) {
        const off = camera.position.clone().sub(c.target);
        const len = off.length();
        off.setLength(len + (want - len) * k);
        camera.position.copy(c.target).add(off);
        if (view.follow && Math.abs(want - len) < 0.1) view.followDist = null;
      }
      if (view.fly && Math.hypot(goal.x - c.target.x, goal.z - c.target.z) < 0.05) view.fly = null;
    }
    // Giữ camera trong phạm vi văn phòng
    const lx = FLOOR_W / 2 + 2;
    const lz = FLOOR_D / 2 + 2;
    const cx = THREE.MathUtils.clamp(c.target.x, -lx, lx) - c.target.x;
    const cz = THREE.MathUtils.clamp(c.target.z, -lz, lz) - c.target.z;
    if (cx || cz) {
      c.target.x += cx;
      c.target.z += cz;
      camera.position.x += cx;
      camera.position.z += cz;
    }
    c.update();
  });

  const pan = touchMode === "pan";
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      minDistance={5}
      maxDistance={55}
      minPolarAngle={0.2}
      maxPolarAngle={1.2}
      screenSpacePanning={false}
      panSpeed={1.2}
      touches={{ ONE: pan ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE, TWO: pan ? THREE.TOUCH.DOLLY_ROTATE : THREE.TOUCH.DOLLY_PAN }}
      mouseButtons={{ LEFT: pan ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: pan ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN }}
      onStart={() => { view.fly = null; }}
    />
  );
}

function useTick(ms = 400) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function Avatar({ agent, size = 34 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: agent.shirt }}>
      <span className="avatar-face" style={{ background: agent.skin, borderTopColor: agent.hair }} />
    </span>
  );
}

function ChatLog({ sim, onPick }) {
  const box = useRef();
  const stick = useRef(true);
  const last = sim.logs[sim.logs.length - 1]?.id;
  useEffect(() => {
    if (stick.current && box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [last]);
  return (
    <div
      className="list"
      ref={box}
      onScroll={(e) => {
        const el = e.currentTarget;
        stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      }}
    >
      {sim.logs.map((l) =>
        l.kind === "system" ? (
          <div key={l.id} className="log sys">
            <span className="time">{l.clock}</span> {l.text}
          </div>
        ) : (
          <div key={l.id} className="log" onClick={() => onPick(l.fromId)}>
            <Avatar agent={sim.byId[l.fromId]} size={28} />
            <div className="log-body">
              <div className="log-head">
                <b style={{ color: ZONES[l.dept].accent }}>{l.from}</b>
                {l.to && <span className="to"> → {l.to}</span>}
                {l.kind === "meeting" && <span className="to"> · 📋 họp</span>}
                {l.kind === "ai" && <span className="ai-tag">🤖 AI thật</span>}
                {l.kind === "tg" && <span className="ai-tag tg-tag">📱 Telegram</span>}
                <span className="time">{l.clock}</span>
              </div>
              <div className="log-text">{l.text}</div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function Staff({ sim, onPick, selected }) {
  return (
    <div className="list">
      {ZONE_LIST.filter((z) => z.type === "dept").map((z) => (
        <div key={z.id} className="group">
          <div className="group-title" style={{ color: z.accent }}>{z.emoji} {z.name}</div>
          {sim.inDept(z.id).map((a) => (
            <button key={a.id} className={`staff ${selected === a.id ? "on" : ""}`} onClick={() => onPick(a.id)}>
              <Avatar agent={a} />
              <span className="staff-info">
                <b>{a.name}</b> <small>{a.role}</small>{a.real && <span className="ai-tag">🤖 AI</span>}
                <span className="status">{a.status}</span>
              </span>
              {a.progress != null && <span className="mini-prog"><i style={{ width: `${a.progress * 100}%`, background: z.accent }} /></span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Projects({ sim }) {
  if (!sim.projects.length) return <div className="list empty">Chưa có dự án nào. Bấm 📩 để tạo!</div>;
  return (
    <div className="list">
      {sim.projects.map((p) => (
        <div key={p.id} className={`project ${p.finished ? "done" : ""}`}>
          <div className="project-head">
            <b>{p.name}</b>
            <span className="amount">{fmtMoney(p.amount)}</span>
          </div>
          <div className="project-sub">🏪 {p.client} · bắt đầu {p.startedAt}</div>
          <div className="bar"><i style={{ width: `${(p.finished ? 1 : p.step / PIPELINE_LEN) * 100}%` }} /></div>
          <div className="project-stage">{p.finished ? "✅ Hoàn thành" : `⏳ ${projectStage(p)}`}</div>
        </div>
      ))}
    </div>
  );
}

function AgentCard({ sim, agent, following, onFollow, onClose, toast, onOpenAi }) {
  const z = ZONES[agent.dept];
  const free = sim.available(agent);
  return (
    <div className="card" style={{ "--c": z.accent }}>
      <div className="card-top">
        <Avatar agent={agent} size={46} />
        <div className="card-info">
          <div><b>{agent.name}</b> <span className="badge">{z.emoji} {z.name}</span></div>
          <small>{agent.role}</small>
          <div className="status">{agent.status}</div>
        </div>
        <button className="icon" onClick={onClose} aria-label="Đóng">✕</button>
      </div>
      {agent.progress != null && (
        <div className="bar"><i style={{ width: `${agent.progress * 100}%`, background: z.accent }} /></div>
      )}
      <div className="card-stats">
        {agent.real ? "🤖 Agent AI — làm việc theo việc anh giao" : `💬 ${agent.stats.talks} lần trao đổi · ✅ ${agent.stats.tasks} việc xong`}
      </div>
      <div className="card-actions">
        <button onClick={onFollow} className={following ? "on" : ""}>{following ? "🎥 Đang theo" : "🎥 Theo dõi"}</button>
        {agent.real && <button onClick={onOpenAi}>🤖 Giao việc</button>}
        {!agent.real && <>
        <button disabled={!free} onClick={() => toast(sim.cmdCoffee(agent.id) ? `☕ ${agent.name} đi nghỉ giải lao` : "Pantry đang kín chỗ!")}>☕ Cho nghỉ</button>
        <button disabled={!free} onClick={() => toast(sim.cmdChat(agent.id) ? `💬 ${agent.name} đi trao đổi` : "Không ai rảnh lúc này")}>💬 Trao đổi</button>
        </>}
      </div>
    </div>
  );
}

export default function OfficeApp() {
  const sim = useMemo(() => new OfficeSim(), []);
  const desks = useMemo(() => sim.agents.map((a) => a.seat), [sim]);
  const [selected, setSelected] = useState(null);
  const [following, setFollowing] = useState(null);
  const [tab, setTab] = useState("chat");
  const [open, setOpen] = useState(false);
  const [touchMode, setTouchMode] = useState("pan");
  const [msg, setMsg] = useState(null);
  const [, force] = useState(0);
  const [aiView, setAiView] = useState("closed"); // closed | open | mini
  const studio = useMemo(() => new AffiliateStudio(sim), [sim]);
  // ?room=<mã phòng> -> chế độ LIVE: hiển thị pipeline aff-do-nam thật qua cầu nối Telegram/Firestore
  const live = useMemo(() => {
    const room = liveRoom();
    return room ? new LiveSession(sim, room) : null;
  }, [sim]);
  useEffect(() => {
    if (live) live.start();
    else studio.init();
    return () => live?.stop?.();
  }, [studio, live]);
  useTick(400);

  const portrait = typeof window !== "undefined" && window.innerHeight > window.innerWidth;
  const smallScreen = typeof window !== "undefined" && Math.min(window.innerWidth, window.innerHeight) < 700;

  const toastTimer = useRef();
  const toast = useCallback((text) => {
    setMsg(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMsg(null), 2200);
  }, []);

  const pick = useCallback((id) => {
    if (!id) return;
    setSelected(id);
    setFollowing(id);
    view.follow = id;
    view.followDist = 12;
    view.fly = null;
  }, []);

  // Thu nhỏ bảng AI và cho camera theo agent đang xử lý job
  const watchJob = (job) => {
    setAiView("mini");
    const role = STEPS.find((s) => s.key === job?.step)?.role || "script";
    pick(studio.agents[role].id);
  };

  const closeCard = () => {
    setSelected(null);
    setFollowing(null);
    view.follow = null;
  };

  const flyTo = (zone) => {
    setFollowing(null);
    view.follow = null;
    view.fly = zone ? { x: zone.x, z: zone.z, dist: portrait ? 17 : 14 } : { x: 0, z: 0, dist: portrait ? 56 : 40 };
  };

  const setSpeed = (s) => {
    sim.setSpeed(s);
    force((x) => x + 1);
  };

  const agent = selected ? sim.byId[selected] : null;
  const lastLog = sim.logs[sim.logs.length - 1];
  const activeProjects = sim.projects.filter((p) => !p.finished).length;

  return (
    <div className="office-app">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, smallScreen ? 1.5 : 2]}
        flat
        camera={{ fov: 45, position: portrait ? [36, 43, 0.01] : [0, 28, 28], near: 0.5, far: 220 }}
        onPointerMissed={() => closeCard()}
      >
        <color attach="background" args={["#d5ecff"]} />
        <fog attach="fog" args={["#d5ecff", 60, 120]} />
        <hemisphereLight args={["#ffffff", "#c8d4ff", 1.6]} />
        <directionalLight
          position={[14, 30, 16]}
          intensity={2.2}
          castShadow
          shadow-mapSize={smallScreen ? [1024, 1024] : [2048, 2048]}
          shadow-camera-left={-29}
          shadow-camera-right={29}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
          shadow-camera-near={1}
          shadow-camera-far={80}
          shadow-bias={-0.0006}
        />
        <SimRunner sim={sim} />
        <Office desks={desks} />
        {sim.agents.map((a) => (
          <Agent key={a.id} agent={a} selected={selected === a.id} onSelect={pick} />
        ))}
        <CameraRig sim={sim} touchMode={touchMode} />
      </Canvas>

      <div className="hud-top">
      <header className="topbar">
        <div className="brand">🏢 <span>Văn phòng Agent</span></div>
        <div className="clock">Ngày {sim.day} · {fmtClock(sim.clock)}</div>
        <div className="kpi">📁 {activeProjects} · ✅ {sim.done} · 💰 {fmtMoney(sim.revenue)} {live ? ` · 📱 Live (${live.items.length} tin)` : ` · 🎬 ${studio.list().filter((j) => j.status === "ready" || j.status === "posted").length} video AI`}</div>
        <div className="speed">
          <button className={sim.paused ? "on" : ""} onClick={() => setSpeed(0)} aria-label="Tạm dừng">{sim.paused ? "▶" : "❚❚"}</button>
          {[1, 2, 4].map((s) => (
            <button key={s} className={!sim.paused && sim.speed === s ? "on" : ""} onClick={() => setSpeed(s)}>{s}x</button>
          ))}
        </div>
      </header>

      <nav className="chips">
        <button onClick={() => flyTo(null)}>🗺️ Toàn cảnh</button>
        {ZONE_LIST.map((z) => (
          <button key={z.id} onClick={() => flyTo(z)} style={{ "--c": z.accent }}>{z.emoji} {z.name}</button>
        ))}
      </nav>
      </div>

      <div className="fabs">
        <button onClick={() => { sim.cmdProject(); toast("📩 Có khách hàng mới gửi yêu cầu!"); }} title="Dự án mới">📩<small>Dự án</small></button>
        <button onClick={() => toast(sim.cmdMeeting() ? "📣 Sếp triệu tập họp!" : "Chưa họp được (sếp bận / đang họp)")} title="Họp">📣<small>Họp</small></button>
        {live ? (
          <button className="fab-ai" onClick={() => setAiView("open")} title="Telegram phòng Affiliate">📱<small>Live</small></button>
        ) : (
          <button className="fab-ai" onClick={() => setAiView("open")} title="Phòng Affiliate AI">🤖<small>AI</small></button>
        )}
        <button onClick={() => { setTouchMode((m) => (m === "pan" ? "rotate" : "pan")); toast(touchMode === "pan" ? "1 ngón: xoay camera" : "1 ngón: kéo bản đồ"); }} title="Chế độ chạm">
          {touchMode === "pan" ? "✋" : "🔄"}<small>{touchMode === "pan" ? "Kéo" : "Xoay"}</small>
        </button>
      </div>

      {aiView === "open" && !live && (
        <AiPanel studio={studio} toast={toast} onClose={() => setAiView("closed")} onMinimize={() => setAiView("mini")} onWatch={watchJob} />
      )}
      {aiView === "mini" && !live && <AiMini studio={studio} onOpen={() => setAiView("open")} />}
      {aiView === "open" && live && (
        <LivePanel live={live} onClose={() => setAiView("closed")} onMinimize={() => setAiView("closed")} onPick={(id) => { setAiView("closed"); pick(id); }} />
      )}

      {msg && <div className="toast">{msg}</div>}

      {/* Bảng dưới */}
      <section className={`sheet ${open ? "open" : ""}`}>
        {agent && (
          <AgentCard
            sim={sim}
            agent={agent}
            following={following === agent.id}
            onClose={closeCard}
            toast={toast}
            onOpenAi={() => setAiView("open")}
            onFollow={() => {
              if (following === agent.id) {
                setFollowing(null);
                view.follow = null;
              } else pick(agent.id);
            }}
          />
        )}
        <button className="handle" onClick={() => setOpen((o) => !o)}>
          <span className="grip" />
          {!open && lastLog && (
            <span className="ticker">
              {lastLog.from ? <b style={{ color: ZONES[lastLog.dept].accent }}>{lastLog.from}: </b> : null}
              {lastLog.text}
            </span>
          )}
          {open && <span className="ticker muted">Chạm để thu gọn</span>}
        </button>
        {open && (
          <>
            <div className="tabs">
              <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>💬 Trao đổi</button>
              <button className={tab === "staff" ? "on" : ""} onClick={() => setTab("staff")}>👥 Nhân viên</button>
              <button className={tab === "proj" ? "on" : ""} onClick={() => setTab("proj")}>📁 Dự án</button>
            </div>
            {tab === "chat" && <ChatLog sim={sim} onPick={pick} />}
            {tab === "staff" && <Staff sim={sim} onPick={pick} selected={selected} />}
            {tab === "proj" && <Projects sim={sim} />}
          </>
        )}
      </section>
    </div>
  );
}
