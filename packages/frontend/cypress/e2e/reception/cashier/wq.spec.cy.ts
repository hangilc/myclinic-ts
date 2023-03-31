import { Visit, Wqueue, WqueueState, type Meisai, type Patient } from "myclinic-model";
import { dialogClose, newPatient, dialogOpen } from "./misc";
import { listWqueue, startVisit, batchEnterShinryou, getMeisai, enterChargeValue, changeWqueueState } from "./req";
import { doesNotExist } from "@cypress/lib/dialog";
import shinryouNames from "@cypress/fixtures/shinryou-names.json";
// import { castList } from "@/lib/cast";
// import { castOp } from "@/lib/drawer/op";

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
  });

  it("should finish cashier", () => {
    startVisit(patient.patientId, new Date()).as("visit");
    cy.get<Visit>("@visit").then(visit => {
      return batchEnterShinryou(visit.visitId, [shinryouNames.初診, shinryouNames.処方せん料])
    });
    cy.get<Visit>("@visit").then(visit => {
      return getMeisai(visit.visitId);
    }).as("meisai");
    cy.get<Visit>("@visit").then(visit => {
      cy.get<Meisai>("@meisai").then((meisai) => {
        enterChargeValue(visit.visitId, meisai.charge);
        changeWqueueState(visit.visitId, WqueueState.WaitCashier.code);
      })
    })
    cy.visit("/reception/");
    cy.get<Visit>("@visit").then((visit) => {
      clickCashierButton(visit.visitId);
    });
    cy.intercept("http://localhost:48080/setting", []);
    cy.intercept("http://localhost:48080/pref/receipt", "null");
    cy.intercept("http://localhost:48080/print/", (req) => {
      // const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      // const setup = castList(castOp)(body.setup);
      // const pages = castList(castList(castOp))(body.pages);
      req.reply("true");
    });
    dialogOpen("会計").within(() => {
      cy.get("button").contains("領収書印刷").click();
    })
    dialogOpen("領収書印刷").within(() => {
      cy.get("button").contains("印刷").click();
    })
    dialogOpen("会計").within(() => {
      cy.get("button").contains("会計終了").click();
    });
    dialogClose("会計終了");
  });

  it("should refresh", () => {
    cy.visit("/reception/");
    cy.intercept(Cypress.env("API") + "/list-wqueue-full", [
      0, [
        new Wqueue(1, WqueueState.WaitExam.code)
      ], 
      {1: new Visit(1, patient.patientId, "2023-02-09 08:57:12", 0, 0, 0, 0, 0, 0)}, 
      {[patient.patientId]: patient}
    ]).as("listWqueue");
    cy.get("button").contains("更新").click();
    cy.get("@listWqueue");
    cy.get("[data-cy=wq-row][data-visit-id=1]").should("exist");
  })
})

function clickCashierButton(visitId: number) {
  cy.get(`[data-cy=wq-row][data-visit-id=${visitId}] button`).contains("会計").click();
}