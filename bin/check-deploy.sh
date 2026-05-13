#!/usr/bin/env bash
set -euo pipefail

# Post-deploy verification helper for this fork.
#
# Usage:
#   bin/check-deploy.sh
#
# Optional env vars:
#   SERVICE_NAME=new-api
#   HEALTHCHECK_URL=http://127.0.0.1:3001/api/status
#   HEALTHCHECK_RETRIES=20
#   HEALTHCHECK_SLEEP=2
#   LOG_TAIL=80

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SERVICE_NAME="${SERVICE_NAME:-new-api}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3001/api/status}"
HEALTHCHECK_RETRIES="${HEALTHCHECK_RETRIES:-20}"
HEALTHCHECK_SLEEP="${HEALTHCHECK_SLEEP:-2}"
LOG_TAIL="${LOG_TAIL:-80}"

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

check_container_exists() {
  if ! docker inspect "$SERVICE_NAME" >/dev/null 2>&1; then
    err "容器不存在: $SERVICE_NAME"
    exit 1
  fi
}

show_container_summary() {
  echo
  log "容器状态"
  docker ps --filter "name=^/${SERVICE_NAME}$" \
    --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'

  echo
  log "容器详情"
  docker inspect "$SERVICE_NAME" \
    --format 'Name={{.Name}} Image={{.Config.Image}} StartedAt={{.State.StartedAt}} Health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}'
}

wait_for_status_api() {
  local i body
  echo
  log "等待状态接口: ${HEALTHCHECK_URL}"
  for ((i=1; i<=HEALTHCHECK_RETRIES; i++)); do
    if body="$(curl -fsS --max-time 8 "$HEALTHCHECK_URL")"; then
      if grep -q '"success":true' <<<"$body"; then
        log "状态接口正常（第 ${i} 次）"
        echo "$body"
        return 0
      fi
      warn "接口已返回，但 success != true（第 ${i} 次）"
    else
      warn "接口暂未就绪（第 ${i} 次）"
    fi
    sleep "$HEALTHCHECK_SLEEP"
  done

  err "状态接口检查超时: ${HEALTHCHECK_URL}"
  return 1
}

show_health_json() {
  echo
  log "Docker health 详情"
  docker inspect "$SERVICE_NAME" --format '{{json .State.Health}}'
}

show_recent_logs() {
  echo
  log "最近 ${LOG_TAIL} 行日志"
  docker logs --tail "$LOG_TAIL" "$SERVICE_NAME" 2>&1
}

main() {
  need_cmd docker
  need_cmd curl
  check_container_exists
  show_container_summary
  wait_for_status_api
  show_health_json || true
  show_recent_logs
}

main "$@"
