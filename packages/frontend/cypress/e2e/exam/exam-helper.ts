export function clickSelectPatientLink() {
  cy.get("a").contains("患者選択").click();
}

export function selectPatientMenu(item: string) {
  cy.get("[data-cy=select-patient-menu]").contains(item).click();
}