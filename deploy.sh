#!/usr/bin/env bash
# Tests, builds and publishes the static frontend to the VM's Nginx web root.
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env ] || { echo "Missing .env (copy .env.example)"; exit 1; }
set -a; . ./.env; set +a
: "${VM_HOST:?}" "${VM_USER:?}" "${SSH_KEY_PATH:?}"
SSH_KEY_PATH="${SSH_KEY_PATH/#\~/$HOME}"

SSH_OPTS=(-i "$SSH_KEY_PATH" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
REMOTE="$VM_USER@$VM_HOST"
STAGING_DIR="/tmp/salary-frontend-dist"
WEB_ROOT="/var/www/salary"

echo "==> Test and build"
npm test
npm run build

echo "==> Upload build"
ssh "${SSH_OPTS[@]}" "$REMOTE" "rm -rf $STAGING_DIR && mkdir -p $STAGING_DIR"
scp "${SSH_OPTS[@]}" -r dist/. "$REMOTE:$STAGING_DIR/"

echo "==> Publish"
ssh "${SSH_OPTS[@]}" "$REMOTE" \
  "sudo rm -rf $WEB_ROOT/* && sudo cp -r $STAGING_DIR/. $WEB_ROOT/ && sudo chown -R root:root $WEB_ROOT && rm -rf $STAGING_DIR"

echo "==> Verify"
curl -fsS -o /dev/null "http://$VM_HOST/" && echo "Frontend reachable: http://$VM_HOST/"
curl -fsS "http://$VM_HOST/api/actuator/health" | grep -q UP && echo "API reachable through Nginx"
