import type { VisitEx } from "myclinic-model";

export interface PaymentStatus {
  rep: string,
  cls: string | null
}

export function resolvePaymentStatus(visit: VisitEx): PaymentStatus {
  const charge = visit.chargeOption;
  const pay = visit.lastPayment;
  if( charge == null ){
    return { rep: "", cls: null };
  } else {
    if( pay == null || pay.amount === 0 ){
      return { rep: "（未収）", cls: "no-payment" };
    } else if( charge.charge > pay.amount ){
      return { rep: "領収額不足", cls : "under-payment"};
    } else if( charge.charge < pay.amount ){
      return { rep: "領収額超過", cls : "over-payment"};
    } else {
      return { rep: "", cls: null };
    }
  }
}