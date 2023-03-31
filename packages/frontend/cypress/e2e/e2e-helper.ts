import patientTmpl from "@cypress/fixtures/patient-a.json";
import { DiseaseEnterData, Patient } from "myclinic-model";

export function dialogOpen(title: string) {
  return cy.get("[data-cy=dialog-title]").contains(title);
}

export function openedDialog(title: string) {
  return cy.get("[data-cy=dialog]").within((d) => {
    dialogOpen(title);
    return d;
  })
}

export function dialogClose(title: string) {
  function findTitle($e: JQuery<HTMLElement>): boolean {
    for (let i = 0; i < $e.length; i++) {
      if ($e[i].innerText === title) {
        return true;
      }
    }
    return false;
  }
  doesNotExist("[data-cy=dialog]", findTitle);
}

export function doesNotExist(selector: string, pred: (e: JQuery<HTMLElement>) => boolean = _ => true) {
  cy.get("body").should(($body) => {
    let found = false;
    $body.find(selector).each((_i, e) => {
      if (pred(Cypress.$(e))) {
        found = true;
      }
    })
    expect(found).to.be.false
  })
}

export function newPatient(user?: any) {
  user = user || patientTmpl;
  return cy.request("POST", Cypress.env("API") + "/enter-patient", user)
    .then((response) => Patient.cast(response.body))
}

export const SearchPatientDialog = {
  fillSearchTextInput(text: string) {
    cy.get("[data-cy=search-text-input]").clear().type(text);
  },

  search() {
    cy.get("button").contains("検索").click();
  },

  selectItem(patientId: number) {
    cy.get(`[data-cy=patient-item][data-patient-id=${patientId}]`).click();
  },

  select() {
    cy.get("button").contains("選択").click();
  }
}

export function reqEnterDisease(data: DiseaseEnterData): Cypress.Chainable<number> {
  return cy.request("POST", Cypress.env("API") + "/enter-disease-ex", data)
    .its("body")
    .then(body => +body);
}

