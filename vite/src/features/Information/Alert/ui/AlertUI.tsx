import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useUIStore, NotificationItem } from "@/core/store/uiStore";
import { useGameQuery } from "@/core/api/queries";

// --- Animations ---
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-50%); opacity: 0; }
`;

// --- Styles ---
const AlertContainer = styled.div<{ $isInverted: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000; /* 最前面 */
  pointer-events: none; /* 下の要素を触れるようにコンテナ自体はスルー */

  /* ✨ 修正: プレイヤー視点に合わせて配置と回転を切り替える */
  ${({ $isInverted }) =>
    $isInverted
      ? css`
          /* 在来種(相手)視点: 画面右下に配置して180度回転 => 相手から見て左上 */
          bottom: calc(100vh / 2.5);
          right: 20px;
          transform: rotate(180deg);
        `
      : css`
          /* 外来種(自分)視点: 画面左上に配置 */
          top: calc(100vh / 2.5);
          left: 20px;
          transform: none;
        `}

  /* 回転の中心はボックスの中心 */
  transform-origin: center;
  transition: all 0.5s ease-in-out;
`;

const AlertItemWrapper = styled.div<{ $type: string; $isExiting: boolean }>`
  background: ${({ $type }) =>
    $type === "error"
      ? "rgba(211, 47, 47, 0.9)"
      : $type === "success"
        ? "rgba(56, 142, 60, 0.9)"
        : "rgba(25, 118, 210, 0.9)"};
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  min-width: 250px;
  max-width: 400px;

  /* ✨ 修正: インタラクションを有効化 */
  pointer-events: auto;
  cursor: pointer;
  user-select: none;

  /* Animation */
  animation: ${({ $isExiting }) =>
    $isExiting
      ? css`
          ${fadeOut} 0.3s ease-in forwards
        `
      : css`
          ${slideIn} 0.3s ease-out forwards
        `};

  &:active {
    filter: brightness(0.9);
  }
`;

// --- Components ---

const AlertItem: React.FC<{ item: NotificationItem }> = ({ item }) => {
  const removeNotification = useUIStore((s) => s.removeNotification);
  const [isExiting, setIsExiting] = useState(false);

  // スワイプ検知用のRef
  const touchStartRef = useRef<number | null>(null);

  // マウント時にタイマーセット、アンマウント時にクリア
  useEffect(() => {
    // 既に終了プロセスに入っている場合はタイマー不要
    if (isExiting) return;

    const duration = item.type === "error" ? 4000 : 2500; // エラーは少し長く

    // 表示時間終了後にフェードアウトを開始
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [item.type, isExiting]);

  // isExitingがtrueになったら、アニメーション時間待ってから削除
  useEffect(() => {
    if (!isExiting) return;

    const removeTimer = setTimeout(() => {
      removeNotification(item.id);
    }, 300); // Animation duration

    return () => clearTimeout(removeTimer);
  }, [isExiting, item.id, removeNotification]);

  // タップ処理
  const handleClick = () => {
    setIsExiting(true);
  };

  // スワイプ処理 (Touch Events)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStartRef.current - touchEnd;

    // 50px以上左にスワイプしたら削除
    if (distance > 50) {
      setIsExiting(true);
    }

    touchStartRef.current = null;
  };

  return (
    <AlertItemWrapper
      $type={item.type}
      $isExiting={isExiting}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
        {item.type.toUpperCase()}
      </div>
      <div>{item.message}</div>
    </AlertItemWrapper>
  );
};

export const AlertUI: React.FC = () => {
  const notifications = useUIStore((s) => s.notifications);
  const clearNotifications = useUIStore((s) => s.clearNotifications);
  const activePlayer = useGameQuery.useActivePlayer();

  // 前回のプレイヤーを記録して変更を検知
  const prevPlayerRef = useRef(activePlayer);

  // ✨ プレイヤーが交代したら通知を全消去する
  useEffect(() => {
    if (prevPlayerRef.current !== activePlayer) {
      clearNotifications();
      prevPlayerRef.current = activePlayer;
    }
  }, [activePlayer, clearNotifications]);

  // "native" (在来種) のターンであれば反転モード
  const isInverted = activePlayer === "native";

  return (
    <AlertContainer $isInverted={isInverted}>
      {notifications.map((item) => (
        <AlertItem key={item.id} item={item} />
      ))}
    </AlertContainer>
  );
};
