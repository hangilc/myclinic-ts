import { Koukikourei, type Patient } from "myclinic-model";
import { assertKoukikoureiForm, dialogClose, dialogOpen, fillKoukikoureiForm, newPatient, newKoukikourei, openPatientDialog, patientDialogClose } from "./misc";
import { enter, update } from "@cypress/fixtures/koukikourei-set.json";

describe("Edit Koukikourei", () => {
  let patient: Patient;
  let orig: Koukikourei;

  before(() => {
    newPatient()
      .then(p => {
        patient = p;
        update.patientId = patient.patientId;
        return newKoukikourei(patient.patientId, enter)
      })
      .then(h => orig = h);
  })

  it("should modify existing koukikourei data", () => {
    expect(patient.patientId).to.be.greaterThan(0);
    expect(orig.koukikoureiId).to.be.greaterThan(0);
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("[data-cy=current-hoken]").click();
    patientDialogClose();
    dialogOpen("後期高齢情報");
    cy.get("button").contains("編集").click();
    dialogClose("後期高齢情報");
    dialogOpen("後期高齢編集");
    assertKoukikoureiForm(patient, orig);
    const m = Koukikourei.cast(update);
    m.koukikoureiId = orig.koukikoureiId;
    fillKoukikoureiForm(m);
    cy.get("button").contains("入力").click();
    dialogClose("後期高齢編集");
    dialogOpen("後期高齢情報");
    cy.request(Cypress.env("API") + `/get-koukikourei?koukikourei-id=${orig.koukikoureiId}`)
      .its("body")
      .then((response) => {
        const r = Koukikourei.cast(response);
        expect(r).deep.equal(m);
      });
    cy.on("window:confirm", (msg) => {
      expect(msg).equal("この保険を削除していいですか？");
    });
    cy.get("a").contains("削除").click();
    dialogClose("後期高齢情報");
    dialogOpen("患者情報");
    cy.get("[data-cy=current-hoken]").should("not.exist");
  })
})
