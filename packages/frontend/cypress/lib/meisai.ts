import { Meisai } from "myclinic-model";
import { apiBase } from "./base";

export function getMeisai(visitId: number): Cypress.Chainable<Meisai> {
  return cy.request(apiBase() + `/get-meisai?visit-id=${visitId}`)
    .its("body")
    .then(body => Meisai.cast(body));
}