import type { Patient } from "myclinic-model";
import { newPatient, openPatientDialog, patientDialogClose } from "./misc";
import { listWqueueFull } from "./req";

describe("Start Visit", () => {
  let patient: Patient;

  before(() => {
    newPatient().then((p) => patient = p);
  })

  it("should start new visit", () => {
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("button").contains("診察受付").click();
    patientDialogClose();
    listWqueueFull().then((list) => {
      const idx = list.findIndex(wq => wq.patient.patientId === patient.patientId)
      expect(idx).to.satisfy((i: number) => i >= 0);
    });
  })
})