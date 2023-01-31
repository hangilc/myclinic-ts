import { toKanjiDate } from "@/lib/to-kanjidate";
import type { Patient } from "myclinic-model";

export function fillPatientForm(patient: Patient) {
  const bd = toKanjiDate(patient.birthday);
  cy.get("[data-cy=last-name-input").type(patient.lastName);
  cy.get("[data-cy=first-name-input").type(patient.firstName);
  cy.get("[data-cy=last-name-yomi-input").type(patient.lastNameYomi);
  cy.get("[data-cy=first-name-yomi-input").type(patient.firstNameYomi);
  cy.get(".birthday-input [data-cy=gengou-select]").select(bd.gengou);
  cy.get(".birthday-input [data-cy=nen-input]").type(bd.nen.toString());
  cy.get(".birthday-input [data-cy=month-input]").type(bd.month.toString());
  cy.get(".birthday-input [data-cy=day-input]").type(bd.day.toString());
  cy.get(`[data-cy=sex-input][value=${patient.sex}]`).click();
  cy.get("[data-cy=address]").type(patient.address);
  cy.get("[data-cy=phone]").type(patient.phone);
}