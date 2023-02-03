import user from "@cypress/fixtures/patient-a.json";
import type { Patient } from "myclinic-model";
import { dialogClose, dialogOpen, newPatient } from "./misc";

describe("Search Patient", () => {

  let patient1: Patient;
  let patient2: Patient;

  before(() => {
    newPatient(user).then(p => patient1 = p);
    newPatient(user).then(p => patient2 = p);
  })

  it("should search for patient 1", () => {
    cy.visit("/reception/");
    cy.get("[data-cy=search-text-input]").type(user.lastName);
    cy.get("button").contains("検索").click();
    dialogOpen("患者検索結果");
    cy.get(`[data-patient-id=${patient1.patientId}]`);
    cy.get(`[data-patient-id=${patient2.patientId}]`).click();
    dialogOpen("患者情報");
    cy.get("[data-cy=patient-id]").contains(patient2.patientId.toString());
    cy.get("button").contains("閉じる").click();
    dialogClose("患者情報");
  });
})