import type { Charge } from "myclinic-model";

export function formatPayment(charge: Charge | undefined): string {
  if (charge == null) {
    return "（未請求）";
  } else {
    return `請求額：${charge.charge.toLocaleString()}円`;
  }
}
