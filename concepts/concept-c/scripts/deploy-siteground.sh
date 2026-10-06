#!/usr/bin/env bash
# Publishes the built site to a SiteGround document root over SSH (rsync).
#
#   SG_HOST=gcam1318.siteground.biz SG_USER=<ssh user> SG_PATH='www/<domain>/public_html' \
#     npm run deploy:siteground
#
# Needs SSH access that already works from this machine (key or agent).
# Optional: SG_PORT (default 18765), SG_KEY (private key file), DRY_RUN=1 (list changes only),
#           SG_DELETE=1 (also remove remote files that are not in this build; off by default).
# No credentials are stored here. SG_PATH is relative to the SSH user's home directory.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${SG_HOST:?set SG_HOST, e.g. gcam1318.siteground.biz}"
: "${SG_USER:?set SG_USER (the SiteGround SSH user)}"
: "${SG_PATH:?set SG_PATH, e.g. www/example.com/public_html}"
SG_PORT="${SG_PORT:-18765}"

case "$SG_PATH" in
  ''|/|.|..|~|~/) echo "Refusing to deploy to '$SG_PATH': point SG_PATH at the site's public_html folder." >&2; exit 2 ;;
esac

SSH=(ssh -p "$SG_PORT" -o StrictHostKeyChecking=accept-new)
[ -n "${SG_KEY:-}" ] && SSH+=(-i "$SG_KEY")

HTACCESS=deploy/siteground/.htaccess
[ -f "$HTACCESS" ] || { echo "Missing $HTACCESS (the server config for SiteGround)." >&2; exit 2; }

echo "Building..."
npm run build --silent
cp "$HTACCESS" dist/.htaccess

FLAGS=(-rlvz --human-readable --chmod=D755,F644 --exclude='.well-known' --exclude='cgi-bin' --exclude='.htpasswd')
[ "${DRY_RUN:-}" = "1" ] && FLAGS+=(--dry-run)
[ "${SG_DELETE:-}" = "1" ] && FLAGS+=(--delete)

echo "Target: $SG_USER@$SG_HOST:$SG_PATH (port $SG_PORT)${DRY_RUN:+ [dry run]}"
# index.html goes last so visitors never see a page that points at files that are not there yet
rsync "${FLAGS[@]}" -e "${SSH[*]}" --exclude='/index.html' dist/ "$SG_USER@$SG_HOST:$SG_PATH/"
rsync "${FLAGS[@]}" -e "${SSH[*]}" dist/index.html "$SG_USER@$SG_HOST:$SG_PATH/index.html"
echo "Done."
