import type { Shahokokuho, Patient, Koukikourei, Kouhi } from "myclinic-model"
import { newPatient, newShahokokuho, newKoukikourei, newKouhi, openPatientDialog, patientDialogClose, dialogOpen, dialogClose, assertShahokokuhoForm, assertKoukikoureiForm, assertKouhiForm } from "./misc"
import { findAvailableKoukikourei, findAvailableShahokokuho, listAvailableKouhi } from "./req";

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

  it("should open hoken history dialog with shahokokuho", () => {
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
    dialogOpen("保険履歴");
    cy.get(`[data-cy=hoken-box][data-key=shahokokuho-${shahokokuho.shahokokuhoId}]`).within(() => {
      cy.get("a").contains("削除").click();
    })
    dialogOpen("確認");
    cy.get("button").contains("はい").click();
    dialogClose("確認");
    findAvailableShahokokuho(patient.patientId).should("be.null");
    cy.get(`[data-cy=hoken-box][data-key=shahokokuho-${shahokokuho.shahokokuhoId}]`).should("not.exist");
    cy.get("button").contains("閉じる").click();
    dialogClose("保険履歴");
    dialogOpen("患者情報");
    cy.get("button").contains("閉じる").click();
    dialogClose("患者情報");
  })

  it("should open hoken history dialog with koukikourei", () => {
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("[data-cy=hoken-history-link]").click();
    patientDialogClose();
    dialogOpen("保険履歴");
    cy.get(`[data-cy=hoken-box][data-key=koukikourei-${koukikourei.koukikoureiId}]`).within(() => {
      cy.get("button").contains("編集").click();
    })
    dialogClose("保険履歴");
    dialogOpen("後期高齢編集");
    assertKoukikoureiForm(patient, koukikourei);
    cy.get("button").contains("キャンセル").click();
    dialogClose("後期高齢編集");
    dialogOpen("保険履歴");
    cy.get(`[data-cy=hoken-box][data-key=koukikourei-${koukikourei.koukikoureiId}]`).within(() => {
      cy.get("a").contains("削除").click();
    })
    dialogOpen("確認");
    cy.get("button").contains("はい").click();
    dialogClose("確認");
    findAvailableKoukikourei(patient.patientId).should("be.null");
    cy.get(`[data-cy=hoken-box][data-key=koukikourei-${koukikourei.koukikoureiId}]`).should("not.exist");
    cy.get("button").contains("閉じる").click();
    dialogClose("保険履歴");
    dialogOpen("患者情報");
    cy.get("button").contains("閉じる").click();
    dialogClose("患者情報");
  })

  it("should open hoken history dialog with kouhi", () => {
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("[data-cy=hoken-history-link]").click();
    patientDialogClose();
    dialogOpen("保険履歴");
    cy.get(`[data-cy=hoken-box][data-key=kouhi-${kouhi.kouhiId}]`).within(() => {
      cy.get("button").contains("編集").click();
    })
    dialogClose("保険履歴");
    dialogOpen("公費編集");
    assertKouhiForm(patient, kouhi);
    cy.get("button").contains("キャンセル").click();
    dialogClose("公費編集");
    dialogOpen("保険履歴");
    cy.get(`[data-cy=hoken-box][data-key=kouhi-${kouhi.kouhiId}]`).within(() => {
      cy.get("a").contains("削除").click();
    })
    dialogOpen("確認");
    cy.get("button").contains("はい").click();
    dialogClose("確認");
    listAvailableKouhi(patient.patientId).should("be.empty");
    cy.get(`[data-cy=hoken-box][data-key=kouhi-${kouhi.kouhiId}]`).should("not.exist");
    cy.get("button").contains("閉じる").click();
    dialogClose("保険履歴");
    dialogOpen("患者情報");
    cy.get("button").contains("閉じる").click();
    dialogClose("患者情報");
  })
})