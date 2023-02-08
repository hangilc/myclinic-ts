import { clickSelectPatientLink, selectPatientMenu } from "@cypress/e2e/exam/exam-helper";
import { DiseaseEnterData, type Patient } from "myclinic-model";
import { dialogClose, newPatient, openedDialog, reqEnterDisease, SearchPatientDialog } from "../e2e-helper";
import byoumeiNames from "@cypress/fixtures/byoumei-names.json";
import { fillDateForm } from "@cypress/lib/form";

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

  it("should add disease", () => {
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

  it("should change tenki", () => {
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
        cy.get("[data-cy=disease-box]").within(() => {
          cy.get("[data-cy=tenki-link]").click();
        });
        cy.get("[data-cy=disease-tenki]").within(() => {
          cy.get(`input[data-disease-id=${diseaseId}]`).click();
          cy.get("[data-cy=week-link]").click();
          cy.get("button").contains("入力").click();
        });
        cy.get("[data-cy=edit-link]").click();
        cy.get("[data-cy=disease-edit]").within(() => {
          cy.get(`[data-cy=disease-list] [data-cy=disease-name][data-disease-id=${diseaseId}]`)
            .should("have.text", "急性咽頭炎");
          cy.get(`[data-cy=disease-list] [data-cy=disease-aux][data-disease-id=${diseaseId}]`)
            .should("have.text", "(治癒、R5.2.8 - R5.2.15)");
        })
      })
    })
  });

  it("should edit", () => {
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
        cy.get("[data-cy=disease-box]").within(() => {
          cy.get("[data-cy=edit-link]").click();
          cy.get("[data-cy=disease-edit]").within(() => {
            cy.get(`[data-cy=disease-list] [data-cy=disease-name][data-disease-id=${diseaseId}]`).click();
            cy.get("[data-cy=disease-edit-form] [data-cy=disease-name]").contains("急性咽頭炎");
            cy.get("[data-cy=end-date-input]").within(() => fillDateForm("2023-02-15"));
            cy.get(`[data-cy=end-reason-input][data-reason-code=C]`).click();
            cy.get("button").contains("入力").click();
          });
          cy.get("[data-cy=disease-edit] [data-cy=no-disease-selected]");
          cy.get("[data-cy=disease-edit]").within(() => {
            cy.get("[data-cy=disease-list] [data-cy=disease-name]").contains("急性咽頭炎");
            cy.get("[data-cy=disease-list] [data-cy=disease-aux]").contains("(治癒、R5.2.8 - R5.2.15)");
          });
        });
      })
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

