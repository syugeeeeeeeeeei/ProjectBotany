import type { CardDefinition } from "../types/data";

/**
 * カードのマスターデータ。
 * 各カードの定義はユニークで、`deckCount`プロパティでデッキに入れる枚数を指定する。
 * TODO: 将来的にはJSONファイルなど外部ファイルに分離して管理する。
 */
const cardMasterData: CardDefinition[] = [
	// --- 外来種カード ---
	{
		id: 'alien-1', name: 'ナガミヒナゲシ',
		description: '特定外来生物ではないが、近年数を増やし侵略性が警戒されている。\n少し毒があり、あまり警戒されずに徐々に勢力を広げる。\n十字状に1マスずつ侵略する。',
		cost: 1, cardType: 'alien', deckCount: 2, imagePath: 'https://placehold.co/100x60/ffcdd2/f44336?text=Nagami',
		baseInvasionPower: 1, baseInvasionShape: 'cross', canGrow: false
	},
	{
		id: 'alien-2', name: 'ブラジルチドメクサ',
		description: '特定外来生物。アクアリウムから逸出し、河川や水路で繁殖する。\n茎だけでも増殖するため、駆除が困難。\n直線状に1マス侵略する。',
		cost: 1, cardType: 'alien', deckCount: 2, imagePath: 'https://placehold.co/100x60/c8e6c9/4caf50?text=Brazil',
		baseInvasionPower: 1, baseInvasionShape: 'straight', canGrow: false
	},
	{
		id: 'alien-3', name: 'オオキンケイギク',
		description: '特定外来生物。観賞用に持ち込まれたが、繁殖・拡散が速い。\n道路沿いなどに多く、在来種を駆逐する。\n2ターン後に成長し、侵略力が上昇する。',
		cost: 2, cardType: 'alien', deckCount: 2, imagePath: 'https://placehold.co/100x60/fff9c4/ffeb3b?text=Ookin',
		baseInvasionPower: 1, baseInvasionShape: 'cross', canGrow: true,
		growthConditions: [{ type: 'turns_since_last_action', value: 2 }],
		growthEffects: [{ type: 'increase_invasion_power', value: 1 }]
	},
	{
		id: 'alien-4', name: 'ミズバショウ',
		description: '諏訪地域では外来植物。大きな葉で広範囲の面積を奪う。\n全国的には希少なため安易に駆除できず、戦略的な対応が求められる。\n範囲状に2マスずつ侵略する。',
		cost: 3, cardType: 'alien', deckCount: 1, imagePath: 'https://placehold.co/100x60/e1f5fe/03a9f4?text=Mizubasho',
		baseInvasionPower: 2, baseInvasionShape: 'range', canGrow: false
	},
	{
		id: 'alien-5', name: 'オオハンゴンソウ',
		description: '特定外来生物。低木と競合するほど強く、森や山を侵す。\n根だけでも増えるため、駆除が困難。\n初期から高い侵略力を持つため、放置は危険。',
		cost: 4, cardType: 'alien', deckCount: 1, imagePath: 'https://placehold.co/100x60/fbe9e7/ff5722?text=Oohangon',
		baseInvasionPower: 3, baseInvasionShape: 'cross', canGrow: false
	},
	{
		id: 'alien-6', name: 'アレチウリ',
		description: '特定外来生物。つるを伸ばし、樹木や河川敷を覆い尽くす。\n密集して繁茂するため、物理的な駆除が難しい。\n広範囲を侵略し、2ターン後にさらに成長する。',
		cost: 5, cardType: 'alien', deckCount: 1, imagePath: 'https://placehold.co/100x60/d1c4e9/673ab7?text=Arechiuri',
		baseInvasionPower: 1, baseInvasionShape: 'range', canGrow: true,
		growthConditions: [{ type: 'turns_since_last_action', value: 2 }],
		growthEffects: [{ type: 'increase_invasion_power', value: 1 }]
	},
	// --- 駆除カード ---
	{
		id: 'erad-1', name: '手作業による除去',
		description: '地道な手作業で、確実に脅威を取り除く。\n指定した1マスを空マスにする。',
		cost: 1, cardType: 'eradication', deckCount: 1, imagePath: 'https://placehold.co/100x60/bcaaa4/795548?text=Tejime',
		removalMethod: 'direct_n_cells', postRemovalState: 'empty_area', targetType: 'cell'
	},
	{
		id: 'erad-2', name: 'ピンポイント除草剤',
		description: '環境負荷の少ない薬剤で、狙った場所だけを的確に処理する。\n指定した1マスを再生待機マスにする。',
		cost: 2, cardType: 'eradication', deckCount: 1, imagePath: 'https://placehold.co/100x60/ce93d8/9c27b0?text=Pinpoint',
		removalMethod: 'direct_n_cells', postRemovalState: 'recovery_pending_area', targetType: 'cell'
	},
	{
		id: 'erad-3', name: '計画的火入れ',
		description: '延焼に注意しつつ、一定範囲の外来種を焼き払う伝統的な手法。\n指定マス中心の十字範囲を空マスにする。\n使用後2ターンのクールタイムが必要。',
		cost: 3, cardType: 'eradication', deckCount: 1, imagePath: 'https://placehold.co/100x60/ef9a9a/f44336?text=Hiire',
		removalMethod: 'range_selection', postRemovalState: 'empty_area', targetType: 'cell', cooldownTurns: 2
	},
	{
		id: 'erad-4', name: '天敵導入',
		description: '特定の外来種のみを捕食する生物を導入し、生態系ごと対処する。\n指定した外来種コマと、その支配マス全体を駆除する。\nゲーム中2回まで使用可能。',
		cost: 4, cardType: 'eradication', deckCount: 1, imagePath: 'https://placehold.co/100x60/a5d6a7/4caf50?text=Tenteki',
		removalMethod: 'target_alien_and_its_dominant_cells', targetType: 'alien_plant', usageLimit: 2
	},
	{
		id: 'erad-5', name: '抜本的駆除計画',
		description: '地域全体で協力し、大規模な駆除作戦を実行する最終手段。\n指定マス中心の3x3マスを空マスにする。\nゲーム中1回しか使えない切り札。',
		cost: 5, cardType: 'eradication', deckCount: 1, imagePath: 'https://placehold.co/100x60/90caf9/2196f3?text=Keikaku',
		removalMethod: 'range_selection', targetType: 'cell', usageLimit: 1
	},
	// --- 回復カード ---
	{
		id: 'recov-1', name: '在来種の種まき',
		description: '在来種の種を蒔き、生態系の再生を促す第一歩。\n指定した1マスを在来種マスに回復する。',
		cost: 1, cardType: 'recovery', deckCount: 1, imagePath: 'https://placehold.co/100x60/c5e1a5/8bc34a?text=Tanemaki',
		recoveryMethod: 'direct_n_cells'
	},
	{
		id: 'recov-2', name: '土壌改良',
		description: '荒れた土地に栄養を与え、在来種が育ちやすい環境を整える。\n指定した空マス2つを再生待機マスにする。',
		cost: 2, cardType: 'recovery', deckCount: 1, imagePath: 'https://placehold.co/100x60/ffe0b2/ff9800?text=Dojo',
		recoveryMethod: 'direct_n_cells'
	},
	{
		id: 'recov-3', name: '植樹祭',
		description: 'ボランティアを募り、地域に緑を取り戻す活動。\n指定マス中心の十字範囲を在来種マスに回復する。\n使用後1ターンのクールタイムが必要。',
		cost: 3, cardType: 'recovery', deckCount: 1, imagePath: 'https://placehold.co/100x60/b2dfdb/009688?text=Shokuju',
		recoveryMethod: 'range_selection', cooldownTurns: 1
	},
	{
		id: 'recov-4', name: '自然公園の整備',
		description: '人の手で環境を整え、在来種の保護区を創出する。\n指定マス中心の2x2マスを在来種マスに回復する。\nゲーム中2回まで使用可能。',
		cost: 4, cardType: 'recovery', deckCount: 1, imagePath: 'https://placehold.co/100x60/bbdefb/2196f3?text=Koen',
		recoveryMethod: 'range_selection', usageLimit: 2
	},
	{
		id: 'recov-5', name: '大地の恵み',
		description: '生態系が持つ本来の回復力が、奇跡的な再生を引き起こす。\n全ての空マスと再生待機マスを在来種マスにする。\nゲーム中1回しか使えない切り札。',
		cost: 5, cardType: 'recovery', deckCount: 1, imagePath: 'https://placehold.co/100x60/dcedc8/8bc34a?text=Megumi',
		recoveryMethod: 'range_selection', usageLimit: 1
	},
];

export default cardMasterData;