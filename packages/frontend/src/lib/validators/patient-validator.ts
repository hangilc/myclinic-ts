import { Patient } from "myclinic-model";
import {
  Invalid,
  isNotNull,
  isNotEmpty,
  oneOf,
  toSqlDate,
  type ValidationResult,
} from "../validator";

export class PatientInput {
  constructor(
    public lastName: ValidationResult<string>,
    public firstName: ValidationResult<string>,
    public lastNameYomi: ValidationResult<string>,
    public firstNameYomi: ValidationResult<string>,
    public sex: ValidationResult<string>,
    public birthday: ValidationResult<Date | null>,
    public address: ValidationResult<string>,
    public phone: ValidationResult<string>
  ) {}
}

export function validatePatient(
  patientId: number,
  input: PatientInput
): Patient | string[] {
  const errs: Invalid[] = [];
  const patient: Patient = new Patient(
    patientId,
    input.lastName.and(isNotEmpty).unwrap(errs, "姓"),
    input.firstName.and(isNotEmpty).unwrap(errs, "名"),
    input.lastNameYomi.and(isNotEmpty).unwrap(errs, "姓のよみ"),
    input.firstNameYomi.and(isNotEmpty).unwrap(errs, "名のよみ"),
    input.sex.and(oneOf(["M", "F"])).unwrap(errs, "性別"),
    input.birthday.to(isNotNull).map(toSqlDate).unwrap(errs, "生年月日"),
    input.address.unwrap(errs, "住所"),
    input.phone.unwrap(errs, "電話番号")
  );
  return errs.length > 0 ? errs.map(e => e.toString()) : patient;
}
