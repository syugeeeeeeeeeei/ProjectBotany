// Alert/ui/AlertUI.tsx
import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useUIStore, NotificationItem } from "@/core/store/uiStore";

// 🕒 アラートの表示時間はここで定義されています
const ERROR_DURATION = 3000;
const DEFAULT_DURATION = 3000;

// --- Animations ---
const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

// --- Styles ---

/**
 * ✨ 修正: 外来種用コンテナ (正位置)
 * 画面中央より少し下から開始し、下方向へ伸びる（top基準）
 */
const AlienAlertContainer = styled.div`
  position: absolute;
  /* bottom基準だと上に伸びてしまうため、top基準に変更 */
  top: calc(100vh - (100vh / 2.1));
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
  pointer-events: none;
  /* 回転なし */
`;

/**
 * ✨ 修正: 在来種用コンテナ (逆位置)
 * 画面中央より少し上から開始し、上方向（相手の手元）へ伸びる
 */
const NativeAlertContainer = styled.div`
  position: absolute;
  top: calc(100vh / 2.1);
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
  pointer-events: none;

  /* 180度回転（対面表示） */
  transform: rotate(180deg);
  /* ✨ 重要: 回転の中心を「上辺」にすることで、高さが変わっても開始位置を固定する */
  transform-origin: center top;
`;

/**
 * 通知アイテムのラッパー
 * typeに応じてスタイルを変化させる
 */
const AlertItemWrapper = styled.div<{ $type: string; $isExiting: boolean }>`
  /* タイプ別背景色 */
  background: ${({ $type }) => {
    switch ($type) {
      case "error":
        return "rgba(211, 47, 47, 0.95)";
      case "success":
        return "rgba(56, 142, 60, 0.95)";
      case "system":
        return "rgba(255, 193, 7, 0.95)"; // ゴールド（システム通知）
      default:
        return "rgba(25, 118, 210, 0.95)"; // Info
    }
  }};

  /* システム通知の場合は文字色を黒に、それ以外は白 */
  color: "#fff";

  /* システム通知の場合は太枠をつける */
  border: ${({ $type }) => ($type === "system" ? "2px solid #fff" : "none")};

  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: ${({ $type }) => ($type === "system" ? "bold" : "normal")};

  min-width: 260px;
  max-width: 400px;

  /* インタラクション有効化 */
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
          ${slideIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards
        `};

  &:active {
    transform: scale(0.98);
    filter: brightness(0.9);
  }
`;

// --- Components ---

const AlertItem: React.FC<{ item: NotificationItem }> = ({ item }) => {
  const removeNotification = useUIStore((s) => s.removeNotification);
  const [isExiting, setIsExiting] = useState(false);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isExiting) return;

    // システム通知やエラーは少し長く表示
    const duration =
      item.type === "error" || item.type === "system"
        ? ERROR_DURATION
        : DEFAULT_DURATION;

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => clearTimeout(exitTimer);
  }, [item.type, isExiting]);

  useEffect(() => {
    if (!isExiting) return;
    const removeTimer = setTimeout(() => {
      removeNotification(item.id);
    }, 300);
    return () => clearTimeout(removeTimer);
  }, [isExiting, item.id, removeNotification]);

  const handleClick = () => setIsExiting(true);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStartRef.current - touchEnd;
    if (Math.abs(distance) > 50) {
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
      {/* タイプ表示（SYSTEM以外の場合） */}
      {item.type !== "system" && (
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "4px",
            fontSize: "0.8em",
            opacity: 0.8,
          }}
        >
          {item.type.toUpperCase()}
        </div>
      )}
      <div>{item.message}</div>
    </AlertItemWrapper>
  );
};

export const AlertUI: React.FC = () => {
  const notifications = useUIStore((s) => s.notifications);

  // 通知をターゲットごとにフィルタリング
  // Alienエリア: targetが 'alien' または 'broadcast'
  const alienNotifications = notifications.filter(
    (n) => n.target === "alien" || n.target === "broadcast",
  );

  // Nativeエリア: targetが 'native' または 'broadcast'
  const nativeNotifications = notifications.filter(
    (n) => n.target === "native" || n.target === "broadcast",
  );

  return (
    <>
      {/* 外来種用アラートエリア（正位置・画面下部） */}
      <AlienAlertContainer>
        {alienNotifications.map((item) => (
          <AlertItem key={`alien-${item.id}`} item={item} />
        ))}
      </AlienAlertContainer>

      {/* 在来種用アラートエリア（逆位置・画面上部） */}
      <NativeAlertContainer>
        {nativeNotifications.map((item) => (
          <AlertItem key={`native-${item.id}`} item={item} />
        ))}
      </NativeAlertContainer>
    </>
  );
};
