#!/usr/bin/env bash
# Deploy the current checkout to staging.lib13.com (Cloudflare Pages project: lib13-staging).
# noindex (meta tag, robots.txt, header) is injected into a temp copy so it never lands in git.
# The meta tag is the host-agnostic part: it still works if staging moves to GitHub Pages.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

rsync -a \
  --exclude '.git' --exclude 'scripts' --exclude 'CNAME' --exclude 'README.md' \
  --exclude '.gitignore' --exclude '.DS_Store' --exclude '.wrangler' --exclude 'Makefile' \
  "$ROOT/" "$OUT/"

find "$OUT" -name '*.html' -exec sed -i '' 's#</head>#<meta name="robots" content="noindex, nofollow, noarchive"></head>#' {} +
rm -f "$OUT/sitemap.xml"
printf 'User-agent: *\nDisallow: /\n' > "$OUT/robots.txt"
awk '{print} /^\/\*$/ && !done {print "  X-Robots-Tag: noindex, nofollow, noarchive"; done=1}' "$ROOT/_headers" > "$OUT/_headers"

wrangler pages deploy "$OUT" --project-name lib13-staging --branch staging \
  --commit-message "$(git -C "$ROOT" log -1 --pretty=%s)" --commit-dirty=true
