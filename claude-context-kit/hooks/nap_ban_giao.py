"""SessionStart (matcher: compact): nạp lại file bàn giao mới nhất vào context."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import handoff_dir, read_input  # noqa: E402

MAX_CHARS = 6000


def main():
    data = read_input()
    f = handoff_dir(data.get("cwd")) / "latest.md"
    if not f.exists():
        return
    text = f.read_text(encoding="utf-8")[:MAX_CHARS]
    print("[Nạp lại sau khi nén] Đây là ghi chú bàn giao; hãy tiếp tục đúng chỗ đang dở:\n")
    print(text)


if __name__ == "__main__":
    main()
