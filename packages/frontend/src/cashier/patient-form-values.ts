import { parseSqlDate } from "@/lib/util";
import type { Patient } from "myclinic-model";

export interface PatientFormValues {
  patientId: number,
  lastName: string,
  firstName: string,
  lastNameYomi: string,
  firstNameYomi: string,
  sex: string,
  birthday: Date | null,
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
    birthday: null,
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
    birthday: parseSqlDate(patient.birthday),
    address: patient.address,
    phone: patient.phone,
  }
}
