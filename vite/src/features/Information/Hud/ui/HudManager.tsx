import { useGameQuery } from "@/core/api";
import { SidePanel } from "./SidePanel";
import { PlayerStatus } from "./PlayerStatus";
// GameInfoが必要ならここに追加

export const HudManager: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();
  const currentRound = useGameQuery.useCurrentRound();

  // ゲーム中でない、またはゲームオーバー時はHUDを隠す（必要に応じて調整）
  // SceneFeature側で「ゲーム開始前」を管理しているため、
  // ここでは厳密な同期が難しいが、Round > 0 なら表示とするなど簡易判定が可能。
  // あるいは、本来は GameStore に `phase: 'title' | 'playing' | 'result'` があるべき。
  // ここでは便宜上、Round > 0 かつ Not GameOver で表示とします。

  if (currentRound === 0 || isGameOver) return null;

  return (
    <>
      <SidePanel position="left">
        {(isOpen) => <PlayerStatus playerId="native" isOpen={isOpen} />}
      </SidePanel>
      <SidePanel position="right">
        {(isOpen) => <PlayerStatus playerId="alien" isOpen={isOpen} />}
      </SidePanel>
    </>
  );
};
