import { type Visit, type Patient, type Meisai, WqueueState } from "myclinic-model";
import { dialogClose, dialogOpen, newPatient, withDialog, withinDialog } from "./misc";
import { batchEnterShinryou, changeWqueueState, enterChargeValue, finishCashier, getMeisai, startVisit } from "./req";
import shinryouMap from "@cypress/fixtures/shinryou-names.json";

describe("Mishuu List", () => {
  let patient: Patient;
  let visit: Visit;
  let meisai: Meisai;
  
  before(() => {
    newPatient()
      .then(p => patient = p)
      .then(() => startVisit(patient.patientId, new Date()))
      .then(v => visit = v)
      .then(() => batchEnterShinryou(visit!.visitId, [shinryouMap.初診]))
      .then(() => getMeisai(visit.visitId))
      .then(m => meisai = m)
      .then(() => enterChargeValue(visit.visitId, meisai.charge))
      .then(() => changeWqueueState(visit.visitId, WqueueState.WaitCashier.code))
      .then(() => finishCashier(visit.visitId, 0))
  })

  it("should list mishuu visits", () => {
    cy.visit("/reception/");
    cy.get("[data-cy=bars3-menu]").click();
    cy.get("a").contains("未収処理").click();
    withinDialog("未収処理").within(() => {
      cy.get("input").type(patient.patientId.toString());
      cy.get("button").contains("検索").click();
    });
    // dialogOpen("未収処理").within(() => {
    //   cy.get("input").type(patient.patientId.toString());
    //   cy.get("button").contains("検索").click();

    // })

    dialogClose("未収処理");
  })
})

