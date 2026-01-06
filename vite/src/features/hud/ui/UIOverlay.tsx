import React, { useState, useEffect } from "react";
import { useGameQuery, gameActions } from "@/core/api";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { CoreEventMap } from "@/core/types/events";
import { PlayerStatus } from "./PlayerStatus";
import { SidePanel } from "./SidePanel";
import { GameOverDialog } from "./GameOverDialog";
import { TitleScreen } from "./TitleScreen";
import { TurnBanner } from "./TurnBanner";
import { GAME_SETTINGS } from "@/shared/constants/game-config";

const BANNER_DURATION = 2000;
const BANNER_FADE_OUT = 500;
const MAX_ROUNDS = GAME_SETTINGS.MAXIMUM_ROUNDS;

export const UIOverlay: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();
  const currentRound = useGameQuery.useCurrentRound();
  const activePlayer = useGameQuery.useActivePlayer();

  // UI進行管理
  const [hasStarted, setHasStarted] = useState(false);

  // バナー表示管理
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
      }, BANNER_FADE_OUT);
    }, BANNER_DURATION);
  };

  const handleStart = () => {
    setHasStarted(true);
    const roundText =
      currentRound === MAX_ROUNDS ? "FINAL ROUND" : `ROUND ${currentRound}`;
    triggerBanner(roundText, `${getPlayerLabel(activePlayer)}のターン`);
  };

  const handleRestart = () => {
    gameActions.system.reset();
    setHasStarted(false);
    setShowBanner(false);
  };

  useEffect(() => {
    if (!hasStarted || isGameOver) return;

    const onRoundStart = (payload: CoreEventMap["ROUND_START"]) => {
      const isFinal = payload.round === MAX_ROUNDS;
      const roundText = isFinal ? "FINAL ROUND" : `ROUND ${payload.round}`;
      triggerBanner(roundText, `${getPlayerLabel(activePlayer)}のターン`);

      // ✨ 通知の例: ラウンド開始
      gameActions.ui.notify({
        message: `ラウンド ${payload.round} 開始`,
        type: "system",
      });
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
  }, [hasStarted, isGameOver, activePlayer]);

  return (
    <div
      style={{
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Phase 1: Title Screen */}
      {!hasStarted && (
        <>
          <TitleScreen side="top" onStart={handleStart} />
          <TitleScreen side="bottom" onStart={handleStart} />
        </>
      )}

      {/* Phase 2: In Game HUD */}
      {hasStarted && !isGameOver && (
        <>
          {/* ✨ SidePanel with Render Props */}
          <SidePanel position="left">
            {(isOpen) => <PlayerStatus playerId="native" isOpen={isOpen} />}
          </SidePanel>
          <SidePanel position="right">
            {(isOpen) => <PlayerStatus playerId="alien" isOpen={isOpen} />}
          </SidePanel>

          {showBanner && (
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
          )}
        </>
      )}

      {/* Phase 3: Game Over */}
      {isGameOver && (
        <>
          <GameOverDialog
            side="top"
            playerId="native"
            onRestart={handleRestart}
          />
          <GameOverDialog
            side="bottom"
            playerId="alien"
            onRestart={handleRestart}
          />
        </>
      )}
    </div>
  );
};
