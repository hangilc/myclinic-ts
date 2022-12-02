import { Koukikourei } from "myclinic-model";
import {
  isNotNull,
  isPositive,
  isNotEmpty,
  oneOf,
  type Invalid,
  type ValidationResult,
  toSqlDate,
  toOptionalSqlDate,
} from "../validator";

export interface KoukikoureiInput {
  patientId: ValidationResult<number>;
  hokenshaBangou: ValidationResult<string>;
  hihokenshaBangou: ValidationResult<string>;
  futanWari: ValidationResult<number>;
  validFrom: ValidationResult<Date | null>;
  validUpto: ValidationResult<Date | null>;
}

export function validateKoukikourei(
  koukikoureiId: number,
  input: KoukikoureiInput
): Koukikourei | string[] {
  const errs: Invalid[] = [];
  const koukikourei = new Koukikourei(
    koukikoureiId,
    input.patientId.and(isPositive).unwrap(errs, "patient-id"),
    input.hokenshaBangou.and(isNotEmpty).unwrap(errs, "保険者番号"),
    input.hihokenshaBangou.and(isNotEmpty).unwrap(errs, "被保険者番号"),
    input.futanWari.and(oneOf([1, 2, 3])).unwrap(errs, "負担割"),
    input.validFrom.to(isNotNull).map(toSqlDate).unwrap(errs, "期限開始"),
    input.validUpto.map(toOptionalSqlDate).unwrap(errs, "期限終了")
  );
  if (errs.length > 0) {
    return errs.map((e) => e.toString());
  } else {
    return koukikourei;
  }
}
