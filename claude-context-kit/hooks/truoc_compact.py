"""PreCompact: lưu file bàn giao từ transcript (trước khi nén mất chi tiết).

Lưu ý: tại thời điểm này chưa có bản tóm tắt của Claude, nên script tự trích:
yêu cầu gần đây, file đã sửa, lượt trả lời cuối của Claude.
"""
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import handoff_dir, iter_transcript, read_input, text_of  # noqa: E402

MAX_USER = 8
MAX_CHARS = 700


def clip(s, n=MAX_CHARS):
    s = " ".join(s.split())
    return s if len(s) <= n else s[:n] + "…"


def main():
    data = read_input()
    cwd = data.get("cwd")
    users, files, last_assistant = [], [], ""
    for e in iter_transcript(data.get("transcript_path")):
        if e.get("isSidechain"):
            continue
        msg = e.get("message") or {}
        content = msg.get("content")
        if e.get("type") == "user":
            t = text_of(content).strip()
            if t and not t.startswith("<") and not e.get("isMeta"):
                users.append(t)
        elif e.get("type") == "assistant":
            t = text_of(content).strip()
            if t:
                last_assistant = t
            for b in content if isinstance(content, list) else []:
                if isinstance(b, dict) and b.get("type") == "tool_use":
                    p = (b.get("input") or {}).get("file_path")
                    if p and b.get("name") in ("Edit", "Write", "NotebookEdit") and p not in files:
                        files.append(p)

    now = datetime.now()
    body = [
        f"# Bàn giao trước khi nén ({now:%Y-%m-%d %H:%M})",
        f"- Dự án: {cwd}",
        f"- Kiểu nén: {data.get('trigger', '?')}",
        "",
        "## Yêu cầu gần đây của người dùng",
        *[f"- {clip(u)}" for u in users[-MAX_USER:]],
        "",
        "## File đã sửa/tạo trong phiên",
        *([f"- {p}" for p in files[-30:]] or ["- (không có)"]),
        "",
        "## Lượt trả lời cuối của Claude",
        clip(last_assistant, 2000) or "(trống)",
        "",
    ]
    d = handoff_dir(cwd)
    text = "\n".join(body)
    (d / f"ban-giao_{now:%Y%m%d-%H%M%S}.md").write_text(text, encoding="utf-8")
    (d / "latest.md").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
