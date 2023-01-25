import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
import type { Shahokokuho } from "myclinic-model";

export class ShahokokuhoFormValues {
  shahokokuhoId: number;
  patientId: number;
  hokenshaBangou: string;
  hihokenshaKigou: string;
  hihokenshaBangou: string;
  edaban: string;
  honninStore: number;
  validFrom: Date | null;
  validUpto: Date | null;
  koureiStore: number;

  constructor(init: {
    shahokokuhoId: number;
    patientId: number;
    hokenshaBangou: string;
    hihokenshaKigou: string;
    hihokenshaBangou: string;
    edaban: string;
    honninStore: number;
    validFrom: Date | null;
    validUpto: Date | null;
    koureiStore: number;
  }) {
    this.shahokokuhoId = init.shahokokuhoId;
    this.patientId = init.patientId;
    this.hokenshaBangou = init.hokenshaBangou;
    this.hihokenshaKigou = init.hihokenshaKigou;
    this.hihokenshaBangou = init.hihokenshaBangou;
    this.edaban = init.edaban;
    this.honninStore = init.honninStore;
    this.validFrom = init.validFrom;
    this.validUpto = init.validUpto;
    this.koureiStore = init.koureiStore;
  }

  static blank(): ShahokokuhoFormValues {
    return new ShahokokuhoFormValues({
      shahokokuhoId: 0,
      patientId: 1,
      hokenshaBangou: "",
      hihokenshaKigou: "",
      hihokenshaBangou: "",
      edaban: "",
      honninStore: 0,
      validFrom: null,
      validUpto: null,
      koureiStore: 0,
    });
  }

  static from(data: Shahokokuho): ShahokokuhoFormValues {
    return new ShahokokuhoFormValues({
      shahokokuhoId: data.shahokokuhoId,
      patientId: data.patientId,
      hokenshaBangou: data.hokenshaBangou.toString(),
      hihokenshaKigou: data.hihokenshaKigou,
      hihokenshaBangou: data.hihokenshaBangou,
      edaban: data.edaban,
      honninStore: data.honninStore,
      validFrom: parseSqlDate(data.validFrom),
      validUpto: parseOptionalSqlDate(data.validUpto),
      koureiStore: data.koureiStore,
    });
  }
}
