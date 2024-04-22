import { ShotokuKubunCode } from "../codes";
import { PayerObject, PaymentObject, PaymentSetting, calcPayments, mkHokenPayer, mkKouhiKekkaku, mkKouhiKousei, mkKouhiMarucho, totalJikofutanOf } from "./calc";

function opt(shotokuKubun: ShotokuKubunCode, arg: Partial<PaymentSetting> = {}): Partial<PaymentSetting> {
  return Object.assign({}, {
    futanWari: 3,
    isUnder70: true,
    shotokuKubun,
    isNyuuin: true,
  }, arg);
}

// 高額療養費の自己負担限度額の 見直しに係る計算事例 （平成27年1月）による
describe("高額療養費（70歳未満）", () => {
  it("事例1　本人入院（標準報酬月額83万円以上）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[8800 * 10, [hoken]]], opt("ア"));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(26400);
  });

  it("事例2　本人入院（標準報酬月額83万円以上）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[94576 * 10, [hoken]]], opt("ア"));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(253638);
  });

  it("事例3　本人入院（標準報酬月額53万～79万円）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[72641 * 10, [hoken]]], opt("イ"));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(169084);
  });

  it("事例4　本人入院（標準報酬月額28万～50万円）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[36452 * 10, [hoken]]], opt("ウ"));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(81075);
  });

  it("事例5　本人入院（標準報酬月額26万円以下）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[21635 * 10, [hoken]]], opt("エ"));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(57600);
  });

  it("事例6　本人入院（低所得者）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[18795 * 10, [hoken]]], opt("オ"));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(35400);
  });

  it("事例7　本人入院（標準報酬月額83万円以上）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[94576 * 10, [hoken]]], opt("ア", { isTasuuGaitou: true }));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(140100);
  });

  it("事例8　本人入院（標準報酬月額53万～79万円）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[72641 * 10, [hoken]]], opt("イ", { isTasuuGaitou: true }));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(93000);
  });

  it("事例9　本人入院（標準報酬月額28万～50万円）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[36452 * 10, [hoken]]], opt("ウ", { isTasuuGaitou: true }));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(44400);
  });

  it("事例10　本人入院（標準報酬月額26万円以下）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[21635 * 10, [hoken]]], opt("エ", { isTasuuGaitou: true }));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(44400);
  });

  it("事例11　本人入院（低所得者）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    calcPayments([[18795 * 10, [hoken]]], opt("オ", { isTasuuGaitou: true }));
    expect(PaymentObject.jikofutanOf(hoken.payment)).toBe(24600);
  });

  it("事例12　本人入院（長）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiMarucho(10000);
    calcPayments([[17500 * 10, [hoken, kouhi]]], opt("ウ"));
    expect(PayerObject.jikofutanOf([hoken, kouhi])).toBe(10000);
  });

  it("事例13　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [6000 * 10, [hoken, kouhi]],
      [9000 * 10, [hoken]],
    ], opt("ア"));
    expect(totalJikofutanOf(payments)).toBe(30000);
  });

  it("事例14　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [85000 * 10, [hoken, kouhi]],
      [5000 * 10, [hoken]],
    ], opt("ア"))
    expect(totalJikofutanOf(payments)).toBe(57500);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(100930);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例15　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [5000 * 10, [hoken, kouhi]],
      [95000 * 10, [hoken]],
    ], opt("ア"));
    expect(totalJikofutanOf(payments)).toBe(256180);
    expect(kouhi.payment.kakari).toBe(15000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(268680);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(2500);
  });

  it("事例16　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [10000 * 10, [hoken, kouhi]],
      [110000 * 10, [hoken]],
    ], opt("ア"))
    expect(totalJikofutanOf(payments)).toBe(256180);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(281180);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例17　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [85000 * 10, [hoken, kouhi]],
      [95000 * 10, [hoken]],
    ], opt("ア"))
    expect(totalJikofutanOf(payments)).toBe(262180);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(305610);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例18　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [85000 * 10, [hoken, kouhi]],
      [5000 * 10, [hoken]],
    ], opt("イ", { isNyuuin: false }))
    expect(totalJikofutanOf(payments)).toBe(57500);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(100930);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例19　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [5000 * 10, [hoken, kouhi]],
      [95000 * 10, [hoken]],
    ], opt("イ", { isNyuuin: false }));
    expect(totalJikofutanOf(payments)).toBe(173820);
    expect(kouhi.payment.kakari).toBe(15000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(186320);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(2500);
  });

  it("事例20　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [10000 * 10, [hoken, kouhi]],
      [110000 * 10, [hoken]],
    ], opt("イ", { isNyuuin: false }));
    expect(totalJikofutanOf(payments)).toBe(173820);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(198820);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例21　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKekkaku();
    const payments = calcPayments([
      [85000 * 10, [hoken, kouhi]],
      [95000 * 10, [hoken]],
    ], opt("イ", { isNyuuin: false }))
    expect(totalJikofutanOf(payments)).toBe(179820);
    expect(kouhi.payment.kakari).toBe(85930);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(223250);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(42500);
  });

  it("事例22　本人入院（標準報酬月額28万円～50万円）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(30000);
    const shotokuKubun = "ウ"
    const payments = calcPayments([
      [20000 * 10, [hoken, kouhi]],
      [40000 * 10, [hoken]],
    ], opt("ウ"))
    expect(totalJikofutanOf(payments)).toBe(83430);
    expect(kouhi.payment.kakari).toBe(60000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(123430);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(20000);
  });

  it("事例23　本人入院（標準報酬月額28万円～50万円）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(30000);
    const shotokuKubun = "ウ"
    const payments = calcPayments([
      [30000 * 10, [hoken, kouhi]],
      [30000 * 10, [hoken]],
    ], opt("ウ"))
    expect(totalJikofutanOf(payments)).toBe(83430);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(133860);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(30000);
  });

  it("事例24　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const shotokuKubun = "エ"
    const payments = calcPayments([
      [30000 * 10, [hoken, kouhi]],
    ], opt("エ"))
    expect(totalJikofutanOf(payments)).toBe(5000);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(80430);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例25　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const payments = calcPayments([
      [10000 * 10, [hoken, kouhi]],
      [20000 * 10, [hoken]],
    ], opt("エ"))
    expect(totalJikofutanOf(payments)).toBe(57600);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(82600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例26　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const payments = calcPayments([
      [30000 * 10, [hoken, kouhi]],
      [30000 * 10, [hoken]],
    ], opt("エ"))
    expect(totalJikofutanOf(payments)).toBe(57600);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(133030);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例27　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(0);
    const shotokuKubun = "オ"
    const payments = calcPayments([
      [10000 * 10, [hoken, kouhi]],
      [20000 * 10, [hoken]],
    ], opt("オ"))
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(65400);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(0);
  });

  it("事例28　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(0);
    const payments = calcPayments([
      [30000 * 10, [hoken, kouhi]],
      [10000 * 10, [hoken]],
    ], opt("オ"))
    expect(totalJikofutanOf(payments)).toBe(30000);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(110430);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(0);
  });

  it("事例29　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(0);
    const payments = calcPayments([
      [30000 * 10, [hoken, kouhi]],
      [30000 * 10, [hoken]],
    ], opt("オ"))
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(115830);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(0);
  });

  it("事例30　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const payments = calcPayments([
      [10000 * 10, [hoken, kouhi]],
      [20000 * 10, [hoken]],
    ], opt("オ"))
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(30000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(60400);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例31　本人入院（低所得者）・公費（更生医療）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(5000);
    const shotokuKubun = "オ"
    const payments = calcPayments([
      [30000 * 10, [hoken, kouhi]],
      [30000 * 10, [hoken]],
    ], opt("オ"))
    expect(totalJikofutanOf(payments)).toBe(35400);
    expect(kouhi.payment.kakari).toBe(80430);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(110830);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

});

