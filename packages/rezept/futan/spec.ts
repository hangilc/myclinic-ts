import { Payer, Payment, PaymentSetting, calcPayments, mkHokenHairyosochi, mkHokenPayer, mkKouhiGroup1Infection, mkKouhiHepatitis, mkKouhiKekkaku, mkKouhiKousei, mkKouhiNanbyou, mkKouhiShouniMansei, totalJikofutanOf } from "./calc";

type PayerSpec = ["hoken", { futanWari: number }] |
["hoken:hairyosochi"] |
["nanbyou" | "kousei" | "hepatitis" | "shouni-mansei", { gendogaku: number }] |
["kekkaku" | "group1-infection"]

export interface Spec {
  title: string;
  payers: PayerSpec[]
  bills: [number, string[]][];
  setting?: {
    shotokuKubun?: string;
    isBirthdayMonth75?: boolean;
    marucho?: 10000 | 20000;
    isNyuuin?: boolean;
    isUnder70?: boolean;
    isTasuuGaitou?: boolean;
  };
  asserts: (["jikofutan", number]
    | ["payment", {
      payer: string;
      kakari?: number;
      payment?: number;
      jikofutan?: number;
      uncovered?: number;
    }])[];
}

export interface SpecExec extends Spec {
  debug?: ("payments")[];
  only?: boolean;
}

export function execSpecTests(specs: SpecExec[]) {
  let selects = specs.filter(spec => spec.only);
  if (selects.length === 0) {
    selects = specs;
  }
  selects.forEach(spec => {
    it(spec.title, () => {
      function cb(info: { payments: Payment[][]}) {
        (spec.debug ?? []).forEach(d => {
          switch (d) {
            case "payments": console.log("payments", info.payments); break;
          }
        })
      }
      const paymentsList = execSpec(spec, cb);
    })
  });
}

export function execSpec(spec: Spec, cb?: (info: { payments: Payment[][] }) => void) {
  const payers: Payer[] = [];
  const setting: Partial<PaymentSetting> = {};
  const payerMap: Record<string, Payer> = {};
  spec.payers.forEach(payerSpec => {
    const [payer, auxSetting] = createPayer(payerSpec);
    payers.push(payer);
    payerMap[payer.getKind()] = payer;
    Object.assign(setting, auxSetting);
  });
  Object.assign(setting, spec.setting);
  const bills: [number, Payer[]][] = spec.bills.map(([bill, payerNames]) => {
    const payers: Payer[] = payerNames.map(name => {
      const payer = payerMap[name];
      if (!payer) {
        throw new Error("Unknown payer: " + name);
      }
      return payer;
    });
    return [bill, payers];
  });
  const payments = calcPayments(bills, setting);
  if (cb) {
    cb({ payments, });
  }
  spec.asserts.forEach(([kind, aux]) => {
    if (kind === "jikofutan") {
      expect(totalJikofutanOf(payments)).toBe(aux);
    } else if (kind === "payment") {
      const payer = payerMap[aux.payer];
      if (!payer) {
        throw new Error("Unknown payer: " + aux.payer);
      }
      const payment = payer.payment;
      if (aux.kakari !== undefined) {
        expect(payment.kakari).toBe(aux.kakari);
      }
      if (aux.payment !== undefined) {
        expect(payment.payment).toBe(aux.payment);
      }
      if (aux.jikofutan) {
        expect(payment.kakari - payment.payment).toBe(aux.jikofutan);
      }
      if (aux.uncovered) {
        expect(payment.kakari - payment.payment).toBe(aux.uncovered);
      }
    } else {
      throw new Error("Unknown assert kind: " + kind);
    }
  });
}

function createPayer(spec: PayerSpec): [Payer, Partial<PaymentSetting>] {
  const [kind, aux] = spec;
  switch (kind) {
    case "hoken": {
      return [mkHokenPayer(), { futanWari: aux.futanWari }]
    }
    case "hoken:hairyosochi": {
      return [mkHokenHairyosochi(), { futanWari: 2, shotokuKubun: "一般Ⅱ", isNyuuin: false, isUnder70: false }];
    }
    case "nanbyou": {
      return [mkKouhiNanbyou(aux.gendogaku), {}];
    }
    case "kousei": {
      return [mkKouhiKousei(aux.gendogaku), {}];
    }
    case "hepatitis": {
      return [mkKouhiHepatitis(aux.gendogaku), {}];
    }
    case "shouni-mansei": {
      return [mkKouhiShouniMansei(aux.gendogaku), {}]
    }
    case "kekkaku": {
      return [mkKouhiKekkaku(), {}];
    }
    case "group1-infection": {
      return [mkKouhiGroup1Infection(), {}];
    }
    default: throw new Error("Unknown Payer kind: " + kind);
  }
}
