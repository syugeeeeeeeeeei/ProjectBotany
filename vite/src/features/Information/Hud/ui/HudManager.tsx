import { useGameQuery } from "@/core/api";
import { SidePanel } from "./SidePanel";
import { PlayerStatus } from "./PlayerStatus";
// GameInfoが必要ならここに追加

export const HudManager: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();
  const currentRound = useGameQuery.useCurrentRound();
  const activePlayer = useGameQuery.useActivePlayer();

  // プレイヤーカラー定義（PlayerStatus内の定義と統一）
  const NATIVE_COLOR = "#66BB6A"; // Green
  const ALIEN_COLOR = "#E57373"; // Red

  // ゲーム中でない、またはゲームオーバー時はHUDを隠す（必要に応じて調整）
  if (currentRound === 0 || isGameOver) return null;

  return (
    <>
      <SidePanel
        position="left"
        isActive={activePlayer === "native"}
        accentColor={NATIVE_COLOR}
      >
        {(isOpen) => <PlayerStatus playerId="native" isOpen={isOpen} />}
      </SidePanel>
      <SidePanel
        position="right"
        isActive={activePlayer === "alien"}
        accentColor={ALIEN_COLOR}
      >
        {(isOpen) => <PlayerStatus playerId="alien" isOpen={isOpen} />}
      </SidePanel>
    </>
  );
};
