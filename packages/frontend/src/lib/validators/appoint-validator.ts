import { Appoint } from "myclinic-model";
import { isNotEmpty, isPositiveInt, isZeroOrPositiveInt, type Invalid, type ValidationResult } from "../validator";

export interface AppointInput {
  appointTimeId: ValidationResult<number>;
  patientName: ValidationResult<string>;
  patientId: ValidationResult<number>;
  memo: ValidationResult<string>;
}

export function validateAppoint(
  appointId: number,
  input: AppointInput
): Appoint | Invalid[] {
  const errs: Invalid[] = [];
  const appoint = new Appoint(
    appointId,
    input.appointTimeId.and(isPositiveInt).unwrap(errs, "appointTimeId"),
    input.patientName.and(isNotEmpty).unwrap(errs, "患者名"),
    input.patientId.and(isZeroOrPositiveInt).unwrap(errs, "患者番号"),
    input.memo.unwrap(errs, "メモ"),
  );
  if( errs.length > 0 ){
    return errs;
  } else {
    return appoint;
  }
}

