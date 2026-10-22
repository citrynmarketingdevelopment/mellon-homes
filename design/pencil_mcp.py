"""Call the installed Pencil MCP server with a fresh connection."""
import base64
import json
from pathlib import Path
import queue
import subprocess
import sys
import threading
import time

ROOT = Path(__file__).resolve().parent
EXE = Path.home() / ".vscode/extensions/highagency.pencildev-0.6.77/out/mcp-server-windows-x64.exe"


def run(tool, arguments):
    process = subprocess.Popen(
        [str(EXE), "--app", "visual_studio_code", "--agent", "codexCLI"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
        text=True, encoding="utf-8",
    )
    responses = queue.Queue()
    threading.Thread(target=lambda: [responses.put(line) for line in process.stdout], daemon=True).start()

    def request(number, method, params):
        process.stdin.write(json.dumps({"jsonrpc": "2.0", "id": number, "method": method, "params": params}) + "\n")
        process.stdin.flush()
        deadline = time.monotonic() + 55
        while time.monotonic() < deadline:
            try:
                message = json.loads(responses.get(timeout=1))
            except queue.Empty:
                continue
            if message.get("id") == number:
                return message
        raise TimeoutError(f"Pencil did not answer {method}")

    try:
        request(1, "initialize", {
            "protocolVersion": "2024-11-05", "capabilities": {},
            "clientInfo": {"name": "mellon-design", "version": "1.0"},
        })
        time.sleep(.5)
        result = request(2, "tools/call", {"name": tool, "arguments": arguments})
        for i, item in enumerate(result.get("result", {}).get("content", [])):
            if item.get("type") == "image":
                previews = ROOT / "previews"
                previews.mkdir(exist_ok=True)
                path = previews / f"pencil-{time.time_ns()}-{i}.png"
                path.write_bytes(base64.b64decode(item.pop("data")))
                item["localPath"] = str(path)
        print(json.dumps(result, ensure_ascii=False), flush=True)
    finally:
        process.terminate()
        process.wait(timeout=5)


if __name__ == "__main__":
    tool = sys.argv[1] if len(sys.argv) > 1 else "get_app_state"
    arguments = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8")) if len(sys.argv) > 2 else {}
    run(tool, arguments)
