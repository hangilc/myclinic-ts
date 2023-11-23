import { dateTimeParam } from "@/lib/date-param";
import { Visit, VisitEx } from "myclinic-model";
import { apiBase } from "./base";

export function startVisit(patientId: number, atDateTime: Date | string): Cypress.Chainable<Visit> {
  const at = dateTimeParam(atDateTime);
  return cy.request(apiBase() + `/start-visit?patient-id=${patientId}&at=${at}`)
    .its("body")
    .then(body => Visit.cast(body))
}

export function endVisit(visitId: number, charge: number): Cypress.Chainable<any> {
  return cy.request(apiBase() + `/enter-charge-value?visit-id=${visitId}&charge-value=${charge}`)
}

export function getVisitEx(visitId: number): Cypress.Chainable<VisitEx> {
  return cy.request(apiBase() + `/get-visit-ex?visit-id=${visitId}`)
    .its("body")
    .then(body => VisitEx.cast(body));
}

export function listRecentVisitIdsByPatient(patientId: number, count: number):
  Cypress.Chainable<number[]> {
  return cy.request(
    apiBase() + `/list-visit-id-by-patient-reverse?patient-id=${patientId}&offset=0&count=${count}`
  ).its("body");
}

export function getVisit(visitId: number): Cypress.Chainable<Visit> {
  return cy.request(apiBase() + `/get-visit?visit-id=${visitId}`)
    .its("body")
    .then(body => Visit.cast(body));
}