import { Shahokokuho } from "myclinic-model";
import { apiBase } from "./base";

export function enterShahokokuho(shahokokuho: Shahokokuho): Cypress.Chainable<Shahokokuho> {
  return cy.request("POST", apiBase() + "/enter-shahokokuho", shahokokuho)
    .then((response) => Shahokokuho.cast(response.body));
}

export function getShahokokuho(shahokokuhoId: number): Cypress.Chainable<Shahokokuho> {
  return cy.request("GET", apiBase() + "/get-shahokokuho?shahokokuho-id=" + shahokokuhoId)
    .its("body").then(body => Shahokokuho.cast(body));
}
