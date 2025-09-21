import type { Koukikourei } from "myclinic-model";
import { DateWrapper } from "myclinic-util";

export class KoukikoureiFormValues {
  koukikoureiId: number;
  patientId: number;
  hokenshaBangou: string;
  hihokenshaBangou: string;
  futanWari: number;
  validFrom: Date | null;
  validUpto: Date | null;

  constructor(patientId: number) {
    this.koukikoureiId = 0;
    this.patientId = patientId;
    this.hokenshaBangou = "";
    this.hihokenshaBangou = "";
    this.futanWari = 1;
    this.validFrom = null;
    this.validUpto = null;
  }

  static fromKoukikourei(src: Koukikourei): KoukikoureiFormValues {
    const dst = new KoukikoureiFormValues(src.patientId);
    dst.koukikoureiId = src.koukikoureiId;
    dst.hokenshaBangou = src.hokenshaBangou;
    dst.hihokenshaBangou = src.hihokenshaBangou;
    dst.futanWari = src.futanWari;
    dst.validFrom = DateWrapper.fromSqlDate(src.validFrom).asDate();
    dst.validUpto = src.validUpto === "0000-00-00" ? null : DateWrapper.fromSqlDate(src.validUpto).asDate();
    return dst;
  }
}
