import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient, enterPatient } from "@cypress/lib/patient";
import { createShahokokuho } from "@cypress/lib/shahokokuho-mock";
import type { OnshiResult } from "onshi-result";
import { onshiCreationModifier as m } from "@cypress/lib/onshi-mock";
import { apiBase } from "@cypress/lib/base";
import { Patient, Shahokokuho, Visit } from "myclinic-model";
import { enterShahokokuho } from "@cypress/lib/shahokokuho";
import { confirmYesContainingMessage } from "@cypress/lib/confirm";
import { shahokokuhoOnshiConsistent } from "@/lib/hoken-onshi-consistent";

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
    cy.get<Patient>("@patient").then((patient) => {
      const shahokokuho = createShahokokuho({ patientId: patient.patientId });
      const result = createOnshiResult(m.patient(patient), m.shahokokuho(shahokokuho));
      expect(result.messageBody.resultList.length).equal(1);
      cy.intercept(
        "GET",
        apiBase() + "/search-patient?text=*",
        [10, [patient]]);
      const props = {
        destroy: () => { },
        result,
        onRegister: () => { }
      };
      cy.mount(FaceConfirmedWindow, { props });
      cy.get("[data-cy=message]").contains("新しい保険証");
      cy.get("button").contains("新規保険証登録").click();
      confirmYesContainingMessage("登録します");
      cy.get("[data-cy=message]").should("not.exist");
      cy.stub(props, "onRegister").as("onRegister");
      cy.get("button").contains("診察登録").click();
      cy.get("@onRegister").should("be.called");
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
        const shahokokuhoId = visit.shahokokuhoId;
        expect(shahokokuhoId).to.be.gt(0);
        cy.request("GET", apiBase() + "/get-shahokokuho?shahokokuho-id=" + shahokokuhoId)
          .its("body").then(body => Shahokokuho.cast(body)).as("shahokokuho");
      });
      cy.get<Shahokokuho>("@shahokokuho").then((shahokokuho) => {
        expect(shahokokuhoOnshiConsistent(shahokokuho, result.messageBody.resultList[0]))
      });
    });
  });

  it("should register patient with valid shahokokuho", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient: Patient) => {
      const shahokokuho = createShahokokuho({ patientId: patient.patientId });
      enterShahokokuho(shahokokuho).as("shahokokuho");
    });
    cy.get<Patient>("@patient").then((patient: Patient) => {
      cy.get<Shahokokuho>("@shahokokuho").then((shahokokuho: Shahokokuho) => {
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(shahokokuho))
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient]]);
        const props = {
          destroy: () => { },
          result,
          onRegister: () => { }
        };
        cy.mount(FaceConfirmedWindow, { props });
        cy.get("[data-cy=message]").should("not.exist");
        cy.get("button").contains("診察登録").should("exist");
      });
    });
  });
});

