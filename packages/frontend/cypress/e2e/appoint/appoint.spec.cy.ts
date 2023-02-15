import { dateToSql } from "@/lib/util";
import { dialogOpen } from "@cypress/lib/dialog";
import { rangeOfWeek } from "./appoint-helper";

describe("Appoint", () => {
  before(() => {
    const [start, last] = rangeOfWeek(new Date())
      .map(d => dateToSql(d));
    cy.request(Cypress.env("API") + `/fill-appoint-times?from=${start}&upto=${last}`).as("fill");
    cy.get("@fill");
  })

  it("should visit", () => {
    cy.visit("/appoint/");
  });

  it("should batch adde appoint times", () => {
    cy.visit("/appoint/?admin=true");
    cy.get("[data-cy=bars3-menu]").click();
    cy.get("[data-cy=alloc-appoints-link]").click();
    cy.get("[data-cy=appoint-time-block]").should("exist");
  });

  it.only("should make appointment", () => {
    cy.visit("/appoint/");
    cy.get("[data-cy=appoint-time-block][data-is-vacant").first().as("slot", { type: "static" });
    cy.get("@slot").click();
    dialogOpen("診察予約入力").within(() => {
      cy.get("[data-cy=search-patient-input]").type("1");
      cy.get("[data-cy=search-icon]").click();
      cy.get("button").contains("入力").click();
    })
    cy.get("@slot").within(() => {
      cy.get("[data-cy=appoint-patient][data-patient-id=1]").should("exist");
    })

  });
})