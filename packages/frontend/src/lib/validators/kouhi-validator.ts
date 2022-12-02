import { Kouhi } from "myclinic-model";
import {
  isNotNull,
  isPositive,
  type Invalid,
  type ValidationResult,
  toSqlDate,
  toOptionalSqlDate,
} from "../validator";

export interface KouhiInput {
  patientId: ValidationResult<number>;
  futansha: ValidationResult<number>;
  jukyuusha: ValidationResult<number>;
  validFrom: ValidationResult<Date | null>;
  validUpto: ValidationResult<Date | null>;
}

export function validateKouhi(
  kouhiId: number,
  input: KouhiInput
): Kouhi | string[] {
  const errs: Invalid[] = [];
  const kouhi = new Kouhi(
    kouhiId,
    input.futansha.and(isPositive).unwrap(errs, "負担者番号"),
    input.jukyuusha.and(isPositive).unwrap(errs, "受給者番号"),
    input.validFrom.to(isNotNull).map(toSqlDate).unwrap(errs, "期限開始"),
    input.validUpto.map(toOptionalSqlDate).unwrap(errs, "期限終了"),
    input.patientId.and(isPositive).unwrap(errs, "patient-id"),
  );
  if (errs.length > 0) {
    return errs.map((e) => e.toString());
  } else {
    return kouhi;
  }
}
