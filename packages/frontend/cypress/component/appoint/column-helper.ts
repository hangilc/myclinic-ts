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

export const AppointPatientDriver = {

}

export function withAppointPatient(patientId: number,
  cb: (driver: typeof AppointPatientDriver) => void): void {
    cy.get(`[data-cy=appoint-patient][data-patient-id=${patientId}]`)
      .should("exist")
      .within(() => cb(AppointPatientDriver));
}