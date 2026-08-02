#!/usr/bin/env bash
# =============================================================================
# BabyGrow — push .env → EAS Environment Variables
# Usage (from mobile-app/):
#   ./scripts/eas-set-secrets.sh
#   ENVIRONMENTS="preview,production" ./scripts/eas-set-secrets.sh
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Missing .env — copy from .env.example and fill values."
  exit 1
fi

# Load local .env (EXPO_PUBLIC_* only expected)
set -a
# shellcheck disable=SC1091
source .env
set +a

ENVIRONMENTS="${ENVIRONMENTS:-development,preview,production}"
IFS=',' read -r -a ENVS <<< "$ENVIRONMENTS"

upsert() {
  local name="$1"
  local value="$2"
  local visibility="${3:-plaintext}"
  if [[ -z "${value}" ]]; then
    echo "skip ${name} (empty)"
    return 0
  fi
  for env in "${ENVS[@]}"; do
    echo "→ ${name} @ ${env} (${visibility})"
    eas env:create "${env}" \
      --name "${name}" \
      --value "${value}" \
      --type string \
      --visibility "${visibility}" \
      --scope project \
      --force \
      --non-interactive
  done
}

echo "Logged in as: $(eas whoami 2>/dev/null | head -1 || true)"
echo "Project: $(node -e "console.log(require('./app.json').expo.extra.eas.projectId)")"
echo "Environments: ${ENVIRONMENTS}"
echo ""

: "${EXPO_PUBLIC_SUPABASE_URL:?EXPO_PUBLIC_SUPABASE_URL missing in .env}"
: "${EXPO_PUBLIC_SUPABASE_ANON_KEY:?EXPO_PUBLIC_SUPABASE_ANON_KEY missing in .env}"

upsert EXPO_PUBLIC_SUPABASE_URL "${EXPO_PUBLIC_SUPABASE_URL}" plaintext
upsert EXPO_PUBLIC_SUPABASE_ANON_KEY "${EXPO_PUBLIC_SUPABASE_ANON_KEY}" sensitive
upsert EXPO_PUBLIC_MQTT_WS_URL "${EXPO_PUBLIC_MQTT_WS_URL:-wss://broker.emqx.io:8084/mqtt}" plaintext
upsert EXPO_PUBLIC_MQTT_TOPIC "${EXPO_PUBLIC_MQTT_TOPIC:-babygrow/data/sensor}" plaintext
upsert EXPO_PUBLIC_MQTT_CLIENT_PREFIX "${EXPO_PUBLIC_MQTT_CLIENT_PREFIX:-babygrow}" plaintext
upsert EXPO_PUBLIC_MQTT_USERNAME "${EXPO_PUBLIC_MQTT_USERNAME:-}" sensitive
upsert EXPO_PUBLIC_MQTT_PASSWORD "${EXPO_PUBLIC_MQTT_PASSWORD:-}" sensitive
upsert EXPO_PUBLIC_GEMINI_API_KEY "${EXPO_PUBLIC_GEMINI_API_KEY:-}" sensitive

echo ""
echo "Done. Verify:"
echo "  eas env:list preview"
echo "  eas env:list production"
echo ""
echo "Build Android preview APK:"
echo "  eas build --platform android --profile preview --non-interactive"
