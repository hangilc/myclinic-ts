import api from "@/lib/api";
import { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
import type { Hoken } from "./hoken";

export async function deleteHoken(hoken: Hoken): Promise<boolean> {
  if (hoken.value instanceof Shahokokuho) {
    await api.deleteShahokokuho(hoken.hokenId);
    return true;
  } else if (hoken.value instanceof Koukikourei) {
    await api.deleteKoukikourei(hoken.hokenId);
    return true;
  } else if (hoken.value instanceof Kouhi) {
    await api.deleteKouhi(hoken.hokenId);
    return true;
  } else {
    return false;
  }
}
