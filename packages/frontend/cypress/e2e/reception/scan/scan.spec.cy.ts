import { getPatient } from "@cypress/e2e/req";
import scannerDevices from "@cypress/fixtures/scanner-devices.json";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { SearchPatientDialogDriver } from "@cypress/lib/drivers";
import type { Patient } from "myclinic-model";

describe("Scan", () => {
  let patient: Patient;

  before(() => {
    getPatient(1).then(p => patient = p);
  })

  beforeEach(() => {
    cy.visit("/reception/");
    cy.get("[data-cy=side-menu]").within(() => {
      cy.get("a").contains("スキャン").click();
    })
  });

  it("should open", () => {
  })

  it("should do new scan", () => {
    cy.intercept(Cypress.env("PRINTER-API") + "/scanner/device/",
      []).as("deviceList");
    cy.get("button").contains("新規スキャン").click();
    cy.get("@deviceList");
  });

  it("should set default scanner", () => {
    cy.intercept(Cypress.env("PRINTER-API") + "/scanner/device/",
      scannerDevices).as("deviceList");
    cy.get("button").contains("新規スキャン").click();
    cy.get("@deviceList");
    cy.get("[data-cy=scan-block]").within(() => {
      cy.get("[data-cy=scanner-text]").should("have.text", scannerDevices[0].description)
    })
  })

  it("should select patient", () => {
    cy.intercept(Cypress.env("PRINTER-API") + "/scanner/device/",
      scannerDevices);
    cy.get("button").contains("新規スキャン").click();
    cy.get("[data-cy=scan-block]").first().within(() => {
      cy.get("[data-cy=patient-workarea]").within(() => {
        cy.get("button").contains("検索").click();
      });
    })
    dialogOpen("患者検索（スキャン）").within(() => {
      const drv = SearchPatientDialogDriver;
      drv.typeInput("1");
      drv.search();
      drv.getSearchResultByPatientId(1).click();
      drv.select();
    });
    dialogClose("患者検索（スキャン）");
    cy.get("[data-cy=scan-block]").within(() => {
      cy.get("[data-cy=patient-text]").should("have.text",
        `(${patient.patientId}) ${patient.lastName} ${patient.firstName}`)
    })
  })

  it("should select document type", () => {
    cy.intercept(Cypress.env("PRINTER-API") + "/scanner/device/",
      scannerDevices);
    cy.get("button").contains("新規スキャン").click();
    cy.get("[data-cy=scan-block]").first().within(() => {
      cy.get("[data-cy=document-kind-workarea]").within(() => {
        cy.get("a").contains("選択").click();
      });
    });
    cy.get("[data-cy=scan-kind-pulldown]").within(() => {
      cy.get("a").contains(/^保険証$/).click();
    })
    cy.get("[data-cy=document-kind-workarea] [data-cy=document-kind-text]")
      .should("have.text", "保険証");
  })

  it.only("should select scanner", () => {
    cy.intercept(Cypress.env("PRINTER-API") + "/scanner/device/",
      scannerDevices);
    cy.get("button").contains("新規スキャン").click();
    cy.get("[data-cy=scan-block]").first().within(() => {
      cy.get("[data-cy=scanner-selection-workarea]").within(() => {
        cy.get("a").contains("選択").click();
      })
    });
    cy.get("[data-cy=select-scanner-pulldown]").within(() => {
      cy.get(`[data-cy=scanner-item][data-id='${encodeURIComponent(scannerDevices[0].deviceId)}']`)
        .click();
    })
  });
});

export { }
