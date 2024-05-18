import CashierDialog from "@/cashier/CashierDialog.svelte";
import { newPatient } from "@cypress/lib/patient";
import { getVisitEx, startVisit } from "@cypress/lib/visit";
import { Charge, type Patient, type Visit, type VisitEx } from "myclinic-model";
import { type Meisai } from "@/lib/rezept-meisai";
import shinryouNames from "@cypress/fixtures/shinryou-set1.json";
import { batchResolveShinryoucodeByName } from "@cypress/lib/masters";
import { batchEnterShinryou } from "@cypress/lib/shinryou";
import { getMeisai } from "@cypress/lib/meisai";
import type { ReceiptDrawerData } from "@/lib/drawer/forms/receipt/receipt-drawer-data";
import { calcRezeptMeisai } from "@/lib/rezept-meisai";

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
        // getMeisai(visit.visitId).as("meisai")
      });
    })
    cy.get<Patient>("@patient").then(patient => {
      cy.get<VisitEx>("@visitEx").then(visit => {
        cy.wrap<Meisai>(calcRezeptMeisai(visit.visitId)).then(meisai => {

        });
        // cy.get<Meisai>("@meisai").then(meisai => {
        //   const charge = new Charge(visit.visitId, meisai.charge);
        //   const props = {
        //     patient, visit, meisai, charge,
        //     destroy: () => { }
        //   };
        //   cy.mount(CashierDialog, { props });
        //   cy.get(".detail-wrapper").invoke("outerHeight").should("be.lt", 300);
        // })
      })
    })
  });

  it("should show changed charge", () => {
    const at = new Date();
    newPatient().as("patient");
    cy.get<Patient>("@patient").then(patient => {
      startVisit(patient.patientId, at).as("visit");
    });
    cy.get<Visit>("@visit").then(visit => {
      getVisitEx(visit.visitId).as("visitEx");
      getMeisai(visit.visitId).as("meisai")
    });
    const f = {
      receiptHook: (data: ReceiptDrawerData) => {
        expect(data.charge).to.be.eq(1000);
      }
    };
    cy.spy(f, "receiptHook").as("receiptHook");
    cy.intercept("GET", "http://localhost:48080/setting/", "[]");
    cy.intercept("GET", "http://localhost:48080/pref/receipt", "null");
    cy.get<Patient>("@patient").then(patient => {
      cy.get<VisitEx>("@visitEx").then(visit => {
        cy.get<Meisai>("@meisai").then(meisai => {
          const charge = new Charge(visit.visitId, 1000);
          const props = {
            patient, visit, meisai, charge,
            destroy: () => { },
            receiptHook: (d: ReceiptDrawerData) => f.receiptHook(d)
          };
          cy.mount(CashierDialog, { props });
          cy.get("button").contains("領収書印刷").click();
          cy.get("@receiptHook").should("be.called");
        })
      })
    });
  });
})

async function calcMeisai(visitId: number): Promise<Meisai> {
  return calcRezeptMeisai(visitId);
}