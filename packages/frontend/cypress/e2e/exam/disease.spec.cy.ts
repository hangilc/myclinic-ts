import { clickSelectPatientLink, selectPatientMenu } from "@cypress/e2e/exam/exam-helper";
import { DiseaseEnterData, type Patient } from "myclinic-model";
import { dialogClose, newPatient, openedDialog, reqEnterDisease, SearchPatientDialog } from "../e2e-helper";
import byoumeiNames from "@cypress/fixtures/byoumei-names.json";

describe("Disease", () => {
  beforeEach(() => {
    cy.visit("/practice/");
  });

  it("should mount", () => {
    
  });

  it("should open disease", () => {
    openPatient(1);
  });

  it.only("should show current diseases", () => {
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
      openPatient(patient.patientId);
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