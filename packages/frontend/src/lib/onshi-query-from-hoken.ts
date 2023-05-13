import { Shahokokuho, type Koukikourei } from "myclinic-model";
import type { LimitApplicationCertificateRelatedConsFlgCode } from "onshi-result/codes";
import type { OnshiKakuninQuery } from "./onshi-confirm";
import { pad } from "./pad";

export function onshi_query_from_hoken(
  hoken: Shahokokuho | Koukikourei,
  birthdate: string,
  confirmationDate: string,
  limitAppConsFlag?: LimitApplicationCertificateRelatedConsFlgCode): OnshiKakuninQuery {
  const base = {
    birthdate: birthdate.replaceAll("-", ""),
    confirmationDate: confirmationDate.replaceAll("-", ""),
    kigou: undefined,
    edaban: undefined,
    limitAppConsFlag: limitAppConsFlag ?? "1",
  };
  if (hoken instanceof Shahokokuho) {
    return Object.assign(base, {
      hokensha: pad(hoken.hokenshaBangou, 8, "0"),
      hihokensha: hoken.hihokenshaBangou.toString(),
      kigou: hoken.hihokenshaKigou || undefined,
      edaban: hoken.edaban || undefined,
    });
  } else {
    return Object.assign(base, {
      hokensha: pad(hoken.hokenshaBangou, 8, "0"),
      hihokensha: hoken.hihokenshaBangou,
    });
  }
}

