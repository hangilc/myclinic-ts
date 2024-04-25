import { Payer, PaymentObject, PaymentSetting, calcPayments, mkHokenHairyosochi, mkKouhiKousei, mkKouhiNanbyou, totalJikofutanOf } from "./calc";

// 後期高齢者医療制度の負担割合見直しに係る計算事例集（令和５年４月）

function calc(ten: number, opt: Partial<PaymentSetting>, jikofutan: number) {
  const hoken = mkHokenHairyosochi();
  const payments = calcPayments([
    [ten * 10, [hoken]]
  ], Object.assign({}, { shotokuKubun: "一般Ⅱ", futanWari: 2, isUnder70: false }, opt))
  expect(totalJikofutanOf(payments)).toBe(jikofutan);
}

function calcWithKouhi(kouhi: Payer, ten: number,
  opt: Partial<PaymentSetting>, jikofutan: number, kouhiKakari: number, kouhiJikofutan: number) {
  const hoken = mkHokenHairyosochi();
  const payments = calcPayments([
    [ten * 10, [hoken, kouhi]],
  ], Object.assign({}, { shotokuKubun: "一般Ⅱ", futanWari: 2, isUnder70: false }, opt));
  console.log("payments", payments);
  expect(totalJikofutanOf(payments)).toBe(jikofutan);
  expect(kouhi.payment.kakari).toBe(kouhiKakari);
  expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(kouhiJikofutan);
}

function calc1(kouhi: Payer, heiyouTen: number, hokenTandokuTen: number,
  opt: Partial<PaymentSetting>, jikofutan: number, kouhiKakari: number, kouhiJikofutan: number) {
  const hoken = mkHokenHairyosochi();
  const payments = calcPayments([
    [heiyouTen * 10, [hoken, kouhi]],
    [hokenTandokuTen * 10, [hoken]],
  ], Object.assign({}, { shotokuKubun: "一般Ⅱ", futanWari: 2, isUnder70: false }, opt));
  console.log("payments", payments);
  expect(totalJikofutanOf(payments)).toBe(jikofutan);
  expect(kouhi.payment.kakari).toBe(kouhiKakari);
  expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(kouhiJikofutan);
}



describe("後期高齢者医療制度の負担割合見直し", () => {
  it("【事例１】後期高齢者２割負担外来", () => {
    calc(2000, {}, 4000);
  });

  it("【事例2】後期高齢者２割負担外来", () => {
    calc(20000, {}, 18000);
  });

  it("【事例3】後期高齢者２割負担外来（配慮措置）", () => {
    calc(8000, {}, 11000);
  });

  it("【事例4】後期高齢者２割負担外来（配慮措置）", () => {
    calc(13000, {}, 16000);
  });

  it("【事例5】後期高齢者２割負担外来（75歳到達月）", () => {
    calc(10000, { isBirthdayMonth75: true }, 9000);
  });

  it("【事例6】後期高齢者２割負担外来（配慮措置）（75歳到達月）", () => {
    calc(4000, { isBirthdayMonth75: true }, 7000);
  });

  it("【事例7】後期高齢者２割負担外来（配慮措置）（75歳到達月）", () => {
    calc(5000, { isBirthdayMonth75: true }, 8000);
  });

  it("【事例8】後期高齢者２割負担外来（マル長）", () => {
    calc(15000, { marucho: 10000 }, 10000);
  });

  it("【事例9】後期高齢者２割負担外来（マル長）（75歳到達月）", () => {
    calc(7000, { marucho: 10000, isBirthdayMonth75: true }, 5000);
  });

  it("【事例10】後期高齢者２割負担外来（難病）", () => {
    calcWithKouhi(mkKouhiNanbyou(5000), 10000, {}, 5000, 13000, 5000);
  });

  it("【事例11】後期高齢者２割負担外来（難病）", () => {
    calcWithKouhi(mkKouhiNanbyou(5000), 8000, {}, 5000, 13000, 11000);
  });

  it("【事例12】後期高齢者２割負担外来（難病）（75歳到達月）", () => {
    calcWithKouhi(mkKouhiNanbyou(5000), 8000, { isBirthdayMonth75: true }, 5000, 13000, 4000);
  });

  it("【事例14】後期高齢者２割負担外来（マル長）（更生医療）", () => {
    calcWithKouhi(mkKouhiKousei(30000), 6000, { marucho: 10000 }, 6000, 10000, 6000);
  });

  it("【事例15】後期高齢者２割負担外来（難病）", () => {
    calc1(mkKouhiNanbyou(5000), 3000, 1000, {}, 7000, )
    //     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
    //       mkTens(["H1", 3000], ["H", 1000]),
    //       {
    //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
    //       });
    //     expect(patientChargeOf(covers)).toBe(7000);
    //     expect(coveredBy("1", covers)).toBe(1000);
  });

  it("【事例16】後期高齢者２割負担外来（難病）（配慮措置）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
    //       mkTens(["H1", 4000], ["H", 5000]),
    //       {
    //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
    //       });
    //     expect(patientChargeOf(covers)).toBe(13000);
    //     expect(coveredBy("1", covers)).toBe(3000);
  });

  it("【事例17】後期高齢者２割負担外来（難病）（配慮措置）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
    //       mkTens(["H1", 3500], ["H", 10500]),
    //       {
    //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
    //       });
    //     expect(patientChargeOf(covers)).toBe(18000);
    //     expect(coveredBy("1", covers)).toBe(2000);
  });

  it("【事例18】後期高齢者２割負担外来（結核）（配慮措置）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [KouhiKekkaku],
    //       mkTens(["H1", 6000], ["H", 8000]),
    //       {
    //       });
    //     expect(patientChargeOf(covers)).toBe(14000);
    //     expect(coveredBy("1", covers)).toBe(9000);
  });

  it("【事例19】後期高齢者２割負担外来（難病・肝炎）（配慮措置）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou, KouhiHepatitis],
    //       mkTens(["H1", 4000], ["H2", 3500], ["H", 4500]),
    //       {
    //         gendogaku: [
    //           { kingaku: 5000, kouhiBangou: 1 },
    //           { kingaku: 1000, kouhiBangou: 2 },
    //         ],
    //       });
    //     expect(patientChargeOf(covers)).toBe(13500);
    //     expect(coveredBy("1", covers)).toBe(3000);
    //     expect(coveredBy("2", covers)).toBe(6000);
  });

  it("【事例20】後期高齢者２割負担外来（難病・肝炎）（配慮措置）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou, KouhiHepatitis],
    //       mkTens(["H1", 3200], ["H2", 2000], ["H", 9600]),
    //       {
    //         gendogaku: [
    //           { kingaku: 5000, kouhiBangou: 1 },
    //           { kingaku: 1000, kouhiBangou: 2 },
    //         ],
    //       });
    //     expect(patientChargeOf(covers)).toBe(18000);
    //     expect(coveredBy("1", covers)).toBe(1400);
    //     expect(coveredBy("2", covers)).toBe(3000);
  });

  it("【事例21】後期高齢者２割負担外来（マル長）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [],
    //       mkTens(["H", 4000]),
    //       {
    //         marucho: 10000,
    //       });
    //     expect(patientChargeOf(covers)).toBe(8000);
  });

  it("【事例22】後期高齢者２割負担外来（新型コロナ感染症）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [KouhiGroup1Group2Infection],
    //       mkTens(["H1", 8500], ["H", 2500]),
    //       {
    //       });
    //     expect(patientChargeOf(covers)).toBe(5000);
    //     expect(coveredBy("1", covers)).toBe(17000);
  });

  it("【事例23】後期高齢者２割負担外来（新型コロナ感染症）（配慮措置）", () => {
    //     const covers = calcFutan(2, "一般Ⅱ", [KouhiGroup1Group2Infection],
    //       mkTens(["H1", 8000], ["H", 5500]),
    //       {
    //       });
    //     expect(patientChargeOf(covers)).toBe(8500);
    //     expect(coveredBy("1", covers)).toBe(16000);
  });
})