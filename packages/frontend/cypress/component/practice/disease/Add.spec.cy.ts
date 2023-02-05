import { base } from "@/lib/api";
import Add from "@/practice/exam/disease2/add/Add.svelte";
import { ByoumeiMaster } from "myclinic-model";

describe("Disease Add", () => {
  it("should mount", () => {
    cy.mount(Add, {
      props: {
        patientId: 1
      }
    })
  });

  it("should search byoumei", () => {
    cy.mount(Add, {
      props: {
        patientId: 1
      }
    })
    cy.get("[data-cy=disease-search-input]").type("急性咽頭炎");
    cy.intercept(base + "/search-byoumei-master*", (req) => {
      const text = req.query["text"];
      const at = req.query["at"];
      expect(text).equal("急性咽頭炎");
      const master = new ByoumeiMaster(1, "急性咽頭炎");
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("急性咽頭炎");
  });
});