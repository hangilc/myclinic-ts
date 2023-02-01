import { Patient, Koukikourei } from "myclinic-model";
import tmpl from "@cypress/fixtures/new-koukikourei-template.json";
import { fillDateForm } from "./misc";

describe("new-koukikourei (reception)", () => {
  let patient: Patient;

  before(() => {
    cy.request(Cypress.env("API") + "/get-patient?patient-id=1").then((response) => {
      patient = Patient.cast(response.body);
    })
  });

  it("should enter new koukikourei", () => {
    const origKeys: string[] = [];
    function findNewKey(curKeys: string[]): string | null {
      for (let k of curKeys) {
        if (!origKeys.includes(k)) {
          return k;
        }
      }
      return null;
    }
    cy.visit("/reception/");
    cy.get("form [data-cy=search-text-input]").type(patient.patientId.toString());
    cy.get("form [data-cy=search-button]").click();
    cy.get("[data-cy=dialog-title]").contains("患者情報");
    cy.get("[data-cy=current-list]").then((wrapper) => {
      wrapper[0].querySelectorAll("[data-cy=current-hoken]").forEach(e => {
        const key = e.getAttribute("data-hoken-key");
        if (key !== null) {
          origKeys.push(key);
        }
      });
      cy.log(JSON.stringify(origKeys));
    });
    cy.get("[data-cy=new-koukikourei-link]").click();
    cy.get("[data-cy=dialog-title]").contains("患者情報").should("not.exist");

    cy.get("[data-cy=dialog-title]").contains("新規後期高齢");
    cy.get("[data-cy=patient-id]").contains(patient.patientId.toString())
    cy.get("[data-cy=patient-name]").contains(patient.fullName(" "));
    cy.get("[data-cy=hokensha-bangou-input]").clear().type(tmpl.hokenshaBangou);
    cy.get("[data-cy=hihokensha-bangou-input]").clear().type(tmpl.hihokenshaBangou);
    cy.get("[data-cy=futan-wari-input]").check(tmpl.futanWari.toString());
    cy.get("[data-cy=valid-from-input]").within(() => {
      fillDateForm(tmpl.validFrom);
    });
    cy.get("[data-cy=valid-upto-input]").within(() => {
      fillDateForm(tmpl.validUpto);
    });
    cy.get("button").contains("入力").click();
    cy.get("[data-cy=dialog-title]").contains("新規後期高齢").should("not.exist");

    cy.get("[data-cy=dialog-title]").contains("患者情報");
    cy.get("[data-cy=current-hoken]").then(($list) => {
      let newKeys: string[] = [];
      $list.each((_, e) => {
        const key = e.getAttribute("data-hoken-key");
        if (key !== null) {
          newKeys.push(key);
        }
      });
      const newKey = findNewKey(newKeys);
      expect(newKey).not.eq(null);
      cy.log(newKey || "(newKey not found)");
      return cy.wrap(newKey || "");
    }).as("newKey")
    cy.get("@newKey").then((newKey: any) => {
      const m = newKey.match(/^koukikourei-(\d+)$/);
      expect(m).not.eq(null);
      if (m !== null) {
        const id = parseInt(m[1]);
        expect(id).not.to.be.NaN;
        return cy.wrap(id);
      }
    }).as("koukikoureiId");
    cy.get("@koukikoureiId").then((koukikoureiId: any) => {
      if( typeof koukikoureiId === "number" ){
        cy.log(koukikoureiId.toString());
        cy.request(Cypress.env("API") + `/get-koukikourei?koukikourei-id=${koukikoureiId}`)
          .its("body")
          .then((response) => {
            const a = Object.assign({}, tmpl, { koukikoureiId: response.koukikoureiId});
            const b = response;
            expect(a).deep.equal(b);
            cy.request(Cypress.env("API") + `/delete-koukikourei?koukikourei-id=${a.koukikoureiId}`);
          })
      }
    })

  })
});
