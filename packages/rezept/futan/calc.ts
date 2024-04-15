
interface PaymentContext {
  totalBill: number;  // total ten * 10 of current visit
}

export interface Payer {
  kind: string;
  calc(bill: number, self: Payer, ctx: PaymentContext): void;
  kakari: number;
  payment: number;
  gendogakuReached: boolean;
}

export function calcPayments(bill: number, payers: Payer[]) {
  const ctx = { totalBill: bill };
  payers.forEach(p => {
    const prevPayment = p.payment;
    p.calc(bill, p, ctx);
    bill -= (p.payment - prevPayment);
  });
}

export function calcJikofutan(bill: number, payers: { payment: number }[]): number {
  payers.forEach(p => bill -= p.payment);
  return bill;
}

function mkPayer(kind: string, calc: (bill: number, self: Payer, ctx: PaymentContext) => void): Payer {
  return {
    kind,
    calc,
    kakari: 0,
    payment: 0,
    gendogakuReached: false,
  }
}

export function mkHokenPayer(futanWari: number, gendogaku?: number): Payer {
  return mkPayer("hoken", (bill: number, self: Payer, _ctx: PaymentContext) => {
    self.kakari += bill;
    if (self.gendogakuReached) {
      self.payment += bill;
      return;
    }
    let jiko = bill * futanWari / 10.0;
    if (gendogaku !== undefined) {
      if (self.payment + jiko > gendogaku) {
        jiko = gendogaku - self.payment;
        self.gendogakuReached = true;
      }
    }
    self.payment += bill - jiko;
  }
  );
}

export function mkNanbyouPayer(gendogaku: number): Payer {
  return mkPayer("nanbyou", (bill: number, self: Payer, ctx: PaymentContext) => {
    self.kakari += bill;
    if (self.gendogakuReached) {
      self.payment += bill;
      return;
    }
    let jiko = bill;
    if (jiko > ctx.totalBill * 0.2) {
      jiko = ctx.totalBill * 0.2;
    }
    if (self.payment + jiko > gendogaku) {
      self.payment += bill + self.payment - gendogaku;
      self.gendogakuReached = true;
    } else {
      self.payment += bill - jiko;
    }
  });
}

export function mkUnknownPayer(): Payer {
  return mkPayer("unknown", (bill: number, self: Payer, ctx: PaymentContext) => {
    self.kakari += bill;
    self.payment = bill;
  });
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