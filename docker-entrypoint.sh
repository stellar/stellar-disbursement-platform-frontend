#!/bin/sh
# Entrypoint script to generate env-config.js from environment variables

# Default values
API_URL="${API_URL:-http://localhost:8000}"
STELLAR_EXPERT_URL="${STELLAR_EXPERT_URL:-https://stellar.expert/explorer/testnet}"
HORIZON_URL="${HORIZON_URL:-https://horizon-testnet.stellar.org}"
RPC_ENABLED="${RPC_ENABLED:-true}"
RECAPTCHA_SITE_KEY="${RECAPTCHA_SITE_KEY:-}"
SINGLE_TENANT_MODE="${SINGLE_TENANT_MODE:-true}"

# Create settings directory
mkdir -p /usr/share/nginx/html/settings

# Generate env-config.js
cat > /usr/share/nginx/html/settings/env-config.js <<EOF
window._env_ = {
    API_URL: "${API_URL}",
    STELLAR_EXPERT_URL: "${STELLAR_EXPERT_URL}",
    HORIZON_URL: "${HORIZON_URL}",
    RPC_ENABLED: ${RPC_ENABLED},
    RECAPTCHA_SITE_KEY: "${RECAPTCHA_SITE_KEY}",
    SINGLE_TENANT_MODE: ${SINGLE_TENANT_MODE}
};
EOF

echo "Generated env-config.js:"
cat /usr/share/nginx/html/settings/env-config.js

# Execute the original nginx entrypoint
exec "$@"