export function fromToTime(from: string): string {
  return from + ":00";
}

export function untilToTime(until: string): string {
  return fromToTime(until);
}

export const AppointDialogDriver = {
  setPatientInput(s: string): void {
    cy.get("[data-cy=search-patient-input]").clear().type(s);
  },

  enter(): void {
    cy.get("button").contains("入力").click();
  }
}