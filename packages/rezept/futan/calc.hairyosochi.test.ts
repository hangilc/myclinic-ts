import { Payer, Payment, PaymentObject, PaymentSetting, calcPayments, mkHokenHairyosochi, mkKouhiKekkaku, mkKouhiKousei, mkKouhiNanbyou, totalJikofutanOf } from "./calc";

import { execSpec, SpecExec, type Spec, execSpecTests } from "./spec";

// 後期高齢者医療制度の負担割合見直しに係る計算事例集（令和５年４月）

const specs: SpecExec[] = [
  {
    title: "【事例１】後期高齢者２割負担外来",
    payers: [["hoken:hairyosochi"]],
    bills: [[20000, ["hoken"]]],
    asserts: [["jikofutan", 4000]]
  },
  {
    title: "【事例2】後期高齢者２割負担外来",
    payers: [["hoken:hairyosochi"]],
    bills: [[200000, ["hoken"]]],
    asserts: [["jikofutan", 18000]]
  },
  {
    title: "【事例2】後期高齢者２割負担外来",
    payers: [["hoken:hairyosochi"]],
    bills: [[80000, ["hoken"]]],
    asserts: [["jikofutan", 11000]]
  },
  {
    title: "【事例3】後期高齢者２割負担外来（配慮措置）",
    payers: [["hoken:hairyosochi"]],
    bills: [[80000, ["hoken"]]],
    asserts: [["jikofutan", 11000]]
  },
  {
    title: "【事例4】後期高齢者２割負担外来（配慮措置）",
    payers: [["hoken:hairyosochi"]],
    bills: [[130000, ["hoken"]]],
    asserts: [["jikofutan", 16000]]
  },
  {
    title: "【事例5】後期高齢者２割負担外来（75歳到達月）",
    payers: [["hoken:hairyosochi"]],
    bills: [[100000, ["hoken"]]],
    setting: { isBirthdayMonth75: true },
    asserts: [["jikofutan", 9000]]
  },
  {
    title: "【事例6】後期高齢者２割負担外来（配慮措置）（75歳到達月）",
    payers: [["hoken:hairyosochi"]],
    bills: [[40000, ["hoken"]]],
    setting: { isBirthdayMonth75: true },
    asserts: [["jikofutan", 7000]]
  },
  {
    title: "【事例7】後期高齢者２割負担外来（配慮措置）（75歳到達月）",
    payers: [["hoken:hairyosochi"]],
    bills: [[50000, ["hoken"]]],
    setting: { isBirthdayMonth75: true },
    asserts: [["jikofutan", 8000]]
  },
  {
    title: "【事例8】後期高齢者２割負担外来（マル長）",
    payers: [["hoken:hairyosochi"]],
    bills: [[150000, ["hoken"]]],
    setting: { marucho: 10000 },
    asserts: [["jikofutan", 10000]]
  },
  {
    title: "【事例9】後期高齢者２割負担外来（マル長）（75歳到達月）",
    payers: [["hoken:hairyosochi"]],
    bills: [[70000, ["hoken"]]],
    setting: { marucho: 10000, isBirthdayMonth75: true },
    asserts: [["jikofutan", 5000]]
  },
  {
    title: "【事例10】後期高齢者２割負担外来（難病）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }]],
    bills: [[100000, ["hoken", "nanbyou"]]],
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 18000 }],
      ["payment", { payer: "nanbyou", kakari: 18000, jikofutan: 5000 }],
    ],
  },
  {
    title: "【事例11】後期高齢者２割負担外来（難病）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }]],
    bills: [[80000, ["hoken", "nanbyou"]]],
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 16000 }],
      ["payment", { payer: "nanbyou", kakari: 16000, jikofutan: 5000 }],
    ],
  },
  {
    title: "【事例12】後期高齢者２割負担外来（難病）（75歳到達月）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }]],
    bills: [[50000, ["hoken", "nanbyou"]]],
    setting: { isBirthdayMonth75: true },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", uncovered: 9000 }],
      ["payment", { payer: "nanbyou", kakari: 9000, jikofutan: 5000 }],
    ],
  },
  {
    title: "【事例14】後期高齢者２割負担外来（マル長）（更生医療）",
    payers: [["hoken:hairyosochi"], ["kousei", { gendogaku: 30000 }]],
    bills: [[60000, ["hoken", "kousei"]]],
    setting: { marucho: 10000 },
    asserts: [
      ["jikofutan", 6000],
      ["payment", { payer: "hoken", uncovered: 10000 }],
      ["payment", { payer: "kousei", kakari: 10000, jikofutan: 6000 }],
    ],
  },
  {
    title: "【事例15】後期高齢者２割負担外来（難病）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }]],
    bills: [
      [30000, ["hoken", "nanbyou"]],
      [10000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 7000],
      ["payment", { payer: "hoken", uncovered: 8000 }],
      ["payment", { payer: "nanbyou", kakari: 6000, jikofutan: 5000 }],
    ],
  },
  {
    title: "【事例16】後期高齢者２割負担外来（難病）（配慮措置）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }]],
    bills: [
      [40000, ["hoken", "nanbyou"]],
      [50000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 13000],
      ["payment", { payer: "hoken", uncovered: 16000 }],
      ["payment", { payer: "nanbyou", kakari: 8000, jikofutan: 5000 }],
    ],
  },
  {
    title: "【事例17】後期高齢者２割負担外来（難病）（配慮措置）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }]],
    bills: [
      [35000, ["hoken", "nanbyou"]],
      [105000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 18000],
      ["payment", { payer: "hoken", uncovered: 20000 }],
      ["payment", { payer: "nanbyou", kakari: 7000, jikofutan: 5000 }],
    ],
  },
  {
    title: "【事例18】後期高齢者２割負担外来（結核）（配慮措置）",
    payers: [["hoken:hairyosochi"], ["kekkaku"]],
    bills: [
      [60000, ["hoken", "kekkaku"]],
      [80000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 14000],
      ["payment", { payer: "hoken", uncovered: 23000 }],
      ["payment", { payer: "kekkaku", kakari: 12000, jikofutan: 3000 }],
    ],
  },
  {
    title: "【事例19】後期高齢者２割負担外来（難病・肝炎）（配慮措置）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }], ["hepatitis", { gendogaku: 1000 }]],
    bills: [
      [40000, ["hoken", "nanbyou"]],
      [35000, ["hoken", "hepatitis"]],
      [45000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 13500],
      ["payment", { payer: "hoken", uncovered: 22500 }],
      ["payment", { payer: "nanbyou", kakari: 8000, jikofutan: 5000 }],
      ["payment", { payer: "hepatitis", kakari: 7000, jikofutan: 1000 }],
    ],
  },
  {
    title: "【事例20】後期高齢者２割負担外来（難病・肝炎）（配慮措置）",
    payers: [["hoken:hairyosochi"], ["nanbyou", { gendogaku: 5000 }], ["hepatitis", { gendogaku: 1000 }]],
    bills: [
      [32000, ["hoken", "nanbyou"]],
      [20000, ["hoken", "hepatitis"]],
      [96000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 18000],
      ["payment", { payer: "hoken", uncovered: 22400 }],
      ["payment", { payer: "nanbyou", kakari: 6400, jikofutan: 5000 }],
      ["payment", { payer: "hepatitis", kakari: 4000, jikofutan: 1000 }],
    ],
  },
  {
    title: "【事例21】後期高齢者２割負担外来（マル長）",
    payers: [["hoken:hairyosochi"]],
    bills: [
      [40000, ["hoken"]],
    ],
    setting: { marucho: 10000 },
    asserts: [
      ["jikofutan", 8000],
    ],
  },
  {
    title: "【事例22】後期高齢者２割負担外来（新型コロナ感染症）",
    payers: [["hoken:hairyosochi"], ["group1-infection"]],
    bills: [
      [85000, ["hoken", "group1-infection"]],
      [25000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 5000],
      ["payment", { payer: "hoken", payment: 88000}],
      ["payment", { payer: "group1-infection", kakari: 17000, jikofutan: 0}],
    ],
  },
  {
    title: "【事例23】後期高齢者２割負担外来（新型コロナ感染症）（配慮措置）",
    payers: [["hoken:hairyosochi"], ["group1-infection"]],
    bills: [
      [80000, ["hoken", "group1-infection"]],
      [55000, ["hoken"]],
    ],
    setting: { },
    asserts: [
      ["jikofutan", 8500],
      ["payment", { payer: "hoken", uncovered: 24500}],
      ["payment", { payer: "group1-infection", kakari: 16000, jikofutan: 0}],
    ],
  },

]

describe("後期高齢者医療制度の負担割合見直し", () => {
  execSpecTests(specs);
})