import { clickSelectPatientLink, selectPatientMenu } from "@cypress/e2e/exam/exam-helper";
import { DiseaseEnterData, type Patient } from "myclinic-model";
import { dialogClose, newPatient, openedDialog, reqEnterDisease, SearchPatientDialog } from "../e2e-helper";
import byoumeiNames from "@cypress/fixtures/byoumei-names.json";

describe("Disease", () => {
  beforeEach(() => {
    cy.visit("/practice/");
  });

  it("should open disease", () => {
    openPatient(1);
  });

  it("should show current diseases", () => {
    newPatient().as("patient");
    cy.get<Patient>("@patient").then((patient) => {
      return reqEnterDisease(new DiseaseEnterData(
        patient.patientId,
        byoumeiNames.急性咽頭炎,
        "2023-02-08",
        []
      ))
    }).as("diseaseId");
    cy.get<Patient>("@patient").then((patient) => {
      cy.get<number>("@diseaseId").then((diseaseId) => {
        openPatient(patient.patientId);
        cy.get("[data-cy=disease-current]");
        cy.get(`[data-cy=disease-item][data-disease-id=${diseaseId}]`).click();
        cy.get("[data-cy=disease-edit]");
        cy.get("[data-cy=disease-edit-form] [data-cy=disease-name]").should("have.text", "急性咽頭炎");
      })
    })
  });

  it.only("should add disease", () => {
    newPatient().as("patient");
    cy.get<Patient>("@patient").then((patient) => {
      openPatient(patient.patientId);
      cy.get("[data-cy=disease-box]").within(() => {
        cy.get("[data-cy=add-link]").click();
        cy.get("[data-cy=disease-add]").within(() => {
          cy.get("[data-cy=search-result] [data-cy=search-result-item] [data-result-kind=example]")
            .contains("アレルギー性鼻炎").click();
          cy.get("button").contains("入力").click();
        });
        cy.get("[data-cy=disease-add] [data-cy=disease-name]").should("have.text", "");
        cy.get("[data-cy=current-link]").click();
        cy.get("[data-cy=disease-current]").within(() => {
          cy.get("[data-cy=disease-name]").contains("アレルギー性鼻炎");
        });
      });
    })
  });
})

function openPatient(patientId: number) {
  clickSelectPatientLink();
  selectPatientMenu("患者検索");
  openedDialog("患者検索").within(() => {
    SearchPatientDialog.fillSearchTextInput(patientId.toString());
    SearchPatientDialog.search();
    SearchPatientDialog.selectItem(patientId);
    SearchPatientDialog.select();
  });
  dialogClose("患者検索");
}