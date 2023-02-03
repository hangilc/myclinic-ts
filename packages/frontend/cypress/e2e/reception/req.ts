import { castList, castNumber, castNumberFromString, castObject } from "@/lib/cast";
import { dateToSql } from "@/lib/util";
import { Patient, Visit, Wqueue } from "myclinic-model";

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

export function listAvailableKouhi(patientId: number, atOpt?: Date) {
  const at = atOpt || dateToSql(new Date());
  return cy.request(Cypress.env("API") + `/list-available-kouhi?patient-id=${patientId}&at=${at}`)
    .its("body")
}

export function listWqueue() {
  return cy.request(Cypress.env("API") + "/list-wqueue").its("body")
    .then(body => {
      return castList(Wqueue.cast)(body);
    })
}

export function listWqueueFull() {
  return cy.request(Cypress.env("API") + "/list-wqueue-full").its("body")
    .then(body => {
      const [_index, wqListArg, visitMapArg, patientMapArg] = body;
      const wqList = castList(Wqueue.cast)(wqListArg);
      const visitMap = castObject(castNumberFromString, Visit.cast)(visitMapArg);
      const patientMap = castObject(castNumberFromString, Patient.cast)(patientMapArg);
      return wqList.map(wq => {
        const visit = visitMap[wq.visitId];
        const patient = patientMap[visit.patientId];
        return Object.assign({}, wq, { visit, patient });
      })
    });
}

