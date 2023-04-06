import { apiBase } from "./base";
import patientTmpl from "@cypress/fixtures/patient-a.json";
import { dateToSqlDate, Patient } from "myclinic-model";

export function newPatient(user?: any): Cypress.Chainable<Patient> {
  user = user || patientTmpl;
  return cy.request("POST", apiBase() + "/enter-patient", user)
    .then((response) => Patient.cast(response.body))
}

export interface PatientCreationSpec {
  patientId?: number,
  lastName?: string,
  firstName?: string,
  lastNameYomi?: string,
  firstNameYomi?: string,
  sex?: string,
  birthday?: string | Date,
  address?: string,
  phone?: string
}

function toSqlDate(arg: string | Date): string {
  if( typeof arg === "string" ){
    return arg;
  } else {
    return dateToSqlDate(arg);
  }
}

export function createPatient(spec: PatientCreationSpec = {}): Cypress.Chainable<Patient> {
  const patient = {
    patientId: spec.patientId ?? 0,
    lastName: spec.lastName ?? "診療",
    firstName: spec.firstName ?? "太郎",
    lastNameYomi: spec.lastNameYomi ?? "しんりょう",
    firstNameYomi: spec.firstNameYomi ?? "たろう",
    sex: spec.sex ?? "M",
    birthday: toSqlDate(spec.birthday ?? "2000-03-04"),
    address: spec.address ?? "",
    phone: spec.phone ?? "",
  }
  return cy.request("POST", apiBase() + "/enter-patient", patient)
    .then((response) => Patient.cast(response.body));
}
