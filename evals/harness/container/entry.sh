#!/bin/sh
# Container entry for one eval run (mounted read-only at /opt/eval).
#
# The fixture is bind-mounted at /mnt/project, but the role never works on the
# mount: Docker Desktop's file sharing ignores file modes (a mode-000 file
# stays readable) and is case-insensitive on macOS. So the project is copied
# into the container's own Linux filesystem at its projectRoot, the runtime
# block is applied, the command runs under a hard timeout, file modes are
# restored, and the project is copied back so the host sees exactly what the
# role left. Exits with the command's own code (95/96/97 for harness failures).
#
#   sh /opt/eval/entry.sh <timeout-minutes> <command> [args...]
#
# Normally the container runs as the runner (uid 1001). A case with unreadable
# files starts it as root (run.mjs adds --user 0:0): the project is handed to
# the runner, setup makes those files root-owned with mode 000 (so the role
# cannot chmod them back), and the command runs as the runner via drop.mjs.
set -u
RUNNER=1001
T="$1"; shift
P=$(node /opt/eval/setup.mjs root) || { echo "eval runtime: no project root" >&2; exit 97; }
mkdir -p "$P" && cp -a /mnt/project/. "$P"/ || { echo "eval runtime: copy in failed" >&2; exit 96; }
if [ "$(id -u)" = 0 ]; then chown -R "$RUNNER:$RUNNER" "$P" || { echo "eval runtime: chown failed" >&2; exit 96; }; fi
cd "$P" || exit 96
NEWPATH=$(node /opt/eval/setup.mjs before) || { echo "eval runtime setup failed" >&2; exit 97; }
PATH="$NEWPATH"; export PATH
if [ "$(id -u)" = 0 ]; then
  node /opt/eval/drop.mjs "$RUNNER" timeout -k 30s "${T}m" "$@"
else
  timeout -k 30s "${T}m" "$@"
fi
code=$?
node /opt/eval/setup.mjs after || echo "eval runtime teardown failed" >&2
cd /
find /mnt/project -mindepth 1 -delete && cp -a "$P"/. /mnt/project/ || { echo "eval runtime: copy back failed" >&2; exit 95; }
exit $code
