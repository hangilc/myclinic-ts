import { Payer, PaymentSetting, calcPayments, mkHokenHairyosochi, mkHokenPayer, totalJikofutanOf } from "./calc";

export interface Spec {
  title: string;
  futanWari: 1 | 2 | 3;
  hokenType?: "regular" | "hairyosochi";
  bills: [number, string[]][];
  setting?: {

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
  const hoken = (spec.hokenType ?? "regular") === "regular" ? mkHokenPayer() : mkHokenHairyosochi();
  const bills: [number, Payer[]][] = spec.bills.map(([bill, payerNames]) => {
    const payers: Payer[] = payerNames.map(name => {
      if (name === "hoken") {
        return hoken;
      } else {
        throw new Error("Unkown payer: " + name);
      }
    });
    return [bill, payers];
  });
  const setting: Partial<PaymentSetting> = {
    futanWari: spec.futanWari,
  };
  const payments = calcPayments(bills, setting);
  spec.asserts.forEach(a => {
    if( a.jikofutan !== undefined ){
      expect(totalJikofutanOf(payments)).toBe(a.jikofutan);
    } else {

    }
  })
}
