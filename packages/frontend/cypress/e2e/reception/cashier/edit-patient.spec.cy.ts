import user from "@cypress/fixtures/patient-a.json";
import { Patient } from "myclinic-model";
import { addDays } from "kanjidate";
import { dateToSql, parseSqlDate } from "@/lib/util";
import { assertPatientDisp, assertPatientForm, dialogClose, fillPatientForm } from "./misc";
import { dialogOpen } from "@cypress/lib/dialog";

function modifyStr(s: string): string {
  return s + "変";
}

function modifyDate(s: string): string {
  const d: Date = parseSqlDate(s);
  return dateToSql(addDays(d, -7));
}

function modify(p: Patient): Patient {
  return new Patient(
    p.patientId,
    modifyStr(p.lastName),
    modifyStr(p.firstName),
    modifyStr(p.lastNameYomi),
    modifyStr(p.firstNameYomi),
    p.sex === "M" ? "F" : "M",
    modifyDate(p.birthday),
    modifyStr(p.address),
    p.phone + " 携帯"
  )
}

describe("Edit Patient", () => {
  let patient: Patient;

  before(() => {
    cy.request("POST", Cypress.env("API") + "/enter-patient", user).then((response) => {
      patient = Patient.cast(response.body);
      expect(patient.lastName).equal(user.lastName);
    })
  });

  it("should edit patient info", () => {
    cy.visit('/reception/');
    cy.get("form [data-cy=search-text-input]").type(patient.patientId.toString());
    cy.get("form [data-cy=search-button]").click();
    cy.get("[data-cy=dialog-title]").contains("患者情報");
    cy.get("[data-cy=edit-patient-link]").click();

    cy.get("[data-cy=dialog-title]").contains("患者情報編集");
    assertPatientForm(patient);
    const modified = modify(patient);
    fillPatientForm(modified);
    cy.get("button").contains("入力").click();
    cy.get("[data-cy=dialog-title]").contains("患者情報");
    assertPatientDisp(modified);
  });

  it.only("should return to patient dialog after Edit/cancel", () => {
    cy.visit("/reception/");
    cy.get("form [data-cy=search-text-input]").type("1");
    cy.get("form [data-cy=search-button]").click();
    dialogOpen("患者情報").within(() => {
      cy.get("a").contains("編集").click();
    });
    dialogOpen("患者情報編集").within(() => {
      cy.get("button").contains("キャンセル").click();
    });
    dialogClose("患者情報編集");
    dialogOpen("患者情報");
  });
});
