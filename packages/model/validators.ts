import { KouhiInterface, PatientSummary, dateToSqlDate } from "./model";
import * as v from "valibot";

const KouhiSchema = v.object({
  kouhiId: v.number(),
  futansha: v.coerce(v.number("負担者番号のエラー。"), Number),
  jukyuusha: v.coerce(v.number("受給者番号のエラー。"), Number),
  validFrom: v.coerce(
    v.string("期限開始のエラー。", [v.regex(/^\d{4}-\d{2}-\d{2}$/, "期限開始の形式エラー。")]),
    coerceToDate),
  validUpto: v.coerce(
    v.string([v.regex(/^((\d{4}-\d{2}-\d{2})|(0000-00-00))$/)]),
    coerceToUptoDate),
  patientId: v.number(),
  memo: v.union([v.string(), v.undefined_()]),
});

export function validateKouhi(obj: any): KouhiInterface {
  return v.parse(KouhiSchema, obj);
}

const PatientSummarySchema = v.object({
  patientId: v.number(),
  content: v.string(),
});

export function validatePatientSummary(obj: any): PatientSummary {
  return v.parse(PatientSummarySchema, obj);
}

function coerceToDate(arg: unknown): unknown {
  if (arg instanceof Date) {
    return dateToSqlDate(arg);
  } else {
    return arg;
  }
}

function coerceToUptoDate(arg: unknown): unknown {
  if (arg instanceof Date) {
    return dateToSqlDate(arg);
  } else if (arg == null || arg === "" ) {
    return "0000-00-00";
  } else {
    return arg;
  }
}
