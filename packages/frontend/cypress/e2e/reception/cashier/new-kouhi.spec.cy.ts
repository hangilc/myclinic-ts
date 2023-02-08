import { Patient, Kouhi } from "myclinic-model";
import tmpl from "@cypress/fixtures/new-kouhi-template.json";
import { fillDateForm } from "./misc";

describe("new-kouhi (reception)", () => {
  let patient: Patient;

  before(() => {
    cy.request(Cypress.env("API") + "/get-patient?patient-id=1").then((response) => {
      patient = Patient.cast(response.body);
    })
  });

  it("should enter new kouhi", () => {
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
    cy.get("[data-cy=new-kouhi-link]").click();
    cy.get("[data-cy=dialog-title]").contains("患者情報").should("not.exist");

    cy.get("[data-cy=dialog-title]").contains("新規公費");
    cy.get("[data-cy=patient-id]").contains(patient.patientId.toString())
    cy.get("[data-cy=patient-name]").contains(patient.fullName(" "));
    cy.get("[data-cy=futansha-input]").clear().type(tmpl.futansha.toString());
    cy.get("[data-cy=jukyuusha-input]").clear().type(tmpl.jukyuusha.toString());
    cy.get("[data-cy=valid-from-input]").within(() => {
      fillDateForm(tmpl.validFrom);
    });
    cy.get("[data-cy=valid-upto-input]").within(() => {
      fillDateForm(tmpl.validUpto);
    });
    cy.get("button").contains("入力").click();
    cy.get("[data-cy=dialog-title]").contains("新規公費").should("not.exist");

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
      const m = newKey.match(/^kouhi-(\d+)$/);
      expect(m).not.eq(null);
      if (m !== null) {
        const id = parseInt(m[1]);
        expect(id).not.to.be.NaN;
        return cy.wrap(id);
      }
    }).as("kouhiId");
    cy.get("@kouhiId").then((kouhiId: any) => {
      if( typeof kouhiId === "number" ){
        cy.log(kouhiId.toString());
        cy.request(Cypress.env("API") + `/get-kouhi?kouhi-id=${kouhiId}`)
          .its("body")
          .then((response) => {
            const a = Object.assign({}, tmpl, { kouhiId: response.kouhiId});
            const b = response;
            console.log({a, b});
            expect(a).deep.equal(b);
            cy.request(Cypress.env("API") + `/delete-kouhi?kouhi-id=${a.kouhiId}`);
          })
      }
    })

  })
});
