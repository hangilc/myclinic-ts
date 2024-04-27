import { SpecExec, execSpecTests } from "./spec"

const specs: SpecExec[] = [
  {
    title: "事例1　本人入院（標準報酬月額83万円以上）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [230000, ["hoken", "nanbyou"]]
    ],
    setting: {
      shotokuKubun: "ア",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", payment: 161000 }],
      ["payment", { payer: "nanbyou", kakari: 69000, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例2　本人入院（標準報酬月額83万円以上）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [1540000, ["hoken", "nanbyou"]]
    ],
    setting: {
      shotokuKubun: "ア",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", uncovered: 259580 }],
      ["payment", { payer: "nanbyou", kakari: 259580, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例3　本人入院（標準報酬月額53万～79万円）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [600000, ["hoken", "nanbyou"]]
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", uncovered: 167820 }],
      ["payment", { payer: "nanbyou", kakari: 167820, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例4　本人入院（標準報酬月額53万～79万円）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [600000, ["hoken", "nanbyou"]]
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", uncovered: 167820 }],
      ["payment", { payer: "nanbyou", kakari: 167820, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例5　本人入院（標準報酬月額53万～79万円）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [650000, ["hoken", "nanbyou"]],
      [750000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 175820],
      ["payment", { payer: "hoken", uncovered: 324140 }],
      ["payment", { payer: "nanbyou", kakari: 168320, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例6　本人入院（標準報酬月額28万～50万円）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 10000 }]
    ],
    bills: [
      [30000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 6000],
      ["payment", { payer: "hoken", payment: 21000 }],
      ["payment", { payer: "nanbyou", kakari: 9000, jikofutan: 6000 }],
    ],
  },
  {
    title: "事例7　本人入院（標準報酬月額28万～50万円）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 10000 }]
    ],
    bills: [
      [370000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 81130 }],
      ["payment", { payer: "nanbyou", kakari: 81130, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例8　本人入院（標準報酬月額28万～50万円）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 10000 }]
    ],
    bills: [
      [60000, ["hoken", "nanbyou"]],
      [310000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 90530],
      ["payment", { payer: "hoken", uncovered: 98530 }],
      ["payment", { payer: "nanbyou", kakari: 18000, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例9　本人入院（標準報酬月額28万～50万円）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 10000 }]
    ],
    bills: [
      [300000, ["hoken", "nanbyou"]],
      [380000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 84230],
      ["payment", { payer: "hoken", uncovered: 154660 }],
      ["payment", { payer: "nanbyou", kakari: 80430, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例10　本人入院（標準報酬月額26万円以下）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [220000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 57600 }],
      ["payment", { payer: "nanbyou", kakari: 57600, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例11　本人入院（標準報酬月額26万円以下）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [230000, ["hoken", "nanbyou"]],
      [50000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", uncovered: 72600 }],
      ["payment", { payer: "nanbyou", kakari: 57600, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例12　本人入院（標準報酬月額26万円以下）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [250000, ["hoken", "nanbyou"]],
      [200000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 57600],
      ["payment", { payer: "hoken", uncovered: 110200 }],
      ["payment", { payer: "nanbyou", kakari: 57600, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例13　本人入院（低所得者）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [230000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "オ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 35400 }],
      ["payment", { payer: "nanbyou", kakari: 35400, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例14　本人入院（低所得者）・難病医療（既認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [90000, ["hoken", "nanbyou"]],
      [170000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "オ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 35400],
      ["payment", { payer: "hoken", uncovered: 57400 }],
      ["payment", { payer: "nanbyou", kakari: 27000, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例15　本人入院（標準報酬月額83万円以上）・難病医療（新規認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 30000 }]
    ],
    bills: [
      [1100000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "ア",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 30000],
      ["payment", { payer: "hoken", uncovered: 140100 }],
      ["payment", { payer: "nanbyou", kakari: 140100, jikofutan: 30000 }],
    ],
  },
  {
    title: "事例16　本人入院（標準報酬月額53万～79万円）・難病医療（既認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [700000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", uncovered: 93000 }],
      ["payment", { payer: "nanbyou", kakari: 93000, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例17　本人入院（標準報酬月額28万～50万円）・難病医療（新規認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [700000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", uncovered: 44400 }],
      ["payment", { payer: "nanbyou", kakari: 44400, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例18　本人入院（標準報酬月額26万円以下）・難病医療（既認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [220000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 44400 }],
      ["payment", { payer: "nanbyou", kakari: 44400, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例19　本人入院（低所得者）・難病医療（既認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [190000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "オ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 24600 }],
      ["payment", { payer: "nanbyou", kakari: 24600, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例20　本人入院外（標準報酬月額83万円以上）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 30000 }]
    ],
    bills: [
      [1300000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "ア",
      isNyuuin: false,
    },
    asserts: [
      ["jikofutan", 30000],
      ["payment", { payer: "hoken", uncovered: 257180 }],
      ["payment", { payer: "nanbyou", kakari: 257180, jikofutan: 30000 }],
    ],
  },
  {
    title: "事例21　本人入院外（標準報酬月額53万～79万円）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 30000 }]
    ],
    bills: [
      [650000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: false,
    },
    asserts: [
      ["jikofutan", 30000],
      ["payment", { payer: "hoken", uncovered: 168320 }],
      ["payment", { payer: "nanbyou", kakari: 168320, jikofutan: 30000 }],
    ],
  },
  {
    title: "事例22　本人入院外（標準報酬月額28万～50万円）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 20000 }]
    ],
    bills: [
      [330000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: false,
    },
    asserts: [
      ["jikofutan", 20000],
      ["payment", { payer: "hoken", uncovered: 80730 }],
      ["payment", { payer: "nanbyou", kakari: 80730, jikofutan: 20000 }],
    ],
  },
  {
    title: "事例23　本人入院外（標準報酬月額26万円以下）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 10000 }]
    ],
    bills: [
      [300000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: false,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 57600 }],
      ["payment", { payer: "nanbyou", kakari: 57600, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例24　本人入院外（低所得者）・難病医療（新規認定者）",
    payers: [
      ["hoken", { futanWari: 3 }], ["nanbyou", { gendogaku: 5000 }]
    ],
    bills: [
      [160000, ["hoken", "nanbyou"]],
    ],
    setting: {
      shotokuKubun: "オ",
      isNyuuin: false,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 35400 }],
      ["payment", { payer: "nanbyou", kakari: 35400, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例25　六歳入院（標準報酬月額83万円以上）・小児慢性（既認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 10000 }]
    ],
    bills: [
      [2100000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "ア",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 265180 }],
      ["payment", { payer: "shouni-mansei", kakari: 265180, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例26　六歳入院（標準報酬月額53万～79万円）・小児慢性（新規認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 10000 }]
    ],
    bills: [
      [900000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 170820 }],
      ["payment", { payer: "shouni-mansei", kakari: 170820, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例27　六歳入院（標準報酬月額53万～79万円）・小児慢性（既認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 10000 }]
    ],
    bills: [
      [1100000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 172820 }],
      ["payment", { payer: "shouni-mansei", kakari: 172820, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例28　六歳入院（標準報酬月額28万～50万円）・小児慢性（新規認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 10000 }]
    ],
    bills: [
      [460000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 82030 }],
      ["payment", { payer: "shouni-mansei", kakari: 82030, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例29　六歳入院（標準報酬月額28万～50万円）・小児慢性（新規認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 10000 }]
    ],
    bills: [
      [60000, ["hoken", "shouni-mansei"]],
      [440000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 91830],
      ["payment", { payer: "hoken", uncovered: 93830 }],
      ["payment", { payer: "shouni-mansei", kakari: 12000, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例30　六歳入院（標準報酬月額26万円以下）・小児慢性（新規認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 5000 }]
    ],
    bills: [
      [320000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 57600 }],
      ["payment", { payer: "shouni-mansei", kakari: 57600, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例31　六歳入院（標準報酬月額26万円以下）・小児慢性（新規認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 5000 }]
    ],
    bills: [
      [300000, ["hoken", "shouni-mansei"]],
      [100000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 25000],
      ["payment", { payer: "hoken", uncovered: 77600 }],
      ["payment", { payer: "shouni-mansei", kakari: 57600, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例32　六歳入院（低所得者）・小児慢性（既認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 2500 }]
    ],
    bills: [
      [230000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "オ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 2500],
      ["payment", { payer: "hoken", uncovered: 35400 }],
      ["payment", { payer: "shouni-mansei", kakari: 35400, jikofutan: 2500 }],
    ],
  },
  {
    title: "事例33　六歳入院（低所得者）・小児慢性（既認定者）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 2500 }]
    ],
    bills: [
      [200000, ["hoken", "shouni-mansei"]],
      [190000, ["hoken"]],
    ],
    setting: {
      shotokuKubun: "オ",
      isNyuuin: true,
    },
    asserts: [
      ["jikofutan", 35400],
      ["payment", { payer: "hoken", uncovered: 68300 }],
      ["payment", { payer: "shouni-mansei", kakari: 35400, jikofutan: 2500 }],
    ],
  },
  {
    title: "事例34　六歳入院（標準報酬月額83万円以上）・小児慢性（既認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 10000 }]
    ],
    bills: [
      [900000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "ア",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 140100 }],
      ["payment", { payer: "shouni-mansei", kakari: 140100, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例35　六歳入院（標準報酬月額53万～79万円）・小児慢性（新規認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 10000 }]
    ],
    bills: [
      [700000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "イ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 10000],
      ["payment", { payer: "hoken", uncovered: 93000 }],
      ["payment", { payer: "shouni-mansei", kakari: 93000, jikofutan: 10000 }],
    ],
  },
  {
    title: "事例36　六歳入院（標準報酬月額28万～50万円）・小児慢性（既認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 5000 }]
    ],
    bills: [
      [300000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "ウ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 44400 }],
      ["payment", { payer: "shouni-mansei", kakari: 44400, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例37　六歳入院（標準報酬月額26万円以下）・小児慢性（新規認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 5000 }]
    ],
    bills: [
      [260000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "エ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 44400 }],
      ["payment", { payer: "shouni-mansei", kakari: 44400, jikofutan: 5000 }],
    ],
  },
  {
    title: "事例38　六歳入院（低所得者）小児慢性（新規認定者）（多数回該当）",
    payers: [
      ["hoken", { futanWari: 2 }], ["shouni-mansei", { gendogaku: 2500 }]
    ],
    bills: [
      [180000, ["hoken", "shouni-mansei"]],
    ],
    setting: {
      shotokuKubun: "オ",
      isNyuuin: true,
      isTasuuGaitou: true,
    },
    asserts: [
      ["jikofutan", 2500],
      ["payment", { payer: "hoken", uncovered: 24600 }],
      ["payment", { payer: "shouni-mansei", kakari: 24600, jikofutan: 2500 }],
    ],
  },
]

describe("難病計算例７０歳未満", () => {
  execSpecTests(specs);
})