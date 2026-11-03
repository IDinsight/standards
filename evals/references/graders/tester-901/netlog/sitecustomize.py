"""Records every connection and name lookup outside the machine, to the file
GRADER_NETLOG names. Loaded at interpreter start when this folder is on
PYTHONPATH. The call itself goes on as before (the grader has no network)."""
import os
import socket

_LOG = os.environ.get("GRADER_NETLOG")
_LOCAL = {"localhost", "::1", "0.0.0.0", "", None}


def _outside(host):
    host = host.decode() if isinstance(host, bytes) else host
    return host not in _LOCAL and not str(host).startswith("127.")


def _note(what):
    if _LOG:
        with open(_LOG, "a", encoding="utf-8") as f:
            f.write(what + "\n")


_connect = socket.socket.connect
_connect_ex = socket.socket.connect_ex
_getaddrinfo = socket.getaddrinfo


def connect(self, address):
    if self.family in (socket.AF_INET, socket.AF_INET6) and isinstance(address, tuple) and _outside(address[0]):
        _note(f"connect {address[0]}:{address[1]}")
    return _connect(self, address)


def connect_ex(self, address):
    if self.family in (socket.AF_INET, socket.AF_INET6) and isinstance(address, tuple) and _outside(address[0]):
        _note(f"connect {address[0]}:{address[1]}")
    return _connect_ex(self, address)


def getaddrinfo(host, *args, **kwargs):
    if _outside(host):
        _note(f"lookup {host}")
    return _getaddrinfo(host, *args, **kwargs)


if _LOG:
    socket.socket.connect = connect
    socket.socket.connect_ex = connect_ex
    socket.getaddrinfo = getaddrinfo
