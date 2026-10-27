#!/usr/bin/env bash
# Deploy the current checkout to staging.lib13.com (Cloudflare Pages project: lib13-staging).
# noindex headers and robots.txt are injected into a temp copy so they never land in git.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

rsync -a \
  --exclude '.git' --exclude 'scripts' --exclude 'CNAME' --exclude 'README.md' \
  --exclude '.gitignore' --exclude '.DS_Store' --exclude '.wrangler' \
  "$ROOT/" "$OUT/"

printf 'User-agent: *\nDisallow: /\n' > "$OUT/robots.txt"
printf '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n' > "$OUT/_headers"

wrangler pages deploy "$OUT" --project-name lib13-staging --branch staging \
  --commit-message "$(git -C "$ROOT" log -1 --pretty=%s)" --commit-dirty=true
