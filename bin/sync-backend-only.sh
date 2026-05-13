#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
PREVIEW_ONLY="${PREVIEW_ONLY:-0}"

BACKEND_PATHS=(
  common
  constant
  controller
  dto
  i18n
  logger
  middleware
  model
  oauth
  pkg
  relay
  router
  service
  setting
  types
  main.go
  go.mod
  go.sum
  Dockerfile
  docker-compose.yml
  makefile
  VERSION
)

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[ERR] 当前目录不是 git 仓库" >&2
  exit 1
fi

if ! git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
  echo "[ERR] 缺少远端 '$UPSTREAM_REMOTE'。先执行：" >&2
  echo "  git remote add upstream <UPSTREAM_GIT_URL>" >&2
  exit 1
fi

echo "[INFO] fetch $UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
git fetch "$UPSTREAM_REMOTE" --prune

echo
echo "[INFO] upstream 新提交："
git log --oneline HEAD.."$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" | sed -n '1,80p' || true

echo
echo "[INFO] upstream 与当前分支的文件差异："
git diff --name-status HEAD.."$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" | sed -n '1,200p' || true

echo
echo "[INFO] 将同步以下后端路径（不会触碰 web/）："
printf ' - %s\n' "${BACKEND_PATHS[@]}"

if [[ "$PREVIEW_ONLY" == "1" ]]; then
  echo
  echo "[INFO] PREVIEW_ONLY=1，仅预览，不执行 checkout。"
  exit 0
fi

git checkout "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" -- "${BACKEND_PATHS[@]}"

echo
echo "[INFO] 已完成后端路径同步。当前变更："
git status --short

echo
echo "[NEXT] 请人工检查后再提交，例如："
echo "  git diff --stat"
echo "  git commit -m 'chore(sync): pull backend updates from upstream'"
