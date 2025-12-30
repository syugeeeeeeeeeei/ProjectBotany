import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { Outline } from "@/shared/components/3d/Outline";
import { moveAlienLogic } from "./domain/moveAlienLogic";

/**
 * 🌿 Move Alien Feature (外来種移動機能)
 * 
 * 【動機】
 * 配置済みの外来種を、自身の侵略範囲内（Invasion Area）で移動させる「再配置」の
 * 仕組みを提供するためです。これにより、外来種プレイヤーは戦況に応じて
 * 拠点をずらし、より効果的な場所へと浸食を広げることができます。
 *
 * 【恩恵】
 * - `InteractionRegistry` を通じて、選択中の外来種の強調表示や移動可能範囲の
 *   アウトライン表示を盤面に追加し、直感的な UI を実現します。
 * - `onCellClick` フィルタリングにより、コアの選択、選択解除、移動の実行という
 *   一連のシーケンスを、盤面側のコードに触れることなく制御できます。
 *
 * 【使用法】
 * `pluginLoader.ts` から `initMoveAlien()` が呼び出され、ロジックと UI プロバイダーが
 * 各レジストリに登録されます。
 */
export const initMoveAlien = () => {
  // アクション（ロジック）を登録
  ActionRegistry.register("MOVE_ALIEN", moveAlienLogic);

  // インタラクション（UI表示・クリック挙動）を登録
  InteractionRegistry.register({
    featureKey: "move-alien",

    /**
     * マスの強調表示（デコレーション）の取得
     * 選択中の外来種コアを青く光らせ、プレイヤーが「どの個体を操作しているか」を明示するために必要です
     */
    getDecoration: (cell, _state, uiState) => {
      if (!uiState.selectedAlienInstanceId) return null;
      if (cell.cellType === "alien_core" && cell.alienInstanceId === uiState.selectedAlienInstanceId) {
        return { emissiveColor: "#4488FF", emissiveIntensity: 1.5 };
      }
      return null;
    },

    /**
     * マスへの重ね合わせコンポーネントの取得
     * 移動可能な範囲（自分の侵略マス）に水色のアウトラインを表示し、移動先を導くために必要です
     */
    getCellOverlays: (cell, _state, uiState) => {
      if (!uiState.selectedAlienInstanceId) return null;
      if (cell.cellType === "alien_invasion_area" && cell.dominantAlienInstanceId === uiState.selectedAlienInstanceId) {
        return <Outline color="#87CEEB" size={0.65} thickness={0.08} />;
      }
      return null;
    },

    /**
     * 盤面クリック時の割り込み処理
     * コアのクリックによる選択、および浸食マスへのクリックによる「移動アクション」の実行を実現するために必要です
     */
    onCellClick: (cell, _state, uiState, dispatch): boolean => {
      const { selectedAlienInstanceId, selectAlienInstance } = uiState;
      
      // コアがクリックされた場合
      if (cell.cellType === "alien_core") {
        // 同じコアなら選択解除、別人ならその人を選択
        if (selectedAlienInstanceId === cell.alienInstanceId) selectAlienInstance(null);
        else selectAlienInstance(cell.alienInstanceId);
        return true; // 処理済みとしてイベントを止める
      }
      
      // 移動先（侵略マス）がクリックされた場合
      if (selectedAlienInstanceId && cell.cellType === "alien_invasion_area" && cell.dominantAlienInstanceId === selectedAlienInstanceId) {
        dispatch("MOVE_ALIEN", { instanceId: selectedAlienInstanceId, targetCell: cell });
        return true;
      }
      
      // 何もない場所をクリックしたら選択解除
      if (selectedAlienInstanceId) { 
        selectAlienInstance(null); 
        return true; 
      }
      return false; // 他の機能（カード使用など）に処理を流す
    },
  });
};