# /Services/ProjectBotany/justfile

# -----------------------------------------------------------------
# 💡 シェル設定
# -----------------------------------------------------------------
set shell := ["bash", "-cu"]

SERVICE_NAME := shell("basename $(pwd)")

_default:
  @just --list -u

# [Dev] 開発用ビルド (devプロファイル適用、dev.yml読み込み)
build profile='dev':
    @echo "==> 🔨 Building {{SERVICE_NAME}} (Profile: {{profile}})..."
    @docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file ../../.env --profile {{profile}} build

# [Dev] 開発用起動 (ホットリロード有効)
up profile='dev': build
    @echo "--> 🚀 Starting {{SERVICE_NAME}} (Profile: {{profile}})"
    @docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file ../../.env --profile {{profile}} up -d

# [Prod] 本番相当起動 (ボリュームマウントなし、Nginx配信確認)
up-prod profile='dev':
    @echo "--> 🚀 Starting {{SERVICE_NAME}} (Production Mode)"
    # dev.ymlを読み込まず、Baseのdocker-compose.ymlのみを使用
    @docker compose -f docker-compose.yml --env-file ../../.env --profile {{profile}} up -d --build

# 停止
down:
    @echo "--> 🛑 Stopping {{SERVICE_NAME}}"
    @docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file ../../.env down