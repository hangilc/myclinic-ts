export interface PaymentContext {
  totalBill: number;
  accumJikoFutan: number;
}

export interface Payer {
  calcFutan(bill: number, ctx: PaymentContext): number;
}

export interface Payment {
  payer: Payer;
  amount: number;
}

export interface Instance {
  totalBill: number;
  payments: Payment[];
}

export function calcFutan(totalBill: number, payers: Payer[], prevs: Instance[]): Instance {
  const payments: Payment[] = [];
  const accumJikoFutan: number = prevs.reduce((acc, ele) => {
    return acc + jikoFutan(ele.totalBill, ele.payments);
  }, 0);
  const ctx: PaymentContext = {
    totalBill,
    accumJikoFutan,
  }
  let bill = totalBill;
  payers.forEach(payer => {
    const amount = payer.calcFutan(bill, ctx);
    payments.push({
      payer,
      amount,
    });
    bill -= amount;
  })
  return { totalBill, payments }
}

export function jikoFutan(totalBill: number, futanList: { amount: number }[]): number {
  let bill = totalBill;
  futanList.forEach(f => bill -= f.amount);
  return bill;
}

export class HokenProvider {
  futanWari: number;

  constructor(futanWari: number){
    this.futanWari = futanWari;
  }

  asPayer(): Payer {
    const futanWari = this.futanWari;
    return {
      calcFutan(bill: number): number {
        return bill * (1 - futanWari/10.0);
      }
    }
  }
}

export class Nanbyou {
  gendo: number;

  constructor(gendo: number) {
    this.gendo = gendo;
  }

  overrideGendo(newGendo: number): Nanbyou {
    return new Nanbyou(newGendo);
  }

  asPayer(): Payer {
    return {
      calcFutan(bill: number, ctx: PaymentContext): number {
        let futan = 0;
        if( bill > ctx.totalBill * 0.2 ){
          futan = bill - ctx.totalBill * 0.2;
        }
        return futan;
      }
    }
  }
}

