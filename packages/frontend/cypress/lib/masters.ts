import { dateToSql } from "@/lib/util";
import { apiBase } from "./base";

export function batchResolveShinryoucodeByName(names: string[], at: Date): Cypress.Chainable<Record<string, number>> {
  const atDate = dateToSql(at);
  return cy.request("POST",
    apiBase() + `/batch-resolve-shinryoucode-by-name?at=${atDate}`,
    names)
    .its("body")
    .then(body => body as Record<string, number>);
}