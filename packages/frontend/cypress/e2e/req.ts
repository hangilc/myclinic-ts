import { Patient } from "myclinic-model";

const api: string = Cypress.env("API");

export function getPatient(patientId: number): Cypress.Chainable<Patient> {
  return cy.request(api + `/get-patient?patient-id=${patientId}`)
    .its("body")
    .then(body => Patient.cast(body));
}