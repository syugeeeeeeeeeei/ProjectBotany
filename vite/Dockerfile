# -----------------------------------------------------------
# Base Stage: 共通の依存関係インストール
# -----------------------------------------------------------
FROM node:24-alpine AS base
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
# Corepack有効化と依存関係インストール
RUN corepack enable && yarn set version stable
RUN yarn install --frozen-lockfile

# -----------------------------------------------------------
# Dev Stage: 開発用 (Bind Mount前提)
# -----------------------------------------------------------
FROM base AS dev
# 開発サーバーのポート
EXPOSE 5173
# 開発時は bind mount するため、ここではソースをコピーしない
CMD ["yarn", "dev", "--host"]

# -----------------------------------------------------------
# Builder Stage: 本番用ビルド
# -----------------------------------------------------------
FROM base AS builder
# ソースコードを全てコピー
COPY . .
# ビルド実行
RUN yarn build

# -----------------------------------------------------------
# Prod Stage: 本番用配信 (Nginx)
# -----------------------------------------------------------
FROM nginx:alpine AS prod
# ビルド成果物をNginxのドキュメントルートにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA用の簡易Nginx設定を作成 (リクエストをindex.htmlにフォールバック)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]