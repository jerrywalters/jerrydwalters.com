#!/usr/bin/env sh
# Workers Builds runs this as the deploy step for EVERY branch it builds.
# Only the production branch (main) deploys live; every other branch uploads a
# preview version (→ a workers.dev preview URL) WITHOUT touching production.
#
# Set the Workers Builds "Deploy command" to:  sh scripts/deploy.sh
set -e

BRANCH="${WORKERS_CI_BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)}"

if [ "$BRANCH" = "main" ]; then
  echo "[deploy] '$BRANCH' is the production branch → wrangler deploy"
  npx wrangler deploy
else
  echo "[deploy] '$BRANCH' is a preview branch → wrangler versions upload (no prod change)"
  npx wrangler versions upload
fi
