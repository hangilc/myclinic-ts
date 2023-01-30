import user from "../../fixtures/patient-a.json"
import { toWareki } from "../../../src/lib/to-wareki";
import { parseSqlDate } from "../../../src/lib/util";
import { format, f1 } from "kanjidate";

describe('template spec', () => {
  it('enters a new patient', () => {
    const bday = parseSqlDate(user.birthday);
    const [gengou, nen] = toWareki(user.birthday);
    const s: string = format(f1, new Date());
    console.log(s);
    cy.visit('http://localhost:5173/vite/reception/');
    cy.get("[data-cy=test-flag]").contains("(Test-Client)");
    cy.get("button").contains("新規患者").click();
    cy.get("[data-cy=dialog-title").contains("新規患者入力");
    cy.get("[data-cy=last-name-input").type(user.lastName);
    cy.get("[data-cy=first-name-input").type(user.firstName);
    cy.get("[data-cy=last-name-yomi-input").type(user.lastNameYomi);
    cy.get("[data-cy=first-name-yomi-input").type(user.firstNameYomi);
    cy.get(".birthday-input [data-cy=gengou-select]").select(gengou);
    cy.get(".birthday-input [data-cy=nen-input]").type(nen.toString());
    cy.get(".birthday-input [data-cy=month-input]").type((bday.getMonth() + 1).toString());
    cy.get(".birthday-input [data-cy=day-input]").type(bday.getDate().toString());
    cy.get(`[data-cy=sex-input][value=${user.sex}]`).click();
    cy.get("[data-cy=address]").type(user.address);
    cy.get("[data-cy=phone]").type(user.phone);
    cy.get("button").contains("入力").click();
  })
})

export { };