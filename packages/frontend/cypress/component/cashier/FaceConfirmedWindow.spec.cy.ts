import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient, enterPatient } from "@cypress/lib/patient";
import { createShahokokuho } from "@cypress/lib/shahokokuho-mock";
import type { OnshiResult } from "onshi-result";
import { onshiCreationModifier as m } from "@cypress/lib/onshi-mock";

describe("FaceConfirmedWindow", () => {
  it("should mount", () => {
    const result: OnshiResult = createOnshiResult();
    cy.mount(FaceConfirmedWindow, { props: {
      destroy: () => {},
      result
    }});
  });

  it("should enter new hoken when none available", () => {
    const patientTemplate = createPatient();
    cy.log(JSON.stringify(patientTemplate, undefined, 2));
    enterPatient(patientTemplate).as("patient");
    const shahokokuhoTemplate = createShahokokuho();
    const result = createOnshiResult(h => h, m.patient(patientTemplate), m.shahokokuho(shahokokuhoTemplate));
    cy.log(JSON.stringify(result, undefined, 2));
    cy.mount(FaceConfirmedWindow, { props: {
      destroy: () => {},
      result,
    }});
  })
});
