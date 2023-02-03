import { castBoolean, castList, castNumber, castNumberFromString, castObject } from "@/lib/cast";
import { dateToSql } from "@/lib/util";
import { Charge, dateToSqlDateTime, Meisai, Patient, Payment, Visit, Wqueue } from "myclinic-model";

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

export function startVisit(patientId: number, atDateTime: Date) {
  const at = dateToSqlDateTime(atDateTime);
  return cy.request(Cypress.env("API") + `/start-visit?patient-id=${patientId}&at=${at}`)
    .its("body")
    .then(body => Visit.cast(body))
}

export function batchEnterShinryou(visitId: number, shinryoucodes: number[]) {
  return cy.request("POST", Cypress.env("API") + `/batch-enter-shinryou?visit-id=${visitId}`, 
    shinryoucodes).its("body").then(body => castList(castNumber)(body));
}

export function getMeisai(visitId: number) {
  return cy.request(Cypress.env("API") + `/get-meisai?visit-id=${visitId}`)
    .its("body")
    .then(body => Meisai.cast(body))
}

export function enterChargeValue(visitId: number, chargeValue: number) {
  return cy.request(Cypress.env("API") + 
    `/enter-charge-value?visit-id=${visitId}&charge-value=${chargeValue}`)
    .its("body")
    .then(body => Charge.cast(body))
}

export function finishCashier(visitId: number, amount: number) {
  const payment = new Payment(visitId, amount, dateToSqlDateTime(new Date()));
  return cy.request("POST", Cypress.env("API") + "/finish-cashier", payment)
    .its("body").then(body => castBoolean(body))
}

export function changeWqueueState(visitId: number, state: number) {
  return cy.request(Cypress.env("API") + 
    `/change-wqueue-state?visit-id=${visitId}&wqueue-state=${state}`)
    .its("body").then(body => Wqueue.cast(body))
}

