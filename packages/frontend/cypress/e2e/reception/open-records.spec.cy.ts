import { dialogClose, dialogOpen } from "./misc";

describe("Open Records", () => {

  it("should open records selection", () => {
    cy.visit("/reception/");
    cy.get("a").contains("診療録").click();
    cy.get("a").contains("患者検索");
    cy.get("a").contains("最近の診察");
    cy.get("a").contains("日付別");
    cy.get("a").contains("患者検索").click();
    dialogOpen("診療録（患者検索）");
    cy.get("button").contains("キャンセル").click();
    dialogClose("診療録（患者検索）");
    cy.get("a").contains("診療録").click();
    cy.get("a").contains("最近の診察").click();
    dialogOpen("診療録（最近の診察）");
    cy.get("button").contains("キャンセル").click();
    dialogClose("診療録（最近の診察）");
    cy.get("a").contains("診療録").click();
    cy.get("a").contains("日付別").click();
    dialogOpen("診療録（日付別）");
    cy.get("button").contains("キャンセル").click();
    dialogClose("診療録（日付別）");
  })
})

export {}