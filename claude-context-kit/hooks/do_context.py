"""UserPromptSubmit: báo % context. Chỉ in khi % đổi >= 5 điểm để đỡ tốn token."""
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import context_tokens, read_input  # noqa: E402

WINDOW = int(os.environ.get("CLAUDE_CONTEXT_WINDOW", "1000000"))
THRESH = int(os.environ.get("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE", "30"))


def main():
    data = read_input()
    used = context_tokens(data.get("transcript_path"))
    if not used:
        return
    pct = used * 100 / WINDOW
    bucket = int(pct // 5)
    state = Path(tempfile.gettempdir()) / f"claude_ctx_{data.get('session_id', 'x')}"
    try:
        prev = int(state.read_text())
    except Exception:
        prev = -1
    if bucket == prev:
        return
    state.write_text(str(bucket))
    print(f"[context] {pct:.0f}% ({used:,}/{WINDOW:,}); nén tự động ở {THRESH}%")


if __name__ == "__main__":
    main()
