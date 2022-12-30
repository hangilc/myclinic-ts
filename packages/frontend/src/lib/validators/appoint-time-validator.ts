import { AppointTime } from "myclinic-model";
import {
  isSqlDate,
  isSqlTime,
  isNotEmpty,
  type Invalid,
  type ValidationResult,
  isZeroOrPositive,
} from "../validator";

export interface AppointTimeInput {
  date: ValidationResult<string>;
  fromTime: ValidationResult<string>;
  untilTime: ValidationResult<string>;
  kind: ValidationResult<string>;
  capacity: ValidationResult<number>;
}

export function validateAppointTime(
  appointTimeId: number,
  input: AppointTimeInput
): AppointTime | Invalid[] {
  const errs: Invalid[] = [];
  const appoint = new AppointTime(
    appointTimeId,
    input.date.and(isSqlDate).unwrap(errs, "日にち"),
    input.fromTime.and(isSqlTime).unwrap(errs, "開始時間"),
    input.untilTime.and(isSqlTime).unwrap(errs, "終了時間"),
    input.kind.and(isNotEmpty).unwrap(errs, "種類"),
    input.capacity.and(isZeroOrPositive).unwrap(errs, "人数")
  );
  if (errs.length > 0) {
    return errs;
  } else {
    return appoint;
  }
}
