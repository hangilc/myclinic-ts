import { toKanjiDate } from "@/lib/to-kanjidate";

export function assertDateForm(date: Date | string | null) {
  if (date === null || date === "0000-00-00") {
    cy.get("[data-cy=nen-input]").should("have.value", "");
    cy.get("[data-cy=month-input]").should("have.value", "");
    cy.get("[data-cy=day-input]").should("have.value", "");
  } else {
    const d = toKanjiDate(date);
    cy.get("[data-cy=gengou-select]").should("have.value", d.gengou)
    cy.get("[data-cy=nen-input]").should("have.value", d.nen.toString());
    cy.get("[data-cy=month-input]").should("have.value", d.month.toString());
    cy.get("[data-cy=day-input]").should("have.value", d.day.toString());
  }
}

