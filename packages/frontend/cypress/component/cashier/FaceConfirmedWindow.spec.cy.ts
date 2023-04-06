import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient } from "@cypress/lib/patient";
import type { Patient } from "myclinic-model";
import type { OnshiResult } from "onshi-result";

describe("FaceConfirmedWindow", () => {
  it("should mount", () => {
    const result: OnshiResult = createOnshiResult({}, {});
    cy.mount(FaceConfirmedWindow, { props: {
      destroy: () => {},
      result
    }});
  });

  it("should enter new hoken when none available", () => {
    createPatient().as("patient");
    cy.get<Patient>("@patient").then((patient) => {
      console.log(patient);
    })
  })
});
