import { toKanjiDate } from "@/lib/to-kanjidate";
import { Patient, Shahokokuho } from "myclinic-model";
import { format, f2, KanjiDate } from "kanjidate";
import patientTmpl from "@cypress/fixtures/patient-a.json";

export function fillPatientForm(patient: Patient) {
  const bd = toKanjiDate(patient.birthday);
  cy.get("[data-cy=last-name-input").clear().type(patient.lastName);
  cy.get("[data-cy=first-name-input").clear().type(patient.firstName);
  cy.get("[data-cy=last-name-yomi-input").clear().type(patient.lastNameYomi);
  cy.get("[data-cy=first-name-yomi-input").clear().type(patient.firstNameYomi);
  cy.get(".birthday-input [data-cy=gengou-select]").select(bd.gengou);
  cy.get(".birthday-input [data-cy=nen-input]").clear().type(bd.nen.toString());
  cy.get(".birthday-input [data-cy=month-input]").clear().type(bd.month.toString());
  cy.get(".birthday-input [data-cy=day-input]").clear().type(bd.day.toString());
  cy.get(`[data-cy=sex-input][value=${patient.sex}]`).click();
  cy.get("[data-cy=address-input]").clear().type(patient.address);
  cy.get("[data-cy=phone-input]").clear().type(patient.phone);
}

export function fillDateForm(date: Date | string | null) {
  if (date === null || date === "0000-00-00") {
    cy.get("[data-cy=nen-input]").clear();
    cy.get("[data-cy=month-input]").clear();
    cy.get("[data-cy=day-input]").clear();
  } else {
    const d = toKanjiDate(date);
    cy.get("[data-cy=gengou-select]").select(d.gengou);
    cy.get("[data-cy=nen-input]").clear().type(d.nen.toString());
    cy.get("[data-cy=month-input]").clear().type(d.month.toString());
    cy.get("[data-cy=day-input]").clear().type(d.day.toString());
  }
}

export function assertPatientDisp(patient: Patient) {
  if (patient.patientId === 0) {
    cy.get("[data-cy=patient-id]").should(($e) => {
      const t = $e.text();
      expect(t).match(/^[1-9][0-9]*$/);
    });
  } else {
    cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
  }
  cy.get("[data-cy=last-name]").contains(patient.lastName);
  cy.get("[data-cy=first-name]").contains(patient.firstName);
  cy.get("[data-cy=last-name-yomi]").contains(patient.lastNameYomi);
  cy.get("[data-cy=first-name-yomi]").contains(patient.firstNameYomi);
  cy.get("[data-cy=birthday]").contains(format(f2, patient.birthday));
  cy.get("[data-cy=sex]").contains(patient.sex === "M" ? "男性" : "女性");
  cy.get("[data-cy=address]").contains(patient.address);
  cy.get("[data-cy=phone]").contains(patient.phone);
}

export function assertPatientForm(patient: Patient) {
  cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
  cy.get("[data-cy=last-name-input]").should("have.value", patient.lastName);
  cy.get("[data-cy=first-name-input]").should("have.value", patient.firstName);
  cy.get("[data-cy=last-name-yomi-input]").should("have.value", patient.lastNameYomi);
  cy.get("[data-cy=first-name-yomi-input]").should("have.value", patient.firstNameYomi);
  cy.get("[data-cy=birthday-input-wrapper]").within(() => {
    const bd = new KanjiDate(new Date(patient.birthday));
    cy.get("[data-cy=gengou-select]").select(bd.gengou);
    cy.get("[data-cy=nen-input]").should("have.value", bd.nen.toString());
    cy.get("[data-cy=month-input]").should("have.value", bd.month.toString());
    cy.get("[data-cy=day-input]").should("have.value", bd.day.toString());
  });
  cy.get(`[data-cy=sex-input][value=${patient.sex}]:checked`);
  cy.get("[data-cy=address-input]").should("have.value", patient.address);
  cy.get("[data-cy=phone-input]").should("have.value", patient.phone);
}

export function newPatient() {
  const user = patientTmpl;
  return cy.request("POST", Cypress.env("API") + "/enter-patient", user)
    .then((response) => Patient.cast(response.body))
}

export function newShahokokuho(patientId: number) {
  return cy.fixture("new-shahokokuho-template.json")
    .then((tmpl) => {
      tmpl.patientId = patientId;
      return cy.request("POST", Cypress.env("API") + "/enter-shahokokuho", tmpl)
        .then((response) => Shahokokuho.cast(response.body))
    })
}

export function openPatientDialog(patientId: number) {
  cy.get("form [data-cy=search-text-input]").type(patientId.toString());
  cy.get("form [data-cy=search-button]").click();
  cy.get("[data-cy=dialog-title]").contains("患者情報");
}

export function closePatientDialog() {
  cy.get("[data-cy=dialog-title]").contains("患者情報").should("not.exist");
}
