import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient, enterPatient } from "@cypress/lib/patient";
import { createShahokokuho } from "@cypress/lib/shahokokuho-mock";
import type { OnshiResult } from "onshi-result";

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
    enterPatient(patientTemplate).as("patient");
    const hokenTemplate = createShahokokuho();
    
  })
});
