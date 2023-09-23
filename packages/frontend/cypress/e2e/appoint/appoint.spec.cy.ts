import { dateToSql } from "@/lib/util";
import { dialogOpen } from "@cypress/lib/dialog";
import { rangeOfWeek } from "./appoint-helper";
import { addDays } from "kanjidate";
import { ConfirmDriver } from "@cypress/lib/drivers";

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

  it("should batch add appoint times", () => {
    cy.visit("/appoint/?admin=true");
    cy.get("[data-cy=bars3-menu]").click();
    // cy.get("a").contains("予約枠わりあて").click();
    cy.get("[data-cy=alloc-appoints-link]").click();
    cy.get("[data-cy=appoint-time-block]").should("exist");
  });

  it("should make appointment", () => {
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

  it("should cancel appointment", () => {
    cy.visit("/appoint/");
    cy.get("[data-cy=appoint-time-block][data-is-vacant").first().as("slot", { type: "static" });
    cy.get("@slot").click();
    dialogOpen("診察予約入力").within(() => {
      cy.get("[data-cy=search-patient-input]").type("1");
      cy.get("[data-cy=search-icon]").click();
      cy.get("button").contains("入力").click();
    })
    cy.get("@slot").within(() => {
      cy.get("[data-cy=appoint-patient][data-patient-id=1]").click();
    });
    dialogOpen("診察予約編集").within(() => {
      cy.get("[data-cy=patient-id-disp]").should("have.text", "1");
      cy.get("button").contains("予約取消").click();
    });
    ConfirmDriver.yes("この予約を削除していいですか？");
    cy.get("@slot").within(() => {
      cy.get("[data-cy=appoint-patient][data-patient-id=1]").should("not.exist");
    });
    cy.get("@slot").should("have.attr", "data-is-vacant");
  });

  it("should move to next week", () => {
    cy.visit("/appoint/");
    const [start, _last] = rangeOfWeek(new Date());
    cy.get("button").contains("次の週").click();
    const d = addDays(start, 8);
    cy.get(`[data-cy=appoint-column][data-date='${dateToSql(d)}']`).should("exist");
  })

  it("should move to next month", () => {
    cy.visit("/appoint/");
    const [start, _last] = rangeOfWeek(new Date());
    cy.get("button").contains("次の月").click();
    const d = addDays(start, 29);
    cy.get(`[data-cy=appoint-column][data-date='${dateToSql(d)}']`).should("exist");
  })

  it("should move to prev week", () => {
    cy.visit("/appoint/");
    const [start, _last] = rangeOfWeek(new Date());
    cy.get("button").contains("前の週").click();
    const d = addDays(start, -7+1);
    cy.get(`[data-cy=appoint-column][data-date='${dateToSql(d)}']`).should("exist");
  })

  it("should move to prev month", () => {
    cy.visit("/appoint/");
    const [start, _last] = rangeOfWeek(new Date());
    cy.get("button").contains("前の月").click();
    const d = addDays(start, -28+1);
    cy.get(`[data-cy=appoint-column][data-date='${dateToSql(d)}']`).should("exist");
  })
})