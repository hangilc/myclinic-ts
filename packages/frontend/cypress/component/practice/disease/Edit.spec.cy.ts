import { base } from "@/lib/api";
import Edit from "@/practice/exam/disease2/edit/Edit.svelte";
import { dialogClose, openedDialog } from "@cypress/e2e/reception/misc";
import { assertDateForm, fillDateForm } from "@cypress/lib/form";
import { ByoumeiMaster, Disease, DiseaseAdj, DiseaseData, DiseaseEndReason, ShuushokugoMaster } from "myclinic-model";

describe("Edit Disease", () => {
  let suspMaster = new ShuushokugoMaster(8002, "の疑い");

  it("should mount", () => {
    cy.mount(Edit, {
      props: {
        diseases: []
      }
    })
  })

  it("should show diseases", () => {
    const diseases = [
      new DiseaseData(
        new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
        new ByoumeiMaster(1, "急性咽頭炎"),
        [
          [new DiseaseAdj(1, 1, 8002), new ShuushokugoMaster(8002, "の疑い")]
        ]
      )
    ];
    cy.mount(Edit, {
      props: {
        diseases
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").contains("急性咽頭炎の疑い");
    cy.get("[data-cy=disease-aux][data-disease-id=1]").contains("(継続、R4.2.1)");
  })

  it("should show edit form after clicking", () => {
    const diseases = [
      new DiseaseData(
        new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
        new ByoumeiMaster(1, "急性咽頭炎"),
        [
          [new DiseaseAdj(1, 1, 8002), suspMaster]
        ]
      )
    ];
    cy.mount(Edit, {
      props: {
        diseases
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").click();
    cy.get("[data-cy=disease-edit-form]").within(() => {
      cy.get("[data-cy=disease-name]").contains("急性咽頭炎の疑い");
      cy.get("[data-cy=start-date-input]").within(() => assertDateForm("2022-02-01"));
      cy.get("[data-cy=end-date-input]").within(() => assertDateForm("0000-00-00"));
      cy.get("[data-cy=end-reason-input]:checked")
        .should("have.attr", "data-reason-code", "N")
    });
  })

  it("should delete disease", () => {
    const diseases = [
      new DiseaseData(
        new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
        new ByoumeiMaster(1, "急性咽頭炎"),
        [
          [new DiseaseAdj(1, 1, 8002), new ShuushokugoMaster(8002, "の疑い")]
        ]
      )
    ];
    let deleted = false;
    cy.mount(Edit, {
      props: {
        diseases,
        onDelete: (diseaseId: number) => {
          expect(diseaseId).equal(1);
        }
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").click();
    console.log("base", base);
    cy.intercept(base + "/delete-disease-ex?*", (req) => {
      console.log("INTERCEPT");
      expect(req.query["disease-id"]).equal("1");
      deleted = true;
      req.reply("true");
    })
    cy.get("[data-cy=delete-link]").click();
    openedDialog("確認").within(() => {
      cy.get("[data-cy=text]").contains("この病名を削除していいですか？");
      cy.get("button").contains("はい").click();
    })
    dialogClose("確認");
    cy.wrap({}).then(() => expect(deleted).equal(true));
  })

  it("should edit byoumeimaster of disease", () => {
    const origMaster = new ByoumeiMaster(1, "急性咽頭炎");
    const updatedMaster = new ByoumeiMaster(2, "急性気管支炎")
    const diseases = [
      new DiseaseData(
        new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
        origMaster,
        [
          [new DiseaseAdj(1, 1, 8002), new ShuushokugoMaster(8002, "の疑い")]
        ]
      )
    ];
    cy.mount(Edit, {
      props: {
        diseases,
        onUpdate: (updated: DiseaseData) => {

        },
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").click();
    cy.get("[data-cy=disease-search-input]").type(updatedMaster.name);
    cy.intercept(base + "/search-byoumei-master*", (req) => {
      req.reply([updatedMaster]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains(updatedMaster.name).click();
    cy.get("[data-cy=disease-name]").contains(updatedMaster.name + "の疑い");
    let updated = false;
    cy.intercept("POST", base + "/update-disease-ex", (req) => {
      const [disease, adjCodes] = JSON.parse(req.body);
      expect(disease).deep.equal({
        diseaseId: 1,
        patientId: 1,
        shoubyoumeicode: updatedMaster.shoubyoumeicode,
        startDate: "2022-02-01",
        endDate: "0000-00-00",
        endReasonStore: "N"
      });
      expect(adjCodes).deep.equal([8002]);
      updated = true;
      req.reply("true");
    }).as("update")
    let queried = false;
    cy.intercept(base + "/get-disease-ex?*", (req) => {
      const diseaseId = req.query["disease-id"]
      expect(diseaseId).equal("1");
      queried = true;
      req.reply([
        new Disease(1, 1, 2, "2022-02-01", "0000-00-00", "N"),
        updatedMaster,
        [
          [new DiseaseAdj(1, 1, 8002), new ShuushokugoMaster(8002, "の疑い")]
        ]
      ]);
    }).as("query");
    cy.get("button").contains("入力").click();
    cy.get("@update").then(() => expect(updated).equal(true));
    cy.get("@query", { timeout: 10000 }).then(() => expect(queried).equal(true));
  })

  // it.only("should add shuushokugo", () => {
  //   const master = new ByoumeiMaster(1, "急性咽頭炎");
  //   const diseases = [
  //     new DiseaseData(
  //       new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
  //       master,
  //       [
  //       ]
  //     )
  //   ];
  //   cy.mount(Edit, {
  //     props: {
  //       diseases,
  //       onDelete: (diseaseId: number) => {
  //         expect(diseaseId).equal(1);
  //       }
  //     }
  //   });
  //   cy.get("[data-cy=disease-name][data-disease-id=1]").click();
  //   cy.get("[data-cy=search-shuushokugo-checkbox]").click();
  //   cy.get("[data-cy=disease-search-input]").type("の疑い");
  //   cy.intercept(base + "/search-shuushokugo-master*", (req) => {
  //     const text = req.query["text"];
  //     const at = req.query["at"];
  //     expect(text).equal("の疑い");
  //     expect(at).equal("2022-02-01");
  //     req.reply([
  //       suspMaster
  //     ])
  //   }).as("search");
  //   cy.get("button").contains("検索").click();
  //   cy.get("@search", { timeout: 10000 });
  //   cy.get("[data-cy=search-result-item]").contains("の疑い").click();
  //   cy.get("button").contains("入力").click();
  // })
});