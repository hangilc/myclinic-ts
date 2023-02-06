import { base } from "@/lib/api";
import Edit from "@/practice/exam/disease2/edit/Edit.svelte";
import { dialogClose, openedDialog } from "@cypress/e2e/reception/misc";
import { assertDateForm, fillDateForm } from "@cypress/lib/form";
import { ByoumeiMaster, Disease, DiseaseAdj, DiseaseData, DiseaseEndReason, ShuushokugoMaster } from "myclinic-model";

describe("Edit Disease", () => {
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
          [new DiseaseAdj(1, 1, 8002), new ShuushokugoMaster(8002, "の疑い")]
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

  it.only("should edit byoumeimaster of disease", () => {
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
        diseases,
        onDelete: (diseaseId: number) => {
          expect(diseaseId).equal(1);
        }
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").click();
    cy.get("[data-cy=disease-search-input]").type("急性気管支炎");
    cy.intercept(base + "/search-byoumei-master*", (req) => {
      const master = new ByoumeiMaster(2, "急性気管支炎");
      req.reply([master]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains("急性気管支炎").click();
    cy.get("[data-cy=disease-name]").contains("急性気管支炎の疑い");
  })
});