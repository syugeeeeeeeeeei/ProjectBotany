# compose/vite/Dockerfile

# -----------------------------------------------------------
# devステージ: 開発環境用のビルド
# 依存関係のインストールのみを行い、ソースコードはコピーしない
# -----------------------------------------------------------
FROM node:22-alpine AS dev

WORKDIR /app

# package.jsonと.yarnrc.ymlをコピー
# これにより、開発環境でボリュームマウントしても、
# node_modulesが上書きされないようにする
COPY package.json .yarnrc.yml ./

# corepackを有効にし、yarnの安定版をインストール
RUN corepack enable && yarn set version stable

# 依存関係をインストール
RUN yarn install

# -----------------------------------------------------------
# prodステージ: 本番環境用のビルド
# devステージから依存関係をコピーし、ソースコードをコピーしてビルドする
# -----------------------------------------------------------
FROM node:22-alpine AS prod

WORKDIR /app

# devステージからインストール済みの依存関係をコピー
COPY --from=dev /app/node_modules ./node_modules
COPY package.json .yarnrc.yml ./

# アプリケーションのソースコードをコピー
COPY . .

# yarn buildを実行
RUN yarn build
