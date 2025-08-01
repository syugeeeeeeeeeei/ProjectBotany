import { create } from 'zustand';
import type { CardId } from '../types/data';

// UIストアが管理する状態の型定義
export type UIState = {
	selectedCardId: CardId | null;
	isAlienHandVisible: boolean;
	isNativeHandVisible: boolean;
	// ... 今後UIの状態が増えればここに追加
};

// UIストアが持つアクションの型定義
export type UIActions = {
	selectCard: (cardId: CardId | null) => void;
	setAlienHandVisible: (visible: boolean) => void;
	setNativeHandVisible: (visible: boolean) => void;
	toggleAlienHand: () => void;
	toggleNativeHand: () => void;
};

// UIストア本体
export const useUIStore = create<UIState & UIActions>((set) => ({
	// --- State ---
	selectedCardId: null,
	isAlienHandVisible: true,
	isNativeHandVisible: true,

	// --- Actions ---
	selectCard: (cardId) => set({ selectedCardId: cardId }),
	setAlienHandVisible: (visible) => set({ isAlienHandVisible: visible }),
	setNativeHandVisible: (visible) => set({ isNativeHandVisible: visible }),
	toggleAlienHand: () =>
		set((state) => ({ isAlienHandVisible: !state.isAlienHandVisible })),
	toggleNativeHand: () =>
		set((state) => ({ isNativeHandVisible: !state.isNativeHandVisible })),
}));