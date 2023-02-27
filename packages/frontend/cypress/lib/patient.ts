import { apiBase } from "./base";
import patientTmpl from "@cypress/fixtures/patient-a.json";
import { Patient } from "myclinic-model";

export function newPatient(user?: any): Cypress.Chainable<Patient> {
  user = user || patientTmpl;
  return cy.request("POST", apiBase() + "/enter-patient", user)
    .then((response) => Patient.cast(response.body))
}
