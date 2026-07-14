FROM ubuntu:26.04 as build

LABEL maintainer="SDF Ops Team <ops@stellar.org>"

RUN mkdir -p /app
WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install --no-install-recommends -y gpg curl git make g++ ca-certificates apt-transport-https && \
    curl -sSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key|gpg --dearmor >/etc/apt/trusted.gpg.d/nodesource-key.gpg && \
    echo "deb https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg |gpg --dearmor >/etc/apt/trusted.gpg.d/yarnpkg.gpg && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y nodejs yarn && apt-get clean


COPY . /app/
# Handle git-info for submodule (git rev-parse won't work without .git)
# Create a fallback gitInfo.ts if git is not available
RUN if git rev-parse --short HEAD 2>/dev/null; then \
        rm -rf src/generated/ && mkdir -p src/generated/ && \
        echo "export default { commitHash: '$(git rev-parse --short HEAD)', version: '$(git describe --tags --always)' };" > src/generated/gitInfo.ts; \
    else \
        rm -rf src/generated/ && mkdir -p src/generated/ && \
        echo "export default { commitHash: 'local', version: 'local-dev' };" > src/generated/gitInfo.ts; \
    fi
RUN yarn install
RUN yarn build

FROM nginx:1.31

COPY --from=build /app/build/ /usr/share/nginx/html/
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Create settings directory for runtime config
RUN mkdir -p /usr/share/nginx/html/settings

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose environment variables for runtime configuration
ENV API_URL="http://localhost:8000"
ENV STELLAR_EXPERT_URL="https://stellar.expert/explorer/testnet"
ENV HORIZON_URL="https://horizon-testnet.stellar.org"
ENV RPC_ENABLED="true"
ENV RECAPTCHA_SITE_KEY=""
ENV SINGLE_TENANT_MODE="true"

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]