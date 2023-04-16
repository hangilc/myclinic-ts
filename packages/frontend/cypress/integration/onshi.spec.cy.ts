import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient, enterPatient } from "@cypress/lib/patient";
import { enterShahokokuho } from "@cypress/lib/shahokokuho";
import { createShahokokuho } from "@cypress/lib/shahokokuho-mock";
import { Onshi, Visit, type Patient, type Shahokokuho } from "myclinic-model";
import { onshiCreationModifier as m } from "@cypress/lib/onshi-mock";
import { apiBase } from "@cypress/lib/base";
import { startVisit } from "@cypress/lib/visit";

describe("onshi", () => {
  it("should delete onshi when visit is deleted", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then(patient => {
      enterShahokokuho(createShahokokuho({ patientId: patient.patientId })).as("shahokokuho");
    });
    cy.get<Patient>("@patient").then(patient => {
      cy.get<Shahokokuho>("@shahokokuho").then(shahokokuho => {
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(shahokokuho));
        startVisit(patient.patientId, new Date()).as("visit");
        cy.get<Visit>("@visit").then(visit => {
          const onshi = new Onshi(visit.visitId, JSON.stringify(result));
          cy.request("POST", apiBase() + "/set-onshi", onshi).as("setOnshi");
        });
      })
    });
    cy.get("@setOnshi");
    cy.get<Visit>("@visit").then(visit => {
      cy.request(apiBase() + `/delete-visit?visit-id=${visit.visitId}`).as("deleteVisit");
    })
    cy.get<Visit>("@visit").then(visit => {
      cy.get("@deleteVisit").then(() => {
        cy.request(apiBase() + `/find-onshi?visit-id=${visit.visitId}`)
          .then(resp => expect(resp.body).to.be.null);
      });
    });
  });
});
