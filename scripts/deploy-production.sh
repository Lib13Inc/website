#!/usr/bin/env bash
# Deploy master to production (Cloudflare Pages project: lib13 -> www.lib13.com).
# Deploys what is committed on master, never the working tree.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

git -C "$ROOT" archive master | tar -x -C "$OUT"
rm -rf "$OUT/scripts" "$OUT/CNAME" "$OUT/README.md" "$OUT/.gitignore"

wrangler pages deploy "$OUT" --project-name lib13 --branch master \
  --commit-message "$(git -C "$ROOT" log -1 master --pretty=%s)" --commit-dirty=true
