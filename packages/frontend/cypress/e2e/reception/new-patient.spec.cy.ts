import user from "../../fixtures/patient-a.json"
import { toKanjiDate } from "@/lib/to-kanjidate";
import { format, f2 } from "kanjidate";
import { assertPatientDisp, fillPatientForm } from "./misc";
import { Patient } from "myclinic-model";

describe('New Patient', () => {
  it('enters a new patient', () => {
    const bd = toKanjiDate(user.birthday);
    cy.visit('http://localhost:5173/vite/reception/');
    cy.get("[data-cy=test-flag]").contains("(Test-Client)");
    cy.get("button").contains("新規患者").click();
    fillPatientForm(Patient.cast(user));
    cy.get("button").contains("入力").click();

    cy.get("[data-cy=dialog-title]").contains("患者情報");
    assertPatientDisp(Patient.cast(user));
  })
})
