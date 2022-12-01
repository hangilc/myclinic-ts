import { Patient } from "myclinic-model";
import {
  isNotNull,
  notEmpty,
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
  const errs: string[] = [];
  const patient: Patient = new Patient(
    patientId,
    input.lastName.and(notEmpty).unwrap(errs),
    input.firstName.and(notEmpty).unwrap(errs),
    input.lastNameYomi.and(notEmpty).unwrap(errs),
    input.firstNameYomi.and(notEmpty).unwrap(errs),
    input.sex.and(oneOf(["M", "F"])).unwrap(errs),
    input.birthday.to(isNotNull).map(toSqlDate).unwrap(errs),
    input.address.unwrap(errs),
    input.phone.unwrap(errs)
  );
  return errs.length > 0 ? errs : patient;
}
