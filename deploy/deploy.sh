#!/usr/bin/env bash
# Ishlatilishi: deploy.sh [OLD_SHA]  — OLD bo'sh bo'lsa, hammasi qayta build qilinadi.
# Faqat o'zgargan ilovalar build/restart qilinadi. Xato bo'lsa to'xtaydi, eski versiya ishlashda qoladi.
set -Eeuo pipefail

REPO="$HOME/newspaper"
DATA="$HOME/newspaper-data"
STATE="$HOME/.newspaper-deployed"
ECO="$REPO/ecosystem.config.cjs"
OLD="${1:-}"
NEW="$(git -C "$REPO" rev-parse HEAD)"

log() { printf '\n==> %s\n' "$*"; }
trap 'log "XATO (${BASH_LINENO[0]}-qator). Deploy toxtadi, sayt oldingi versiyada ishlayapti."' ERR

changed() {
  [[ -z "$OLD" ]] && return 0
  git -C "$REPO" cat-file -e "${OLD}^{commit}" 2>/dev/null || return 0
  ! git -C "$REPO" diff --quiet "$OLD" "$NEW" -- "$@"
}

install_deps() {
  local app="$1"
  if [[ ! -d "$REPO/$app/node_modules" ]] || changed "$app/package-lock.json"; then
    log "$app: npm ci"
    (cd "$REPO/$app" && npm ci --include=dev --no-audit --no-fund)
  fi
}

restart() {
  pm2 delete "$1" >/dev/null 2>&1 || true
  pm2 start "$ECO" --only "$1"
}

link_uploads() {
  local target="$REPO/backend/dist/uploads"
  mkdir -p "$DATA/uploads" "$REPO/backend/dist"
  if [[ ! -L "$target" ]]; then
    if [[ -d "$target" ]]; then
      rsync -a "$target/" "$DATA/uploads/"
      rm -rf "$target"
    fi
    ln -s "$DATA/uploads" "$target"
  fi
}

deploy_backend() {
  if ! changed backend/ ecosystem.config.cjs; then log "backend: ozgarish yoq"; return; fi
  install_deps backend
  cd "$REPO/backend"
  if [[ -n "$OLD" ]] && changed backend/prisma/schema.prisma; then
    log "backend: prisma db push"
    npx prisma db push
  fi
  npx prisma generate
  log "backend: build"
  npm run build
  link_uploads
  cd "$REPO"
  restart nb-backend
}

deploy_next() {
  local app="$1" name="$2"
  if ! changed "$app/" ecosystem.config.cjs; then log "$app: ozgarish yoq"; return; fi
  install_deps "$app"
  log "$app: build"
  (cd "$REPO/$app" && npm run build)
  restart "$name"
}

log "Deploy: ${OLD:-birinchi} -> $NEW"
deploy_backend
deploy_next frontend nb-front
deploy_next admin nb-admin
pm2 save
echo "$NEW" > "$STATE"
log "Tayyor: $NEW"
