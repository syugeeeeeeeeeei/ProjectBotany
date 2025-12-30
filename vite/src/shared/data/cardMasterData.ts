import { CardDefinition } from "@/shared/types/game-schema";

/**
 * 🌿 Project Botany カードマスターデータ
 * 
 * 【動機】
 * ゲーム内に登場する全てのカード（外来種、駆除、回復）の属性やパラメータを一元管理するためです。
 * ロジックからデータを切り離すことで、カードの性能調整（バランス調整）や、
 * 新しいカードの追加をコードの修正なしに、データ定義の追記だけで行えるようにします。
 *
 * 【恩恵】
 * - カードの種類（`cardType`）ごとに異なるプロパティ（侵略力、駆除後の状態など）を型安全に定義できます。
 * - 各カードの「フレーバーテキスト（説明文）」や「画像パス」がまとまっており、UI表示にそのまま利用できます。
 * - `growthConditions` などの複雑な条件を構造化データとして持たせることで、拡張性の高い挙動を実現できます。
 *
 * 【使用法】
 * 1. `useGameStore` の初期化や、手札の生成ロジックでこの配列を参照します。
 * 2. 開発者は新しいカードを作成する際、既存のデータ構造に倣ってこの配列に要素を追加します。
 */
const cardMasterData: CardDefinition[] = [
  // --- 外来種カード定義 ---
  // alien: 自身を「コア」として配置し、周囲に「侵略マス」を広げる攻撃的なカード群です
  {
    id: "alien-1",
    name: "ナガミヒナゲシ",
    description:
      "特定外来生物ではないが、近年数を増やし侵略性が警戒される。\n少し毒があり、あまり警戒されずに徐々に勢力を広げる。\n\n[侵略]：左右1マス\n[クールタイム]：1ターン",
    cost: 1,
    cardType: "alien",
    deckCount: 2,
    imagePath: "/plants/ナガミヒナゲシ.png",
    targeting: {
      power: 1,
      shape: "straight",
      direction: "horizon",
    },
    cooldownTurns: 1,
    canGrow: false,
  },
  {
    id: "alien-2",
    name: "ブラジルチドメクサ",
    description:
      "特定外来生物。\nアクアリウムから逸出し、河川や水路で繁殖する。\n茎だけでも増殖し駆除が困難。\n\n[侵略]：上下1マス\n[クールタイム]：1ターン",
    cost: 1,
    cardType: "alien",
    deckCount: 2,
    imagePath: "/plants/ブラジルチドメグサ.png",
    targeting: {
      power: 1,
      shape: "straight",
      direction: "vertical",
    },
    cooldownTurns: 1,
    canGrow: false,
  },
  {
    id: "alien-3",
    name: "オオキンケイギク",
    description:
      "特定外来生物。\n観賞用に持ち込まれた。\n繁殖・拡散が速い。\n道路沿いなどに多く、在来種を駆逐する。\n\n[侵略]：十字1マス\n[クールタイム]：2ターン\n[成長]：2ターン後、侵略力2",
    cost: 2,
    cardType: "alien",
    deckCount: 2,
    imagePath: "/plants/オオキンケイギク.png",
    targeting: {
      power: 1,
      shape: "cross",
    },
    canGrow: true,
    cooldownTurns: 2,
    growthConditions: [{ type: "turns_since_last_action", value: 2 }],
    growthEffects: [{ newInvasionPower: 2 }],
  },
  {
    id: "alien-4",
    name: "ミズバショウ",
    description:
      "諏訪地域では外来植物。\n大きな葉で広範囲の面積を奪う。\n全国的には希少なため安易に駆除できない。\n\n[侵略]：周囲1マス\n[成長]：1ターン後、侵略力3\n[クールタイム]：1ターン",
    cost: 3,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/ミズバショウ.png",
    targeting: {
      power: 2,
      shape: "range",
    },
    cooldownTurns: 1,
    canGrow: false,
    growthConditions: [{ type: "turns_since_last_action", value: 1 }],
    growthEffects: [{ newInvasionPower: 3 }],
  },
  {
    id: "alien-5",
    name: "オオハンゴンソウ",
    description:
      "特定外来生物。\n低木と競合するほど強く、森や山を侵す。\n根だけでも増え駆除が困難。\n\n[侵略]：十字3マス\n[クールタイム]：2ターン\n[使用制限]：2回",
    cost: 4,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/オオハンゴンソウ.png",
    targeting: {
      power: 3,
      shape: "cross",
    },
    cooldownTurns: 1,
    usageLimit: 3,
    canGrow: false,
  },
  {
    id: "alien-6",
    name: "アレチウリ",
    description:
      "特定外来生物。\nつるを伸ばし、樹木や河川敷を覆い尽くす。\n密集して繁茂するため、物理的な駆除が難しい。\n\n[侵略]：周囲3マス\n[クールタイム]：1ターン\n[使用制限]：2回",
    cost: 5,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/アレチウリ.png",
    targeting: {
      power: 3,
      shape: "range",
    },
    cooldownTurns: 1,
    canGrow: false,
    usageLimit: 2,
  },
  // --- 駆除カード定義 ---
  // eradication: フィールド上の「コア」または「侵略マス」を除去するためのカード群です
  // 生態系のバランスを取り戻すため、外来種の勢力を抑える役割を担います
  {
    id: "erad-1",
    name: "引っこ抜き",
    description:
      "地道な手作業で、根本から確実に脅威を取り除く。\n\n[駆除]：侵略マス・上下1マス\n[駆除後状態]：空マス",
    cost: 1,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/bcaaa4/795548?text=Tejime",
    targeting: {
      power: 1,
      shape: "straight",
      direction: "vertical",
      target: "alien_invasion_area",
    },
    postRemovalState: "empty_area",
  },
  {
    id: "erad-2",
    name: "早期発見・萌芽伐採",
    description:
      "外来種が種子を付ける前に伐採し、拡散を防ぐ。\n\n[駆除]：外来種コマ・十字1マス\n[駆除後状態]:再生待機マス\n[クールタイム]：1ターン",
    cost: 2,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/ce93d8/9c27b0?text=Pinpoint",
    targeting: {
      power: 1,
      shape: "cross",
      target: "alien_core",
    },
    postRemovalState: "recovery_pending_area",
    cooldownTurns: 1,
  },
  {
    id: "erad-3",
    name: "遮光シート",
    description:
      "遮光シートを被せ、外来種の発芽を抑制する。\n\n[駆除]：侵略マス・周囲2マス\n[駆除後状態]：再生待機マス\n[クールタイム]：1ターン",
    cost: 3,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/ef9a9a/f44336?text=Hiire",
    targeting: {
      power: 2,
      shape: "range",
      target: "alien_invasion_area",
    },
    postRemovalState: "recovery_pending_area",
    cooldownTurns: 1,
  },
  {
    id: "erad-4",
    name: "表土掘削",
    description:
      "\n重機を用いて表土を削り、根本から駆逐する。\n\n[駆除]：1種根絶やし\n[駆除後状態]：空マス\n[使用回数]：2回",
    cost: 4,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/a5d6a7/4caf50?text=Tenteki",
    targeting: {
      target: "species",
    },
    postRemovalState: "empty_area",
    usageLimit: 2,
  },
  {
    id: "erad-5",
    name: "抜本的駆除計画",
    description:
      "地域全体で協力し、大規模な駆除作戦を実行する最終手段。\n\n[駆除]：周囲2マス\n[駆除後状態]：空マス\n[使用回数]：1回",
    cost: 5,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/90caf9/2196f3?text=Keikaku",
    targeting: {
      power: 3,
      shape: "range",
      target: "alien_core",
    },
    postRemovalState: "empty_area",
    usageLimit: 1,
  },
  // --- 回復カード定義 ---
  // recovery: ダメージを受けた土地（空マス、再生待機マス）を「在来種マス」に戻すためのカード群です
  // 最終的なスコア（在来種マスの割合）を稼ぐために不可欠です
  {
    id: "recov-1",
    name: "在来種の種まき",
    description:
      "在来種の種を蒔き、生態系の再生を促す第一歩。\n\n[回復]：指定1マス\n[回復後状態]：再生待機マス",
    cost: 1,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/c5e1a5/8bc34a?text=Tanemaki",
    targeting: {
      power: 1,
      shape: "single",
    },
    postRecoveryState: "recovery_pending_area",
  },
  {
    id: "recov-2",
    name: "土壌改良",
    description:
      "荒れた土地に栄養を与え、在来種が育ちやすい環境を整える。\n\n[回復]：指定1マス\n[回復後状態]：在来種マス",
    cost: 2,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/ffe0b2/ff9800?text=Dojo",
    targeting: {
      power: 1,
      shape: "single",
    },
    postRecoveryState: "native_area",
  },
  {
    id: "recov-3",
    name: "植樹祭",
    description:
      "ボランティアを募り、地域に緑を取り戻す活動。\n\n[回復]：十字1マス\n[回復後状態]：再生待機マス\n[クールタイム]：1ターン",
    cost: 3,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/b2dfdb/009688?text=Shokuju",
    targeting: {
      power: 1,
      shape: "cross",
    },
    postRecoveryState: "recovery_pending_area",
    cooldownTurns: 1,
  },
  {
    id: "recov-4",
    name: "帰化促進",
    description:
      "外来種の支配地域を、在来種の力で取り戻す。\n\n[回復]：1種の支配マス全て\n[回復後状態]：再生待機マス\n[使用回数]：2回",
    cost: 4,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/bbdefb/2196f3?text=Kika",
    targeting: {
      target: "species",
    },
    postRecoveryState: "recovery_pending_area",
    usageLimit: 2,
  },
  {
    id: "recov-5",
    name: "大地の恵み",
    description:
      "生態系が持つ本来の回復力が、奇跡的な再生を引き起こす。\n\n[回復]：周囲1マス範囲\n[回復後状態]：在来種マス\n[使用回数]：1回",
    cost: 5,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "https://placehold.co/100x60/dcedc8/8bc34a?text=Megumi",
    targeting: {
      power: 2,
      shape: "range",
    },
    postRecoveryState: "native_area",
    usageLimit: 1,
  },
];

export default cardMasterData;
