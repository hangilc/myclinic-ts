import { getBase } from "@/lib/api";
import Add from "@/practice/exam/disease2/add/Add.svelte";
import { fillDateForm } from "@cypress/lib/form";
import { ByoumeiMaster, DiseaseEnterData, ShuushokugoMaster } from "myclinic-model";

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
    cy.intercept(Cypress.env("API") + "/search-byoumei-master*", (req) => {
      const text = req.query["text"];
      // const at = req.query["at"];
      expect(text).equal("急性咽頭炎");
      const master = new ByoumeiMaster(1, "急性咽頭炎");
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("急性咽頭炎");
  });

  it("should search shuushokugo", () => {
    cy.mount(Add, {
      props: {
        patientId: 1
      }
    })
    cy.get("input[type=radio][value=shuushokugo]").click();
    cy.get("[data-cy=disease-search-input]").type("急性");
    cy.intercept(Cypress.env("API") + "/search-shuushokugo-master*", (req) => {
      const text = req.query["text"];
      // const at = req.query["at"];
      expect(text).equal("急性");
      const master = new ShuushokugoMaster(1, "急性");
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("急性");
  });

  it("should set byoumei", () => {
    cy.mount(Add, {
      props: {
        patientId: 1
      }
    })
    cy.get("[data-cy=disease-search-input]").type("急性咽頭炎");
    cy.intercept(Cypress.env("API") + "/search-byoumei-master*", (req) => {
      const master = new ByoumeiMaster(1, "急性咽頭炎");
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("急性咽頭炎").click();
    cy.get("[data-cy=disease-name]").contains("急性咽頭炎");
  });

  it("should set byoumei with shuushokugo", () => {
    cy.mount(Add, {
      props: {
        patientId: 1
      }
    })
    cy.get("[data-cy=disease-search-input]").type("急性咽頭炎");
    cy.intercept(Cypress.env("API") + "/search-byoumei-master*", (req) => {
      const master = new ByoumeiMaster(1, "急性咽頭炎");
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("急性咽頭炎").click();
    cy.get("input[type=radio][value=shuushokugo]").click();
    cy.get("[data-cy=disease-search-input]").clear().type("の疑い");
    cy.intercept(Cypress.env("API") + "/search-shuushokugo-master*", (req) => {
      const master = new ShuushokugoMaster(8002, "の疑い")
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("の疑い").click();
    cy.get("[data-cy=disease-name]").contains("急性咽頭炎の疑い");
  });

  it("should enter disease", () => {
    let startDate = new Date("2023-02-01");
    cy.mount(Add, {
      props: {
        patientId: 1,
        onEnter: (data: DiseaseEnterData) => {
          console.log(data);
          expect(data).deep.equal({
            patientId: 1,
            byoumeicode: 1,
            startDate: "2023-02-01",
            adjCodes: [8002]
          })
        }
      }
    })
    cy.get("div.start-date-wrapper").within(() => {
      fillDateForm(startDate);
    });
    cy.get("[data-cy=disease-search-input]").type("急性咽頭炎");
    cy.intercept(getBase() + "/search-byoumei-master*", (req) => {
      const master = new ByoumeiMaster(1, "急性咽頭炎");
      req.reply([master]);
    }).as("searchByoumei");
    cy.get("button").contains("検索").click();
    cy.wait("@searchByoumei");
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("急性咽頭炎").click();
    cy.get("input[type=radio][value=shuushokugo]").click();
    cy.get("[data-cy=disease-search-input]").clear().type("の疑い");
    cy.intercept(getBase() + "/search-shuushokugo-master*", (req) => {
      const master = new ShuushokugoMaster(8002, "の疑い")
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("の疑い").click();
    cy.get("[data-cy=disease-name]").contains("急性咽頭炎の疑い");
    cy.get("button").contains("入力").click();
  });

});