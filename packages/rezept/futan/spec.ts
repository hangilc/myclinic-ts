import { Payer, PaymentSetting, calcPayments, mkHokenHairyosochi, mkHokenPayer, totalJikofutanOf } from "./calc";

type PayerSpec = ["hoken", { futanWari: number}] |
  ["hoken:hairyosochi"]

export interface Spec {
  title: string;
  payers: PayerSpec[]
  bills: [number, string[]][];
  setting?: {
    isBirthdayMonth75?: boolean;
    marucho?: 10000 | 20000;
  };
  asserts: ({
    jikofutan: number;
  } |
  {
    payers: string[];
    kakari?: number;
    payment?: number;
    jikofutan?: number;
    uncovered?: number;
  })[];
}

export function execSpec(spec: Spec) {
  const payers: Payer[] = [];
  const setting: Partial<PaymentSetting> = Object.assign({}, spec.setting);
  const payerMap: Record<string, Payer> = {};
  spec.payers.forEach(payerSpec => {
    const [payer, auxSetting] = createPayer(payerSpec);
    payers.push(payer);
    payerMap[payer.getKind()] = payer;
    Object.assign(setting, auxSetting);
  })
  const bills: [number, Payer[]][] = spec.bills.map(([bill, payerNames]) => {
    const payers: Payer[] = payerNames.map(name => {
      const payer = payerMap[name];
      if( !payer ){
        throw new Error("Unknown payer: " + name);
      }
      return payer;
    });
    return [bill, payers];
  });
  const payments = calcPayments(bills, setting);
  spec.asserts.forEach(a => {
    if( a.jikofutan !== undefined ){
      expect(totalJikofutanOf(payments)).toBe(a.jikofutan);
    } else {

    }
  })
}

function createPayer(spec: PayerSpec): [Payer, Partial<PaymentSetting>] {
  const [kind, aux] = spec;
  switch(kind){
    case "hoken": {
      return [mkHokenPayer(), { futanWari: aux.futanWari }]
    }
    case "hoken:hairyosochi": {
      return [mkHokenHairyosochi(), { futanWari: 2 }];
    }
    default: throw new Error("Unknown Payer kind: " + kind);
  }
}
