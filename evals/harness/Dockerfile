# Disposable runner image for STANDARDS role evals. One container per run.
# - Pins the Claude Code version so a run is reproducible and comparable.
# - Runs as an unprivileged user: Claude Code refuses bypassPermissions as root,
#   and the container, not a permission prompt, is the safety boundary.
# - Has no ~/.claude user settings, plugins, skills, or MCP servers, so only the
#   fixture's project settings and installed skills load (each run mounts a
#   fresh, empty ~/.claude, holding at most a seeded session).
# Build (image.mjs pins BASE to the pulled digest and records it):
#   pnpm eval image build   (docker build -t standards-eval:claude-<version> --build-arg BASE=node:22-bookworm-slim@sha256:... .)
ARG BASE=node:22-bookworm-slim
FROM ${BASE}

ARG CLAUDE_CODE_VERSION=2.1.283
ARG PNPM_VERSION=10.34.5
RUN apt-get update \
 && apt-get install -y --no-install-recommends git python3 python3-pytest ca-certificates coreutils \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" "pnpm@${PNPM_VERSION}" \
 && npm cache clean --force
# pnpm is installed at build time so no run downloads it (corepack would, at run time).

# Pinned version: never self-update during a suite; no telemetry or error reporting.
ENV DISABLE_AUTOUPDATER=1 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
# Running code or tests must not leave caches that look like project changes.
ENV PYTHONDONTWRITEBYTECODE=1 PYTEST_ADDOPTS="-p no:cacheprovider"

RUN useradd --create-home --uid 1001 runner \
 && git config --system user.name "Eval Runner" \
 && git config --system user.email "runner@example.invalid" \
 && git config --system --add safe.directory '*' \
 && mkdir -p /work /home/runner/.claude && chown runner:runner /work /home/runner/.claude
USER runner
WORKDIR /work
# ANTHROPIC_API_KEY=[API_KEY] comes from the private key file via `docker run --env-file`, never baked in.
