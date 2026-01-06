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

  /**
   * プレイヤーIDを日本語ラベルに変換するヘルパー
   */
  const getPlayerLabel = (id: string) => (id === "alien" ? "外来種" : "在来種");

  // バナー表示トリガー関数
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

  // ゲーム開始処理
  const handleStart = () => {
    setHasStarted(true);
    // ゲーム開始時：ラウンド数と最初の手番を表示
    const roundText =
      currentRound === MAX_ROUNDS ? "FINAL ROUND" : `ROUND ${currentRound}`;
    triggerBanner(roundText, `${getPlayerLabel(activePlayer)}のターン`);
  };

  const handleRestart = () => {
    gameActions.system.reset();
    setHasStarted(false);
    setShowBanner(false);
  };

  // イベント駆動によるバナー表示制御
  useEffect(() => {
    if (!hasStarted || isGameOver) return;

    // ラウンド開始イベント
    const onRoundStart = (payload: CoreEventMap["ROUND_START"]) => {
      const isFinal = payload.round === MAX_ROUNDS;
      const roundText = isFinal ? "FINAL ROUND" : `ROUND ${payload.round}`;

      // ラウンド開始時も、その時点の activePlayer の手番を表示
      triggerBanner(roundText, `${getPlayerLabel(activePlayer)}のターン`);
    };

    // プレイヤーアクション開始（ターン切替）イベント
    const onPlayerActionStart = (
      payload: CoreEventMap["PLAYER_ACTION_START"],
    ) => {
      // ターン切替時は、メインメッセージに手番を表示
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
  }, [hasStarted, isGameOver, activePlayer]); // activePlayer を依存配分に追加して最新を参照

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
          <SidePanel position="left">
            <PlayerStatus playerId="native" />
          </SidePanel>
          <SidePanel position="right">
            <PlayerStatus playerId="alien" />
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
