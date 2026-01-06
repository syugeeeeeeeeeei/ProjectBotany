import React, { useState, useEffect, useRef } from "react";
import { useGameQuery } from "@/core/api";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { CoreEventMap } from "@/core/types/events";
import { TurnBanner } from "./TurnBanner";
import { GAME_SETTINGS } from "@/shared/constants/game-config";

export const BannerManager: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();

  // useEffect内では使用しないが、他で使うかもしれないので取得はしておく
  // ただし依存配列には含めない
  useGameQuery.useActivePlayer();

  const [showBanner, setShowBanner] = useState(false);
  const [isBannerExiting, setIsBannerExiting] = useState(false);
  const [bannerContent, setBannerContent] = useState({
    message: "",
    subMessage: "",
  });

  // タイマー管理用のRef
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getPlayerLabel = (id: string) => (id === "alien" ? "外来種" : "在来種");

  const triggerBanner = (message: string, subMessage: string) => {
    // 既存のタイマーがあればクリア（連打やシーケンス時の干渉を防ぐ）
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    setBannerContent({ message, subMessage });
    setShowBanner(true);
    setIsBannerExiting(false);

    // フェードアウト開始までの時間 (2000ms)
    exitTimerRef.current = setTimeout(() => {
      setIsBannerExiting(true);

      // 完全に非表示にするまでの時間 (FadeOut 500ms)
      hideTimerRef.current = setTimeout(() => {
        setShowBanner(false);
      }, 500);
    }, 2000);
  };

  useEffect(() => {
    if (isGameOver) return;

    const onRoundStart = (payload: CoreEventMap["ROUND_START"]) => {
      const isFinal = payload.round === GAME_SETTINGS.MAXIMUM_ROUNDS;
      const roundText = isFinal ? "FINAL ROUND" : `ROUND ${payload.round}`;

      // 1. まずラウンド数を表示 (subMessageなし)
      triggerBanner(roundText, "");

      // 2. バナーが消えた頃を見計らって、プレイヤーの手番を表示
      // 表示時間(2000ms) + フェードアウト(500ms) + 余韻(300ms) = 2800ms
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = setTimeout(() => {
        // ラウンド開始時は常に外来種(alien)から始まる
        triggerBanner(`${getPlayerLabel("alien")}のターン`, "Turn Start");
      }, 2800);
    };

    const onPlayerActionStart = (
      payload: CoreEventMap["PLAYER_ACTION_START"],
    ) => {
      // 進行中のシーケンスタイマーがあればキャンセル（念のため）
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);

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

      // アンマウント時にタイマーを全てクリーンアップ
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    };
    // ✨ 修正: activePlayer を依存配列から削除
    // activePlayerが変わるたびにuseEffectが再実行され、タイマーが消されるのを防ぐ
  }, [isGameOver]);

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
