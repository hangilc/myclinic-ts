import { dialogClose, dialogOpen } from "./dialog";

export const SearchPatientDialogDriver = {
  typeInput(text: string) {
    cy.get("[data-cy=search-text-input]").clear().type(text);
  },

  search() {
    cy.get("button").contains("検索").click();
  },

  getSearchResultByPatientId(patientId: number) {
    return cy.get(`[data-cy=search-result-item][data-patient-id=${patientId}]`);
  },

  select() {
    cy.get("button").contains("選択").click();
  }
}

export const ConfirmDriver = {
  yes(msg?: string) {
    dialogOpen("確認").within(() => {
      if( msg ){
        cy.get("[data-cy=text]").should("have.text", msg!);
      }
      cy.get("button").contains("はい").click();
    });
    dialogClose("確認");
  }
}