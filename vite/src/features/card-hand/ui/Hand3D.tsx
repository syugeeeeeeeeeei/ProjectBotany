import React from "react";
// 修正: 未使用の animated, useSpring を削除
import { useGameQuery } from "@/core/api/queries";
import type { PlayerType } from "@/shared/types/game-schema";
import Card3D from "./Card3D";
import cardMasterData from "@/shared/data/cardMasterData";
import { DESIGN } from "@/shared/constants/design-tokens";

interface Hand3DProps {
  player: PlayerType;
}

/**
 * 手札コンポーネント
 * 各プレイヤーの手札を3D空間に整列して表示する
 */
const Hand3D: React.FC<Hand3DProps> = ({ player }) => {
  const playerState = useGameQuery.usePlayer(player);

  if (!playerState) return null;

  const facingFactor = playerState.facingFactor;

  // カードデータ(ID)とマスターデータを結合
  const cards = playerState.cardLibrary
    .map((instance) => {
      const def = cardMasterData.find(
        (c) => c.id === instance.cardDefinitionId,
      );
      if (!def) return null;
      return { ...def, instanceId: instance.instanceId };
    })
    .filter((c) => c !== null);

  return (
    <group
      position={[
        0,
        DESIGN.HAND.POSITION_Y,
        DESIGN.HAND.Z_POS_VISIBLE * facingFactor,
      ]}
    >
      {cards.map((card, index) => {
        // 修正: 未使用の isSelected 変数を削除
        const xPos =
          (index - (cards.length - 1) / 2) *
          (DESIGN.HAND.CARD_WIDTH + 0.2) *
          facingFactor;

        return (
          <group
            key={card!.instanceId}
            position={[xPos, 0, 0]}
            rotation={[DESIGN.HAND.TILT_ANGLE_BASE * -facingFactor, 0, 0]}
          >
            <Card3D
              card={card!}
              player={player}
              width={DESIGN.HAND.CARD_WIDTH}
              opacity={1}
              // 補足: selectedCardId は Card3D 内部で useUIStore から取得しているため、isSelected を渡す必要はありません
            />
          </group>
        );
      })}
    </group>
  );
};

export default Hand3D;
