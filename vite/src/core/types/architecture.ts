// src/core/types/architecture.ts
import React from "react";

export interface GameFeature {
  key: string;
  /** アプリ起動時に実行される初期化ロジック (Event Listener登録など) */
  init?: () => void;
  /** 画面の特定レイヤーに配置されるコンポーネント */
  components?: {
    /** 盤面レイヤー (Main View) */
    main?: React.FC;
    /** UIオーバーレイ (HUD) */
    ui?: React.FC;
  };
}
