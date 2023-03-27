import { dateToSqlDate, Shahokokuho } from "myclinic-model";

export interface MockShahokokuhoSpec {
  shahokokuhoId?: number;
  patientId?: number;
  hokenshaBangou?: number;
  hihokenshaKigou?: string;
  hihokenshaBangou?: string;
  honninStore?: number;
  validFrom?: string;
  validUpto?: string;
  koureiStore?: number;
  edaban?: string;
}

export function mockShahokokuho(spec?: MockShahokokuhoSpec): Shahokokuho {
  const s: MockShahokokuhoSpec = spec || {};
  return new Shahokokuho(
    s.shahokokuhoId ?? 0,
    s.patientId ?? 1,
    s.hokenshaBangou ?? 123456, 
    s.hihokenshaKigou ?? "",
    s.hihokenshaBangou ?? "1212",
    s.honninStore ?? 1,
    s.validFrom ?? dateToSqlDate(new Date()),
    s.validUpto ?? "0000-00-00",
    s.koureiStore ?? 0,
    s.edaban ?? "",
  )
}