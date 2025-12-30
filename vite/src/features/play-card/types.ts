import { ActionLog } from "@/shared/types/actions";

/**
 * カードプレイアクションのPayload定義
 * このFeature固有のデータ構造
 */
export type PlayCardPayload = {
	cardId: string;
	targetX: number;
	targetY: number;
};

/**
 * 型定義されたアクションログ
 */
export type PlayCardAction = ActionLog<PlayCardPayload>;

/**
 * アクション識別子定数
 */
export const PLAY_CARD_ACTION_TYPE = "PLAY_CARD";

/**
 * 型ガード関数 (Type Guard)
 * 不明なアクションログが、カードプレイアクションであるかを判定する
 */
export const isPlayCardAction = (action: ActionLog): action is PlayCardAction => {
	return action.type === PLAY_CARD_ACTION_TYPE;
};