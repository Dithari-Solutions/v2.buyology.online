#!/usr/bin/env bash
set -euo pipefail
umask 077

# Run on web-app-1 after the backend deployment succeeds. Both frontend replicas
# receive this same build, with old static assets retained for already-open tabs.
buyology_repo_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd "$buyology_repo_dir"
if [[ "$(git branch --show-current)" != "main" ]]; then
  printf '%s\n' 'Run this deployment from the main branch.' >&2
  exit 1
fi
git pull --ff-only origin main
buyology_build_id=$(git rev-parse --short HEAD)
buyology_build_dir=$(mktemp -d "${TMPDIR:-/tmp}/buyology-v2-build.XXXXXX")
trap 'rm -rf -- "$buyology_build_dir"' EXIT

# Next cleans its output directory. Keep the live checkout untouched while building.
git archive HEAD | tar -x -C "$buyology_build_dir"
for buyology_env_file in .env .env.local .env.production .env.production.local; do
  if [[ -f "$buyology_env_file" ]]; then
    cp -- "$buyology_env_file" "$buyology_build_dir/$buyology_env_file"
  fi
done
(
  cd "$buyology_build_dir"
  npm ci
  NEXT_BUILD_ID="$buyology_build_id" \
    NEXT_PUBLIC_API_BASE="${NEXT_PUBLIC_API_BASE:-https://api.buyology.online}" npm run build
)

buyology_bundle="$buyology_build_dir/.next/standalone"
mkdir -p "$buyology_bundle/.next/static" "$buyology_bundle/public"
if [[ -d .next/standalone/.next/static ]]; then
  cp -r .next/standalone/.next/static/. "$buyology_bundle/.next/static/"
fi
# Earlier independently built replicas may have different old chunk names.
rsync -a --ignore-existing web-app-2:~/buyology-v2/.next/standalone/.next/static/ \
  "$buyology_bundle/.next/static/"
cp -r "$buyology_build_dir/.next/static/." "$buyology_bundle/.next/static/"
cp -r "$buyology_build_dir/public/." "$buyology_bundle/public/"

mkdir -p .next/standalone
# Merge so old code/assets remain available during the brief restart window.
rsync -a "$buyology_bundle/" .next/standalone/
rsync -a "$buyology_bundle/" web-app-2:~/buyology-v2/.next/standalone/
pm2 restart buyology-v2
ssh web-app-2 'pm2 restart buyology-v2'
