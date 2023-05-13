import type { Patient } from "myclinic-model";
import { dateToSqlDate, Shahokokuho, Visit } from "myclinic-model";
import { newPatient, openPatientDialog } from "./misc";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { listWqueueFull } from "./req";
import { mockShahokokuho } from "@cypress/lib/shahokokuho-mock";
import { mockOnshiSuccessResult } from "@cypress/lib/onshi-mock";
import { onshi_query_from_hoken } from "@/lib/onshi-query-from-hoken";

describe("Start Visit", () => {
  let patient: Patient;

  before(() => {
    newPatient().then((p) => patient = p);
  })

  it("should start new visit without hoken", () => {
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("button").contains("診察受付").click();
    dialogOpen("診察受付").within(() => {
      cy.get("button").contains("入力").click();
    });
    dialogClose("診察受付");
    dialogClose("患者情報");
    listWqueueFull().then((list) => {
      const idx = list.findIndex(wq => wq.patient.patientId === patient.patientId)
      expect(idx).to.satisfy((i: number) => i >= 0);
    });
  });

  it("should start new visit with hoken without onshi confirm", () => {
    const shahokokuho = mockShahokokuho({ patientId: patient.patientId, hokenshaBangou: 123456 });
    cy.request("POST", Cypress.env("API") + "/enter-shahokokuho", shahokokuho)
      .then((response) => Shahokokuho.cast(response.body)).as("hoken");
    cy.get<Shahokokuho>("@hoken").then((hoken) => {
      cy.visit("/reception/");
      openPatientDialog(patient.patientId);
      cy.get("button").contains("診察受付").click();
      dialogOpen("診察受付").within(() => {
        cy.get(`input[data-cy=hoken-input][data-shahokokuho-id=${hoken.shahokokuhoId}]`).should("be.checked");
        cy.get("a").contains("資格確認なしで入力").click();
      });
      dialogOpen("確認").within(() => {
        cy.get("[data-cy=text]").contains("資格確認なしで入力していいですか？");
        cy.get("button").contains("はい").click();
      })
      dialogClose("確認");
      dialogClose("診察受付");
      dialogClose("患者情報");
      listWqueueFull().then((list) => {
        const wqs = list.filter(wq => wq.patient.patientId === patient.patientId);
        expect(wqs.length).to.satisfy((i: number) => i > 0);
        const wq = wqs[wqs.length - 1];
        cy.request("GET", Cypress.env("API") + "/get-visit?visit-id=" + wq.visitId)
          .then((response) => Visit.cast(response.body)).as("visit")
      });
      cy.get<Visit>("@visit").then((visit) => {
        cy.get<Shahokokuho>("@hoken").then((shahokokuho) => {
          console.log(visit);
          console.log(shahokokuho);
          expect(visit.shahokokuhoId).to.be.equal(shahokokuho.shahokokuhoId);
        });
      });
    });
  });

  // it("should start new visit with hoken and onshi confirm", () => {
  //   const shahokokuho = mockShahokokuho({ patientId: patient.patientId, hokenshaBangou: 123456 });
  //   const at = dateToSqlDate(new Date());
  //   cy.request("POST", Cypress.env("API") + "/enter-shahokokuho", shahokokuho)
  //     .then((response) => Shahokokuho.cast(response.body)).as("hoken");
  //   cy.get<Shahokokuho>("@hoken").then((shahokokuho) => {
  //     cy.visit("/reception/");
  //     openPatientDialog(patient.patientId);
  //     cy.get("button").contains("診察受付").click();
  //     dialogOpen("診察受付").within(() => {
  //       cy.get(`input[data-cy=hoken-input][data-shahokokuho-id=${shahokokuho.shahokokuhoId}]`).should("be.checked");
  //       const query = onshi_query_from_hoken(shahokokuho, patient.birthday, at);
  //       const onshiResult = mockOnshiSuccessResult(query);
  //       cy.intercept("POST", "http://localhost/onshi/kakunin", onshiResult.toJSON());
  //       cy.get("button").contains("資格確認").click();
  //       cy.get("[data-cy=onshi-confirmed]");
  //       cy.get("button").contains("入力").click();
  //     });
  //   });
  //   dialogClose("診察受付");
  //   dialogClose("患者情報");
  //   cy.get<Shahokokuho>("@hoken").then((shahokokuho) => {
  //     listWqueueFull().then((list) => {
  //       const wqs = list.filter(wq => wq.patient.patientId === patient.patientId &&
  //         wq.visit.shahokokuhoId === shahokokuho.shahokokuhoId);
  //       expect(wqs.length).to.satisfy((i: number) => i > 0);
  //     });
  //   });
  // });
});