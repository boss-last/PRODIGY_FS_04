#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for name in backend frontend; do
  pidfile="$ROOT/.runtime/$name.pid"
  if [ -f "$pidfile" ]; then kill "$(cat "$pidfile")" 2>/dev/null || true; rm -f "$pidfile"; fi
done
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  (cd "$ROOT" && docker compose stop mongodb >/dev/null 2>&1 || true)
fi
echo "PRODIGY_FS_04 arrêté."
