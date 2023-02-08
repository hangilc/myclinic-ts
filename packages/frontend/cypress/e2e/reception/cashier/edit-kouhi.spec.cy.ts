import { Kouhi, type Patient } from "myclinic-model";
import { assertKouhiForm, dialogClose, dialogOpen, fillKouhiForm, newPatient, newKouhi, openPatientDialog, patientDialogClose } from "./misc";
import { enter, update } from "@cypress/fixtures/kouhi-set.json";

describe("Edit Kouhi", () => {
  let patient: Patient;
  let orig: Kouhi;

  before(() => {
    newPatient()
      .then(p => {
        patient = p;
        update.patientId = patient.patientId;
        return newKouhi(patient.patientId, enter)
      })
      .then(h => orig = h);
  })

  it("should modify existing kouhi data", () => {
    expect(patient.patientId).to.be.greaterThan(0);
    expect(orig.kouhiId).to.be.greaterThan(0);
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("[data-cy=current-hoken]").click();
    patientDialogClose();
    dialogOpen("公費情報");
    cy.get("button").contains("編集").click();
    dialogClose("公費情報");
    dialogOpen("公費編集");
    assertKouhiForm(patient, orig);
    const m = Kouhi.cast(update);
    m.kouhiId = orig.kouhiId;
    fillKouhiForm(m);
    cy.get("button").contains("入力").click();
    dialogClose("公費編集");
    dialogOpen("公費情報");
    cy.request(Cypress.env("API") + `/get-kouhi?kouhi-id=${orig.kouhiId}`)
      .its("body")
      .then((response) => {
        const r = Kouhi.cast(response);
        expect(r).deep.equal(m);
      });
    cy.once("window:confirm", (msg) => {
      expect(msg).equal("この保険を削除していいですか？");
    });
    cy.get("a").contains("削除").click();
    dialogClose("公費情報");
    dialogOpen("患者情報");
    cy.get("[data-cy=current-hoken]").should("not.exist");
  })
})
