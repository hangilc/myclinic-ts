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

export function fillDateForm(date: Date | string | null) {
  if (date === null || date === "0000-00-00") {
    cy.get("[data-cy=nen-input]").clear();
    cy.get("[data-cy=month-input]").clear();
    cy.get("[data-cy=day-input]").clear();
  } else {
    const d = toKanjiDate(date);
    cy.get("[data-cy=gengou-select]").select(d.gengou);
    cy.get("[data-cy=nen-input]").clear();
    cy.get("[data-cy=month-input]").clear();
    cy.get("[data-cy=day-input]").clear();
    cy.get("[data-cy=nen-input]").type(d.nen.toString());
    cy.get("[data-cy=month-input]").type(d.month.toString());
    cy.get("[data-cy=day-input]").type(d.day.toString());
  }
}

