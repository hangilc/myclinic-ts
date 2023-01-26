import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
import type { Koukikourei } from "myclinic-model";

export class KoukikoureiFormValues {
  koukikoureiId: number;
  patientId: number;
  hokenshaBangou: string;
  hihokenshaBangou: string;
  futanWari: number;
  validFrom: Date | null;
  validUpto: Date | null;

  constructor(init: {
    koukikoureiId: number;
    patientId: number;
    hokenshaBangou: string;
    hihokenshaBangou: string;
    futanWari: number;
    validFrom: Date | null;
    validUpto: Date | null;
  }) {
    this.koukikoureiId = init.koukikoureiId;
    this.patientId = init.patientId;
    this.hokenshaBangou = init.hokenshaBangou;
    this.hihokenshaBangou = init.hihokenshaBangou;
    this.futanWari = init.futanWari;
    this.validFrom = init.validFrom;
    this.validUpto = init.validUpto;
  }

  static blank(patientId: number): KoukikoureiFormValues {
    return new KoukikoureiFormValues({
      koukikoureiId: 0,
      patientId: patientId,
      hokenshaBangou: "",
      hihokenshaBangou: "",
      futanWari: 1,
      validFrom: null,
      validUpto: null,
    });
  }

  static from(data: Koukikourei): KoukikoureiFormValues {
    return new KoukikoureiFormValues({
      koukikoureiId: data.koukikoureiId,
      patientId: data.patientId,
      hokenshaBangou: data.hokenshaBangou,
      hihokenshaBangou: data.hihokenshaBangou,
      futanWari: data.futanWari,
      validFrom: parseSqlDate(data.validFrom),
      validUpto: parseOptionalSqlDate(data.validUpto),
    });
  }
}
