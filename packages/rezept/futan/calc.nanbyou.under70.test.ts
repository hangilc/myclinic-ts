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
]

describe("難病計算例７０歳未満", () => {
  execSpecTests(specs);
})