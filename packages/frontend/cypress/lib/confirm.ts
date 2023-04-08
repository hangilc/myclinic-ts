import { dialogClose, dialogOpen } from "./dialog";

export function confirmYes(message?: string) {
  dialogOpen("確認").within(() => {
    if (message) {
      cy.get("[data-cy=text]").should("have.text", message);
    }
    cy.get("button").contains("はい").click();
  });
  dialogClose("確認");
}

export function confirmYesContainingMessage(message: string) {
  dialogOpen("確認").within(() => {
    cy.get("[data-cy=text]").contains(message);
    cy.get("button").contains("はい").click();
  });
  dialogClose("確認");
}

export function confirmCancel(message?: string) {
  dialogOpen("確認").within(() => {
    if (message) {
      cy.get("[data-cy=text]").should("have.text", message);
    }
    cy.get("button").contains("キャンセル").click();
  });
  dialogClose("確認");
}


