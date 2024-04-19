import { PayerObject, PaymentContext, PaymentObject, calcPayments, calcPaymentsMulti, mkHokenPayer, mkKouhiKekkaku, mkKouhiKousei, mkKouhiMarucho, totalJikofutanOf } from "./calc";

// import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
// import { calcFutan, TotalCover } from "./futan-calc";
// import { KouhiKekkaku, KouhiKouseiIryou } from "./kouhi-registry";

// function mkTens(...items: [負担区分コードName, number][]): Map<負担区分コードCode, number> {
//   return new Map(items.map(([kubunName, ten]) => [負担区分コード[kubunName], ten]));
// }

// function mkTen(futanCodeName: 負担区分コードName, ten: number): Map<負担区分コードCode, number> {
//   return mkTens([futanCodeName, ten]);
// }

// const round = Math.round;

// function patientChargeOf(totalCover: TotalCover): number {
//   return round(totalCover.patientCharge);
// }

// 高額療養費の自己負担限度額の 見直しに係る計算事例 （平成27年1月）による
describe("高額療養費（70歳未満）", () => {
  it("事例1　本人入院（標準報酬月額83万円以上）", () => {
    const hoken = mkHokenPayer();
    calcPayments(8800 * 10, [hoken], { shotokuKubun: "ア" });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(26400);
  });

  it("事例2　本人入院（標準報酬月額83万円以上）", () => {
    const hoken = mkHokenPayer();
    calcPayments(94576 * 10, [hoken], { shotokuKubun: "ア" });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(253638);
  });

  it("事例3　本人入院（標準報酬月額53万～79万円）", () => {
    const hoken = mkHokenPayer();
    calcPayments(72641 * 10, [hoken], { shotokuKubun: "イ" });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(169084);
  });

  it("事例4　本人入院（標準報酬月額28万～50万円）", () => {
    const hoken = mkHokenPayer();
    calcPayments(36452 * 10, [hoken], { shotokuKubun: "ウ" });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(81075);
  });

  it("事例5　本人入院（標準報酬月額26万円以下）", () => {
    const hoken = mkHokenPayer();
    calcPayments(21635 * 10, [hoken], { shotokuKubun: "エ" });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(57600);
  });

  it("事例6　本人入院（低所得者）", () => {
    const hoken = mkHokenPayer();
    calcPayments(18795 * 10, [hoken], { shotokuKubun: "オ" });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(35400);
  });

  it("事例7　本人入院（標準報酬月額83万円以上）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments(94576 * 10, [hoken], { shotokuKubun: "ア", gendogakuOptions: { isTasuuGaitou: true } });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(140100);
  });

  it("事例8　本人入院（標準報酬月額53万～79万円）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments(72641 * 10, [hoken], { shotokuKubun: "イ", gendogakuOptions: { isTasuuGaitou: true } });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(93000);
  });

  it("事例9　本人入院（標準報酬月額28万～50万円）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments(36452 * 10, [hoken], { shotokuKubun: "ウ", gendogakuOptions: { isTasuuGaitou: true } });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(44400);
  });

  it("事例10　本人入院（標準報酬月額26万円以下）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments(21635 * 10, [hoken], { shotokuKubun: "エ", gendogakuOptions: { isTasuuGaitou: true } });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(44400);
  });

  it("事例11　本人入院（低所得者）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments(18795 * 10, [hoken], { shotokuKubun: "オ", gendogakuOptions: { isTasuuGaitou: true } });
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(24600);
  });

  it("事例12　本人入院（長）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiMarucho(10000);
    calcPayments(17500 * 10, [hoken, kouhi], { shotokuKubun: "ウ" });
    expect(PayerObject.jikofutanOf([hoken, kouhi])).toBe(10000);
  });

  it("事例13　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const ctx: PaymentContext = { shotokuKubun: "ア" };
    const payments = calcPaymentsMulti([
      [6000 * 10, [hoken, kouhi], ctx],
      [9000 * 10, [hoken], ctx],
    ]);
    expect(totalJikofutanOf(payments)).toBe(30000);
  });

  it("事例14　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPaymentsMulti([
      [85000 * 10, [hoken, kouhi], { shotokuKubun: "ア" }],
      [5000 * 10, [hoken], { shotokuKubun: "ア" }],
    ])
    expect(totalJikofutanOf(payments)).toBe(57500);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(100930);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例15　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPaymentsMulti([
      [5000 * 10, [hoken, kouhi], { shotokuKubun: "ア" }],
      [95000 * 10, [hoken], { shotokuKubun: "ア" }],
    ])
    expect(totalJikofutanOf(payments)).toBe(256180);
    expect(kouhi.payment.kakari).toBe(15000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(268680);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(2500);
  });

  it("事例16　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPaymentsMulti([
      [10000 * 10, [hoken, kouhi], { shotokuKubun: "ア" }],
      [110000 * 10, [hoken], { shotokuKubun: "ア" }],
    ])
    expect(totalJikofutanOf(payments)).toBe(256180);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(281180);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例17　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPaymentsMulti([
      [85000 * 10, [hoken, kouhi], { shotokuKubun: "ア" }],
      [95000 * 10, [hoken], { shotokuKubun: "ア" }],
    ])
    expect(totalJikofutanOf(payments)).toBe(262180);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(305610);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例18　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const shotokuKubun = "イ"
    const payments = calcPaymentsMulti([
      [85000 * 10, [hoken, kouhi], { shotokuKubun }],
      [5000 * 10, [hoken], { shotokuKubun }],
    ])
    expect(totalJikofutanOf(payments)).toBe(57500);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(100930);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例19　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const shotokuKubun = "イ"
    const payments = calcPaymentsMulti([
      [5000 * 10, [hoken, kouhi], { shotokuKubun }],
      [95000 * 10, [hoken], { shotokuKubun }],
    ])
    expect(totalJikofutanOf(payments)).toBe(173820);
    expect(kouhi.payment.kakari).toBe(15000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(186320);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(2500);
  });

  it("事例20　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const shotokuKubun = "イ"
    const payments = calcPaymentsMulti([
      [10000 * 10, [hoken, kouhi], { shotokuKubun }],
      [110000 * 10, [hoken], { shotokuKubun }],
    ])
    expect(totalJikofutanOf(payments)).toBe(173820);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(198820);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例21　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const shotokuKubun = "イ"
    const payments = calcPaymentsMulti([
      [85000 * 10, [hoken, kouhi], { shotokuKubun }],
      [95000 * 10, [hoken], { shotokuKubun }],
    ])
    expect(totalJikofutanOf(payments)).toBe(179820);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(223250);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例22　本人入院（標準報酬月額28万円～50万円）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(30000);
    const shotokuKubun = "ウ"
    const payments = calcPaymentsMulti([
      [20000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [40000 * 10, [hoken], { shotokuKubun }],
    ])
    expect(totalJikofutanOf(payments)).toBe(83430);
    expect(kouhi.payment.kakari).toBe(60000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(123430);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(20000);
  });

  it("事例23　本人入院（標準報酬月額28万円～50万円）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(30000);
    const shotokuKubun = "ウ"
    const payments = calcPaymentsMulti([
      [30000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [30000 * 10, [hoken], { shotokuKubun }],
    ])
    expect(totalJikofutanOf(payments)).toBe(83430);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(133860);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(30000);
  });

  it("事例24　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const shotokuKubun = "エ"
    const payments = calcPaymentsMulti([
      [30000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(5000);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(80430);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例25　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const shotokuKubun = "エ"
    const payments = calcPaymentsMulti([
      [10000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [20000 * 10, [hoken], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(57600);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(82600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例26　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const shotokuKubun = "エ"
    const payments = calcPaymentsMulti([
      [30000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [30000 * 10, [hoken], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(57600);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(133030);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例27　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(0);
    const shotokuKubun = "オ"
    const payments = calcPaymentsMulti([
      [10000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [20000 * 10, [hoken], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(65400);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(0);
  });

  it("事例28　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(0);
    const shotokuKubun = "オ"
    const payments = calcPaymentsMulti([
      [30000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [10000 * 10, [hoken], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(30000);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(110430);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(0);
  });

  it("事例29　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(0);
    const shotokuKubun = "オ"
    const payments = calcPaymentsMulti([
      [30000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [30000 * 10, [hoken], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(115830);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(0);
  });

  it("事例30　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const shotokuKubun = "オ"
    const payments = calcPaymentsMulti([
      [10000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [20000 * 10, [hoken], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(60400);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例31　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const shotokuKubun = "オ"
    const payments = calcPaymentsMulti([
      [30000 * 10, [hoken, kouhi], { shotokuKubun, gendogakuOptions: { } }],
      [30000 * 10, [hoken], { shotokuKubun, gendogakuOptions: { } }],
    ])
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(110830);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

});

