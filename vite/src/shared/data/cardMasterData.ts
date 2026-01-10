/**
 * src/shared/data/cardMasterData.ts
 * プロジェクト「侵緑」カードマスターデータ
 * ✨ 更新: 新しい CardDefinition スキーマ (range, transition[], EradicationType) に準拠
 */

import { CardDefinition } from "../types/card";

export const cardMasterData: CardDefinition[] = [
  // =================================================================
  // 🌵 外来種カード (Alien Cards)
  // =================================================================
  {
    id: "alien-1",
    name: "ナガミヒナゲシ",
    description:
      "【拡散】左右1マス\n【反撃】なし\n\n特定外来生物ではないが、近年数を増やし侵略性が警戒される。\n少し毒があり、あまり警戒されずに徐々に勢力を広げる。",
    cost: 1,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/ナガミヒナゲシ.png",
    range: { shape: "horizon", scale: 1 }, // 左右1マス
    transition: [{ target: "bare", result: "alien-core" }],
    counterAbility: "none",
  },
  {
    id: "alien-2",
    name: "ブラジルチドメグサ",
    description:
      "【拡散】上下1マス\n【反撃】種子散布\n\n特定外来生物。\nアクアリウムから逸出し、河川や水路で繁殖する。\n茎だけでも増殖し駆除が困難。",
    cost: 1,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/ブラジルチドメグサ.png",
    range: { shape: "vertical", scale: 1 }, // 上下1マス
    transition: [{ target: "bare", result: "alien-core" }],
    counterAbility: "spread_seed", // 簡易駆除時に周囲に種を撒く
  },
  {
    id: "alien-3",
    name: "オオキンケイギク",
    description:
      "【拡散】十字1マス\n【反撃】なし\n\n特定外来生物。\n観賞用に持ち込まれた。\n繁殖・拡散が速い。\n道路沿いなどに多く、在来種を駆逐する。",
    cost: 2,
    cardType: "alien",
    deckCount: 2,
    imagePath: "/plants/オオキンケイギク.png",
    range: { shape: "cross", scale: 1 }, // 十字1マス
    transition: [{ target: "bare", result: "alien-core" }],
    counterAbility: "none",
    cooldownTurns: 1,
  },
  {
    id: "alien-4",
    name: "ミズバショウ",
    description:
      "【拡散】周囲1マス\n【反撃】なし\n\n諏訪地域では外来植物。\n大きな葉で広範囲の面積を奪う。\n全国的には希少なため安易に駆除できない。",
    cost: 3,
    cardType: "alien",
    deckCount: 2,
    imagePath: "/plants/ミズバショウ.png",
    range: { shape: "range", scale: 1 }, // 周囲1マス（3x3）
    transition: [{ target: "bare", result: "alien-core" }],
    counterAbility: "none",
    cooldownTurns: 1,
  },
  {
    id: "alien-5",
    name: "オオハンゴンソウ",
    description:
      "【拡散】斜め十字\n【反撃】種子散布\n\n特定外来生物。\n低木と競合するほど強く、森や山を侵す。\n根だけでも増え駆除が困難。",
    cost: 4,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/オオハンゴンソウ.png",
    range: { shape: "x_cross", scale: 2 }, // 斜め十字（距離2）
    transition: [{ target: "bare", result: "alien-core" }],
    counterAbility: "spread_seed",
    usageLimit: 3,
  },
  {
    id: "alien-6",
    name: "アレチウリ",
    description:
      "【拡散】周囲2マス\n【反撃】種子散布\n\n特定外来生物。\nつるを伸ばし、樹木や河川敷を覆い尽くす。\n密集して繁茂するため、物理的な駆除が難しい。",
    cost: 5,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/アレチウリ.png",
    range: { shape: "range", scale: 2 }, // 周囲2マス（5x5）
    transition: [{ target: "bare", result: "alien-core" }],
    counterAbility: "spread_seed",
    cooldownTurns: 1,
    usageLimit: 2,
  },

  // =================================================================
  // 🧹 駆除カード (Eradication Cards)
  // =================================================================
  {
    id: "erad-1",
    name: "刈り払い",
    description:
      "【簡易駆除】1マス\n草刈り機などで地上部を刈り取る。低コストだが、種子を広げるなど逆効果となる場合がある。",
    cost: 1,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "/actions/erad/kariharai.png",
    range: { shape: "point", scale: 1 },
    transition: [{ target: ["alien", "alien-core"], result: "pioneer" }],
    eradicationType: "simple",
  },
  {
    id: "erad-2",
    name: "手取り除草",
    description:
      "【簡易駆除】十字範囲\n手作業で抜き取る。範囲は広いが、根の断片を残すと再生を許してしまう。",
    cost: 2,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "/actions/erad/tedori.png",
    range: { shape: "cross", scale: 1 },
    transition: [{ target: ["alien", "alien-core"], result: "bare" }],
    eradicationType: "simple",
  },
  {
    id: "erad-3",
    name: "遮光シート",
    description:
      "【完全駆除】周囲\n防草シートで覆い、光合成を阻害して枯死させる。種子の散布を防ぎ、環境負荷も低い",
    cost: 3,
    cardType: "eradication",
    deckCount: 2,
    imagePath: "/actions/erad/shakou.png",
    cooldownTurns: 1,
    range: { shape: "range", scale: 1 },
    transition: [{ target: ["alien", "alien-core"], result: "pioneer" }],
    eradicationType: "complete",
  },
  {
    id: "erad-4",
    name: "表土掘削・搬出",
    description:
      "【完全駆除】周囲\n種子を含んだ表土ごと重機で削り取り、搬出する。広範囲を安全に浄化する。",
    cost: 4,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "/actions/erad/kussaku.png",
    range: { shape: "x_cross", scale: 2 },
    transition: [{ target: ["alien", "alien-core"], result: "bare" }],
    eradicationType: "complete",
    usageLimit: 2,
  },
  {
    id: "erad-5",
    name: "抜本的駆除計画",
    description:
      "【連鎖駆除】\nあらゆる手段・莫大なコストを投じ、指定した外来種を根こそぎ駆除する最終手段。",
    cost: 5,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "/actions/erad/bappon.png",
    range: { shape: "point", scale: 1 },
    transition: [{ target: "alien-core", result: "bare" }],
    eradicationType: "chain",
    cooldownTurns: 1,
    usageLimit: 2,
  },

  // =================================================================
  // 🌿 回復カード (Recovery Cards)
  // =================================================================
  {
    id: "recov-1",
    name: "客土（土入れ）",
    description:
      "【回復】範囲1マス (裸地→先駆植生)\n外来種の種を含まない清浄な土を入れる。裸地を塞ぎ、在来種が定着できる土台を作る",
    cost: 1,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/kyakudo.png",
    range: { shape: "cross", scale: 1 },
    transition: [{ target: "bare", result: "pioneer" }],
    protection: "none",
  },
  {
    id: "recov-2",
    name: "在来種植栽",
    description:
      "【回復】範囲1マス (先駆植生→在来)\n在来種の苗を直接植え付ける。時間をかけずに緑を取り戻すことができる。",
    cost: 2,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/shokusai.png",
    range: { shape: "range", scale: 1 },
    transition: [{ target: "pioneer", result: "native" }],
    protection: "none",
  },
  {
    id: "recov-3",
    name: "河川環境管理",
    description:
      "【回復】縦一列 (裸地→先駆植生)\n川の流れに沿って環境を整え、外来種の侵入しにくい自然な水辺を再生する。",
    cost: 3,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/kasen.png",
    range: { shape: "vertical", scale: 2 },
    transition: [{ target: "bare", result: "pioneer" }],
    protection: "none",
    usageLimit: 2,
  },
  {
    id: "recov-4",
    name: "大地の恵み",
    description:
      "【回復】周囲 (先駆→在来)\n生態系本来の回復力を呼び覚ます。広範囲の先駆植生が一斉に在来種へ遷移する。",
    cost: 4,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/megumi.png",
    range: { shape: "range", scale: 2 }, // 周囲2マス（5x5）
    // ✨ ユーザー提示のロジック: 先駆と裸地の両方を在来に戻す
    transition: [
      { target: "bare", result: "pioneer" },
      { target: "pioneer", result: "native" }
    ],
    protection: "none",
    usageLimit: 2,
  },
];