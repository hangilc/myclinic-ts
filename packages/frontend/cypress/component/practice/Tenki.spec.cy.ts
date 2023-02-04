import Tenki from "@/practice/exam/disease2/Tenki.svelte";
import { assertDateForm } from "@cypress/lib/form";
import { addDays, lastDayOfMonth } from "kanjidate";
import { ByoumeiMaster, Disease, DiseaseData } from "myclinic-model";

describe("Tenki (disease)", () => {
  let diseases: DiseaseData[] = [
    new DiseaseData(
      new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
      new ByoumeiMaster(1, "高血圧症"),
      []
    )
  ];
  it("mounts", () => {
    const today = new Date();
    cy.mount(Tenki, {
      props: {
        diseases,
        doMode: (mode: string) => {}
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
    cy.get("a").contains("月末").click({ shiftKey: true });
    cy.get("[data-cy=end-date-input]").within(() => {
      const d = lastDayOfMonth(today.getFullYear(), today.getMonth() + 1);
      const last = new Date(today);
      last.setDate(d);
      assertDateForm(last);
    });
    cy.get("a").contains("先月末").click({ shiftKey: true });
    cy.get("[data-cy=end-date-input]").within(() => {
      const d = new Date(today)
      d.setDate(0);
      assertDateForm(d);
    });
  })
})