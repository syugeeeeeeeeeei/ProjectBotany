#!/bin/bash

# ---------------------------------------------------------
# 🏗️ Project Botany: Core-Feature Refactoring Setup Script
# ---------------------------------------------------------

echo "🚀 Starting refactoring setup..."

# 1. 退避用ディレクトリの作成
echo "📦 Moving current src to legacy..."
if [ -d "src" ]; then
  mkdir -p legacy
  # 日付付きで退避させると安全ですが、今回は計画書通りシンプルに
  mv src legacy/src_v1
  echo "✅ Moved src to legacy/src_v1"
else
  echo "⚠️ 'src' directory not found. Assuming clean slate or already moved."
fi

# 2. 新しいディレクトリ構造の作成
echo "📂 Creating new directory structure..."

# Root
mkdir -p src

# Core Layer (Kernel)
mkdir -p src/core/store
mkdir -p src/core/event-bus
mkdir -p src/core/systems
mkdir -p src/core/api
mkdir -p src/core/ui
mkdir -p src/core/types

# Feature Layer (Plugins)
mkdir -p src/features
mkdir -p src/features/field-grid/ui
mkdir -p src/features/turn-system/ui
mkdir -p src/features/play-card/ui
mkdir -p src/features/alien-expansion
mkdir -p src/features/card-hand/ui

# Shared Layer (Library)
mkdir -p src/shared/types
mkdir -p src/shared/constants
mkdir -p src/shared/utils
mkdir -p src/shared/components/3d
mkdir -p src/shared/components/ui
mkdir -p src/shared/assets

# App Layer (Wiring)
mkdir -p src/app
mkdir -p src/app/registry

# 3. ファイルのプレースホルダー作成 (空ファイル)
echo "📄 Creating placeholder files..."

# Core
touch src/core/store/gameStore.ts
touch src/core/store/uiStore.ts
touch src/core/event-bus/GameEventBus.ts
touch src/core/event-bus/events.ts
touch src/core/systems/TurnSystem.ts
touch src/core/systems/FieldSystem.ts
touch src/core/api/index.ts
touch src/core/api/actions.ts
touch src/core/api/queries.ts
touch src/core/types/index.ts

# Shared
touch src/shared/types/index.ts
touch src/shared/types/game-schema.ts
touch src/shared/types/primitives.ts
touch src/shared/constants/design-tokens.ts
touch src/shared/constants/game-config.ts
touch src/shared/types/architecture.ts

# App
touch src/app/App.tsx
touch src/app/main.tsx
touch src/app/GameComposition.ts

echo "✨ Scaffolding complete! Starting Phase 1..."