#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  docker compose up -d mongodb
fi
mkdir -p .runtime logs
(cd backend && nohup npm start > ../logs/backend.log 2>&1 & echo $! > ../.runtime/backend.pid)
(cd frontend && nohup npm run dev -- --host 0.0.0.0 > ../logs/frontend.log 2>&1 & echo $! > ../.runtime/frontend.pid)
echo "PRODIGY_FS_04 démarré en mode persistant local."
