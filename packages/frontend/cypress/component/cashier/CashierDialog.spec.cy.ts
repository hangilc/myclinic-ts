import CashierDialog from "@/cashier/CashierDialog.svelte";
import { newPatient } from "@cypress/lib/patient";
import { getVisitEx, startVisit } from "@cypress/lib/visit";
import { Charge, Meisai, type Patient, type Visit, type VisitEx } from "myclinic-model";
import shinryouNames from "@cypress/fixtures/shinryou-set1.json";
import { batchResolveShinryoucodeByName } from "@cypress/lib/masters";
import { batchEnterShinryou } from "@cypress/lib/shinryou";
import { getMeisai } from "@cypress/lib/meisai";

describe("CashierDialog", () => {
  it("should have proper height of cashier detail", () => {
    const at = new Date();
    newPatient().as("patient");
    cy.get<Patient>("@patient").then(patient => {
      startVisit(patient.patientId, at).as("visit");
    });
    batchResolveShinryoucodeByName(shinryouNames, at).then(map => {
      return shinryouNames.map(name => map[name]);
    }).as("shinryoucodes");
    cy.get<Visit>("@visit").then(visit => {
      cy.get<number[]>("@shinryoucodes").then(shinryoucodes => {
        batchEnterShinryou(visit.visitId, shinryoucodes).as("batchEnter");
      })
    });
    cy.get("@batchEnter").then(() => {
      cy.get<Visit>("@visit").then(visit => {
        getVisitEx(visit.visitId).as("visitEx");
        getMeisai(visit.visitId).as("meisai")
      });
    })
    cy.get<Patient>("@patient").then(patient => {
      cy.get<VisitEx>("@visitEx").then(visit => {
        cy.get<Meisai>("@meisai").then(meisai => {
          const charge = new Charge(visit.visitId, meisai.charge);
          const props = {
            patient, visit, meisai, charge,
            destroy: () => {}
          };
          cy.mount(CashierDialog, { props });
          cy.get(".detail-wrapper").invoke("outerHeight").should("be.lt", 300);
        })
      })
    })
  });
})