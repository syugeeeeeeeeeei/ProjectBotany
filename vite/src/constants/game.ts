import type { CardDefinition, PlayerId } from "../types/data";

export const MAX_TURN = 20;
export const INITIAL_FIELD_WIDTH = 7;
export const INITIAL_FIELD_HEIGHT = 10; // ✨ 要件に合わせて変更
export const INITIAL_ENVIRONMENT = 1;
export const MAX_ENVIRONMENT = 10;
export const ALIEN_MOVE_COST = 1; // ✨ 新しい要件：移動コスト

export const PLAYER_IDS: { [key: string]: PlayerId } = {
	NATIVE_SIDE: "native_side",
	ALIEN_SIDE: "alien_side",
};

export const CARD_MASTER_DATA: { [id: string]: CardDefinition } = {
	"1": {
		id: "1",
		name: "セイタカアワダチソウ",
		description: "北アメリカ原産のキク科の植物。繁殖力が非常に強い。",
		cost: 2,
		cardType: "alien",
		imagePath: "/images/aliens/seitaakaawadatisou.png",
		baseInvasionPower: 1,
		baseInvasionShape: "range",
		canGrow: true,
		growthConditions: [{ type: "turns_since_last_action", value: 3 }],
		growthEffects: [{ type: "increase_invasion_power", value: 1 }],
	},
	"2": {
		id: "2",
		name: "オオキンケイギク",
		description: "北アメリカ原産のキク科の植物。道端などでよく見られる。",
		cost: 3,
		cardType: "alien",
		imagePath: "/images/aliens/ookinkeigiku.png",
		baseInvasionPower: 2,
		baseInvasionShape: "cross",
	},
	"3": {
		id: "3",
		name: "アメリカセンダングサ",
		description: "北アメリカ原産のキク科の植物。ひっつき虫としても知られる。",
		cost: 1,
		cardType: "alien",
		imagePath: "/images/aliens/americasendangusa.png",
		baseInvasionPower: 1,
		baseInvasionShape: "single",
	},
	"101": {
		id: "101",
		name: "タンポポの綿毛",
		description: "周囲のマスを在来種エリアに戻す。",
		cost: 2,
		cardType: "recovery",
		imagePath: "/images/natives/tanpopo.png",
		cooldownTurns: 2,
	},
	"201": {
		id: "201",
		name: "草刈り",
		description: "指定した範囲の外来種を除去する。",
		cost: 3,
		cardType: "eradication",
		imagePath: "/images/actions/kusakari.png",
		targetType: "cell",
		removalMethod: "range_selection",
	},
	"301": {
		id: "301",
		name: "緑化推進",
		description: "指定したマスを回復・強化する。",
		cost: 4,
		cardType: "recovery",
		imagePath: "/images/actions/fueiyouka.png",
		cooldownTurns: 3,
	},
};