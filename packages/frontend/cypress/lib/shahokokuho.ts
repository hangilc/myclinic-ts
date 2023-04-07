import { Shahokokuho } from "myclinic-model";
import { apiBase } from "./base";

export function enterShahokokuho(shahokokuho: Shahokokuho): Cypress.Chainable<Shahokokuho> {
  return cy.request("POST", apiBase() + "/enter-shahokokuho", shahokokuho)
    .then((response) => Shahokokuho.cast(response.body));
}
