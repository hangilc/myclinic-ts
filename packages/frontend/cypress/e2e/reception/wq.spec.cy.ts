import type { Patient, Visit } from "myclinic-model";
import { dialogClose, newPatient, openedDialog } from "./misc";
import { startVisit } from "./req";

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
          openedDialog("診療録").within(() => {
            cy.get("[data-cy=cross-icon]").click();
            dialogClose("診療録");
          });
        })
      })

  })
})