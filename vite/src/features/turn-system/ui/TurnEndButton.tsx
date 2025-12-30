import React from "react";
import { gameActions, useGameQuery } from "@/core/api";
import { BaseActionButton } from "@/shared/components/BaseActionButton"; // ※なければHTMLボタンで代用

/**
 * ターン終了ボタン
 * 現在のプレイヤーが自分のターンの時だけ押せる
 */
const TurnEndButton: React.FC = () => {
  const activePlayer = useGameQuery.useActivePlayer();
  const currentTurn = useGameQuery.useCurrentTurn();

  // 開発中はどちらのプレイヤーでも押せるようにしておくと楽ですが、
  // ここでは一旦「誰でも押せる」状態にします。
  // 本番ルールなら: const isMyTurn = activePlayer === props.player;

  const handleClick = () => {
    console.log("🔄 Turn End Requested");
    gameActions.turn.next();
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        pointerEvents: "auto",
      }}
    >
      <BaseActionButton
        onClick={handleClick}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: activePlayer === "native" ? "#2E7D32" : "#C62828", // Native=緑, Alien=赤
          color: "white",
          border: "2px solid white",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        Turn End ({currentTurn})
      </BaseActionButton>
      <div
        style={{
          marginTop: "5px",
          textAlign: "right",
          color: "white",
          fontSize: "12px",
          textShadow: "1px 1px 0 #000",
        }}
      >
        Current: {activePlayer.toUpperCase()}
      </div>
    </div>
  );
};

export default TurnEndButton;
