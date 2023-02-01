import user from "@cypress/fixtures/patient-a.json";
import type { Patient, Shahokokuho } from "myclinic-model";
import { closePatientDialog, newPatient, newShahokokuho, openPatientDialog } from "./misc";

describe("Edit Shahokokuho", () => {
  let patient: Patient;
  let orig: Shahokokuho;

  before(() => {
    newPatient()
      .then(p => {
        patient = p;
        return newShahokokuho(patient.patientId)
      })
      .then(h => orig = h);
  })

  it("should modify existing shahokokuho data", () => {
    expect(patient.patientId).to.be.greaterThan(0);
    expect(orig.shahokokuhoId).to.be.greaterThan(0);
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("[data-cy=current-hoken]").click();
    closePatientDialog();
    cy.get("[data-cy=dialog-title]").contains("社保国保情報");
    cy.get("button").contains("編集").click();
    cy.get("[data-cy=dialog-title]").contains("社保国保情報").should("not.exist");
  })
})