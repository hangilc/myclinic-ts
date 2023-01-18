import { Shahokokuho } from "myclinic-model";
import { notNull, isPositive, isNotEmpty, oneOf, type Invalid, type ValidationResult, inRange, toSqlDate, toOptionalSqlDate } from "../validator";

interface ShahokokuhoInput {
  hokenshaBangou: ValidationResult<number>;
  hihokenshaKigou: ValidationResult<string>;
  hihokenshaBangou: ValidationResult<string>;
  honninStore: ValidationResult<number>;
  validFrom: ValidationResult<Date | null>;
  validUpto: ValidationResult<Date | null>;
  koureiStore: ValidationResult<number>;
  edaban: ValidationResult<string>;
}

export function validateShahokokuho(
  shahokokuhoId: number,
  input: ShahokokuhoInput
): Shahokokuho | string[] {
  const errs: Invalid[] = [];
  const shahokokuho = new Shahokokuho(
    shahokokuhoId,
    input.patientId.and(isPositive).unwrap(errs, "patient-id"),
    input.hokenshaBangou.and(isPositive).unwrap(errs, "保険者番号"),
    input.hihokenshaKigou.unwrap(errs, "被保険者記号"),
    input.hihokenshaBangou.and(isNotEmpty).unwrap(errs, "被保険者番号"),
    input.honninStore.and(oneOf([0, 1])).unwrap(errs, "本人・家族"),
    input.validFrom.to(notNull).map(toSqlDate).unwrap(errs, "期限開始"),
    input.validUpto.map(toOptionalSqlDate).unwrap(errs, "期限終了"),
    input.koureiStore.and(inRange(0, 3)).unwrap(errs, "高齢"),
    input.edaban.unwrap(errs, "枝番"),
  );
  if( errs.length > 0 ){
    return errs.map(e => e.toString());
  } else {
    return shahokokuho;
  }
}
