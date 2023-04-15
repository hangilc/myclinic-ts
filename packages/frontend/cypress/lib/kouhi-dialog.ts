// driver for KouhiDialog

import { fillDateForm } from "./form";

export class KouhiDialogDriver {
  setFutansha(futansha: string | number): void {
    const value: string = typeof futansha === "number" ? futansha.toString() : futansha;
    cy.get("input[data-cy=futansha-input]").clear().type(value);
  }

  setJukyuusha(jukyuusha: string | number): void {
    const value: string = typeof jukyuusha === "number" ? jukyuusha.toString() : jukyuusha;
    cy.get("input[data-cy=jukyuusha-input]").clear().type(value);
  }
  
  setValidFrom(validFrom: string | Date) {
    cy.get("[data-cy=valid-from-input]").within(() => fillDateForm(validFrom));
  }

  setValidUpto(validUpto: string | Date | null) {
    cy.get("[data-cy=valid-upto-input").within(() => fillDateForm(validUpto));
  }
}