import { apiBase } from "./base";

export function batchEnterShinryou(visitId: number, shinryoucodes: number[]):
  Cypress.Chainable<number[]> {
    return cy.request("POST", 
      apiBase() + `/batch-enter-shinryou?visit-id=${visitId}`,
      shinryoucodes
      ).its("body").then(body => body as number[]);
  }