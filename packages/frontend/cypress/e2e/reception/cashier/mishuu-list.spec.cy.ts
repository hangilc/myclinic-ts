import { type Visit, type Patient, type Meisai, WqueueState } from "myclinic-model";
import { dialogClose, newPatient, dialogOpen } from "./misc";
import { batchEnterShinryou, changeWqueueState, enterChargeValue, finishCashier, getMeisai, listWqueue, startVisit } from "./req";
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
    dialogOpen("未収処理（検索）").within(() => {
      cy.get("input").type(patient.patientId.toString());
      cy.get("button").contains("検索").click();
      cy.get("[data-patient-id]").contains(patient.patientId.toString()).click();
    });
    dialogClose("未収処理（検索）");
    dialogOpen("未収処理").within(() => {
      cy.get(`input[data-visit-id=${visit.visitId}]`).check();
      cy.get("button").contains("会計に加える").click();
    })
    dialogClose("未収処理");
    listWqueue().then(list => {
      const idx = list.findIndex(wq => wq.visitId === visit.visitId);
      expect(idx).to.satisfy((n: number) => n >= 0);
    })
  })
})

