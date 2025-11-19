# /Services/ProjectBotany/justfile

# -----------------------------------------------------------------
# 💡 シェル設定
# -----------------------------------------------------------------
set shell := ["bash", "-cu"]

SERVICE_NAME := shell("basename $(pwd)")

_default:
  @just --list -u

# [変更] プロファイル指定とDev用Composeファイルの読み込みに対応
build profile='dev':
    @echo "==> 🔨 Building {{SERVICE_NAME}} (Profile: {{profile}})..."
    # Dev用ファイルを指定してビルド (Prodステージも影響を受ける場合はあるが、ターゲット指定があるため安全)
    @docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file ../../.env --profile {{profile}} build

# [変更] 開発環境では dev.yml を上書き読み込みして起動
up profile='dev': build
    @echo "--> 🚀 Starting {{SERVICE_NAME}} (Profile: {{profile}})"
    @docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file ../../.env --profile {{profile}} up -d

# [追加] 本番相当の挙動を確認したい場合 (ボリュームマウントなし)
up-prod profile='dev':
    @echo "--> 🚀 Starting {{SERVICE_NAME}} (Production Mode)"
    @docker compose -f docker-compose.yml --env-file ../../.env --profile {{profile}} up -d --build