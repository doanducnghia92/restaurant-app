#!/usr/bin/env python3
"""Cầu nối Văn phòng 3D <- pipeline aff-do-nam (Telegram + thư mục san_pham/).

Đặt file này vào  AFFILIATE/automation/office_bridge.py  (cạnh telegram_bot.py).
Chỉ dùng thư viện chuẩn của Python. Mọi lỗi mạng đều bị nuốt: cầu nối không bao giờ
làm bot Telegram hay pipeline bị dừng.

Cách dùng:
  python office_bridge.py url                     # in link mở văn phòng (tạo mã phòng lần đầu)
  python office_bridge.py watch                   # theo dõi san_pham/ và đẩy tiến độ (chạy nền)
  python office_bridge.py say ngoc "Kịch bản xong" # agent tự báo (ngoc|quan|hieu|tam|thao)
  python office_bridge.py anh "tin anh nhắn"       # (dùng trong telegram_bot.py)
  python office_bridge.py bot "tin bot trả lời"    # (dùng trong telegram_bot.py)

Trong telegram_bot.py:
  from office_bridge import push
  push(text_anh_gui, kind="anh")          # khi nhận tin của anh
  push(text_bot_gui, kind="bot")          # trong hàm send(...)
"""
import glob
import json
import os
import secrets
import sys
import threading
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CFG_PATH = os.path.join(HERE, "office_bridge.json")
DEFAULTS = {
    "project": "restaurant-app-24e87",
    "api_key": "AIzaSyAxEtbl--V5CXfdnUh8YC0h2JYYt80M-lk",
    "office_url": "https://restaurant-app-24e87.web.app/office.html",
    "san_pham": os.path.normpath(os.path.join(HERE, "..", "san_pham")),
}
AGENTS = {"ngoc": "script", "quan": "image", "hieu": "audit", "tam": "video", "thao": "post",
          "script": "script", "image": "image", "audit": "audit", "video": "video", "post": "post"}


def cfg():
    data = dict(DEFAULTS)
    if os.path.exists(CFG_PATH):
        with open(CFG_PATH, encoding="utf-8") as f:
            data.update(json.load(f))
    if not data.get("room"):
        data["room"] = secrets.token_urlsafe(24)  # mã phòng bí mật: ai có link mới xem được
        with open(CFG_PATH, "w", encoding="utf-8") as f:
            json.dump({k: data[k] for k in ("room",)}, f, ensure_ascii=False, indent=2)
    return data


def office_link():
    c = cfg()
    return f"{c['office_url']}?room={c['room']}"


def _send(doc):
    c = cfg()
    url = ("https://firestore.googleapis.com/v1/projects/{p}/databases/(default)/documents/"
           "office_rooms/{r}/feed?key={k}").format(p=c["project"], r=c["room"], k=urllib.parse.quote(c["api_key"]))
    fields = {k: ({"integerValue": str(v)} if isinstance(v, int) else {"stringValue": str(v)}) for k, v in doc.items()}
    req = urllib.request.Request(url, data=json.dumps({"fields": fields}).encode("utf-8"),
                                 headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            r.read()
        return True
    except Exception as e:  # không bao giờ làm hỏng bot/pipeline
        sys.stderr.write(f"[office_bridge] không gửi được: {e}\n")
        return False


def push(text, kind="bot", agent="", ma_sp="", kb="", wait=False):
    """Đẩy 1 tin lên văn phòng. kind: anh | bot | say | step."""
    text = str(text or "").strip()
    if not text:
        return False
    doc = {"at": int(time.time() * 1000), "kind": kind, "agent": AGENTS.get(str(agent).lower(), ""),
           "text": text[:3900], "ma_sp": str(ma_sp or ""), "kb": str(kb or "")}
    if wait:
        return _send(doc)
    threading.Thread(target=_send, args=(doc,), daemon=True).start()
    return True


# ---------------- Theo dõi thư mục san_pham/ ----------------
VAL = {"DAT": "ĐẠT ✅", "CHUA_DAT": "CHƯA ĐẠT ❌", "CHUA_DU_DU_LIEU": "CHƯA ĐỦ DỮ LIỆU ⚠️",
       "cho_duyet": "chờ anh duyệt 🕒", "da_dang": "đã đăng 🚀", "cho_token": "hết tín dụng Flow ⛽",
       "can_doi_prompt": "Flow từ chối, cần đổi prompt 🔁"}
KEYS = {  # khoá trong status.json -> (agent, nhãn)
    "d1_img": ("audit", "Ảnh D1"), "d2_img": ("audit", "Ảnh D2"),
    "d1_vid": ("video", "Clip D1"), "d2_vid": ("video", "Clip D2"),
    "final": ("video", "Video ghép 16s"), "audit_video": ("audit", "Audit video"),
    "posted": ("post", "Đăng TikTok"),
}
FILES = [  # file xuất hiện/đổi -> (agent, câu báo)
    ("d1.png", "image", "Xong ảnh D1 (ChatGPT)"), ("d2.png", "image", "Xong ảnh D2 (ChatGPT)"),
    ("d1.mp4", "video", "Xong clip D1 (Flow)"), ("d2.mp4", "video", "Xong clip D2 (Flow)"),
    ("final.mp4", "video", "Ghép xong video 16s (final.mp4)"),
]


def _read_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _val(v):
    if isinstance(v, dict):
        s = v.get("trang_thai") or v.get("status") or v.get("value") or ""
        note = v.get("ghi_chu") or v.get("note") or ""
    else:
        s, note = v, ""
    s = str(s)
    return VAL.get(s, s) + (f" — {note}" if note else "")


def _mtime(p):
    try:
        return os.path.getmtime(p)
    except OSError:
        return None


def scan(root, state, emit):
    for sp in sorted(glob.glob(os.path.join(root, "*"))):
        if not os.path.isdir(sp):
            continue
        ma = os.path.basename(sp)
        plan_p = os.path.join(sp, "plan.json")
        m = _mtime(plan_p)
        if m and state.get(plan_p) != m:
            state[plan_p] = m
            plan = _read_json(plan_p) or {}
            kbs = ", ".join(f"{k.get('id', '')} «{k.get('ten', '')}»" for k in plan.get("kich_ban", []))
            emit("script", f"Xong phân tích {ma}: {kbs}" if kbs else f"Đã cập nhật kịch bản {ma}", ma, "")
        for kbdir in sorted(glob.glob(os.path.join(sp, "kb*"))):
            kb = os.path.basename(kbdir)
            for fn, agent, label in FILES:
                p = os.path.join(kbdir, fn)
                m = _mtime(p)
                if m and state.get(p) != m:
                    state[p] = m
                    emit(agent, f"{kb} · {label}", ma, kb)
            st_p = os.path.join(kbdir, "status.json")
            st = _read_json(st_p) or {}
            for key, (agent, label) in KEYS.items():
                if key not in st:
                    continue
                sig = json.dumps(st[key], ensure_ascii=False, sort_keys=True)
                k = f"{st_p}#{key}"
                if state.get(k) != sig:
                    state[k] = sig
                    emit(agent, f"{kb} · {label}: {_val(st[key])}", ma, kb)
        kq = os.path.join(sp, "ket_qua.json")
        m = _mtime(kq)
        if m and state.get(kq) != m:
            state[kq] = m
            emit("post", f"Báo cáo cuối {ma} đã sẵn sàng (ket_qua.json)", ma, "")


def watch(root=None, every=3.0):
    root = root or cfg()["san_pham"]
    print(f"Theo dõi {root}\nMở văn phòng: {office_link()}", flush=True)
    state = {}
    scan(root, state, lambda *a: None)  # lần đầu: chỉ ghi nhận hiện trạng, không gửi lịch sử
    while True:
        time.sleep(every)
        try:
            scan(root, state, lambda agent, text, ma, kb: push(text, "step", agent, ma, kb))
        except Exception as e:
            sys.stderr.write(f"[office_bridge] lỗi quét: {e}\n")


def main(argv):
    try:  # cửa sổ lệnh Windows: in được tiếng Việt
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    if len(argv) < 2 or argv[1] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd = argv[1]
    if cmd == "url":
        print(office_link())
    elif cmd == "watch":
        watch(argv[2] if len(argv) > 2 else None)
    elif cmd == "say" and len(argv) >= 4:
        ok = push(" ".join(argv[3:]), "say", argv[2], wait=True)
        return 0 if ok else 1
    elif cmd in ("anh", "bot") and len(argv) >= 3:
        ok = push(" ".join(argv[2:]), cmd, wait=True)
        return 0 if ok else 1
    elif cmd == "test":
        ok = push("Cầu nối văn phòng đã chạy ✅", "say", "ngoc", wait=True)
        print("Đã gửi tin thử." if ok else "Gửi thất bại — xem lỗi ở trên.")
        print(office_link())
        return 0 if ok else 1
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
