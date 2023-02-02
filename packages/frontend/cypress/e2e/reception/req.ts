import { dateToSql } from "@/lib/util";

export function findAvailableShahokokuho(patientId: number, atOpt?: Date) {
  const at = atOpt || dateToSql(new Date());
  return cy.request(Cypress.env("API") + `/find-available-shahokokuho?patient-id=${patientId}&at=${at}`)
    .its("body")
}

export function findAvailableKoukikourei(patientId: number, atOpt?: Date) {
  const at = atOpt || dateToSql(new Date());
  return cy.request(Cypress.env("API") + `/find-available-koukikourei?patient-id=${patientId}&at=${at}`)
    .its("body")
}

