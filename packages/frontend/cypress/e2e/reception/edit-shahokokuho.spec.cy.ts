import { Shahokokuho, type Patient } from "myclinic-model";
import { assertShahokokuhoForm, dialogClose, dialogOpen, fillShahokokuhoForm, newPatient, newShahokokuho, openPatientDialog, patientDialogClose } from "./misc";
import { addDays } from "kanjidate";
import { dateToSql, parseSqlDate } from "@/lib/util";

function modify(h: Shahokokuho): Shahokokuho {
  return new Shahokokuho(
    h.shahokokuhoId,
    h.patientId,
    h.hokenshaBangou - 1,
    h.hihokenshaBangou + "変",
    h.hihokenshaBangou + "変",
    h.honninStore === 0 ? 1 : 0,
    dateToSql(addDays(parseSqlDate(h.validFrom), 7)),
    "0000-00-00",
    h.koureiStore === 0 ? 1 : 0,
    h.edaban
  );
}

describe("Edit Shahokokuho", () => {
  let patient: Patient;
  let orig: Shahokokuho;

  before(() => {
    newPatient()
      .then(p => {
        patient = p;
        return newShahokokuho(patient.patientId)
      })
      .then(h => orig = h);
  })

  it("should modify existing shahokokuho data", () => {
    expect(patient.patientId).to.be.greaterThan(0);
    expect(orig.shahokokuhoId).to.be.greaterThan(0);
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
    cy.get("[data-cy=current-hoken]").click();
    patientDialogClose();
    dialogOpen("社保国保情報");
    cy.get("button").contains("編集").click();
    dialogClose("社保国保情報");
    dialogOpen("社保国保編集");
    assertShahokokuhoForm(patient, orig);
    const m = modify(orig);
    fillShahokokuhoForm(m);
    cy.get("button").contains("入力").click();
    dialogClose("社保国保編集");
    dialogOpen("社保国保情報");
    cy.request(Cypress.env("API") + `/get-shahokokuho?shahokokuho-id=${orig.shahokokuhoId}`)
      .its("body")
      .then((response) => {
        const r = Shahokokuho.cast(response);
        expect(r).deep.equal(m);
      });
    cy.get("a").contains("削除").click();
    dialogClose("社保国保情報");
    dialogOpen("患者情報");
    cy.get("[data-cy=current-hoken]").should("not.exist");
  })
})