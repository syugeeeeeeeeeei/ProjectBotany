/**
 * src/shared/data/cardMasterData.ts
 * プロジェクト「侵緑」カードマスターデータ
 */

import { CardDefinition } from "../types/card";

export const cardMasterData: CardDefinition[] = [
  // =================================================================
  // 🌵 外来種カード (Alien Cards)
  // [共通仕様] ターゲット: 裸地(Bare), 配置時: 種(Seed), 成長: 休眠1R後に成体化
  // =================================================================
  {
    id: "alien-1",
    name: "ナガミヒナゲシ",
    description:
      "【拡散】左右1マス\n【反撃】なし\n\n近年急増している外来種。拡散力は低いが、コストが軽く、隙間に入り込んでくる。",
    cost: 1,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/ナガミヒナゲシ.png",
    expansionPower: 1,
    expansionRange: "horizon", // 左右
    counterAbility: "none",
  },
  {
    id: "alien-2",
    name: "ブラジルチドメグサ",
    description:
      "【拡散】上下1マス\n【反撃】種子散布\n\n水辺を好む外来種。千切れた茎から再生するため、半端な駆除は拡散を招く。",
    cost: 1,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/ブラジルチドメグサ.png",
    expansionPower: 1,
    expansionRange: "vertical", // 上下（川の流れなど）
    counterAbility: "spread_seed", // 物理駆除時に周囲に種を撒く
  },
  {
    id: "alien-3",
    name: "オオキンケイギク",
    description:
      "【拡散】十字1マス\n【反撃】なし\n\n鮮やかな花を咲かせるが、在来種を駆逐する力が強い。物理駆除で確実に処理しよう。",
    cost: 2,
    cardType: "alien",
    deckCount: 2,
    imagePath: "/plants/オオキンケイギク.png",
    expansionPower: 1,
    expansionRange: "cross", // 十字
    counterAbility: "none",
    cooldownTurns: 1,
  },
  {
    id: "alien-4",
    name: "ミズバショウ",
    description:
      "【拡散】周囲1マス\n【反撃】なし\n\n大きな葉で光を遮り、広範囲の在来種を衰退させる。拡散範囲が広い。",
    cost: 3,
    cardType: "alien",
    deckCount: 2,
    imagePath: "/plants/ミズバショウ.png",
    expansionPower: 1,
    expansionRange: "range", // 周囲8マス（正方形）
    counterAbility: "none",
    cooldownTurns: 1,
  },
  {
    id: "alien-5",
    name: "オオハンゴンソウ",
    description:
      "【拡散】斜め十字\n【反撃】種子散布\n\n地下茎で増える強害雑草。物理駆除では根が残り、そこから再生・拡散する恐れがある。",
    cost: 4,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/オオハンゴンソウ.png",
    expansionPower: 2, // 遠くまで届く
    expansionRange: "x_cross", // 斜め
    counterAbility: "spread_seed", // 厄介な反撃持ち
    usageLimit: 3,
  },
  {
    id: "alien-6",
    name: "アレチウリ",
    description:
      "【拡散】周囲2マス\n【反撃】種子散布\n\nすべてを覆い尽くす「緑の怪物」。極めて強い拡散力と再生能力を持つ。",
    cost: 5,
    cardType: "alien",
    deckCount: 1,
    imagePath: "/plants/アレチウリ.png",
    expansionPower: 2,
    expansionRange: "range", // 周囲広範囲
    counterAbility: "spread_seed",
    cooldownTurns: 1,
    usageLimit: 2,
  },

  // =================================================================
  // 🧹 駆除カード (Eradication Cards)
  // [共通仕様] 完全(Complete)=反撃無効, 物理(Physical)=反撃許容
  // =================================================================
  {
    id: "erad-1",
    name: "刈り払い",
    description:
      "【物理駆除】1マス\n草刈り機などで地上部を刈り取る。低コストだが、再生能力を持つ外来種には逆効果となる場合がある。",
    cost: 1,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "/actions/erad/kariharai.png",
    eradicationPower: 1,
    eradicationRange: "point", // 1マス
    eradicationType: "physical", // ★物理（反撃受ける）
    chainDestruction: false,
    postState: "bare", // 駆除後は裸地
  },
  {
    id: "erad-2",
    name: "手取り除草",
    description:
      "【物理駆除】十字範囲\n手作業で抜き取る。範囲は広いが、根の断片を残すと再生を許してしまう。",
    cost: 2,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "/actions/erad/tedori.png",
    eradicationPower: 1,
    eradicationRange: "cross", // 十字
    eradicationType: "physical", // ★物理
    chainDestruction: false,
    postState: "bare",
  },
  {
    id: "erad-3",
    name: "遮光シート被覆",
    description:
      "【完全駆除】1マス\n防草シートで覆い、光合成を阻害して枯死させる。「種子散布」等の反撃を無効化する。",
    cost: 3,
    cardType: "eradication",
    deckCount: 2,
    imagePath: "/actions/erad/shakou.png",
    eradicationPower: 2,
    cooldownTurns: 1,
    eradicationRange: "point",
    eradicationType: "complete", // 完全（反撃無効）
    chainDestruction: false,
    postState: "pioneer", // シートが土を守るため、先駆植生になりやすい
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
    eradicationPower: 3,
    eradicationRange: "range", // 周囲8マス
    eradicationType: "complete", // 完全
    chainDestruction: false,
    postState: "bare",
    usageLimit: 2,
  },
  {
    id: "erad-5",
    name: "抜本的駆除計画",
    description:
      "【連鎖駆除】\n指定した外来種(Core)と、その支配下にある全ての侵略マスを根こそぎ駆除する最終手段。",
    cost: 5,
    cardType: "eradication",
    deckCount: 1,
    imagePath: "/actions/erad/bappon.png",
    eradicationPower: 3,
    eradicationRange: "point", // 起点は1つだが連鎖する
    eradicationType: "complete",
    chainDestruction: true, // 連鎖的に破壊する
    postState: "bare",
    cooldownTurns: 1,
    usageLimit: 2,
  },

  // =================================================================
  // 🌿 回復カード (Recovery Cards)
  // [共通仕様] Power 1: 裸地->先駆, Power 2: 裸地->在来
  // =================================================================
  {
    id: "recov-1",
    name: "客土（土入れ）",
    description:
      "【回復】1マス (裸地→先駆)\n外来種の種を含まない清浄な土を入れる。裸地を塞ぎ、侵入を防ぐ壁を作る。",
    cost: 1,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/kyakudo.png",
    recoveryPower: 1, // 裸地 -> 先駆
    recoveryRange: "point",
    protection: "none",
  },
  {
    id: "recov-2",
    name: "在来種植栽",
    description:
      "【回復】1マス (裸地→在来)\n在来種の苗を直接植え付ける。時間をかけずに緑を取り戻すことができる。",
    cost: 2,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/shokusai.png",
    recoveryPower: 2, // 裸地 -> 在来種 (即時回復)
    recoveryRange: "point",
    protection: "none",
  },
  {
    id: "recov-3",
    name: "モニタリング保全",
    description:
      "【回復】十字範囲 (裸地→先駆) + 防御\n広範囲の植生を回復し、監視を行うことで次の侵入を防ぐ(1ラウンド防御)。",
    cost: 2,
    cardType: "recovery",
    deckCount: 2,
    cooldownTurns: 1,
    imagePath: "/actions/recov/monitoring.png",
    recoveryPower: 1,
    recoveryRange: "cross",
    protection: "1_round", // 次のターンの侵入不可
  },
  {
    id: "recov-4",
    name: "河川環境管理",
    description:
      "【回復】縦一列 (裸地→在来)\n川の流れに沿って環境を整え、外来種の侵入しにくい自然な水辺を再生する。",
    cost: 4,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/kasen.png",
    recoveryPower: 2, // 即時回復
    recoveryRange: "vertical", // 縦列
    protection: "none",
    cooldownTurns: 1,
    usageLimit: 2,
  },
  {
    id: "recov-5",
    name: "大地の恵み",
    description:
      "【回復】周囲 (先駆→在来)\n生態系本来の回復力を呼び覚ます。広範囲の先駆植生が一斉に在来種へ遷移する。",
    cost: 5,
    cardType: "recovery",
    deckCount: 1,
    imagePath: "/actions/recov/megumi.png",
    recoveryPower: 3, // 先駆 -> 在来種 (広範囲仕上げ用)
    recoveryRange: "range",
    protection: "none",
    usageLimit: 1,
  },
];