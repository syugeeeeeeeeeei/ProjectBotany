// vite/src/features/card-hand/hooks/useToggleHand.ts
import { useState, useCallback } from "react";
import { useSpring } from "@react-spring/three";
import { HandLayout } from "../domain/HandLayout";

/**
 * 手札の表示・非表示（出し入れ）の状態とアニメーションを管理するフック
 */
export const useToggleHand = (isMyTurn: boolean, isAnySelected: boolean) => {
	const [isVisible, setIsVisible] = useState(true);

	// 1. ユーザーが明示的に「出し」ていて
	// 2. 自分のターンで
	// 3. かつ、カードを選択していない時だけ「Show」の位置にする
	// 選択中は、手札の土台（親グループ）は自動的に「Hide」の位置（奥）へ移動させる
	const effectiveIsVisible = isMyTurn && isVisible && !isAnySelected;

	const { zPos } = useSpring({
		zPos: effectiveIsVisible
			? HandLayout.POSITION.Z.VISIBLE
			: HandLayout.POSITION.Z.HIDDEN,
		config: HandLayout.ANIMATION.SPRING_CONFIG,
	});

	return {
		state: {
			isVisible,           // ユーザー設定の表示状態（スワイプで切り替わるもの）
			effectiveIsVisible,  // 最終的な計算上の表示フラグ
		},
		animation: {
			zPos,
		},
		actions: {
			show: useCallback(() => setIsVisible(true), []),
			hide: useCallback(() => setIsVisible(false), []),
			toggle: useCallback(() => setIsVisible((prev) => !prev), []),
		},
	};
};