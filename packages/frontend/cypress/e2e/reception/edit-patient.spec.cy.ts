import user from "@cypress/fixtures/patient-a.json";
import { Patient } from "myclinic-model";
import * as kanjidate from "kanjidate";
import { dateToSql, parseSqlDate } from "@/lib/util";

function modifyStr(s: string): string {
  return s + "変";
}

function modifyDate(s: string): string {
  const d: Date = parseSqlDate(s);
  return dateToSql(kanjidate.addDays(d, -7));
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
    cy.request("POST", "http://localhost:38080/api/enter-patient", user).then((response) => {
      patient = Patient.cast(response.body);
      expect(patient.lastName).equal(user.lastName);
    })
  });

  it("should edit patient info", () => {
    cy.visit('http://localhost:5173/vite/reception/');
    cy.get("form [data-cy=search-text-input]").type(patient.patientId.toString());
    cy.get("form [data-cy=search-button]").click();
    cy.get("[data-cy=dialog-title]").contains("患者情報");
    cy.get("[data-cy=edit-patient-link]").click();

    cy.get("[data-cy=dialog-title]").contains("患者情報編集");
    
  });
});

export {};
