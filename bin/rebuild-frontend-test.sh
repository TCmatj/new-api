#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
COMPOSE_FILE="$ROOT_DIR/docker-compose.frontend-test.yml"

if [[ ! -d "$WEB_DIR" ]]; then
  echo "web directory not found: $WEB_DIR" >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

echo "[1/2] Building frontend assets..."
cd "$WEB_DIR"
npm run build

echo "[2/2] Rebuilding and restarting frontend test container..."
cd "$ROOT_DIR"
docker compose -f "$COMPOSE_FILE" up -d --build

echo "Done. Frontend test environment is available at: http://127.0.0.1:3002"
