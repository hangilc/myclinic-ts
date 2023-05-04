import Current from "@/practice/exam/disease/Current.svelte";
import { ByoumeiMaster, Disease, DiseaseAdj, DiseaseData, ShuushokugoMaster } from "myclinic-model";

describe("Current Disease", () => {
  it("should mount", () => {
    cy.mount(Current, {
      props: {
        list: []
      }
    })
  })

  it("should show diseases", () => {
    cy.mount(Current, {
      props: {
        list: diseaseList1
      }
    })
    cy.get("[data-cy=disease-item][data-disease-id=1]").within(() => {
      cy.get("[data-cy=disease-name]").should("have.text", "急性咽頭炎");
      cy.get("[data-cy=disease-aux]").should("have.text", "(R4.1.8)")
    })
    cy.get("[data-cy=disease-item][data-disease-id=2]").within(() => {
      cy.get("[data-cy=disease-name]").should("have.text", "アレルギー性鼻炎の疑い");
      cy.get("[data-cy=disease-aux]").should("have.text", "(R4.1.10)")
    })
  })

  it("should select disease", () => {
    const select = new Cypress.Promise((resolve) => {
      cy.mount(Current, {
        props: {
          list: diseaseList1,
          onSelect: resolve
        }
      })
    });
    cy.get("[data-cy=disease-item][data-disease-id=1]").click();
    cy.wrap(select).then(d => {
      expect(d).deep.equal(diseaseList1[0]);
    })
  })
})

const susp = new ShuushokugoMaster(8002, "の疑い");

const diseaseList1: DiseaseData[] = [
  new DiseaseData(
    new Disease(1, 1, 1, "2022-01-08", "0000-00-00", "N"),
    new ByoumeiMaster(1, "急性咽頭炎"),
    []
  ),
  new DiseaseData(
    new Disease(2, 1, 2, "2022-01-10", "0000-00-00", "N"),
    new ByoumeiMaster(2, "アレルギー性鼻炎"),
    [[new DiseaseAdj(1,2, susp.shuushokugocode), susp]]
  ),
]