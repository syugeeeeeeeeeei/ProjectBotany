import React, { useState, useEffect } from "react";
import { useGameQuery } from "@/core/api";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { CoreEventMap } from "@/core/types/events";
import { TurnBanner } from "./TurnBanner";
import { GAME_SETTINGS } from "@/shared/constants/game-config";

export const BannerManager: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();
  const activePlayer = useGameQuery.useActivePlayer();
  //   const currentRound = useGameQuery.useCurrentRound();

  const [showBanner, setShowBanner] = useState(false);
  const [isBannerExiting, setIsBannerExiting] = useState(false);
  const [bannerContent, setBannerContent] = useState({
    message: "",
    subMessage: "",
  });

  const getPlayerLabel = (id: string) => (id === "alien" ? "外来種" : "在来種");

  const triggerBanner = (message: string, subMessage: string) => {
    setBannerContent({ message, subMessage });
    setShowBanner(true);
    setIsBannerExiting(false);

    setTimeout(() => {
      setIsBannerExiting(true);
      setTimeout(() => {
        setShowBanner(false);
      }, 500); // FADE_OUT time
    }, 2000); // DURATION time
  };

  useEffect(() => {
    if (isGameOver) return;

    const onRoundStart = (payload: CoreEventMap["ROUND_START"]) => {
      const isFinal = payload.round === GAME_SETTINGS.MAXIMUM_ROUNDS;
      const roundText = isFinal ? "FINAL ROUND" : `ROUND ${payload.round}`;
      triggerBanner(roundText, `${getPlayerLabel(activePlayer)}のターン`);
    };

    const onPlayerActionStart = (
      payload: CoreEventMap["PLAYER_ACTION_START"],
    ) => {
      triggerBanner(
        `${getPlayerLabel(payload.playerId)}のターン`,
        "Turn Action",
      );
    };

    gameEventBus.on("ROUND_START", onRoundStart);
    gameEventBus.on("PLAYER_ACTION_START", onPlayerActionStart);

    return () => {
      gameEventBus.off("ROUND_START", onRoundStart);
      gameEventBus.off("PLAYER_ACTION_START", onPlayerActionStart);
    };
  }, [isGameOver, activePlayer]);

  if (!showBanner) return null;

  return (
    <>
      <TurnBanner
        side="top"
        message={bannerContent.message}
        subMessage={bannerContent.subMessage}
        isExiting={isBannerExiting}
      />
      <TurnBanner
        side="bottom"
        message={bannerContent.message}
        subMessage={bannerContent.subMessage}
        isExiting={isBannerExiting}
      />
      {/* バナー表示中は操作ブロック用の透明レイヤー */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 140,
          pointerEvents: "auto",
        }}
      />
    </>
  );
};
