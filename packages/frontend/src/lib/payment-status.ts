// import type { Charge } from "myclinic-model";

export enum PaymentStatus {
  Done,
  NoPay,
  UnderPay,
  OverPay,
}

export function formatPaymentStatus(ps: PaymentStatus): string {
  switch(ps){
    case PaymentStatus.Done: return "";
    case PaymentStatus.NoPay: return "（未収）";
    case PaymentStatus.UnderPay: return "領収額不足";
    case PaymentStatus.OverPay: return "領収額超過";
    default: return "";
  }
}

export function resolvePaymentStatus(
  charge: number,
  lastPayment: number
): PaymentStatus {
  if ((charge > 0 && lastPayment === 0)) {
    return PaymentStatus.NoPay;
  } else if (charge > lastPayment) {
    return PaymentStatus.UnderPay;
  } else if (charge < lastPayment) {
    return PaymentStatus.UnderPay;
  } else {
    return PaymentStatus.Done;
  }
}
