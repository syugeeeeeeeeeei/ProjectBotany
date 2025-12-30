import React, { useMemo, useRef } from "react";
import { Group } from "three";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { useUIStore } from "@/app/store/useUIStore";
import { useGameStore } from "@/app/store/useGameStore";
import type { CellState, FieldState } from "@/shared/types/game-schema";

/**
 * 3D ゲーム盤面コンポーネント (GameBoard3D)
 * 
 * 【動機】
 * ゲームの核となる 2D 配列のフィールドデータを、3D のタイル群としてレンダリングするためです。
 * また、`InteractionRegistry` と連携することで、盤面自体のコードを書き換えることなく
 * 他機能（カード、移動など）からの表示・挙動の注入を受け入れます。
 *
 * 【恩恵】
 * - 各マスは個別のコンポーネント（Cell）として独立しており、`InteractionRegistry` を通じて
 *   動的なエミッシブ（発光）効果やアウトラインの重畳が可能です。
 * - クリックイベントを `InteractionRegistry.invokeClick` に委譲しているため、
 *   「どのモードの時に何が起きるか」という関心事を盤面から切り離せます。
 * - `globalComponents` スロットにより、プレビュー用の半透明な駒などを盤面の上に柔軟に配置できます。
 *
 * 【使用法】
 * `App.tsx` の `Canvas` 内に配置し、`fieldState` プロップスとして盤面データを渡します。
 */

const BOARD_LAYOUT = {
  CELL_GAP: 1.0,
  CELL_SIZE: 0.9,
  BOARD_WIDTH: 7,
  BOARD_HEIGHT: 10,
  ROTATION_X: -Math.PI / 2,
};

const CELL_COLORS: Record<string, string> = {
  native_area: "#2E7D32",
  alien_core: "#C62828",
  alien_invasion_area: "#E57373",
  empty_area: "#757575",
  recovery_pending_area: "#FDD835",
  default: "#444444",
};

const Cell: React.FC<{ cell: CellState }> = ({ cell }) => {
  const game = useGameStore();
  const ui = useUIStore();

  // 📢 ここでRegistryから「このマスの視覚効果」を取得
  // マスの発光（エミッシブ）や色を動的に変更するために必要です
  const decoration = useMemo(() => 
    InteractionRegistry.getCombinedDecoration(cell, game, ui),
    [cell, game, ui]
  );

  // 📢 ここでRegistryから「このマスに重ねるコンポーネント」を取得
  // マスごとのアウトラインやアイコンなどの描画指示を受け取るために必要です
  const overlays = useMemo(() =>
    InteractionRegistry.getCellOverlays(cell, game, ui),
    [cell, game, ui]
  );

  return (
    <group 
      position={[
        (cell.x - (BOARD_LAYOUT.BOARD_WIDTH - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
        0,
        (cell.y - (BOARD_LAYOUT.BOARD_HEIGHT - 1) / 2) * BOARD_LAYOUT.CELL_GAP
      ]}
      userData={{ cell }}
    >
      <mesh 
        name="cell-plane" 
        rotation={[BOARD_LAYOUT.ROTATION_X, 0, 0]} 
        /**
         * 各マスのクリックハンドラ
         * 現在のセッション（カード使用、移動など）に応じた処理を呼び出すために必要です
         */
        onClick={(e) => {
          e.stopPropagation();
          InteractionRegistry.invokeClick(cell, game, ui, game.dispatch);
        }}
      >
        <planeGeometry args={[BOARD_LAYOUT.CELL_SIZE, BOARD_LAYOUT.CELL_SIZE]} />
        <meshStandardMaterial
          color={CELL_COLORS[cell.cellType] || CELL_COLORS.default}
          emissive={decoration.emissiveColor || "black"}
          emissiveIntensity={decoration.emissiveIntensity || 0}
        />
      </mesh>
      {/* 📢 Registryから送られてきたOutline等のコンポーネントをそのまま描画 */}
      {overlays}
    </group>
  );
};

const GameBoard3D: React.FC<{ fieldState: FieldState }> = ({ fieldState }) => {
  const game = useGameStore();
  const ui = useUIStore();
  const boardRef = useRef<Group>(null);

  // 📢 ガイド（PreviewPiece）などのグローバルUIを取得
  const globalComponents = useMemo(() => 
    InteractionRegistry.getGlobalComponents(game, ui, boardRef),
    [game, ui]
  );

  return (
    <group ref={boardRef}>
      {fieldState.cells.flat().map((cell) => (
        <Cell key={`${cell.x}-${cell.y}`} cell={cell} />
      ))}
      {globalComponents}
    </group>
  );
};

export default GameBoard3D;