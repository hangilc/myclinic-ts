import { dateToSqlDateTime, Visit, VisitEx } from "myclinic-model";
import { apiBase } from "./base";

export function startVisit(patientId: number, atDateTime: Date): Cypress.Chainable<Visit> {
  const at = dateToSqlDateTime(atDateTime);
  return cy.request(apiBase() + `/start-visit?patient-id=${patientId}&at=${at}`)
    .its("body")
    .then(body => Visit.cast(body))
}

export function getVisitEx(visitId: number): Cypress.Chainable<VisitEx> {
  return cy.request(apiBase() + `/get-visit-ex?visit-id=${visitId}`)
    .its("body")
    .then(body => VisitEx.cast(body));
}
