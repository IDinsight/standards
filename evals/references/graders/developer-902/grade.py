"""developer-902 (D2, security headers): reads the code, runs nothing.

FastAPI is not in the runner image, so these checks read the project with
Python's ast module: the headers the app's code sets (in a subscript
assignment, a setdefault/append call, a dict literal, or a (name, value) pair,
as str or bytes), where the middleware sits in the stack, and how the
Dockerfile starts uvicorn. Prints one GRADER_RESULT line.
"""
import ast
import json
import re
import shlex
from pathlib import Path

PROJECT = Path.cwd()


def sources():
    """(relative path, source, tree) for each Python file under app/ that parses."""
    out = []
    for f in sorted((PROJECT / "app").rglob("*.py")):
        try:
            src = f.read_text(encoding="utf-8")
            out.append((f.relative_to(PROJECT).as_posix(), src, ast.parse(src)))
        except (OSError, UnicodeDecodeError, SyntaxError):
            continue
    return out


def text(node):
    """The constant str or bytes a node holds, or None."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (str, bytes)):
        return node.value.decode("latin-1") if isinstance(node.value, bytes) else node.value
    return None


def parents(tree):
    up = {}
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            up[child] = node
    return up


def header_settings(files):
    """Every place the code sets a header: {name (lower), value (or None), file,
    node, conditions, uses}. For a header held in a module-level constant, uses
    lists the conditions at each place the module uses that constant."""
    found = []
    for rel, src, tree in files:
        up = parents(tree)

        def conditions(node):
            out = []
            while node in up:
                parent = up[node]
                if isinstance(parent, (ast.If, ast.IfExp, ast.While)) and node is not parent.test:
                    out.append(ast.get_source_segment(src, parent.test) or "")
                node = parent
            return out

        def bound_names(node):
            """The names a module-level assignment binds to a value that holds node."""
            while node in up:
                parent = up[node]
                if isinstance(parent, (ast.Assign, ast.AnnAssign)) and parent in tree.body:
                    targets = parent.targets if isinstance(parent, ast.Assign) else [parent.target]
                    return {t.id for t in targets if isinstance(t, ast.Name)}
                node = parent
            return set()

        def add(name_node, value_node, node):
            name = text(name_node)
            if name and re.fullmatch(r"[A-Za-z][A-Za-z0-9-]*-[A-Za-z0-9-]+", name):
                names = bound_names(node)
                uses = [conditions(n) for n in ast.walk(tree) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load) and n.id in names]
                found.append({"name": name.lower(), "value": text(value_node) if value_node is not None else None, "file": rel, "node": node, "conditions": conditions(node), "uses": uses})

        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for t in node.targets:
                    if isinstance(t, ast.Subscript):
                        add(t.slice, node.value, node)
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in ("setdefault", "append", "add", "__setitem__", "set") and len(node.args) >= 2:
                add(node.args[0], node.args[1], node)
            elif isinstance(node, ast.Dict):
                for k, v in zip(node.keys, node.values):
                    if k is not None:
                        add(k, v, node)
            elif isinstance(node, ast.Tuple) and len(node.elts) == 2:
                add(node.elts[0], node.elts[1], node)
    return found


def values(found, name):
    return [h for h in found if h["name"] == name]


def registered_name(src, call):
    """What a Middleware(...) or add_middleware(...) call puts in the stack: its
    dispatch function when it has one (BaseHTTPMiddleware, dispatch=fn), else
    its first argument."""
    dispatch = next((k.value for k in call.keywords if k.arg == "dispatch"), None)
    target = dispatch if dispatch is not None else (call.args[0] if call.args else None)
    return ast.get_source_segment(src, target) or "" if target is not None else ""


def helper_registrations(files):
    """Functions that register middleware themselves (a helper such as
    add_security_headers(app)), by name: the names they register, in order."""
    helpers = {}
    for _, src, tree in files:
        for fn in ast.walk(tree):
            if not isinstance(fn, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            names = []
            for node in sorted((n for n in ast.walk(fn) if isinstance(n, ast.Call)), key=lambda n: (n.lineno, n.col_offset)):
                if isinstance(node.func, ast.Attribute) and node.func.attr == "add_middleware":
                    names.append(registered_name(src, node))
                elif isinstance(node.func, ast.Call) and isinstance(node.func.func, ast.Attribute) and node.func.func.attr == "middleware" and node.args:
                    names.append(ast.get_source_segment(src, node.args[0]) or "")
            if names:
                helpers[fn.name] = names
    return helpers


def _builds_stack(node):
    """A call of build_middleware_stack (super().build_middleware_stack())."""
    return isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "build_middleware_stack"


def app_classes(files):
    """FastAPI and Starlette, and each project class that subclasses one, with
    the middleware its build_middleware_stack wraps around the whole built stack
    (outside even ServerErrorMiddleware), outermost first."""
    classes = {"FastAPI": [], "Starlette": []}
    for _, src, tree in files:
        for cls in ast.walk(tree):
            if not (isinstance(cls, ast.ClassDef) and any(getattr(b, "id", getattr(b, "attr", "")) in ("FastAPI", "Starlette") for b in cls.bases)):
                continue
            wrappers = []
            for fn in cls.body:
                if isinstance(fn, (ast.FunctionDef, ast.AsyncFunctionDef)) and fn.name == "build_middleware_stack":
                    built = {t.id for n in ast.walk(fn) if isinstance(n, ast.Assign) and _builds_stack(n.value) for t in n.targets if isinstance(t, ast.Name)}
                    holds = lambda c: any(_builds_stack(x) or (isinstance(x, ast.Name) and x.id in built) for a in [*c.args, *(k.value for k in c.keywords)] for x in ast.walk(a))
                    calls = [c for c in ast.walk(fn) if isinstance(c, ast.Call) and not _builds_stack(c) and holds(c)]
                    # The call that holds the others is the outermost.
                    calls.sort(key=lambda c: -sum(1 for _ in ast.walk(c)))
                    wrappers = [ast.get_source_segment(src, c.func) or "" for c in calls]
            classes[cls.name] = wrappers
    return classes


def registration_order(files):
    """The app's middleware stack, outermost first, as the names registered:
    FastAPI(middleware=[...]) gives the starting list in order, and each
    add_middleware call, app.middleware("http") registration (as a decorator or
    a call), or call of a helper that registers middleware puts its middleware
    in front, in the order the module runs them. An app built from a project
    subclass of FastAPI or Starlette has whatever its build_middleware_stack
    wraps around the stack outermost of all."""
    helpers = helper_registrations(files)
    classes = app_classes(files)
    for rel, src, tree in files:
        apps = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call) and getattr(node.value.func, "id", getattr(node.value.func, "attr", "")) in classes:
                apps.update((t.id, getattr(node.value.func, "id", getattr(node.value.func, "attr", ""))) for t in node.targets if isinstance(t, ast.Name))
        if not apps:
            continue
        stack = []
        events = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node.func, "id", getattr(node.func, "attr", "")) in classes:
                for kw in node.keywords:
                    if kw.arg == "middleware" and isinstance(kw.value, (ast.List, ast.Tuple)):
                        stack.extend(registered_name(src, m) for m in kw.value.elts if isinstance(m, ast.Call))
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "add_middleware" and node.args:
                events.append(((node.lineno, node.col_offset), registered_name(src, node)))
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Call) and isinstance(node.func.func, ast.Attribute) and node.func.func.attr == "middleware" and node.args:
                events.append(((node.lineno, node.col_offset), ast.get_source_segment(src, node.args[0]) or ""))
            elif isinstance(node, ast.Call) and getattr(node.func, "id", getattr(node.func, "attr", "")) in helpers:
                callee = getattr(node.func, "id", getattr(node.func, "attr", ""))
                events.extend(((node.lineno, node.col_offset, k), name) for k, name in enumerate(helpers[callee]))
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for d in node.decorator_list:
                    if isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute) and d.func.attr == "middleware":
                        events.append(((d.lineno, d.col_offset), node.name))
        for _, name in sorted(events):
            stack.insert(0, name)
        wrapped = [w for cls in dict.fromkeys(apps.values()) for w in classes.get(cls, [])]
        return rel, wrapped + stack
    return None, []


def prod_registration(files, ours):
    """Whether app/main.py registers or builds a security middleware with an
    argument that mentions production (hsts=settings.environment == "production")."""
    for rel, src, tree in files:
        if rel != "app/main.py":
            continue
        for call in ast.walk(tree):
            if not isinstance(call, ast.Call):
                continue
            name = getattr(call.func, "id", getattr(call.func, "attr", ""))
            target = (ast.get_source_segment(src, call.args[0]) or "") if name in ("add_middleware", "Middleware") and call.args else ""
            if name in ours or target.split(".")[-1] in ours:
                if any(re.search(r"prod", ast.get_source_segment(src, a) or "", re.I) for a in [*call.args, *(k.value for k in call.keywords)]):
                    return True
    return False


def security_middleware_names(files, found):
    """Names of the classes and functions that set the security headers: those
    defined in a file that sets them, and any class or function elsewhere (a
    decorated middleware in app/main.py, say) that calls a module-level one of
    them. Methods (__init__, dispatch) do not count as calls, so another
    middleware's super().__init__() does not make it one of ours."""
    files_with_headers = {h["file"] for h in found if h["name"] in ("x-content-type-options", "x-frame-options", "referrer-policy", "cache-control", "strict-transport-security", "permissions-policy")}
    defs = (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)
    names, top = set(), set()
    for rel, _, tree in files:
        if rel in files_with_headers:
            names.update(n.name for n in ast.walk(tree) if isinstance(n, defs))
            top.update(n.name for n in tree.body if isinstance(n, defs))
    callee = lambda call: getattr(call.func, "id", getattr(call.func, "attr", None))
    for _, _, tree in files:
        for n in ast.walk(tree):
            if isinstance(n, defs) and any(isinstance(c, ast.Call) and callee(c) in top for c in ast.walk(n)):
                names.add(n.name)
    return names


def dockerfile_start():
    """The Dockerfile's final ENTRYPOINT and CMD, as words."""
    f = PROJECT / "Dockerfile"
    if not f.exists():
        return None
    lines = re.sub(r"\\\r?\n", " ", f.read_text(encoding="utf-8")).splitlines()
    found = {}
    for line in lines:
        m = re.match(r"\s*(CMD|ENTRYPOINT)\s+(.*)", line, re.I)
        if m:
            body = m.group(2).strip()
            try:
                words = json.loads(body) if body.startswith("[") else shlex.split(body)
            except (ValueError, json.JSONDecodeError):
                words = body.split()
            found[m.group(1).upper()] = [str(w) for w in words]
    return found.get("ENTRYPOINT", []) + found.get("CMD", [])


def server_header_off_in(module_words):
    """Whether a python module the start command runs calls uvicorn with server_header=False."""
    candidates = []
    for i, w in enumerate(module_words):
        if w == "-m" and i + 1 < len(module_words):
            candidates.append(PROJECT / (module_words[i + 1].replace(".", "/") + ".py"))
        elif w.endswith(".py"):
            candidates.append(PROJECT / w)
    for f in candidates:
        if f.exists() and re.search(r"server_header\s*=\s*False", f.read_text(encoding="utf-8")):
            return True
    return False


def main():
    files = sources()
    found = header_settings(files)
    checks = []

    def check(cid, ok, detail):
        checks.append({"id": cid, "verdict": "PASS" if ok else "FAIL", "detail": detail})

    def show(name):
        hs = values(found, name)
        return ", ".join(f"{h['file']}:{h['node'].lineno}={h['value']!r}" for h in hs) or "not set"

    eq = lambda v, want: v is not None and v.strip().lower() == want
    check("nosniff", any(eq(h["value"], "nosniff") for h in values(found, "x-content-type-options")), f"X-Content-Type-Options: {show('x-content-type-options')}")
    deny = any(eq(h["value"], "deny") for h in values(found, "x-frame-options"))
    csp = any(h["value"] and re.search(r"frame-ancestors\s+'none'", h["value"], re.I) for h in values(found, "content-security-policy"))
    check("framing-denied", deny or csp, f"X-Frame-Options: {show('x-frame-options')}; Content-Security-Policy: {show('content-security-policy')}")
    xss_on = [h for h in values(found, "x-xss-protection") if h["value"] is not None and h["value"].strip() != "0"]
    check("xss-auditor-off", not xss_on, f"X-XSS-Protection: {show('x-xss-protection')}")
    check("no-store", any(h["value"] and "no-store" in h["value"].lower() for h in values(found, "cache-control")), f"Cache-Control: {show('cache-control')}")
    check("referrer-policy", any(eq(h["value"], "strict-origin-when-cross-origin") for h in values(found, "referrer-policy")), f"Referrer-Policy: {show('referrer-policy')}")
    check("permissions-policy", bool(values(found, "permissions-policy")), f"Permissions-Policy: {show('permissions-policy')}")

    where, stack = registration_order(files)
    ours = security_middleware_names(files, found)

    # HSTS: set, and every place that sets it sits under a condition about
    # production, or under a flag that app/main.py sets from production. A header
    # in a module-level constant takes the conditions of every place it is used.
    hsts = values(found, "strict-transport-security")
    main_src = next((src for rel, src, _ in files if rel == "app/main.py"), "")
    registration_says_prod = prod_registration(files, ours) or bool(re.search(r"add_middleware\([^)]*prod|Middleware\([^)]*prod", main_src, re.I | re.S))
    gated = lambda h: h["conditions"] or ([c for u in h["uses"] for c in u] if h["uses"] and all(h["uses"]) else [])
    conditional = all(gated(h) and (any(re.search(r"prod", c, re.I) for c in gated(h)) or registration_says_prod) for h in hsts)
    check("hsts-production-only", bool(hsts) and conditional, f"Strict-Transport-Security: {show('strict-transport-security')}; conditions: {[gated(h) for h in hsts]}; production flag in app/main.py: {registration_says_prod}")

    # The security middleware wraps CORSMiddleware.
    cors = next((i for i, n in enumerate(stack) if "CORSMiddleware" in n), None)
    mine = next((i for i, n in enumerate(stack) if n.split(".")[-1] in ours), None)
    check("wraps-cors", cors is not None and mine is not None and mine < cors, f"stack in {where}, outermost first: {stack}; security middleware names: {sorted(ours)}")

    # uvicorn's server header is off where the Dockerfile starts the service.
    start = dockerfile_start()
    off = start is not None and ("--no-server-header" in start or any("--no-server-header" in w for w in start) or server_header_off_in(start))
    check("no-server-header", off, f"Dockerfile start: {start}")

    # The design's module defines the middleware and app/main.py registers it.
    module = PROJECT / "app" / "utils" / "security_headers.py"
    defined = set()
    if module.exists():
        try:
            tree = ast.parse(module.read_text(encoding="utf-8"))
            defined = {n.name for n in tree.body if isinstance(n, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef))}
        except SyntaxError:
            pass
    registered = [n for n in stack if n.split(".")[-1] in defined]
    imported = bool(re.search(r"(from\s+app\.utils\.security_headers\s+import|from\s+app\.utils\s+import\s+[^\n]*security_headers|import\s+app\.utils\.security_headers)", main_src))
    check("middleware-module", module.exists() and bool(registered) and imported, f"app/utils/security_headers.py {'defines ' + str(sorted(defined)) if module.exists() else 'is missing'}; registered: {registered}")

    print("GRADER_RESULT " + json.dumps({"checks": checks}))


if __name__ == "__main__":
    main()
