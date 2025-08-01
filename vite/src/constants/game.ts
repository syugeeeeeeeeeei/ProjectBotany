import type { AlienMaster, CardId, Cell, NativeMaster } from '../types/data';

export const GRID_SIZE = 5;

export const INITIAL_CELLS: Cell[] = Array.from(
	{ length: GRID_SIZE * GRID_SIZE },
	(_, i) => ({
		id: i,
	}),
);

// 最大ターン数
export const MAX_TURNS = 20;

export const alienMaster: { [key: CardId]: AlienMaster } = {
	'alien-lv1': {
		id: 'alien-lv1',
		name: '侵略種Lv1',
		description: '最も基本的な侵略種。',
		cost: 2,
		cooldown: 0,
		target_type: 'cell',
		effect: {},
		growth_conditions: {
			turn: 3,
		},
		next_alien_id: 'alien-lv2',
	},
	'alien-lv2': {
		id: 'alien-lv2',
		name: '侵略種Lv2',
		description: '成長した侵略種。',
		cost: 0, // 進化なのでコスト不要
		cooldown: 0,
		target_type: 'self',
		effect: {},
	},
};

export const nativeMaster: { [key: CardId]: NativeMaster } = {
	'native-remove': {
		id: 'native-remove',
		name: '単体駆除',
		description: '指定したマスの外来種を1体駆除する。',
		cost: 3,
		cooldown: 2,
		target_type: 'piece',
		power: 1,
		effect: {},
	},
	'native-recover': {
		id: 'native-recover',
		name: '土地の回復',
		description: '指定したマスを在来種の土地に戻す。',
		cost: 2,
		cooldown: 1,
		target_type: 'cell',
		recovery: 1,
		effect: {},
	},
};