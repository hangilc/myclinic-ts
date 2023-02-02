import type { Shahokokuho, Patient, Koukikourei, Kouhi } from "myclinic-model"
import { newPatient, newShahokokuho, newKoukikourei, newKouhi, openPatientDialog, patientDialogClose, dialogOpen, dialogClose, assertShahokokuhoForm } from "./misc"

describe("Hoken History", () => {
  let patient: Patient;
  let shahokokuho: Shahokokuho;
  let koukikourei: Koukikourei;
  let kouhi: Kouhi;

  before(() => {
    newPatient().then(p => {
      patient = p;
      return newShahokokuho(patient.patientId)
    }).then(h => {
      shahokokuho = h;
      return newKoukikourei(patient.patientId);
    }).then(h => {
      koukikourei = h;
      return newKouhi(patient.patientId);
    }).then(h => {
      kouhi = h;
    })
  })

  it("should open hoken history dialog", () => {
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("[data-cy=hoken-history-link]").click();
    patientDialogClose();
    dialogOpen("保険履歴");
    cy.get(`[data-cy=hoken-box][data-key=shahokokuho-${shahokokuho.shahokokuhoId}]`).within(() => {
      cy.get("button").contains("編集").click();
    })
    dialogClose("保険履歴");
    dialogOpen("社保国保編集");
    assertShahokokuhoForm(patient, shahokokuho);
    cy.get("button").contains("キャンセル").click();
    dialogClose("社保国保編集");
    dialogClose("保険履歴");
  })
})