import React from "react";
import styled from "styled-components";
import { useGameStore } from "@/app/store/useGameStore";
import type { PlayerType } from "@/shared/types/game-schema";

const STYLES = {
  BACKGROUND_COLOR: "rgba(0, 0, 0, 0.7)",
  TEXT_COLOR: "white",
  SUB_TEXT_COLOR: "#aaa",
  PADDING: "10px 5px",
  BORDER_RADIUS: "8px",
  GAP: "10px",
  FONT_SIZE: "1.3em",
  SUB_FONT_SIZE: "0.8em",
};

const InfoContainer = styled.div`
  background-color: ${STYLES.BACKGROUND_COLOR};
  color: ${STYLES.TEXT_COLOR};
  padding: ${STYLES.PADDING};
  border-radius: ${STYLES.BORDER_RADIUS};
  display: flex;
  flex-direction: column;
  gap: ${STYLES.GAP};
  align-items: center;
  width: 100%;
`;

const InfoItem = styled.div`
  text-align: center;
  font-size: ${STYLES.FONT_SIZE};
  & > div:first-child {
    font-size: ${STYLES.SUB_FONT_SIZE};
    color: ${STYLES.SUB_TEXT_COLOR};
  }
`;

/**
 * プレイヤー情報表示コンポーネント (GameInfo)
 * 
 * 【動機】
 * プレイヤーの名前や現在の「環境適応力（Environment）」などのステータスを、
 * 視覚的に分かりやすくパネル表示するためです。対戦形式であることを強調するため、
 * 画面の両端（あるいは上下）に配置されることを想定しています。
 *
 * 【恩恵】
 * - `useGameStore` を通じて常に最新のプレイヤーステータスが反映されます。
 * - 半透明の黒背景（Glassmorphism風）を採用することで、背後の 3D シーンの
 *   視認性を保ちつつ、情報を浮き立たせることができます。
 *
 * 【使用法】
 * `App.tsx` 内で `player="alien"` または `player="native"` を指定して配置します。
 */
interface GameInfoProps {
  player: PlayerType;
}

const GameInfo: React.FC<GameInfoProps> = ({ player }) => {
  // ゲームの状態を取得
  const { playerStates } = useGameStore();
  const playerData = playerStates[player];

  // データが存在しない（＝機能無効など）場合は何も表示しない
  if (!playerData) return null;

  /**
   * プレイヤーステータスパネルの描画
   * 現在のプレイヤー名、環境適応力（リソース量）を定常的に監視するために必要です
   */
  return (
    <InfoContainer>
      <InfoItem>
        <div>Player</div>
        <div>{playerData.playerName}</div>
      </InfoItem>
      <InfoItem>
        <div>Environment</div>
        <div>{`${playerData.currentEnvironment} / ${playerData.maxEnvironment}`}</div>
      </InfoItem>
    </InfoContainer>
  );
};

export default GameInfo;
