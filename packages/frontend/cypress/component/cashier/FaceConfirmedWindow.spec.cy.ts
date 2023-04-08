import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient, enterPatient } from "@cypress/lib/patient";
import { createShahokokuho } from "@cypress/lib/shahokokuho-mock";
import type { OnshiResult } from "onshi-result";
import { onshiCreationModifier as m } from "@cypress/lib/onshi-mock";
import { apiBase } from "@cypress/lib/base";
import { Visit, type Patient, type Shahokokuho } from "myclinic-model";
import { enterShahokokuho } from "@cypress/lib/shahokokuho";
import { confirmCancel, confirmYes, confirmYesContainingMessage } from "@cypress/lib/confirm";

describe("FaceConfirmedWindow", () => {
  it("should mount", () => {
    const result: OnshiResult = createOnshiResult();
    cy.mount(FaceConfirmedWindow, {
      props: {
        destroy: () => { },
        result
      }
    });
  });

  it("should enter new hoken when none available", () => {
    enterPatient(createPatient()).as("patient");
    enterShahokokuho(createShahokokuho()).as("shahokokuho");
    cy.get<Patient>("@patient").then((patient) => {
      cy.get<Shahokokuho>("@shahokokuho").then((shahokokuho) => {
        const result = createOnshiResult(h => h, m.patient(patient), m.shahokokuho(shahokokuho));
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient]]);
        cy.mount(FaceConfirmedWindow, {
          props: {
            destroy: () => { },
            result,
          }
        });
        cy.get("[data-cy=message]").contains("新しい保険証");
        cy.get("button").contains("新規保険証登録").click();
        confirmYesContainingMessage("登録します");
        cy.get("[data-cy=message]").should("not.exist");
        cy.get("button").contains("診察登録").click();
        cy.request(
          apiBase() + `/list-visit-id-by-patient-reverse?patient-id=${patient.patientId}&offset=0&count=1`,
        ).its("body").then((body: number[]) => {
          expect(body.length).equal(1);
          return body[0]
        }).as("visitId");
        cy.get<number>("@visitId").then((visitId: number) => {
          cy.request(
            apiBase() + `/get-visit?visit-id=${visitId}`
          ).its("body").then((body) => Visit.cast(body))
          .as("visit");
        });
        cy.get<Visit>("@visit").then((visit: Visit) => {

        });
      })
    });
  })
});
