import { GendogakuOptions, calcGendogaku, classifyKouhi, hairyosochi } from "../gendogaku";
import { ShotokuKubunCode } from "../codes";

interface Payment {
  kind: string;
  kakari: number;
  payment: number;
  gendogakuReached: boolean;
}

export const PaymentObject = {
  jikofutanOf(self: Payment): number { return self.kakari - self.payment; },
  finalJikofutanOf(payments: Payment[]): number { return PaymentObject.jikofutanOf(payments[payments.length - 1]); },
  uncoveredOf(self: Payment): number { return self.kakari - self.payment; }
}

function mkEmptyPayment(kind: string): Payment {
  return { kind, kakari: 0, payment: 0, gendogakuReached: false };
}

export function totalJikofutanOf(paymentsList: Payment[][]): number {
  return paymentsList.reduce((acc, ele) => acc + PaymentObject.finalJikofutanOf(ele), 0);
}

type PaymentCalc = (bill: number, ctx: PaymentContext) => { payment: number, gendogakuReached?: boolean };

export interface Payer {
  getKind(): string;
  getHoubetsuBangou(): number | undefined;
  calc: PaymentCalc;
  payment: Payment;
}

export const PayerObject = {
  jikofutanOf(payers: Payer[]): number {
    return PaymentObject.jikofutanOf(payers[payers.length - 1].payment);
  },
  uncoveredOf(self: Payer): number {
    return PaymentObject.uncoveredOf(self.payment);
  }
}

export interface PaymentSetting {
  futanWari: number;
  isUnder70: boolean;
  isBirthdayMonth75: boolean;
  shotokuKubun?: ShotokuKubunCode;
  isTasuuGaitou?: boolean;
  isNyuuin?: boolean;
}

export function defaultPaymentSetting(): PaymentSetting {
  return {
    futanWari: 3,
    isUnder70: true,
    isBirthdayMonth75: false,
    shotokuKubun: undefined,
    isTasuuGaitou: false,
    isNyuuin: false,
  }
}

function mkPaymentContext(setting: PaymentSetting): PaymentContext {
  return {
    futanWari: setting.futanWari,
    gendogakuOptions: {
      isUnder70: setting.isUnder70,
      shotokuKubun: setting.shotokuKubun ?? "不明",
      iryouhi: 0,
      isTasuuGaitou: setting.isTasuuGaitou ?? false,
      isNyuuin: setting.isNyuuin ?? false,
      heiyouKouhi: "none",
      isBirthdayMonth75: setting.isBirthdayMonth75,
    },
    currentPayments: [],
    currentPayers: [],
    prevPayments: [],
  }
}

interface PaymentContext {
  futanWari: number;
  gendogakuOptions: GendogakuOptions;
  currentPayments: Payment[];
  currentPayers: Payer[];
  prevPayments: Payment[][];
}

function getCurrentPaymentByKind(kind: string, ctx: PaymentContext): Payment {
  for (let p of ctx.currentPayments ?? []) {
    if (p.kind === kind) {
      return p;
    }
  }
  throw new Error(`Cannot find payment of kind ${kind}`);
}

function getCurrentHokenPaymetOf(ctx: PaymentContext): Payment {
  return getCurrentPaymentByKind("hoken", ctx);
}

function mergePayment(self: Payment, arg: Payment) {
  if (self.kind !== arg.kind) {
    throw new Error(`Inconsistent payments: ${self.kind}, ${arg.kind}`);
  }
  self.kakari += arg.kakari;
  self.payment += arg.payment;
}

function collectHoubetsuBangou(payers: Payer[]): number[] {
  const result: number[] = [];
  payers.forEach(p => {
    const h = p.getHoubetsuBangou();
    if (h !== undefined) {
      result.push(h);
    }
  })
  return result;
}

function calcOne(bill: number, payers: Payer[], ctx: PaymentContext): Payment[] {
  payers = reorderPayers(payers);
  ctx = Object.assign({}, ctx, { currentPayers: payers });
  const gendogakuOptions = Object.assign({}, ctx.gendogakuOptions, {
    iryouhi: bill,
    heiyouKouhi: classifyKouhi(collectHoubetsuBangou(payers)),
  });
  let kakari = bill;
  const result: Payment[] = [];
  payers.forEach(p => {
    const gopts: GendogakuOptions = Object.assign({}, gendogakuOptions);
    const curCtx: PaymentContext = Object.assign({}, ctx, { currentPayments: result })
    const payment = p.calc(kakari, Object.assign({}, curCtx, { gendogakuOptions: gopts }));
    result.push({
      kind: p.getKind(), kakari, payment: payment.payment,
      gendogakuReached: payment.gendogakuReached ?? false
    });
    kakari -= payment.payment;
  });
  payers.forEach((p, i) => {
    const r = result[i];
    mergePayment(p.payment, r);
  })
  return result;
}

function isHokenTandoku(payers: Payer[]): boolean {
  return payers.length === 1 && payers[0].getKind() === "hoken";
}

function reorderBills(bills: [number, Payer[]][]): [number, Payer[]][] {
  function hokenOnly([_bill, payers]: [number, Payer[]]): boolean {
    return isHokenTandoku(payers);
  }
  let hokenTandoku: [number, Payer[]] | undefined = undefined;
  bills.forEach(billPayers => {
    if (hokenOnly(billPayers)) {
      if (hokenTandoku !== undefined) {
        throw new Error("Multiple hoken tandoku");
      }
      hokenTandoku = billPayers;
    }
  });
  if (hokenTandoku === undefined) {
    return bills;
  } else {
    if (hokenOnly(bills[bills.length - 1])) {
      return bills;
    } else {
      return [
        ...bills.filter(billPayers => billPayers !== hokenTandoku),
        hokenTandoku,
      ];
    }
  }
}

const KouhiOrder: number[] = [
  13, 14, 18, 29, 30, 10, 11, 20, 21, 15,
  16, 24, 22, 28, 17, 79, 19, 23, 52, 54,
  51, 38, 53, 66, 62, 25, 12
];

const KouhiOrderWeights: Record<number, number> = {};

KouhiOrder.forEach((houbetsu, i) => {
  KouhiOrderWeights[houbetsu] = i + 10;
})

export function reorderPayers(payers: Payer[]): Payer[] {
  const items: { payer: Payer, weight: number }[] = payers.map(payer => {
    const houbetsu = payer.getHoubetsuBangou();
    if( houbetsu !== undefined ){
      const w = KouhiOrderWeights[houbetsu];
      if( w === undefined ){
        throw new Error(`Unknown houbetsu bangou: ${houbetsu}`)
      }
      return { payer, weight: w };
    } else {
      switch(payer.getKind()){
        case "hoken": return { payer, weight: 1 };
        case "marucho": return { payer, weight: 0 };
        default: throw new Error(`Unknown payer kind: ${payer.getKind()}`);
      }
    }
  })
  items.sort((a, b) => a.weight - b.weight);
  return items.map(item => item.payer);
}

export function calcPayments(bills: [number, Payer[]][], settingArg: Partial<PaymentSetting>): Payment[][] {
  bills = reorderBills(bills);
  const setting: PaymentSetting = Object.assign(defaultPaymentSetting(), settingArg);
  const baseContext = mkPaymentContext(setting);
  const result: Payment[][] = [];
  bills.forEach(([bill, payers]) => {
    const payments = calcOne(bill, payers, Object.assign({}, baseContext, { prevPayments: result }));
    result.push(payments);
  })
  return result;
}

function getPaymentByKind(kind: string, payments: Payment[]): Payment {
  for (let payment of payments) {
    if (payment.kind === kind) {
      return payment;
    }
  }
  throw new Error(`Cannot find payment of kind: ${kind}`);
}

function mkPayer(kind: string, houbetsuBangou: number | undefined, calc: PaymentCalc): Payer {
  return {
    getKind(): string { return kind; },
    getHoubetsuBangou(): number | undefined { return houbetsuBangou; },
    calc,
    payment: mkEmptyPayment(kind),
  }
}

interface Gassan {
  hokenKakari: number;
  jikofutan: number;
}

function combineGassan(a: Gassan, b: Gassan): Gassan {
  return {
    hokenKakari: a.hokenKakari + b.hokenKakari,
    jikofutan: a.jikofutan + b.jikofutan,
  };
}

function calcGassan(payments: Payment[], isUnder70?: boolean): Gassan {
  if (isUnder70 === undefined) {
    throw new Error("Missing info: isUnder70");
  }
  let hokenKakari = 0;
  let kouhiKakari = 0;
  let jikofutan = 0;
  payments.forEach(payment => {
    if (payment.kind === "hoken") {
      hokenKakari += payment.kakari;
    } else {
      if (payment.kakari > kouhiKakari) {
        kouhiKakari = payment.kakari;
      }
      jikofutan += payment.kakari - payment.payment;
    }
  })
  if (isUnder70 && kouhiKakari < 21000) {
    hokenKakari = 0;
    jikofutan = 0;
  }
  return { hokenKakari, jikofutan };
}

export function mkHokenPayer(): Payer {
  return mkPayer("hoken", undefined, (bill: number, ctx: PaymentContext) => {
    const jikofutan = bill * ctx.futanWari / 10.0;
    if (isHokenTandoku(ctx.currentPayers)) {
      if (ctx.gendogakuOptions.shotokuKubun !== "不明") {
        const gassan = ctx.prevPayments.reduce((acc, ele) => {
          const g = calcGassan(ele, ctx.gendogakuOptions.isUnder70);
          return combineGassan(acc, g);
        }, { hokenKakari: 0, jikofutan: 0 });
        const gendogakuBill = bill + gassan.hokenKakari;
        const gendogaku = calcGendogaku(Object.assign({}, ctx.gendogakuOptions, { iryouhi: gendogakuBill }));
        if (jikofutan + gassan.jikofutan > gendogaku) {
          return { payment: bill - gendogaku + gassan.jikofutan, gendogakuReached: true };
        }
      }
    } else {
      if (ctx.gendogakuOptions.shotokuKubun !== "不明") {
        const gendogaku = calcGendogaku(ctx.gendogakuOptions);
        if (jikofutan > gendogaku) {
          return { payment: bill - gendogaku, gendogakuReached: true };
        }
      }
    }
    return { payment: bill - jikofutan };
  });
}

export function mkHokenHairyosochi(): Payer {
  function prevKouhi(payers: Payer[]): Payer[] {
    const result: Payer[] = [];
    for(const p of payers){
      if( p.getKind() === "hoken" ){
        break;
      } else {
        result.push(p);
      }
    }
    return result;
  }
  function isDone(payers: Payer[]): boolean {
    for(const p of payers){
      return true;
    }
    return false;
  }
  return mkPayer("hoken", undefined, (bill: number, ctx: PaymentContext) => {
    if (isHokenTandoku(ctx.currentPayers)) {
      const h = hairyosochi(bill, ctx.gendogakuOptions.isBirthdayMonth75);
      const jikofutan = bill * ctx.futanWari / 10.0;
      let result: { payment: number, gendogakuReached?: boolean };
      if( jikofutan > h.gendogaku ){
        result = { payment: bill - h.gendogaku, gendogakuReached: true };
      } else {
        result = { payment: bill - jikofutan };
      }
      const hoken = mkHokenPayer();
      const unapplied = hoken.calc(bill, ctx);
      if( unapplied.payment > result.payment ){
        return unapplied;
      } else {
        return result;
      }
    } else {
      if( isDone(prevKouhi(ctx.currentPayers)) ){ // マル長
        return { }
      }
      const p = mkHokenPayer();
      return p.calc(bill, ctx);
    }
  })
}

export function mkKouhiNanbyou(gendogaku: number): Payer {
  return mkPayer("nanbyou", 54, (bill: number, ctx: PaymentContext) => {
    let jikofutan = bill;
    const futanWari = ctx.futanWari;
    if (futanWari > 2) {
      const hoken = getPaymentByKind("hoken", ctx.currentPayments);
      jikofutan = hoken.kakari * 2 / 10.0;
    }
    if (jikofutan > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: bill - jikofutan };
    }
  });
}

export function mkKouhiFutanNashi(kind: string, houbetsuBangou: number | undefined): Payer {
  return mkPayer(kind, houbetsuBangou, (bill: number, ctx: PaymentContext) => {
    return { payment: bill, gendogakuReached: true };
  })
}

export function mkKouhiHibakusha(): Payer {
  return mkKouhiFutanNashi("hibakusha", 18);
}

export function mkKouhiMaruaoFutanNash(): Payer {
  return mkKouhiFutanNashi("maruao", 89);
}

export function mkMaruToTaikiosen(gendogaku: number): Payer {
  return mkPayer("taikiosen", 82, (bill: number, ctx: PaymentContext) => {
    if (bill > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: 0 };
    }
  });
}

export function mkKouhiMarucho(gendogaku: number): Payer {
  return mkPayer("marucho", undefined, (bill: number, ctx: PaymentContext) => {
    if (bill > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: 0 };
    }
  })
}

export function mkKouhiKekkaku(): Payer {
  return mkPayer("kekkaku", 10, (bill: number, ctx: PaymentContext) => {
    const hoken = getCurrentHokenPaymetOf(ctx);
    const jikofutan = Math.round(hoken.kakari * 0.05);
    return { payment: bill - jikofutan };
  })
}

export function mkKouhiKousei(gendogaku: number): Payer {
  return mkPayer("kousei", 15, (bill: number, ctx: PaymentContext) => {
    const hoken = getCurrentHokenPaymetOf(ctx);
    let jikofutan = hoken.kakari * 0.1;
    if (jikofutan > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: bill - jikofutan };
    }
  })
}

export function mkKouhiSeishinTsuuin(): Payer {
  return mkPayer("seishin-tsuuin", 21, (bill: number, ctx: PaymentContext) => {
    const hoken = getCurrentHokenPaymetOf(ctx);
    let jikofutan = hoken.kakari * 0.1;
    return { payment: bill - jikofutan };
  })
}

export function mkMarucho(gendogaku: number): Payer {
  return mkPayer("marucho", undefined, (bill: number, ctx: PaymentContext) => {
    let jikofutan = bill * ctx.futanWari / 10.0;
    if (jikofutan > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: bill - jikofutan };
    }
  })
}

export function mkSeikatsuHogo(): Payer {
  return mkPayer("seikatsuhogo", 12, (bill: number, ctx: PaymentContext) => {
    return { payment: bill };
  })
}

export function mkUnknownPayer(): Payer {
  return mkKouhiFutanNashi("unknown", undefined);
}

// 公費
// 高校生 (patient 7358)
// 被爆者 (5366)
// マル都 (7170)
// 心身障害 (3288)
// 難病 (7300)
// 心身障害 (1753)

// 2022-01-01 以降
// +----------+
// | futansha |
// +----------+
// | 54136015 |難病
// | 80137151 |重度障がい者医療
// | 82134008 |被爆者の子に対する医療
// | 82137530 |マル都（大気汚染）
// | 89135156 |高校生
// +----------+


// +----------+----------+-------------+
// | kouhi_id | futansha | patient_id  |
// +----------+----------+-------------+
// |     1421 | 89135156 |       7358  | 高校生
// |     1419 | 54136015 |        416  | 難病
// |     1344 | 82137530 |       7170  | マル都（大気汚染）
// |     1105 | 82134008 |       5366  | 被爆者の子に対する医療
// |     1025 | 51433019 |       5525  | 水俣病
// |      908 | 82138009 |       1977  | 特殊医療・人工透析
// |      288 | 82137555 |       2727  | 大気汚染関連疾病
// |      254 | 38136016 |         84  | B型C型ウイルス肝炎医療
// |      113 | 51136018 |        131  | 難病医療（スモン、劇症肝炎、重症急性膵炎、プリオン病（医原性））
// |       32 | 82137001 |       1242  | 大気汚染関連疾病
// |       21 | 81136152 |        608  | ひとり親
// |        5 | 81137150 |        129  | ひとり親
// |        1 | 80137151 |        134  | 重度障がい者医療
// +----------+----------+-------------+