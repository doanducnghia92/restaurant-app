"""Tiện ích dùng chung cho các hook (chỉ dùng thư viện chuẩn)."""
import json
import os
import re
import sys
from pathlib import Path

HOME = Path.home() / ".claude"
HANDOFF_ROOT = HOME / "handoff"


def read_input():
    try:
        return json.loads(sys.stdin.read() or "{}")
    except Exception:
        return {}


def project_name(cwd):
    name = Path(cwd or os.getcwd()).name or "default"
    return re.sub(r"[^\w.-]+", "_", name)


def handoff_dir(cwd):
    d = HANDOFF_ROOT / project_name(cwd)
    d.mkdir(parents=True, exist_ok=True)
    return d


def iter_transcript(path):
    if not path or not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except Exception:
                continue


def text_of(content):
    """Lấy phần chữ từ message.content (chuỗi hoặc danh sách khối)."""
    if isinstance(content, str):
        return content
    out = []
    for b in content or []:
        if isinstance(b, dict) and b.get("type") == "text":
            out.append(b.get("text", ""))
    return "\n".join(out)


def context_tokens(path):
    """Kích thước context hiện tại = usage của lượt assistant gần nhất."""
    last = 0
    for e in iter_transcript(path):
        if e.get("isSidechain"):
            continue
        u = (e.get("message") or {}).get("usage")
        if e.get("type") == "assistant" and u:
            last = (
                u.get("input_tokens", 0)
                + u.get("cache_read_input_tokens", 0)
                + u.get("cache_creation_input_tokens", 0)
            )
    return last
