#!/usr/bin/env bash
set -euo pipefail

# One-shot helper for this fork:
# 1) fetch upstream/main
# 2) sync backend-only paths from QuantumNous/new-api
# 3) restore this fork's compose/runtime layout
# 4) re-apply this fork's single-frontend compatibility patches
# 5) rebuild local/new-api:opencub
# 6) recreate the new-api service and verify /api/status
#
# Usage:
#   bin/update-backend-and-redeploy.sh
#
# Optional env vars:
#   UPSTREAM_REMOTE=upstream
#   UPSTREAM_BRANCH=main
#   COMPOSE_SERVICE=new-api
#   HEALTHCHECK_URL=http://127.0.0.1:3001/api/status
#   HEALTHCHECK_RETRIES=30
#   HEALTHCHECK_SLEEP=2
#   SKIP_DEPLOY=1        # only sync + patch, no docker compose up
#   PREVIEW_ONLY=1       # only preview upstream/backend diff via sync script

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
COMPOSE_SERVICE="${COMPOSE_SERVICE:-new-api}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3001/api/status}"
HEALTHCHECK_RETRIES="${HEALTHCHECK_RETRIES:-30}"
HEALTHCHECK_SLEEP="${HEALTHCHECK_SLEEP:-2}"
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"
PREVIEW_ONLY="${PREVIEW_ONLY:-0}"

log() {
  echo "[INFO] $*"
}

warn() {
  echo "[WARN] $*" >&2
}

err() {
  echo "[ERR] $*" >&2
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    err "缺少命令: $1"
    exit 1
  }
}

write_runtime_compose() {
  cat > "$ROOT_DIR/docker-compose.yml" <<'EOF'
version: '3.4' # For compatibility with older Docker versions

services:
  new-api:
    image: local/new-api:opencub
    build:
      context: .
      dockerfile: Dockerfile
    container_name: new-api
    restart: always
    command: --log-dir /app/logs
    ports:
      - "3001:3000"
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    environment:
      - SQL_DSN=postgresql://root:123456@new-api-postgres:5432/new-api
      - REDIS_CONN_STRING=redis://new-api-redis:6379
      - TZ=Asia/Shanghai
      - ERROR_LOG_ENABLED=true
      - BATCH_UPDATE_ENABLED=true
    depends_on:
      - new-api-redis
      - new-api-postgres
    networks:
      - new-api-network
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:3000/api/status | grep -o '\"success\":\\s*true' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  new-api-redis:
    image: redis:latest
    container_name: new-api-redis
    restart: always
    networks:
      - new-api-network

  new-api-postgres:
    image: postgres:15
    container_name: new-api-postgres
    restart: always
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: new-api
    volumes:
      - pg_data:/var/lib/postgresql/data
    networks:
      - new-api-network

networks:
  new-api-network:
    driver: bridge

volumes:
  pg_data:
EOF
}

write_compat_dockerfile() {
  cat > "$ROOT_DIR/Dockerfile" <<'EOF'
FROM golang:1.26.1-alpine@sha256:2389ebfa5b7f43eeafbd6be0c3700cc46690ef842ad962f6c5bd6be49ed82039 AS builder2
ENV GO111MODULE=on CGO_ENABLED=0

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64}
ENV GOEXPERIMENT=greenteagc

WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
COPY web/dist ./web/dist
RUN go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'" -o new-api

FROM calciumion/new-api:latest

COPY --from=builder2 /build/new-api /new-api
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
EOF
}

write_compat_makefile() {
  cat > "$ROOT_DIR/makefile" <<'EOF'
FRONTEND_DIR = ./web
BACKEND_DIR = .

.PHONY: all build-frontend start-backend

all: build-frontend start-backend

build-frontend:
	@echo "Building frontend..."
	@cd $(FRONTEND_DIR) && bun install && DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=$(cat VERSION) bun run build

start-backend:
	@echo "Starting backend dev server..."
	@cd $(BACKEND_DIR) && go run main.go &
EOF
}

patch_main_go() {
  python3 - <<'PY'
from pathlib import Path
path = Path('main.go')
text = path.read_text()
old = """//go:embed web/default/dist
var buildFS embed.FS

//go:embed web/default/dist/index.html
var indexPage []byte

//go:embed web/classic/dist
var classicBuildFS embed.FS

//go:embed web/classic/dist/index.html
var classicIndexPage []byte
"""
new = """// Compatibility with this fork: keep using the existing single-frontend build output.
// We map both default/classic theme assets to the current web/dist layout.
//go:embed web/dist
var buildFS embed.FS

//go:embed web/dist/index.html
var indexPage []byte

//go:embed web/dist
var classicBuildFS embed.FS

//go:embed web/dist/index.html
var classicIndexPage []byte
"""
if old in text:
    text = text.replace(old, new, 1)
elif new in text:
    pass
else:
    raise SystemExit('main.go embed block not found; please check upstream changes manually')
path.write_text(text)
PY
}

ensure_required_state() {
  need_cmd git
  need_cmd docker
  need_cmd curl
  need_cmd python3

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    err "当前目录不是 git 仓库"
    exit 1
  fi

  if ! git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
    err "缺少远端 '$UPSTREAM_REMOTE'"
    err "先执行: git remote add $UPSTREAM_REMOTE <UPSTREAM_GIT_URL>"
    exit 1
  fi

  if [[ ! -x "$ROOT_DIR/bin/sync-backend-only.sh" ]]; then
    err "缺少可执行脚本: bin/sync-backend-only.sh"
    exit 1
  fi
}

run_sync() {
  log "同步后端自 ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}"
  UPSTREAM_REMOTE="$UPSTREAM_REMOTE" \
  UPSTREAM_BRANCH="$UPSTREAM_BRANCH" \
  PREVIEW_ONLY="$PREVIEW_ONLY" \
  "$ROOT_DIR/bin/sync-backend-only.sh"
}

apply_fork_compat_patches() {
  log "恢复当前 fork 的部署 compose 配置"
  write_runtime_compose

  log "重写兼容版 Dockerfile"
  write_compat_dockerfile

  log "重写兼容版 makefile"
  write_compat_makefile

  log "修补 main.go 的 embed 路径，继续兼容单前端 web/dist"
  patch_main_go
}

show_diff_summary() {
  echo
  log "当前 git 状态"
  git status -sb
  echo
  log "当前 diff 统计"
  git diff --stat || true
}

redeploy() {
  log "开始重建并重启服务: ${COMPOSE_SERVICE}"
  docker compose up -d --build "$COMPOSE_SERVICE"
}

wait_for_health() {
  local i body
  log "等待健康检查: ${HEALTHCHECK_URL}"
  for ((i=1; i<=HEALTHCHECK_RETRIES; i++)); do
    if body="$(curl -fsS --max-time 8 "$HEALTHCHECK_URL")"; then
      if grep -q '"success":true' <<<"$body"; then
        log "健康检查通过（第 ${i} 次）"
        echo "$body"
        return 0
      fi
      warn "接口已响应，但 success != true（第 ${i} 次）"
    else
      warn "接口暂未就绪（第 ${i} 次）"
    fi
    sleep "$HEALTHCHECK_SLEEP"
  done

  err "健康检查超时：${HEALTHCHECK_URL}"
  return 1
}

main() {
  ensure_required_state

  if [[ "$PREVIEW_ONLY" == "1" ]]; then
    run_sync
    exit 0
  fi

  run_sync
  apply_fork_compat_patches
  show_diff_summary

  if [[ "$SKIP_DEPLOY" == "1" ]]; then
    warn "SKIP_DEPLOY=1，已跳过部署"
    exit 0
  fi

  redeploy
  wait_for_health

  echo
  log "完成。建议后续检查："
  echo "  git status -sb"
  echo "  docker ps --filter name='^/${COMPOSE_SERVICE}$'"
  echo "  docker logs --tail 100 ${COMPOSE_SERVICE}"
}

main "$@"
