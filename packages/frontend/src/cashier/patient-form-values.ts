import { parseSqlDate } from "@/lib/util";
import { validResult, type VResult } from "@/lib/validation";
import type { Patient } from "myclinic-model";

export interface PatientFormValues {
  patientId: number,
  lastName: string,
  firstName: string,
  lastNameYomi: string,
  firstNameYomi: string,
  sex: string,
  birthday: VResult<Date | null>,
  address: string,
  phone: string,
}

export function blankPatientFormValues(): PatientFormValues {
  return {
    patientId: 0,
    lastName: "",
    firstName: "",
    lastNameYomi: "",
    firstNameYomi: "",
    sex: "F",
    birthday: validResult(null),
    address: "",
    phone: "",
  }
}

export function patientFormValues(patient: Patient): PatientFormValues {
  return {
    patientId: patient.patientId,
    lastName: patient.lastName,
    firstName: patient.firstName,
    lastNameYomi: patient.lastNameYomi,
    firstNameYomi: patient.firstNameYomi,
    sex: patient.sex,
    birthday: validResult(parseSqlDate(patient.birthday)),
    address: patient.address,
    phone: patient.phone,
  }
}
