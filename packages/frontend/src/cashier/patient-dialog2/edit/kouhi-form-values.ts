import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
import type { Kouhi } from "myclinic-model";

export class KouhiFormValues {
  kouhiId: number;
  futansha: string;
  jukyuusha: string;
  validFrom: Date | null;
  validUpto: Date | null;
  patientId: number;

  constructor(init: {
    kouhiId: number;
    futansha: string;
    jukyuusha: string;
    validFrom: Date | null;
    validUpto: Date | null;
    patientId: number;
  }) {
    this.kouhiId = init.kouhiId;
    this.futansha = init.futansha;
    this.jukyuusha = init.jukyuusha;
    this.validFrom = init.validFrom;
    this.validUpto = init.validUpto;
    this.patientId = init.patientId;
  }

  static blank(patientId: number): KouhiFormValues {
    return new KouhiFormValues({
      kouhiId: 0,
      futansha: "",
      jukyuusha: "",
      validFrom: null,
      validUpto: null,
      patientId: patientId,
    });
  }

  static from(data: Kouhi): KouhiFormValues {
    return new KouhiFormValues({
      kouhiId: data.kouhiId,
      futansha: data.futansha.toString(),
      jukyuusha: data.jukyuusha.toString(),
      validFrom: parseSqlDate(data.validFrom),
      validUpto: parseOptionalSqlDate(data.validUpto),
      patientId: data.patientId,
    });
  }
}
