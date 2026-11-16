"""Cài bộ hook vào ~/.claude (toàn cục). Chạy lại nhiều lần vẫn an toàn.

    python3 install.py            # cài
    python3 install.py --pct 30   # đổi ngưỡng nén (mặc định 30)
    python3 install.py --uninstall
"""
import argparse
import json
import shutil
import sys
import time
from pathlib import Path

SRC = Path(__file__).parent / "hooks"
CLAUDE = Path.home() / ".claude"
DEST = CLAUDE / "hooks"
SETTINGS = CLAUDE / "settings.json"
TAG = "claude-context-kit"  # nhận diện hook do bộ này tạo


def cmd(script):
    return f'"{sys.executable}" "{DEST / script}"'


def strip_ours(hooks):
    for ev in list(hooks):
        kept = []
        for grp in hooks[ev]:
            grp["hooks"] = [h for h in grp.get("hooks", []) if str(DEST) not in h.get("command", "")]
            if grp["hooks"]:
                kept.append(grp)
        if kept:
            hooks[ev] = kept
        else:
            del hooks[ev]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pct", default="30")
    ap.add_argument("--uninstall", action="store_true")
    a = ap.parse_args()

    CLAUDE.mkdir(exist_ok=True)
    cfg = {}
    if SETTINGS.exists():
        cfg = json.loads(SETTINGS.read_text(encoding="utf-8") or "{}")
        shutil.copy(SETTINGS, SETTINGS.with_name(f"settings.json.bak-{int(time.time())}"))

    hooks = cfg.setdefault("hooks", {})
    strip_ours(hooks)

    if a.uninstall:
        cfg.get("env", {}).pop("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE", None)
        if not hooks:
            cfg.pop("hooks")
        SETTINGS.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
        print("Đã gỡ. (Các file trong ~/.claude/hooks giữ nguyên.)")
        return

    DEST.mkdir(exist_ok=True)
    for f in SRC.glob("*.py"):
        shutil.copy(f, DEST / f.name)

    cfg.setdefault("env", {})["CLAUDE_AUTOCOMPACT_PCT_OVERRIDE"] = str(a.pct)
    hooks.setdefault("UserPromptSubmit", []).append(
        {"hooks": [{"type": "command", "command": cmd("do_context.py")}]})
    hooks.setdefault("PreCompact", []).append(
        {"hooks": [{"type": "command", "command": cmd("truoc_compact.py")}]})
    hooks.setdefault("SessionStart", []).append(
        {"matcher": "compact", "hooks": [{"type": "command", "command": cmd("nap_ban_giao.py")}]})

    SETTINGS.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Đã cài vào {CLAUDE}\n- Ngưỡng nén: {a.pct}%\n- Mở phiên Claude Code MỚI để có hiệu lực.")
    print(f"- File bàn giao lưu ở {CLAUDE / 'handoff'}")


if __name__ == "__main__":
    main()
