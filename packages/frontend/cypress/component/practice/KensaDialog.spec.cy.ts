import KensaDialog from "@/practice/exam/record/shinryou/KensaDialog.svelte";
import { dialogOpen } from "@cypress/lib/dialog";
import { getShinryhouKensa } from "@cypress/lib/shinryou";
import { startVisit, getVisitEx } from "@cypress/lib/visit";
import type { VisitEx, Visit } from "myclinic-model";

describe("KensaDialog", () => {
  beforeEach(() => {
    cy.viewport(800, 600);
  });

  it("should respond to cancel click", () => {
    startVisit(1, new Date()).as("visit");
    cy.get<Visit>("@visit").then(visit => {
      getVisitEx(visit.visitId).as("visitEx");
    });
    getShinryhouKensa().as("kensa");
    cy.get<VisitEx>("@visitEx").then(visitEx => {
      cy.get<Record<string, string[]>>("@kensa").then(kensa => {
        const props = {
          destroy: () => {},
          visit: visitEx,
          kensa
        };
        cy.spy(props, "destroy").as("destroy");
        cy.mount(KensaDialog, { props });
        dialogOpen("検査入力").within(() => {
          cy.get("button").contains("キャンセル").click();
        });
        cy.get("@destroy").should("be.called");
      })
    });
  })
})