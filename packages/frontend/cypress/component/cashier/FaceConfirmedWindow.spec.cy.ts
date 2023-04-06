import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import type { OnshiResult } from "onshi-result";

describe("FaceConfirmedWindow", () => {
  it("should mount", () => {
    const result: OnshiResult = createOnshiResult({}, { ResultList: [{}]});
    cy.mount(FaceConfirmedWindow, { props: {
      destroy: () => {},
      result
    }});
  })
});
