import React, { useMemo, useRef, useEffect } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { gameActions, useGameQuery } from "@/core/api";
import { useUIStore } from "@/core/store/uiStore";
import { DESIGN } from "@/shared/constants/design-tokens";
import { CellState } from "@/shared/types/game-schema";
import { cardMasterData } from "@/shared/data/cardMasterData";

interface CellProps {
  cell: CellState;
}

// 最低ホバー時間
const HOVER_THRESHOLD = 200;

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const isSelected = useUIStore(
    (s) => s.selectedCell?.x === cell.x && s.selectedCell?.y === cell.y,
  );
  const isHovered = useUIStore(
    (s) => s.hoveredCell?.x === cell.x && s.hoveredCell?.y === cell.y,
  );
  // const isHoverValid = useUIStore((s) => s.isHoverValid);

  const selectedCardId = useUIStore((s) => s.selectedCardId);
  const activePlayerId = useGameQuery.useActivePlayer();
  const playerState = useGameQuery.usePlayer(activePlayerId);

  // タイマー管理用のRef
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 選択中のカード情報を取得
  const selectedCardDef = useMemo(() => {
    if (!selectedCardId || !playerState) return null;
    const handCard = playerState.cardLibrary.find(
      (c) => c.instanceId === selectedCardId,
    );
    if (handCard) {
      return cardMasterData.find((c) => c.id === handCard.cardDefinitionId);
    }
    return cardMasterData.find((c) => c.id === selectedCardId);
  }, [selectedCardId, playerState]);

  // クリーンアップ: コンポーネントアンマウント時にタイマー解除
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const getCellColor = () => {
    switch (cell.type) {
      case "native":
        return DESIGN.COLORS.NATIVE_AREA;
      case "alien":
        return DESIGN.COLORS.ALIEN_INVASION;
      case "pioneer":
        return DESIGN.COLORS.RECOVERY_PENDING;
      case "bare":
        return DESIGN.COLORS.EMPTY;
      default:
        return DESIGN.COLORS.DEFAULT_CELL;
    }
  };

  const getEmissive = () => {
    if (isSelected) return "#ffffff";
    if (isHovered) return "#666666";
    return DESIGN.COLORS.EMISSIVE_DEFAULT;
  };

  // --- Event Handlers ---

  /**
   * ポインタが乗った時: ホバー検知 & タイマー開始
   */
  const handlePointerOver = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    // Store更新
    useUIStore.getState().hoverCell(cell);
    useUIStore.getState().setHoverValid(false); // 最初は無効

    // カード選択中ならタイマー開始
    if (selectedCardId) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

      hoverTimerRef.current = setTimeout(() => {
        // 1秒経過したら配置可能フラグを立てる
        useUIStore.getState().setHoverValid(true);
      }, HOVER_THRESHOLD); // 1秒待機
    }
  };

  /**
   * ポインタが外れた時: ホバー解除 & タイマーリセット
   */
  const handlePointerOut = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    useUIStore.getState().hoverCell(null);
    useUIStore.getState().setHoverValid(false);
  };

  /**
   * ポインタを離した時 (Release): 配置実行
   */
  const handlePointerUp = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    // カード未選択時は通常の選択処理 (即時)
    if (!selectedCardId) {
      useUIStore.getState().selectCell(cell);
      return;
    }

    // 誤タップ防止: 1秒未満のタップ/ホバーなら無視
    if (!useUIStore.getState().isHoverValid) {
      // 必要ならここで「早すぎます」等のフィードバックを出す
      return;
    }

    // バリデーション & 実行
    if (selectedCardDef) {
      let isValid = true;
      let errorMsg = "";

      if (selectedCardDef.cardType === "alien") {
        if (cell.type !== "bare") {
          isValid = false;
          errorMsg = "外来種は「裸地」にしか配置できません";
        }
      }

      if (!isValid) {
        gameActions.ui.notify({
          message: errorMsg,
          type: "error",
        });
        return;
      }
    }

    // 配置実行
    gameEventBus.emit("CELL_CLICK", { cell });

    // 実行後はタイマーリセット
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    useUIStore.getState().setHoverValid(false);
  };

  const posX = (cell.x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (cell.y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  return (
    <mesh
      position={[posX, 0, posZ]}
      rotation={[DESIGN.BOARD.DEFAULT_ROTATION_X, 0, 0]}
      // onClick は廃止 (誤タップ防止のため)
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[DESIGN.BOARD.CELL_SIZE, DESIGN.BOARD.CELL_SIZE]} />
      <meshStandardMaterial
        color={getCellColor()}
        emissive={getEmissive()}
        emissiveIntensity={isSelected || isHovered ? 0.5 : 0}
      />
    </mesh>
  );
};
