import { Patient } from "myclinic-model";
import { notEmpty, type ValidationResult } from "../validator";

export class PatientInput {
  constructor(
    public patientId: Number,
    public lastName: ValidationResult<string>,
    public firstName: ValidationResult<string>,
    public lastNameYomi: ValidationResult<string>,
    public firstNameYomi: ValidationResult<string>,
    public sex: ValidationResult<string>,
    public birthday: ValidationResult<Date>,
    public address: ValidationResult<string>,
    public phone: ValidationResult<string>,
  ) {}
}

export function validatePatient(patientId: number, input: PatientInput): ValidationResult<Patient> {
  const errs: string[] = [];
  const patient: Patient = new Patient(
    patientId,
    input.lastName.and(notEmpty).unwrap(errs),
    input.firstName.and(notEmpty).unwrap(errs)
  )
}