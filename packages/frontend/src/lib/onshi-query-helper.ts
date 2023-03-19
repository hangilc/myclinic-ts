import { Koukikourei, Shahokokuho } from "myclinic-model";
import type { OnshiKakuninQuery } from "./onshi-confirm";

export function onshi_query_from_hoken(
  hoken: Shahokokuho | Koukikourei,
  birthdate: string,
  confirmationDate: string): OnshiKakuninQuery {
  const base = { birthdate, confirmationDate, kigou: undefined, edaban: undefined };
  if (hoken instanceof Shahokokuho) {
    return Object.assign(base, {
      hokensha: hoken.hokenshaBangou.toString(),
      hihokensha: hoken.hihokenshaBangou.toString(),
      kigou: hoken.hihokenshaKigou || undefined,
      edaban: hoken.edaban || undefined,
    });
  } else {
    return Object.assign(base, {
      hokensha: hoken.hokenshaBangou,
      hihokensha: hoken.hihokenshaBangou,
    });
  }
}

