import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PlayerType } from "@/shared/types/game-schema";

interface UIState {
  selectedCardId: string | null;
  selectedAlienInstanceId: string | null;
  notification: { message: string; forPlayer: PlayerType } | null;
  previewPlacement: { x: number; y: number } | null;
  isCardPreview: boolean;
}

interface UIActions {
  selectCard: (cardId: string) => void;
  deselectCard: () => void;
  selectAlienInstance: (instanceId: string | null) => void;
  setNotification: (message: string | null, forPlayer?: PlayerType) => void;
  setPreviewPlacement: (position: { x: number; y: number } | null) => void;
}

const DEFAULT_PREVIEW_POSITION = { x: 3, y: 5 };

export const useUIStore = create(
  immer<UIState & UIActions>((set) => ({
    selectedCardId: null,
    selectedAlienInstanceId: null,
    notification: null,
    previewPlacement: null,
    isCardPreview: false,

    selectCard: (cardId) =>
      set((state) => {
        state.selectedCardId = cardId;
        state.selectedAlienInstanceId = null;
        state.previewPlacement = DEFAULT_PREVIEW_POSITION;
        state.isCardPreview = true;
      }),

    deselectCard: () =>
      set((state) => {
        state.selectedCardId = null;
        state.previewPlacement = null;
        state.isCardPreview = false;
      }),

    selectAlienInstance: (instanceId) =>
      set((state) => {
        state.selectedAlienInstanceId = instanceId;
        state.selectedCardId = null;
        state.previewPlacement = null;
        state.isCardPreview = false;
      }),

    setNotification: (message, forPlayer) =>
      set((state) => {
        state.notification =
          message && forPlayer ? { message, forPlayer } : null;
      }),

    setPreviewPlacement: (position) =>
      set((state) => {
        state.previewPlacement = position;
      }),
  })),
);
