import { ShotokuKubunCode } from "../codes";
import { PaymentObject, PaymentSetting, calcPayments, mkHokenPayer, mkKouhiKousei, mkKouhiNanbyou, mkSeikatsuHogo, totalJikofutanOf } from "./calc";

function resolveFutanWari(shotokuKubun: ShotokuKubunCode) {
  switch (shotokuKubun) {
    case "現役並みⅢ":
    case "現役並みⅡ":
    case "現役並みⅠ": return 3;
    case "一般": case "一般Ⅱ": case "一般Ⅰ": return 2;
    case "低所得Ⅱ":
    case "低所得Ⅰ": return 1;
  }
  throw new Error("Invalid shotokukubun: " + shotokuKubun);
}

function opt(shotokuKubun: ShotokuKubunCode, arg: Partial<PaymentSetting> = {}): Partial<PaymentSetting> {
  return Object.assign({}, {
    futanWari: resolveFutanWari(shotokuKubun),
    isUnder70: false,
    shotokuKubun,
    isNyuuin: true,
  }, arg);
}

// 高額療養費計算例（７０歳以上）.pdf
describe("高額療養費計算例（７０歳以上）", () => {
  it("事例１　高齢受給者入院", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [99260 * 10, [hoken]]
      ],
      opt("現役並みⅢ")
    );
    expect(totalJikofutanOf(payments)).toBe(254106);
  });

  it("事例２　高齢受給者入院（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [47600 * 10, [hoken]]
      ],
      opt("現役並みⅢ", { isTasuuGaitou: true })
    );
    expect(totalJikofutanOf(payments)).toBe(140100);
  });

  it("事例３　高齢受給者入院", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [61600 * 10, [hoken]]
      ],
      opt("現役並みⅡ")
    );
    expect(totalJikofutanOf(payments)).toBe(167980);
  });

  it("事例４　高齢受給者入院（75歳到達月）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [33600 * 10, [hoken]]
      ],
      opt("現役並みⅡ", { isBirthdayMonth75: true })
    );
    expect(totalJikofutanOf(payments)).toBe(84270);
  });

  it("事例５　高齢受給者入院", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [27600 * 10, [hoken]]
      ],
      opt("現役並みⅠ")
    );
    expect(totalJikofutanOf(payments)).toBe(80190);
  });

  it("事例６　高齢受給者入院（75歳到達月）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [15200 * 10, [hoken]]
      ],
      opt("現役並みⅠ", { isTasuuGaitou: true, isBirthdayMonth75: true })
    );
    expect(totalJikofutanOf(payments)).toBe(22200);
  });

  it("事例７　高齢受給者入院・難病医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [90500 * 10, [hoken, kouhi]]
      ],
      opt("現役並みⅢ")
    );
    expect(totalJikofutanOf(payments)).toBe(10000);
    expect(kouhi.payment.kakari).toBe(253230);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(253230);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例８　高齢受給者入院・難病医療（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [48200 * 10, [hoken, kouhi]],
        [47100 * 10, [hoken]],
      ],
      opt("現役並みⅢ", { isTasuuGaitou: true })
    );
    expect(totalJikofutanOf(payments)).toBe(140100);
    expect(kouhi.payment.kakari).toBe(140100);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(270200);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例９　高齢受給者入院・難病医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [67100 * 10, [hoken, kouhi]],
      ],
      opt("現役並みⅡ")
    );
    expect(totalJikofutanOf(payments)).toBe(10000);
    expect(kouhi.payment.kakari).toBe(168530);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(168530);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例１０　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [14500 * 10, [hoken, kouhi]],
        [16500 * 10, [hoken]],
      ],
      opt("現役並みⅡ", { isTasuuGaitou: true, isBirthdayMonth75: true })
    );
    expect(totalJikofutanOf(payments)).toBe(46500);
    expect(kouhi.payment.kakari).toBe(43500);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(80000);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例１１　高齢受給者入院・難病医療（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [35500 * 10, [hoken, kouhi]],
        [2500 * 10, [hoken]],
      ],
      opt("現役並みⅡ", { isTasuuGaitou: true })
    );
    expect(totalJikofutanOf(payments)).toBe(17500);
    expect(kouhi.payment.kakari).toBe(93000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(100500);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例１２　高齢受給者入院・難病医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [28900 * 10, [hoken, kouhi]],
        [1200 * 10, [hoken]],
      ],
      opt("現役並みⅠ", {})
    );
    expect(totalJikofutanOf(payments)).toBe(13600);
    expect(kouhi.payment.kakari).toBe(80320);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(83920);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例１３　高齢受給者入院・難病医療（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [9800 * 10, [hoken, kouhi]],
        [16800 * 10, [hoken]],
      ],
      opt("現役並みⅠ", { isTasuuGaitou: true, })
    );
    expect(totalJikofutanOf(payments)).toBe(44400);
    expect(kouhi.payment.kakari).toBe(29400);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(63800);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例１４　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [19900 * 10, [hoken, kouhi]],
        [23300 * 10, [hoken]],
      ],
      opt("現役並みⅠ", { isTasuuGaitou: true, isBirthdayMonth75: true })
    );
    expect(totalJikofutanOf(payments)).toBe(22200);
    expect(kouhi.payment.kakari).toBe(22200);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(34400);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例１５　高齢受給者入院・更生医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(100000);
    const payments = calcPayments(
      [
        [44300 * 10, [hoken, kouhi]],
      ],
      opt("現役並みⅠ", {})
    );
    expect(totalJikofutanOf(payments)).toBe(44300);
    expect(kouhi.payment.kakari).toBe(57600);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(57600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(44300);
  });

  it("事例１６　高齢受給者入院・更生医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiKousei(100000);
    const payments = calcPayments(
      [
        [20900 * 10, [hoken, kouhi]],
        [500 * 10, [hoken]],
      ],
      opt("現役並みⅠ", {})
    );
    expect(totalJikofutanOf(payments)).toBe(22400);
    expect(kouhi.payment.kakari).toBe(57600);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(59100);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(20900);
  });

  it("事例１７　高齢受給者入院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [34500 * 10, [hoken]],
      ],
      opt("一般", { futanWari: 1 })
    );
    expect(totalJikofutanOf(payments)).toBe(34500);
  });

  it("事例１８　高齢受給者入院（75歳到達月）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [13500 * 10, [hoken]],
      ],
      opt("一般", { isTasuuGaitou: true, isBirthdayMonth75: true })
    );
    expect(totalJikofutanOf(payments)).toBe(22200);
  });

  it("事例１９　高齢受給者入院", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [16700 * 10, [hoken]],
      ],
      opt("低所得Ⅱ", { futanWari: 2 })
    );
    expect(totalJikofutanOf(payments)).toBe(24600);
  });

  it("事例２０　高齢受給者入院（75歳到達月）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments(
      [
        [5500 * 10, [hoken]],
      ],
      opt("低所得Ⅱ", { futanWari: 1 })
    );
    expect(totalJikofutanOf(payments)).toBe(5500);
  });

  it("事例２１　高齢受給者入院・難病医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [41300 * 10, [hoken, kouhi]],
      ],
      opt("一般", { futanWari: 2 })
    );
    expect(totalJikofutanOf(payments)).toBe(10000);
    expect(kouhi.payment.kakari).toBe(57600);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(57600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例２２　高齢受給者入院・難病医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [5500 * 10, [hoken, kouhi]],
        [30000 * 10, [hoken]],
      ],
      opt("一般", { futanWari: 2 })
    );
    expect(totalJikofutanOf(payments)).toBe(57600);
    expect(kouhi.payment.kakari).toBe(11000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(58600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例２３　高齢受給者入院・難病医療（75歳到達月）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [16500 * 10, [hoken, kouhi]],
        [15500 * 10, [hoken]],
      ],
      opt("一般", { futanWari: 2, isBirthdayMonth75: true })
    );
    expect(totalJikofutanOf(payments)).toBe(28800);
    expect(kouhi.payment.kakari).toBe(28800);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(47600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例２４　高齢受給者入院・難病医療（多数回該当）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [23100 * 10, [hoken, kouhi]],
        [800 * 10, [hoken]],
      ],
      opt("一般", { futanWari: 1, isTasuuGaitou: true })
    );
    expect(totalJikofutanOf(payments)).toBe(10800);
    expect(kouhi.payment.kakari).toBe(23100);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(23900);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例２５　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments(
      [
        [14500 * 10, [hoken, kouhi]],
        [15100 * 10, [hoken]],
      ],
      opt("一般", { futanWari: 2, isTasuuGaitou: true, isBirthdayMonth75: true })
    );
    expect(totalJikofutanOf(payments)).toBe(22200);
    expect(kouhi.payment.kakari).toBe(22200);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(34400);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例２６　高齢受給者入院・難病医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(5000);
    const payments = calcPayments(
      [
        [22800 * 10, [hoken, kouhi]],
      ],
      opt("低所得Ⅱ", { futanWari: 2, })
    );
    expect(totalJikofutanOf(payments)).toBe(5000);
    expect(kouhi.payment.kakari).toBe(24600);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(24600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例２７　高齢受給者入院・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(5000);
    const payments = calcPayments(
      [
        [15500 * 10, [hoken, kouhi]],
        [2300 * 10, [hoken]],
      ],
      opt("低所得Ⅱ", { futanWari: 1, })
    );
    expect(totalJikofutanOf(payments)).toBe(7300);
    expect(kouhi.payment.kakari).toBe(15500);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(17800);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例２８　高齢受給者入院・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(5000);
    const payments = calcPayments(
      [
        [8900 * 10, [hoken, kouhi]],
        [2600 * 10, [hoken]],
      ],
      opt("低所得Ⅱ", { futanWari: 1, })
    );
    expect(totalJikofutanOf(payments)).toBe(7600);
    expect(kouhi.payment.kakari).toBe(8900);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(11500);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例２９　高齢受給者入院・難病医療・生活保護", () => {
    const hoken = mkHokenPayer();
    const nanbyou = mkKouhiNanbyou(0);
    const seikatsuhogo = mkSeikatsuHogo();
    const payments = calcPayments(
      [
        [15500 * 10, [hoken, nanbyou]],
        [9000 * 10, [hoken, seikatsuhogo]],
      ],
      opt("低所得Ⅱ", { futanWari: 2, })
    );
    expect(totalJikofutanOf(payments)).toBe(0);
    expect(nanbyou.payment.kakari).toBe(24600);
    expect(seikatsuhogo.payment.kakari).toBe(15000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(39600);
    expect(PaymentObject.jikofutanOf(nanbyou.payment)).toBe(0);
    expect(PaymentObject.jikofutanOf(seikatsuhogo.payment)).toBe(0);
  });

  it("事例３０　高齢受給者入院・難病医療・生活保護", () => {
    const hoken = mkHokenPayer();
    const nanbyou = mkKouhiNanbyou(0);
    const seikatsuhogo = mkSeikatsuHogo();
    const payments = calcPayments(
      [
        [9600 * 10, [hoken, nanbyou]],
        [7800 * 10, [hoken, seikatsuhogo]],
      ],
      opt("低所得Ⅰ", { futanWari: 2, })
    );
    expect(totalJikofutanOf(payments)).toBe(0);
    expect(nanbyou.payment.kakari).toBe(15000);
    expect(seikatsuhogo.payment.kakari).toBe(15000);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(30000);
    expect(PaymentObject.jikofutanOf(nanbyou.payment)).toBe(0);
    expect(PaymentObject.jikofutanOf(seikatsuhogo.payment)).toBe(0);
  });

  it("事例３１　高齢受給者外来", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [87300 * 10, [hoken]]
    ], opt("現役並みⅢ", { isNyuuin: false }));
    expect(totalJikofutanOf(payments)).toBe(252910);
  });

  it("事例３２　高齢受給者外来（75歳到達月）（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [24800 * 10, [hoken]]
    ], opt("現役並みⅢ", { isNyuuin: false, isBirthdayMonth75: true, isTasuuGaitou: true }));
    expect(totalJikofutanOf(payments)).toBe(70050);
  });

  it("事例３３　高齢受給者外来（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [34600 * 10, [hoken]]
    ], opt("現役並みⅡ", { isNyuuin: false, isTasuuGaitou: true }));
    expect(totalJikofutanOf(payments)).toBe(93000);
  });

  it("事例３４　高齢受給者外来", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [30300 * 10, [hoken]]
    ], opt("現役並みⅠ", { isNyuuin: false }));
    expect(totalJikofutanOf(payments)).toBe(80460);
  });

  it("事例３５　高齢受給者外来・難病医療（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments([
      [13500 * 10, [hoken, kouhi]],
      [47000 * 10, [hoken]],
    ], opt("現役並みⅢ", { isNyuuin: false, isTasuuGaitou: true }));
    expect(totalJikofutanOf(payments)).toBe(140100);
    expect(kouhi.payment.kakari).toBe(40500);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(170600);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例３６　高齢受給者外来・難病医療（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(5000);
    const payments = calcPayments([
      [3100 * 10, [hoken, kouhi]],
      [34900 * 10, [hoken]],
    ], opt("現役並みⅡ", { isNyuuin: false, isTasuuGaitou: true }));
    expect(totalJikofutanOf(payments)).toBe(93000);
    expect(kouhi.payment.kakari).toBe(9300);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(97300);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(5000);
  });

  it("事例３７　高齢受給者外来・難病医療", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments([
      [31100 * 10, [hoken, kouhi]],
    ], opt("現役並みⅠ", { isNyuuin: false }));
    expect(totalJikofutanOf(payments)).toBe(10000);
    expect(kouhi.payment.kakari).toBe(80540);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(80540);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(10000);
  });

  it("事例３８　高齢受給者外来・難病医療（多数回該当）", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(10000);
    const payments = calcPayments([
      [1800 * 10, [hoken, kouhi]],
      [18600 * 10, [hoken]],
    ], opt("現役並みⅠ", { isNyuuin: false, isTasuuGaitou: true }));
    expect(totalJikofutanOf(payments)).toBe(44400);
    expect(kouhi.payment.kakari).toBe(5400);
    expect(PaymentObject.uncoveredOf(hoken.payment)).toBe(46200);
    expect(PaymentObject.jikofutanOf(kouhi.payment)).toBe(3600);
  });

  it("事例３９　高齢受給者外来", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [11000 * 10, [hoken]],
    ], opt("一般", { isNyuuin: false }));
    expect(totalJikofutanOf(payments)).toBe(18000);
  });

  it("事例４０　高齢受給者外来（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [9900 * 10, [hoken]],
    ], opt("一般", { isNyuuin: false, futanWari: 1 }));
    expect(totalJikofutanOf(payments)).toBe(9900);
  });

  it("事例４１　高齢受給者外来（75歳到達月）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [6300 * 10, [hoken]],
    ], opt("一般", { isNyuuin: false, futanWari: 1, isBirthdayMonth75: true }));
    expect(totalJikofutanOf(payments)).toBe(6300);
  });

  it("事例４２　高齢受給者外来（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [4600 * 10, [hoken]],
    ], opt("低所得Ⅱ", { isNyuuin: false, futanWari: 1 }));
    expect(totalJikofutanOf(payments)).toBe(4600);
  });

  it("事例４３　高齢受給者外来", () => {
    const hoken = mkHokenPayer();
    const payments = calcPayments([
      [5100 * 10, [hoken]],
    ], opt("低所得Ⅰ", { isNyuuin: false, futanWari: 2 }));
    expect(totalJikofutanOf(payments)).toBe(8000);
  });

  //   it("事例４４　高齢受給者外来・難病医療", () => {
  //     const covers = calcFutan(2, "一般", [KuniNanbyou],
  //       mkTens(["H1", 9500]),
  //       {
  //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
  //       });
  //     expect(patientChargeOf(covers)).toBe(5000);
  //     expect(coveredBy("1", covers)).toBe(13000);
  //   });

  //   it("事例４５　高齢受給者外来・難病医療", () => {
  //     const covers = calcFutan(2, "一般", [KuniNanbyou],
  //       mkTens(["H1", 5500], ["H", 10000]),
  //       {
  //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
  //       });
  //     expect(patientChargeOf(covers)).toBe(18000);
  //     expect(coveredBy("1", covers)).toBe(6000);
  //   });

  //   it("事例４６　高齢受給者外来・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
  //     const covers = calcFutan(2, "一般", [KuniNanbyou],
  //       mkTens(["H1", 9800], ["H", 11800]),
  //       {
  //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
  //         isKourei1WariShiteiKouhi: true,
  //       });
  //     expect(coveredBy("1", covers)).toBe(13000);
  //     expect(patientChargeOf(covers)).toBe(16800);
  //   });

  //   it("事例４７　高齢受給者外来・難病医療（75歳到達月）", () => {
  //     const covers = calcFutan(2, "一般", [KuniNanbyou],
  //       mkTens(["H1", 9800]),
  //       {
  //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
  //         isBirthdayMonth75: true,
  //       });
  //     expect(coveredBy("1", covers)).toBe(4000);
  //     expect(patientChargeOf(covers)).toBe(5000);
  //   });

  //   it("事例４８　高齢受給者外来・難病医療", () => {
  //     const covers = calcFutan(2, "一般", [KuniNanbyou],
  //       mkTens(["H1", 12000], ["H", 1200]),
  //       {
  //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
  //       });
  //     expect(coveredBy("1", covers)).toBe(13000);
  //     expect(patientChargeOf(covers)).toBe(7400);
  //   });

  //   it("事例４９　高齢受給者外来・難病医療", () => {
  //     const covers = calcFutan(2, "一般", [KuniNanbyou],
  //       mkTens(["H1", 12400], ["H", 9600]),
  //       {
  //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
  //       });
  //     expect(coveredBy("1", covers)).toBe(13000);
  //     expect(patientChargeOf(covers)).toBe(18000);
  //   });

  //   it("事例５０　高齢受給者外来・難病医療（75歳到達月）", () => {
  //     const covers = calcFutan(2, "一般", [KuniNanbyou],
  //       mkTens(["H1", 5100], ["H", 7400]),
  //       {
  //         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
  //         isBirthdayMonth75: true,
  //       });
  //     expect(coveredBy("1", covers)).toBe(4000);
  //     expect(patientChargeOf(covers)).toBe(9000);
  //   });

  //   it("事例５１　高齢受給者外来・更生医療", () => {
  //     const covers = calcFutan(2, "一般", [KouhiKouseiIryou],
  //       mkTens(["H1", 10800]),
  //       {
  //       });
  //     expect(coveredBy("1", covers)).toBe(7200);
  //     expect(patientChargeOf(covers)).toBe(10800);
  //   });

  //   it("事例５２　高齢受給者外来・更生医療", () => {
  //     const covers = calcFutan(2, "一般", [KouhiKouseiIryou],
  //       mkTens(["H1", 16400], ["H", 11400]),
  //       {
  //       });
  //     expect(coveredBy("1", covers)).toBe(1600);
  //     expect(patientChargeOf(covers)).toBe(18000);
  //   });

  //   it("事例５３　高齢受給者外来・精神通院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
  //     const covers = calcFutan(2, "一般", [KuniSeishinTsuuin],
  //       mkTens(["H1", 4300], ["H", 9600]),
  //       {
  //         isKourei1WariShiteiKouhi: true,
  //       });
  //     expect(coveredBy("1", covers)).toBe(4300);
  //     expect(patientChargeOf(covers)).toBe(13900);
  //   });

  //   it("事例５４　高齢受給者外来・精神通院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
  //     const covers = calcFutan(2, "一般", [KuniSeishinTsuuin],
  //       mkTens(["H1", 9500], ["H", 400]),
  //       {
  //         isKourei1WariShiteiKouhi: true,
  //       });
  //     expect(coveredBy("1", covers)).toBe(8500);
  //     expect(patientChargeOf(covers)).toBe(9900);
  //   });

  //   it("事例５５　高齢受給者外来・精神通院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
  //     const covers = calcFutan(2, "一般", [KuniSeishinTsuuin],
  //       mkTens(["H1", 9300], ["H", 5100]),
  //       {
  //         isKourei1WariShiteiKouhi: true,
  //       });
  //     expect(coveredBy("1", covers)).toBe(8700);
  //     expect(patientChargeOf(covers)).toBe(14400);
  //   });

  //   it("事例５６　高齢受給者外来・難病医療・生活保護", () => {
  //     const covers = calcFutan(2, "低所得Ⅰ", [KuniNanbyou, SeikatsuHogo()],
  //       mkTens(["H1", 4800], ["H2", 4500]),
  //       {
  //         gendogaku: { kingaku: 0, kouhiBangou: 1 },
  //       });
  //     expect(coveredBy("1", covers)).toBe(8000);
  //     expect(patientChargeOf(covers)).toBe(0);
  //   });
})