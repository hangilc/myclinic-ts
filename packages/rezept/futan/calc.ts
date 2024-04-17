import { GendogakuOptions, calcGendogaku } from "../gendogaku";
import { ShotokuKubunCode } from "../codes";

interface Payment {
  kind: string;
  kakari: number;
  payment: number;
  gendogakuReached: boolean;
}

export const PaymentObject = {
  jikofutanOf(self: Payment): number { return self.kakari - self.payment; },
  finalJikofutanOf(payments: Payment[]): number { return PaymentObject.jikofutanOf(payments[payments.length - 1]); }
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
  calc: PaymentCalc;
  payment: Payment;
}

export const PayerObject = {
  jikofutanOf(payers: Payer[]): number {
    return PaymentObject.jikofutanOf(payers[payers.length - 1].payment);
  }
}

interface PaymentContext {
  futanWari?: number;
  shotokuKubun?: ShotokuKubunCode;
  gendogakuOptions?: GendogakuOptions;
  currentPayments?: Payment[];
  prevPayments?: Payment[][];
}

function getCurrentPaymentByKind(kind: string, ctx: PaymentContext): Payment {
  for(let p of ctx.currentPayments ?? []) {
    if( p.kind === kind ){
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

export function calcPayments(bill: number, payers: Payer[], ctx: PaymentContext): Payment[] {
  const result: Payment[] = [];
  for (let payer of payers) {
    let pay: { payment: number, gendogakuReached?: boolean };
    if( payer.getKind() === "hoken" && ctx.shotokuKubun === "一般Ⅱ" && payers.length > 1 ) {
      ctx = Object.assign({}, ctx, { shotokuKubun: "一般Ⅰ" });
    }
    if( payer.getKind() === "hoken" && ctx.shotokuKubun === "一般Ⅱ" ) {
      const pay1 = payer.calc(bill, Object.assign({}, ctx, { currentPayments: result }));
      if( pay1.gendogakuReached ){
        const pay2 = payer.calc(bill, Object.assign({}, ctx, { currentPayments: result, shotokuKubun: "一般Ⅰ" }));
        pay = (pay1.payment > pay2.payment) ? pay1 : pay2;
      } else {
        pay = pay1;
      }
    } else {
      pay = payer.calc(bill, Object.assign({}, ctx, { currentPayments: result }));
    }
    result.push({ kind: payer.getKind(), kakari: bill, payment: pay.payment, gendogakuReached: pay.gendogakuReached ?? false });
    bill -= pay.payment;
  }
  payers.forEach((payer, i) => {
    const r = result[i];
    mergePayment(payer.payment, r);
  })
  return result;
}

export function calcPaymentsMulti(bills: [number, Payer[]][], ctx: PaymentContext): Payment[][] {
  const result: Payment[][] = [];
  for (const [bill, payers] of bills) {
    const payments = calcPayments(bill, payers, Object.assign({}, ctx, { prevPayments: result }));
    result.push(payments);
  }
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

function mkPayer(kind: string, calc: PaymentCalc): Payer {
  return {
    getKind(): string { return kind; },
    calc,
    payment: mkEmptyPayment(kind),
  }
}

export function mkHokenPayer(): Payer {
  return mkPayer("hoken", (bill: number, ctx: PaymentContext) => {
    let futanWari: number = ctx.futanWari ?? 3;
    let gendogaku: number | undefined = undefined;
    if (ctx.shotokuKubun !== undefined) {
      gendogaku = calcGendogaku(ctx.shotokuKubun, bill, ctx.gendogakuOptions);
    }
    let jikofutan = bill * futanWari / 10.0;
    if (gendogaku !== undefined) {
      if (jikofutan > gendogaku) {
        let payment = bill - gendogaku;
        if( ctx.shotokuKubun !== "一般Ⅱ") {
          const prevJikofutan = totalJikofutanOf(ctx.prevPayments ?? []);
          payment + prevJikofutan;
        }
        return { payment, gendogakuReached: true };
      }
    }
    return { payment: bill - jikofutan };
  });
}

export function mkKouhiNanbyou(gendogaku: number): Payer {
  return mkPayer("nanbyou", (bill: number, ctx: PaymentContext) => {
    let jikofutan = bill;
    const futanWari = ctx.futanWari ?? 3;
    if (futanWari > 2) {
      const hoken = getPaymentByKind("hoken", ctx.currentPayments ?? []);
      jikofutan = hoken.kakari * 2 / 10.0;
    }
    if (jikofutan > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: bill - jikofutan };
    }
  });
}

export function mkKouhiFutanNashi(kind: string): Payer {
  return mkPayer(kind, (bill: number, ctx: PaymentContext) => {
    return { payment: bill, gendogakuReached: true };
  })
}

export function mkKouhiHibakusha(): Payer {
  return mkKouhiFutanNashi("hibakusha");
}

export function mkKouhiMaruaoFutanNash(): Payer {
  return mkKouhiFutanNashi("maruao");
}

export function mkMaruToTaikiosen(gendogaku: number): Payer {
  return mkPayer("taikiosen", (bill: number, ctx: PaymentContext) => {
    if (bill > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: 0 };
    }
  });
}

export function mkKouhiMarucho(gendogaku: number): Payer {
  return mkPayer("marucho", (bill: number, ctx: PaymentContext) => {
    if (bill > gendogaku) {
      return { payment: bill - gendogaku, gendogakuReached: true };
    } else {
      return { payment: 0 };
    }
  })
}

export function mkKouhiKekkaku(): Payer {
  return mkPayer("kekkaku", (bill: number, ctx: PaymentContext) => {
    const hoken = getCurrentHokenPaymetOf(ctx);
    const jikofutan = Math.round(hoken.kakari * 0.05);
    return { payment: bill - jikofutan, gendogakuReached: true };
  })
}

export function mkUnknownPayer(): Payer {
  return mkKouhiFutanNashi("unknown");
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