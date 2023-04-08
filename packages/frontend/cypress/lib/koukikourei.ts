import { dateToSqlDate, Koukikourei } from "myclinic-model";
import { apiBase } from "./base";

export interface KoukikoureiCreationSpec {
  koukikoureiId?: number;
  patientId?: number;
  hokenshaBangou?: string;
  hihokenshaBangou?: string;
  futanWari?: number;
  validFrom?: string;
  validUpto?: string;
}

export function createKoukikourei(spec: KoukikoureiCreationSpec = {}): Koukikourei {
  return Koukikourei.cast({
    koukikoureiId: spec.koukikoureiId ?? 0,
    patientId: spec.patientId ?? 1,
    hokenshaBangou: spec.hokenshaBangou ?? 39345678,
    hihokenshaBangou: spec.hihokenshaBangou ?? 87654321,
    futanWari: spec.futanWari ?? 1,
    validFrom: spec.validFrom ?? dateToSqlDate(new Date()),
    validUpto: spec.validUpto ?? "0000-00-00",
  });
}

export function getKoukikourei(koukikoureiId: number): Cypress.Chainable<Koukikourei> {
  return cy.request("GET", apiBase() + "/get-koukikourei?koukikourei-id=" + koukikoureiId)
    .its("body").then(body => Koukikourei.cast(body));
}
