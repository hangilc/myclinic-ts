import type { Patient, Shahokokuho } from "myclinic-model";
import { dialogClose, dialogOpen, newPatient, newShahokokuho, openPatientDialog, patientDialogClose } from "./misc";

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
    patientDialogClose();
    dialogOpen("社保国保情報");
    cy.get("button").contains("編集").click();
    dialogClose("社保国保情報");
  })
})