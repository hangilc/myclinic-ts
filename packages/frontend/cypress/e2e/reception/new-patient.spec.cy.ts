import user from "../../fixtures/patient-a.json"
import { toKanjiDate } from "@/lib/to-kanjidate";
import { format, f2 } from "kanjidate";

describe('template spec', () => {
  it('enters a new patient', () => {
    const bd = toKanjiDate(user.birthday);
    cy.visit('http://localhost:5173/vite/reception/');
    cy.get("[data-cy=test-flag]").contains("(Test-Client)");
    cy.get("button").contains("新規患者").click();
    cy.get("[data-cy=dialog-title").contains("新規患者入力");
    cy.get("[data-cy=last-name-input").type(user.lastName);
    cy.get("[data-cy=first-name-input").type(user.firstName);
    cy.get("[data-cy=last-name-yomi-input").type(user.lastNameYomi);
    cy.get("[data-cy=first-name-yomi-input").type(user.firstNameYomi);
    cy.get(".birthday-input [data-cy=gengou-select]").select(bd.gengou);
    cy.get(".birthday-input [data-cy=nen-input]").type(bd.nen.toString());
    cy.get(".birthday-input [data-cy=month-input]").type(bd.month.toString());
    cy.get(".birthday-input [data-cy=day-input]").type(bd.day.toString());
    cy.get(`[data-cy=sex-input][value=${user.sex}]`).click();
    cy.get("[data-cy=address]").type(user.address);
    cy.get("[data-cy=phone]").type(user.phone);
    cy.get("button").contains("入力").click();

    cy.get("[data-cy=dialog-title]").contains("患者情報");
    cy.get("[data-cy=patient-id]").should(($e) => {
      const t = $e.text();
      expect(t).match(/^[1-9][0-9]*$/);
    });
    cy.get("[data-cy=last-name]").contains(user.lastName);
    cy.get("[data-cy=first-name]").contains(user.firstName);
    cy.get("[data-cy=last-name-yomi]").contains(user.lastNameYomi);
    cy.get("[data-cy=first-name-yomi]").contains(user.firstNameYomi);
    cy.get("[data-cy=birthday]").contains(format(f2, user.birthday));
    cy.get("[data-cy=sex]").contains(user.sex === "M" ? "男性" : "女性");
    cy.get("[data-cy=address]").contains(user.address);
    cy.get("[data-cy=phone]").contains(user.phone);
  })
})
