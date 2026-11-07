// Bộ máy mô phỏng văn phòng: mỗi agent có hàng đợi hành động (đi, nói, làm việc,
// trao đổi, họp...). "Engine" điều phối dự án đi qua các phòng ban và sinh các
// sự kiện ngẫu nhiên (nghỉ cà phê, hỏi đồng nghiệp, HR thăm hỏi, họp giao ban).
import {
  ZONES, buildRoster, doorPoint, corridorPoint, visitorSpot, MEETING_SEATS, PANTRY_SPOTS,
} from "./layout.js";
import {
  TALKS, COFFEE_LINES, COFFEE_CHAT, WORK_THOUGHTS, MEETING_REPORT, PROJECT_NAMES, CLIENTS, pick, fill,
} from "./dialogues.js";

const WALK_SPEED = 2.1; // m/giây mô phỏng
const rand = (a, b) => a + Math.random() * (b - a);
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const lineDur = (text) => Math.min(5, Math.max(2.2, 1.4 + text.length * 0.05));

function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * Math.min(1, t);
}
const angleTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);

export function fmtMoney(million) {
  return million >= 1000 ? `${(million / 1000).toFixed(2).replace(/\.?0+$/, "")} tỷ` : `${million} triệu`;
}

export function fmtClock(min) {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const PIPELINE = [
  { kind: "work", dept: "sales", dur: 6, label: "Tiếp nhận yêu cầu {c}", stage: "Tiếp nhận" },
  { kind: "talk", from: "sales", to: "tech", key: "sales>tech", stage: "Trao đổi yêu cầu" },
  { kind: "work", dept: "tech", dur: 26, label: "Lập trình {p}", stage: "Phát triển" },
  { kind: "talk", from: "tech", to: "mkt", key: "tech>mkt", stage: "Bàn giao Marketing" },
  { kind: "work", dept: "mkt", dur: 16, label: "Truyền thông {p}", stage: "Truyền thông" },
  { kind: "talk", from: "mkt", to: "sales", key: "mkt>sales", stage: "Gửi tài liệu" },
  { kind: "work", dept: "sales", dur: 10, label: "Chốt hợp đồng {c}", stage: "Chốt hợp đồng" },
  { kind: "talk", from: "sales", to: "fin", key: "sales>fin", stage: "Chuyển kế toán" },
  { kind: "work", dept: "fin", dur: 8, label: "Xuất hoá đơn {p}", stage: "Thanh toán" },
  { kind: "talk", from: "fin", to: "ceo", key: "fin>ceo", stage: "Báo cáo CEO" },
];
export const PIPELINE_LEN = PIPELINE.length;

export class OfficeSim {
  constructor() {
    this.t = 0; // giây mô phỏng
    this.clock = 8 * 60; // phút trong ngày
    this.day = 1;
    this.speed = 1;
    this.paused = false;
    this.version = 0;
    this.logs = [];
    this.logId = 0;
    this.projects = [];
    this.projectId = 0;
    this.done = 0;
    this.revenue = 0;
    this.meeting = null;
    this.pantryUsed = new Set();
    this.timers = { project: 2, coffee: 9, peer: 5, hr: 16, ceo: 26, meeting: 75, pair: 30 };
    this.aiPending = []; // các lượt bàn giao thật giữa agent AI đang chờ thực hiện

    this.agents = buildRoster().map((r, i) => ({
      ...r,
      pos: { x: r.seat.x, z: r.seat.z },
      rot: r.seat.rot,
      targetRot: r.seat.rot,
      pose: "sit",
      typing: true,
      zone: r.dept,
      at: "home",
      leaveVia: [...r.seat.via].reverse(),
      lane: ((i % 5) - 2) * 0.28,
      queue: [],
      cur: null,
      locked: false,
      inTalk: false,
      bubble: null,
      bubbleUntil: 0,
      nextThought: rand(2, 12),
      status: r.real ? "Chờ việc" : "Đang làm việc",
      aiTask: null,
      stayAway: false,
      task: null,
      progress: null,
      cup: false,
      stats: { talks: 0, tasks: 0 },
    }));
    this.byId = Object.fromEntries(this.agents.map((a) => [a.id, a]));
    this.log(null, "🌅 Chào buổi sáng! Văn phòng bắt đầu ngày làm việc.", "system");
  }

  // ---------- tiện ích ----------
  touch() {
    this.version++;
  }

  log(agent, text, kind = "talk", to = null) {
    this.logs.push({
      id: ++this.logId,
      clock: fmtClock(this.clock),
      from: agent?.name ?? null,
      fromId: agent?.id ?? null,
      color: agent?.shirt ?? null,
      dept: agent?.dept ?? null,
      to: to?.name ?? null,
      text,
      kind,
    });
    if (this.logs.length > 120) this.logs.shift();
    this.touch();
  }

  say(agent, text, dur = lineDur(text)) {
    agent.bubble = text;
    agent.bubbleUntil = this.t + dur;
  }

  inDept(dept) {
    return this.agents.filter((a) => a.dept === dept);
  }

  // Agent AI thật (phòng Affiliate) không bị kịch bản ngẫu nhiên điều đi đâu cả
  available(a, allowReal = false) {
    return a && (allowReal || !a.real) && !a.locked && !a.cur && a.queue.length === 0 && a.at === "home";
  }

  freeIn(dept, exclude) {
    return shuffle(this.inDept(dept).filter((a) => a !== exclude && this.available(a)));
  }

  // ---------- vòng lặp ----------
  update(dtReal) {
    if (this.paused) return;
    const dt = Math.min(dtReal, 0.1) * this.speed;
    this.t += dt;
    this.clock += dt;
    if (this.clock >= 18 * 60) {
      this.clock = 8 * 60;
      this.day++;
      this.log(null, `🌅 Ngày làm việc thứ ${this.day} bắt đầu!`, "system");
    }
    for (const a of this.agents) this.stepAgent(a, dt);
    this.engine();
    this.stepAi();
    this.stepMeeting(dt);
  }

  stepAgent(a, dt) {
    if (a.bubble && this.t > a.bubbleUntil) a.bubble = null;
    a.rot = lerpAngle(a.rot, a.targetRot, dt * 8);

    if (!a.cur && a.queue.length && !a.locked) {
      a.cur = a.queue.shift();
      this.begin(a, a.cur);
    }
    if (a.cur) {
      if (this.run(a, a.cur, dt)) {
        a.cur = null;
        this.touch();
      }
      return;
    }
    if (a.real) {
      this.idleReal(a);
      return;
    }
    // Không có việc gì: về bàn hoặc làm việc tại chỗ
    if (a.at !== "home" && !a.locked) {
      a.queue.push({ t: "go", spot: a.seat, home: true, status: "Về chỗ ngồi" });
      return;
    }
    if (!a.inTalk) {
      a.pose = "sit";
      a.typing = true;
      a.targetRot = a.seat.rot;
      if (!a.locked) a.status = "Đang làm việc";
      if (this.t > a.nextThought) {
        this.say(a, pick(WORK_THOUGHTS[a.dept]), 2.4);
        a.nextThought = this.t + rand(9, 22);
      }
    }
  }

  route(a, spot) {
    const pts = [...a.leaveVia];
    if (a.zone !== spot.zone) {
      const from = ZONES[a.zone];
      const to = ZONES[spot.zone];
      const c1 = corridorPoint(from);
      const c2 = corridorPoint(to);
      pts.push(doorPoint(from), { x: c1.x, z: a.lane }, { x: c2.x, z: a.lane }, doorPoint(to));
    }
    pts.push(...spot.via, { x: spot.x, z: spot.z });
    return pts;
  }

  begin(a, act) {
    switch (act.t) {
      case "go":
        act.path = this.route(a, act.spot);
        a.leaveVia = [];
        a.pose = "walk";
        a.typing = false;
        a.cup = false;
        a.status = act.status || "Đang di chuyển";
        break;
      case "wait":
      case "say":
        act.left = act.dur;
        if (act.t === "say") {
          this.say(a, act.text, act.dur);
          if (act.log) this.log(a, act.text, act.log);
        }
        break;
      case "work":
        a.task = act.label;
        a.status = act.label;
        a.progress = 0;
        a.typing = true;
        a.pose = "sit";
        act.left = act.dur;
        this.touch();
        break;
      case "talk": {
        const b = act.partner;
        act.idx = -1;
        act.left = 0;
        a.inTalk = b.inTalk = true;
        a.typing = b.typing = false;
        a.status = `Trao đổi với ${b.name}`;
        b.status = `Trao đổi với ${a.name}`;
        a.targetRot = angleTo(a.pos, b.pos);
        b.targetRot = b.pose === "sit" && b.at === "home"
          ? lerpAngle(b.seat.rot, angleTo(b.pos, a.pos), 0.6)
          : angleTo(b.pos, a.pos);
        break;
      }
      case "meet":
        act.meeting.arrived.add(a.id);
        a.status = "Đang họp";
        a.typing = false;
        break;
      default:
        break;
    }
  }

  run(a, act, dt) {
    switch (act.t) {
      case "go": {
        let step = WALK_SPEED * dt;
        while (step > 0 && act.path.length) {
          const p = act.path[0];
          const dx = p.x - a.pos.x;
          const dz = p.z - a.pos.z;
          const d = Math.hypot(dx, dz);
          if (d <= step) {
            a.pos.x = p.x;
            a.pos.z = p.z;
            step -= d;
            act.path.shift();
          } else {
            a.pos.x += (dx / d) * step;
            a.pos.z += (dz / d) * step;
            a.targetRot = Math.atan2(dx, dz);
            step = 0;
          }
        }
        if (act.path.length) return false;
        const s = act.spot;
        a.zone = s.zone;
        a.targetRot = s.rot;
        a.pose = s.sit ? "sit" : "stand";
        a.leaveVia = [...s.via].reverse();
        a.at = act.home ? "home" : "away";
        if (act.home) a.status = a.real ? a.aiTask || "Chờ việc" : "Đang làm việc";
        return true;
      }
      case "wait":
      case "say":
        act.left -= dt;
        return act.left <= 0;
      case "call":
        act.fn();
        return true;
      case "hold":
        return act.until();
      case "work": {
        act.left -= dt;
        a.progress = Math.min(1, 1 - act.left / act.dur);
        if (this.t > a.nextThought) {
          this.say(a, pick(WORK_THOUGHTS[a.dept]), 2.2);
          a.nextThought = this.t + rand(6, 12);
        }
        if (act.left > 0) return false;
        a.progress = null;
        a.task = null;
        a.stats.tasks++;
        act.onDone?.();
        return true;
      }
      case "talk": {
        act.left -= dt;
        if (act.left > 0) return false;
        act.idx++;
        const b = act.partner;
        if (act.idx >= act.lines.length) {
          a.inTalk = b.inTalk = false;
          b.locked = false;
          a.stats.talks++;
          b.stats.talks++;
          if (b.at === "home") b.targetRot = b.seat.rot;
          act.onDone?.();
          return true;
        }
        const [who, raw] = act.lines[act.idx];
        const text = act.raw ? raw : fill(raw, act.ctx);
        const speaker = who === 0 ? a : b;
        const listener = who === 0 ? b : a;
        const dur = lineDur(text);
        this.say(speaker, text.length > 110 ? `${text.slice(0, 108)}…` : text, dur + 0.2);
        this.log(speaker, text, act.raw ? "ai" : "talk", listener);
        act.left = dur;
        return false;
      }
      case "meet":
        return act.meeting.done;
      default:
        return true;
    }
  }

  // ---------- điều phối ----------
  visit(a, b, lines, ctx, onDone, why, raw = false) {
    b.locked = true;
    const full = { A: a.name, B: b.name, ...ctx };
    a.queue.push(
      { t: "go", spot: visitorSpot(b.seat), status: why || `Đi gặp ${b.name}` },
      { t: "talk", partner: b, lines, ctx: full, onDone, raw },
    );
    this.touch();
  }

  engine() {
    const T = this.timers;
    for (const p of this.projects) if (!p.busy && !p.finished) this.tryStep(p);

    if (this.t > T.project) {
      if (this.projects.filter((p) => !p.finished).length < 3) this.newProject();
      T.project = this.t + rand(40, 75);
    }
    if (this.t > T.coffee) {
      this.coffeeBreak();
      T.coffee = this.t + rand(9, 16);
    }
    if (this.t > T.peer) {
      this.peerChat();
      T.peer = this.t + rand(12, 22);
    }
    if (this.t > T.pair) {
      this.coffeePair();
      T.pair = this.t + rand(45, 70);
    }
    if (this.t > T.hr) {
      const hr = this.freeIn("hr")[0];
      const target = shuffle(this.agents.filter((x) => x.dept !== "hr" && this.available(x)))[0];
      if (hr && target) this.visit(hr, target, pick(TALKS.hr), {}, null, `Hỏi thăm ${target.name}`);
      T.hr = this.t + rand(24, 40);
    }
    if (this.t > T.ceo) {
      const ceo = this.freeIn("ceo")[0];
      const target = shuffle(this.agents.filter((x) => x.dept !== "ceo" && this.available(x)))[0];
      if (ceo && target) this.visit(ceo, target, pick(TALKS.ceo), {}, null, `Đi một vòng, ghé ${target.name}`);
      T.ceo = this.t + rand(35, 55);
    }
    if (this.t > T.meeting) {
      T.meeting = this.t + (this.startMeeting() ? rand(110, 160) : 20);
    }
  }

  newProject() {
    const id = ++this.projectId;
    const p = {
      id,
      name: pick(PROJECT_NAMES),
      client: pick(CLIENTS),
      amount: Math.round(rand(5, 45)) * 10,
      step: 0,
      busy: false,
      finished: false,
      who: {},
      startedAt: fmtClock(this.clock),
    };
    this.projects.unshift(p);
    if (this.projects.length > 12) this.projects.pop();
    this.log(null, `📩 Khách hàng ${p.client} gửi yêu cầu: "${p.name}" (${fmtMoney(p.amount)})`, "system");
    return p;
  }

  pickFor(p, dept) {
    const pref = p.who[dept];
    if (this.available(pref)) return pref;
    return this.freeIn(dept)[0];
  }

  tryStep(p) {
    const s = PIPELINE[p.step];
    const ctx = { p: p.name, c: p.client, a: fmtMoney(p.amount) };
    const advance = () => {
      p.busy = false;
      p.step++;
      this.touch();
      if (p.step >= PIPELINE.length) this.finishProject(p);
    };
    if (s.kind === "work") {
      const a = this.pickFor(p, s.dept);
      if (!a) return;
      p.busy = true;
      p.who[s.dept] = a;
      a.queue.push({ t: "work", dur: s.dur * rand(0.85, 1.2), label: fill(s.label, ctx), onDone: advance });
    } else {
      const a = this.pickFor(p, s.from);
      if (!a) return;
      const b = this.pickFor(p, s.to);
      if (!b || b === a) return;
      p.busy = true;
      p.who[s.from] = a;
      p.who[s.to] = b;
      this.visit(a, b, pick(TALKS[s.key]), ctx, advance, `${s.stage}: ${p.name}`);
    }
  }

  finishProject(p) {
    p.finished = true;
    this.done++;
    this.revenue += p.amount;
    this.log(null, `🎉 Hoàn thành dự án "${p.name}" cho ${p.client}! +${fmtMoney(p.amount)}`, "system");
    const ceo = this.inDept("ceo")[0];
    this.say(ceo, "🎉 Tuyệt vời cả team!", 3);
    this.agents.forEach((a) => {
      if (a !== ceo && Math.random() < 0.5 && !a.bubble) this.say(a, pick(["🎉", "👏", "🥳", "🙌"]), 2.5);
    });
  }

  freePantrySpot(prefer) {
    const order = prefer ?? shuffle(PANTRY_SPOTS.map((_, i) => i));
    return order.find((i) => !this.pantryUsed.has(i));
  }

  coffeeBreak(agent) {
    const away = this.agents.filter((a) => a.at !== "home").length;
    if (!agent && away > 6) return false;
    const a = agent ?? shuffle(this.agents.filter((x) => this.available(x) && x.dept !== "ceo"))[0];
    const i = this.freePantrySpot();
    if (!a || i === undefined) return false;
    this.pantryUsed.add(i);
    a.queue.push(
      { t: "go", spot: PANTRY_SPOTS[i], status: "Nghỉ giải lao ☕" },
      { t: "call", fn: () => { a.cup = true; } },
      { t: "say", text: pick(COFFEE_LINES), dur: 3 },
      { t: "wait", dur: rand(3, 7) },
      { t: "call", fn: () => { this.pantryUsed.delete(i); a.cup = false; } },
    );
    this.touch();
    return true;
  }

  coffeePair() {
    const free = shuffle(this.agents.filter((x) => this.available(x) && x.dept !== "ceo"));
    const a = free[0];
    const b = free.find((x) => x.dept !== a?.dept);
    const ia = this.freePantrySpot([3, 0, 1]);
    const ib = ia === 3 ? this.freePantrySpot([5, 4]) : this.freePantrySpot([ia + 1, 2, 4]);
    if (!a || !b || ia === undefined || ib === undefined || ia === ib) return;
    this.pantryUsed.add(ia).add(ib);
    const pair = { bArrived: false, done: false };
    a.queue.push(
      { t: "go", spot: PANTRY_SPOTS[ia], status: `Cà phê với ${b.name}` },
      { t: "call", fn: () => { a.cup = true; } },
      { t: "hold", until: () => pair.bArrived },
      { t: "talk", partner: b, lines: pick(COFFEE_CHAT), ctx: { A: a.name, B: b.name }, onDone: () => { pair.done = true; } },
      { t: "call", fn: () => { this.pantryUsed.delete(ia); a.cup = false; } },
    );
    b.queue.push(
      { t: "go", spot: PANTRY_SPOTS[ib], status: `Cà phê với ${a.name}` },
      { t: "call", fn: () => { pair.bArrived = true; b.cup = true; } },
      { t: "hold", until: () => pair.done },
      { t: "call", fn: () => { this.pantryUsed.delete(ib); b.cup = false; } },
    );
    this.touch();
  }

  peerChat(agent) {
    const depts = agent ? [agent.dept] : shuffle(["tech", "mkt", "sales", "fin", "hr"]);
    for (const d of depts) {
      const a = agent ?? this.freeIn(d)[0];
      const b = this.freeIn(d, a)[0];
      if (a && b && TALKS[`peer:${d}`]) {
        this.visit(a, b, pick(TALKS[`peer:${d}`]), { c: pick(CLIENTS) }, null, `Hỏi ý kiến ${b.name}`);
        return true;
      }
    }
    if (agent) {
      // Không có đồng nghiệp rảnh trong phòng -> hỏi người khác
      const b = shuffle(this.agents.filter((x) => x !== agent && this.available(x)))[0];
      if (b) {
        this.visit(agent, b, pick(TALKS.ceo.concat(TALKS.hr)), {}, null, `Gặp ${b.name}`);
        return true;
      }
    }
    return false;
  }

  startMeeting() {
    if (this.meeting) return false;
    const ceo = this.inDept("ceo")[0];
    if (!this.available(ceo)) return false;
    const others = ["tech", "mkt", "sales", "fin", "hr"].map((d) => this.freeIn(d)[0]).filter(Boolean);
    if (others.length < 2) return false;
    const people = [ceo, ...others].slice(0, MEETING_SEATS.length);
    const m = { people, arrived: new Set(), state: "gather", wait: 0, idx: -1, left: 0, lines: [], done: false };
    people.forEach((a, i) => {
      a.queue.push({ t: "go", spot: MEETING_SEATS[i], status: "Đi họp giao ban 📋" }, { t: "meet", meeting: m });
    });
    this.meeting = m;
    this.log(ceo, "📣 Mời các trưởng nhóm sang phòng họp giao ban!", "system");
    this.say(ceo, "📣 Họp nhé mọi người!", 3);
    return true;
  }

  stepMeeting(dt) {
    const m = this.meeting;
    if (!m) return;
    if (m.state === "gather") {
      m.wait += dt;
      if (m.arrived.size < m.people.length && m.wait < 60) return;
      m.state = "talk";
      const ctx = {
        n: this.projects.filter((p) => !p.finished).length,
        d: this.done,
        r: fmtMoney(this.revenue),
      };
      const [ceo, ...rest] = m.people;
      m.lines = [
        [ceo, pick(MEETING_REPORT.ceo)],
        ...rest.map((a) => [a, fill(pick(MEETING_REPORT[a.dept]), ctx)]),
        [ceo, pick(MEETING_REPORT.end)],
      ];
    }
    if (m.state === "talk") {
      m.left -= dt;
      if (m.left > 0) return;
      m.idx++;
      if (m.idx >= m.lines.length) {
        m.done = true;
        this.meeting = null;
        this.log(null, "✅ Kết thúc họp giao ban.", "system");
        return;
      }
      const [a, text] = m.lines[m.idx];
      const dur = lineDur(text) + 0.4;
      this.say(a, text, dur);
      this.log(a, text, "meeting");
      m.left = dur;
    }
  }

  // ---------- agent AI thật ----------
  // Lớp AI (src/office/ai) gọi các hàm dưới đây để nhân vật 3D phản ánh công việc thật.
  idleReal(a) {
    if (a.inTalk) return;
    if (a.at !== "home" && !a.locked && !a.stayAway) {
      a.queue.push({ t: "go", spot: a.seat, home: true, status: "Về chỗ ngồi" });
      return;
    }
    a.pose = a.at === "home" ? "sit" : "stand";
    a.typing = !!a.aiTask;
    if (a.at === "home") a.targetRot = a.seat.rot;
    if (!a.locked) a.status = a.aiTask || "Chờ việc";
    a.progress = a.aiTask ? a.aiProgress ?? null : null;
    if (!a.aiTask && this.t > a.nextThought) {
      this.say(a, pick(["💤", "☕?", "Có brief mới chưa nhỉ? 👀", "🎧"]), 2.2);
      a.nextThought = this.t + rand(25, 50);
    }
  }

  aiSetTask(id, label, progress = null) {
    const a = this.byId[id];
    a.aiTask = label;
    a.aiProgress = progress;
    this.touch();
  }

  aiBubble(id, text, dur = 3) {
    this.say(this.byId[id], text, dur);
  }

  aiLog(id, text, toId = null) {
    this.log(this.byId[id], text, "ai", toId ? this.byId[toId] : null);
  }

  // Bàn giao thật: A đi tới bàn B, nói tóm tắt kết quả, B xác nhận. Resolve khi nói xong.
  aiHandoff(fromId, toId, lines) {
    return new Promise((resolve) => {
      this.aiPending.push({ a: this.byId[fromId], b: this.byId[toId], lines, resolve });
    });
  }

  aiGo(id, spot, status) {
    const a = this.byId[id];
    a.stayAway = true;
    return new Promise((resolve) => {
      a.queue.push({ t: "go", spot, status }, { t: "call", fn: resolve });
      this.touch();
    });
  }

  aiHome(id) {
    const a = this.byId[id];
    a.stayAway = false;
    if (a.at === "home" && !a.cur && !a.queue.length) return Promise.resolve();
    return new Promise((resolve) => {
      a.queue.push({ t: "go", spot: a.seat, home: true, status: "Về chỗ ngồi" }, { t: "call", fn: resolve });
      this.touch();
    });
  }

  stepAi() {
    if (!this.aiPending.length) return;
    this.aiPending = this.aiPending.filter((h) => {
      const { a, b } = h;
      const aFree = !a.locked && !a.cur && !a.queue.length && !a.inTalk;
      const bFree = !b.locked && !b.cur && !b.queue.length && !b.inTalk && b.at === "home";
      if (!aFree || !bFree) return true;
      a.stayAway = false;
      this.visit(a, b, h.lines, {}, h.resolve, `Bàn giao cho ${b.name}`, true);
      return false;
    });
  }

  // ---------- lệnh từ người dùng ----------
  cmdCoffee(id) {
    const a = this.byId[id];
    if (!this.available(a)) return false;
    return this.coffeeBreak(a);
  }

  cmdChat(id) {
    const a = this.byId[id];
    if (!this.available(a)) return false;
    return this.peerChat(a);
  }

  cmdMeeting() {
    const ok = this.startMeeting();
    if (ok) this.timers.meeting = this.t + rand(110, 160);
    return ok;
  }

  // 0 = bật/tắt tạm dừng
  setSpeed(s) {
    if (s === 0) this.paused = !this.paused;
    else {
      this.speed = s;
      this.paused = false;
    }
  }

  cmdProject() {
    this.newProject();
  }
}

export function projectStage(p) {
  if (p.finished) return "Hoàn thành";
  return PIPELINE[p.step]?.stage ?? "";
}
