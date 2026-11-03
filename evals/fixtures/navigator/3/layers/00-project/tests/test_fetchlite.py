import http.server
import socket
import threading

import pytest

from fetchlite import FetchTimeout, fetch


@pytest.fixture(autouse=True)
def _no_proxy(monkeypatch):
    # Keep local test servers off any proxy configured in the environment.
    monkeypatch.setenv("no_proxy", "*")
    monkeypatch.setenv("NO_PROXY", "*")


class _Hello(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"hello"
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def test_returns_body():
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), _Hello)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        host, port = server.server_address
        assert fetch(f"http://{host}:{port}/") == b"hello"
    finally:
        server.shutdown()
        server.server_close()


def test_silent_server_raises_fetch_timeout():
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        listener.listen(1)
        host, port = listener.getsockname()
        with pytest.raises(FetchTimeout):
            fetch(f"http://{host}:{port}/", timeout=0.2)
