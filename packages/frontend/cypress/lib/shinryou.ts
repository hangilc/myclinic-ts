import { apiBase } from "./base";

export function batchEnterShinryou(visitId: number, shinryoucodes: number[]):
  Cypress.Chainable<number[]> {
  return cy.request("POST",
    apiBase() + `/batch-enter-shinryou?visit-id=${visitId}`,
    shinryoucodes
  ).its("body").then(body => body as number[]);
}

export function getShinryhouKensa(): Cypress.Chainable<Record<string, string[]>> {
  return cy.request("GET", apiBase() + "/get-shinryou-kensa")
    .its("body")
    .then(body => body as Record<string, string[]>);
}
