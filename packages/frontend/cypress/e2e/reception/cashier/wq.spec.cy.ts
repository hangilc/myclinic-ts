import type { Patient, Visit } from "myclinic-model";
import { dialogClose, doesNotExist, newPatient, dialogOpen } from "./misc";
import { listWqueue, startVisit } from "./req";

describe("Wqueue", () => {
  let patient: Patient;
  
  before(() => {
    newPatient().then(p => patient = p);
  })

  it("should show new registry", () => {
    let visit: Visit;
    cy.visit("/reception/");
    startVisit(patient.patientId, new Date())
      .then(v => visit = v)
      .then(() => {
        cy.get(`[data-cy=wq-row][data-visit-id=${visit.visitId}]`).within(() => {
          cy.get("a").contains("診療録").click();
        })
        cy.scrollTo(0, 0);
        dialogOpen("診療録").within(() => {
          cy.get("[data-cy=cross-icon]").should("be.visible");
          cy.get("[data-cy=cross-icon]").click()
        });
        dialogClose("診療録");

        cy.get(`[data-cy=wq-row][data-visit-id=${visit.visitId}]`).within(() => {
          cy.get("[data-cy=aux-menu-icon]").click();
        })
        cy.get("[data-cy=wq-row-aux-menu]").within(() => {
          cy.get("a").contains("患者").click();
        })
        dialogOpen("患者情報").within(() => {
          cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
          cy.get("button").contains("閉じる").click();
        });
        dialogClose("患者情報");

        cy.get(`[data-cy=wq-row][data-visit-id=${visit.visitId}]`).within(() => {
          cy.get("[data-cy=aux-menu-icon]").click();
        })
        cy.get("[data-cy=wq-row-aux-menu]").within(() => {
          cy.get("a").contains("削除").click();
        })
        dialogOpen("確認").within(() => {
          cy.get("button").contains("はい").click();
        })
        dialogClose("確認");
        listWqueue().then(list => {
          const idx = list.findIndex(wq => wq.visitId === visit.visitId);
          expect(idx).to.satisfy((n: number) => n < 0);
        });
        doesNotExist(`[data-cy=wq-row][data-visit-id=${visit.visitId}]`);
      })
  })
})