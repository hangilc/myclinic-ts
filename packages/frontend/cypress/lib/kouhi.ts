import { dateToSqlDate, Kouhi } from "myclinic-model";
import { apiBase } from "./base";

export function enterKouhi(kouhi: Kouhi): Cypress.Chainable<Kouhi> {
  return cy.request("POST", apiBase() + "/enter-kouhi", kouhi)
    .then((response) => Kouhi.cast(response.body));
}

export function getKouhi(kouhiId: number): Cypress.Chainable<Kouhi> {
  return cy.request("GET", apiBase() + "/get-kouhi?kouhi-id=" + kouhiId)
    .its("body").then(body => Kouhi.cast(body));
}

export interface KouhiCreationSpec {
  kouhiId?: number;
  patientId?: number;
  futansha?: number;
  jukyuusha?: number;
  validFrom?: string;
  validUpto?: string;
}

export function createKouhi(spec: KouhiCreationSpec = {}): Kouhi {
  return Kouhi.cast({
    kouhiId: spec.kouhiId ?? 0,
    patientId: spec.patientId ?? 1,
    futansha: spec.futansha ?? 51123456,
    jukyuusha: 1234567,
    validFrom: spec.validFrom ?? dateToSqlDate(new Date()),
    validUpto: spec.validUpto ?? "0000-00-00",
  });
}
