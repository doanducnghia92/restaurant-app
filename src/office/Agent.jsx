import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { mat } from "./materials";
import { ZONES } from "./layout";

const g = {
  body: new THREE.CapsuleGeometry(0.24, 0.2, 6, 14),
  head: new THREE.SphereGeometry(0.36, 24, 18),
  hair: new THREE.SphereGeometry(0.385, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
  hairBack: new THREE.SphereGeometry(0.37, 18, 12, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.35, Math.PI * 0.5),
  limb: new THREE.CapsuleGeometry(0.075, 0.18, 4, 8),
  dot: new THREE.SphereGeometry(1, 10, 8),
  ring: new THREE.RingGeometry(0.42, 0.55, 32),
  hit: new THREE.CylinderGeometry(0.6, 0.6, 1.8, 8),
  cup: new THREE.CylinderGeometry(0.06, 0.05, 0.12, 10),
  band: new THREE.TorusGeometry(0.39, 0.035, 8, 20, Math.PI),
  shadow: new THREE.CircleGeometry(0.38, 20),
};
const black = new THREE.MeshBasicMaterial({ color: "#2a2233" });
const white = new THREE.MeshBasicMaterial({ color: "#ffffff" });
const blush = new THREE.MeshBasicMaterial({ color: "#ff9aa8", transparent: true, opacity: 0.7 });
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const shadowMat = new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.14, depthWrite: false });

const HTML_STYLE = { pointerEvents: "none" };
const Z_RANGE = [20, 10];
const TAG_POS = [0, 1.9, 0];

export default memo(function Agent({ agent, selected, onSelect }) {
  const root = useRef();
  const bodyG = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();
  const headG = useRef();
  const bubbleEl = useRef();
  const barEl = useRef();
  const fillEl = useRef();
  const cupRef = useRef();
  const ringRef = useRef();
  const last = useRef({ bubble: undefined, prog: undefined });
  const phase = useRef(Number(agent.id.slice(1)) * 1.7);

  useFrame((state, dt) => {
    const a = agent;
    const t = state.clock.elapsedTime + phase.current;
    root.current.position.set(a.pos.x, 0, a.pos.z);
    root.current.rotation.y = a.rot;

    const walking = a.pose === "walk";
    const sitting = a.pose === "sit";
    const swing = walking ? Math.sin(t * 11) * 0.7 : 0;
    const k = Math.min(1, dt * 12);

    // Chân
    const legTarget = sitting ? -1.45 : 0;
    legL.current.rotation.x += (legTarget + swing - legL.current.rotation.x) * k;
    legR.current.rotation.x += (legTarget - swing - legR.current.rotation.x) * k;

    // Thân + đầu
    const bob = walking ? Math.abs(Math.sin(t * 11)) * 0.06 : Math.sin(t * 2) * 0.012;
    bodyG.current.position.y = bob + (sitting ? 0.02 : 0);
    const talking = !!a.bubble && a.inTalk;
    headG.current.rotation.z = talking ? Math.sin(t * 3) * 0.08 : Math.sin(t * 1.3) * 0.03;
    headG.current.rotation.x = a.typing && sitting ? 0.12 : talking ? Math.sin(t * 6) * 0.05 : 0;

    // Tay
    let al = 0;
    let ar = 0;
    if (walking) {
      al = -swing * 0.8;
      ar = swing * 0.8;
    } else if (a.typing && sitting) {
      al = -1.1 + Math.sin(t * 18) * 0.12;
      ar = -1.1 + Math.cos(t * 18) * 0.12;
    } else if (a.cup) {
      ar = -1.3;
    } else if (talking) {
      ar = -0.5 + Math.sin(t * 4) * 0.35;
    }
    armL.current.rotation.x += (al - armL.current.rotation.x) * k;
    armR.current.rotation.x += (ar - armR.current.rotation.x) * k;
    cupRef.current.visible = a.cup;
    ringRef.current.visible = selected;
    if (selected) ringRef.current.rotation.z = t;

    // Bong bóng thoại + thanh tiến độ (cập nhật DOM trực tiếp, không re-render React)
    if (last.current.bubble !== a.bubble) {
      last.current.bubble = a.bubble;
      const el = bubbleEl.current;
      if (el) {
        el.textContent = a.bubble || "";
        el.style.display = a.bubble ? "block" : "none";
        el.classList.remove("pop");
        void el.offsetWidth;
        if (a.bubble) el.classList.add("pop");
      }
    }
    const prog = a.progress == null ? null : Math.round(a.progress * 20) / 20;
    if (last.current.prog !== prog && barEl.current) {
      last.current.prog = prog;
      barEl.current.style.display = prog == null ? "none" : "block";
      fillEl.current.style.width = `${(prog || 0) * 100}%`;
    }
  });

  const accent = ZONES[agent.dept].accent;
  const sel = (e) => {
    e.stopPropagation();
    onSelect(agent.id);
  };

  return (
    <group ref={root}>
      <mesh geometry={g.hit} material={hitMat} position={[0, 0.9, 0]} onClick={sel} />
      <mesh geometry={g.shadow} material={shadowMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} />
      <mesh ref={ringRef} geometry={g.ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} visible={false}>
        <meshBasicMaterial color="#ffcf33" toneMapped={false} />
      </mesh>
      <group ref={bodyG}>
        {/* chân (pivot ở hông) */}
        <group ref={legL} position={[-0.11, 0.4, 0]}>
          <mesh geometry={g.limb} material={mat("#4b4f6b")} position={[0, -0.17, 0]} castShadow />
          <mesh geometry={g.dot} material={mat("#3a3347")} position={[0, -0.34, 0.04]} scale={[0.09, 0.06, 0.12]} />
        </group>
        <group ref={legR} position={[0.11, 0.4, 0]}>
          <mesh geometry={g.limb} material={mat("#4b4f6b")} position={[0, -0.17, 0]} castShadow />
          <mesh geometry={g.dot} material={mat("#3a3347")} position={[0, -0.34, 0.04]} scale={[0.09, 0.06, 0.12]} />
        </group>
        {/* thân */}
        <mesh geometry={g.body} material={mat(agent.shirt)} position={[0, 0.66, 0]} castShadow />
        {agent.tie && <mesh geometry={g.dot} material={mat("#e04f5f")} position={[0, 0.68, 0.23]} scale={[0.05, 0.16, 0.03]} />}
        {/* tay (pivot ở vai) */}
        <group ref={armL} position={[-0.3, 0.84, 0]}>
          <mesh geometry={g.limb} material={mat(agent.shirt)} position={[0, -0.15, 0]} castShadow />
          <mesh geometry={g.dot} material={mat(agent.skin)} position={[0, -0.3, 0]} scale={0.075} />
        </group>
        <group ref={armR} position={[0.3, 0.84, 0]}>
          <mesh geometry={g.limb} material={mat(agent.shirt)} position={[0, -0.15, 0]} castShadow />
          <mesh geometry={g.dot} material={mat(agent.skin)} position={[0, -0.3, 0]} scale={0.075} />
          <mesh ref={cupRef} geometry={g.cup} material={mat("#ffffff")} position={[0, -0.34, 0.06]} visible={false} />
        </group>
        {/* đầu */}
        <group ref={headG} position={[0, 1.22, 0]}>
          <mesh geometry={g.head} material={mat(agent.skin)} castShadow />
          <mesh geometry={g.hair} material={mat(agent.hair)} position={[0, 0.02, -0.03]} rotation={[-0.35, 0, 0]} />
          {agent.long && <mesh geometry={g.hairBack} material={mat(agent.hair)} position={[0, -0.05, -0.04]} rotation={[0, Math.PI, 0]} scale={[1.02, 1.15, 1.02]} />}
          {agent.dept === "tech" && <mesh geometry={g.band} material={mat("#3b3f52")} position={[0, 0.02, 0]} />}
          {/* mắt */}
          <mesh geometry={g.dot} material={black} position={[-0.13, -0.02, 0.33]} scale={[0.05, 0.065, 0.03]} />
          <mesh geometry={g.dot} material={black} position={[0.13, -0.02, 0.33]} scale={[0.05, 0.065, 0.03]} />
          <mesh geometry={g.dot} material={white} position={[-0.115, 0.0, 0.355]} scale={0.016} />
          <mesh geometry={g.dot} material={white} position={[0.145, 0.0, 0.355]} scale={0.016} />
          {/* má hồng + miệng */}
          <mesh geometry={g.dot} material={blush} position={[-0.22, -0.1, 0.28]} scale={[0.06, 0.035, 0.02]} />
          <mesh geometry={g.dot} material={blush} position={[0.22, -0.1, 0.28]} scale={[0.06, 0.035, 0.02]} />
          <mesh geometry={g.dot} material={black} position={[0, -0.13, 0.34]} scale={[0.035, 0.018, 0.02]} />
        </group>
      </group>
      <Html position={TAG_POS} center distanceFactor={11} zIndexRange={Z_RANGE} style={HTML_STYLE}>
        <div className="agent-tag">
          <div ref={bubbleEl} className="bubble" style={{ display: "none" }} />
          <div ref={barEl} className="prog" style={{ display: "none" }}>
            <div ref={fillEl} style={{ background: accent }} />
          </div>
          <div className={`name ${selected ? "sel" : ""}`} style={{ "--c": accent }}>
            <b>{agent.name}</b>
            <span className="role">{agent.role}</span>
          </div>
        </div>
      </Html>
    </group>
  );
});
