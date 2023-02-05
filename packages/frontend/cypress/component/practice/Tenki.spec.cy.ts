import { dateToSql, parseSqlDate } from "@/lib/util";
import Tenki from "@/practice/exam/disease2/Tenki.svelte";
import { assertDateForm, fillDateForm } from "@cypress/lib/form";
import { addDays, lastDayOfMonth } from "kanjidate";
import { ByoumeiMaster, Disease, DiseaseData, DiseaseEndReason } from "myclinic-model";

describe("Tenki (disease)", () => {
  let disease1 = new DiseaseData(
    new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
    new ByoumeiMaster(1, "高血圧症"),
    []
  )

  let diseases: DiseaseData[] = [disease1];

  it("should handle date modification", () => {
    const today = new Date();
    cy.mount(Tenki, {
      props: {
        diseases,
        onEnter: _ => { }
      }
    });
    cy.get("[data-cy=end-date-input]").within(() => {
      assertDateForm(today);
    });
    cy.get("a").contains("週").click();
    cy.get("[data-cy=end-date-input]").within(() => {
      assertDateForm(addDays(today, 7));
    });
    cy.get("a").contains("今日").click();
    cy.get("[data-cy=end-date-input]").within(() => {
      assertDateForm(today);
    });
    cy.get("a").contains("週").click({ shiftKey: true });
    cy.get("[data-cy=end-date-input]").within(() => {
      assertDateForm(addDays(today, -7));
    });
    const testDay = new Date("2023-02-01");
    cy.get("[data-cy=end-date-input]").within(() => {
      fillDateForm(testDay);
    });
    cy.get("a").contains("月末").click({ shiftKey: true });
    cy.get("[data-cy=end-date-input]").within(() => {
      const d = lastDayOfMonth(testDay.getFullYear(), testDay.getMonth() + 1);
      const last = new Date(testDay);
      last.setDate(d);
      assertDateForm(last);
    });
    cy.get("a").contains("先月末").click({ shiftKey: true });
    cy.get("[data-cy=end-date-input]").within(() => {
      const d = new Date(today)
      d.setDate(0);
      assertDateForm(d);
    });
  });

  it("should set end date according to selected disease", () => {
    const today = new Date();
    cy.mount(Tenki, {
      props: {
        diseases,
        onEnter: _ => { }
      }
    });
    cy.get(`input[type=checkbox][data-disease-id=${disease1.disease.diseaseId}]`).check();
    cy.get("[data-cy=end-date-input]").within(() => {
      const d = parseSqlDate(disease1.disease.startDate);
      assertDateForm(d);
    });
    cy.get(`input[type=checkbox][data-disease-id=${disease1.disease.diseaseId}]`).click();
    cy.get("[data-cy=end-date-input]").within(() => {
      assertDateForm(today);
    });
  })

  it("should disable/enable enter button", () => {
    cy.mount(Tenki, {
      props: {
        diseases,
        onEnter: _ => { }
      }
    });
    cy.get("button").contains("入力").should("be.disabled");
    cy.get(`input[type=checkbox][data-disease-id=${disease1.disease.diseaseId}]`).check();
    cy.get("button").contains("入力").should("not.be.disabled");
  });

  it.only("should enter", () => {
    const endDate = addDays(parseSqlDate(disease1.disease.startDate), 30);
    cy.mount(Tenki, {
      props: {
        diseases,
        onEnter: (args: [number, string, string][]) => {
          expect(args).lengthOf(1);
          expect(args).deep.equal([
            [disease1.disease.diseaseId, dateToSql(endDate), DiseaseEndReason.Cured.code], 
          ])
        }
      }
    });
    cy.get(`input[type=checkbox][data-disease-id=${disease1.disease.diseaseId}]`).check();
    cy.get("[data-cy=end-date-input]").within(() => {
      fillDateForm(endDate);
    });
    cy.get("[data-cy=end-date-input]").within(() => {
      assertDateForm(endDate);
    });
    cy.get("button").contains("入力").click();
  });

})