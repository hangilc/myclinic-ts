import ScanBlock from "@/scan/ScanBlock.svelte";
import scannerDevices from "@cypress/fixtures/scanner-devices.json";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { SearchPatientDialogDriver } from "@cypress/lib/drivers";
import patient1 from "@cypress/fixtures/patient-1.json";
import { getBase } from "@/lib/api";
import { interceptPatient1 } from "@cypress/lib/intercept";

describe("Scan Block", () => {
  it("should show scanned document", () => {
    interceptPatient1();
    cy.intercept(Cypress.env("PRINTER-API") + "/scanner/device/",
      scannerDevices).as("deviceList");
    cy.intercept(Cypress.env("PRINTER-API") + "/scanner/scan?*", (req) => {
      const deviceId = req.query["device-id"];
      const resolution = req.query["resolution"];
      expect(deviceId).equal(scannerDevices[0].deviceId);
      expect(resolution).equal("100");
      req.headers["Content-Type"] = "text/plain";
      req.headers["Content-Length"] = "10";
      req.reply({
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": "10",
          "x-saved-image": "scanned-image-17338846808322831557.jpg"
        },
        body: "**********"
      });
    }).as("scan");
    cy.mount(ScanBlock, {
      props: {
        remove: () => {}
      }
    });
    selectPatient(1);
    scan();
    cy.wait("@scan");
    cy.get("[data-cy=scanned-documents]").within(() => {
      cy.get(`[data-cy=upload-file-name]`).contains(/^1-.+-01.jpg$/);
    })
  });

  it("should display scanned image", () => {
    interceptPatient1();
    interceptDevices();
    interceptScan().as("scan");
    interceptScannerImage().as("image");
    cy.mount(ScanBlock, { props: { remove: () => {} } });
    selectPatient(1);
    scan();
    cy.wait("@scan");
    cy.get("[data-cy=scanned-documents] [data-cy=scanned-document-item][data-index=1]").within(() => {
      cy.get("a").contains("表示").click();
    });
    cy.wait("@image");
    dialogOpen("スキャン画像プレビュー").within(() => {
      cy.get<HTMLImageElement>("[src]")
        .should("be.visible")
        .and(($img) => {
          expect($img[0].naturalWidth).to.be.greaterThan(0);
        })
    })
  })
});

function selectPatient(patientId: number) {
  cy.get("[data-cy=patient-workarea]").within(() => {
    cy.get("button").contains("検索").click();
  });
  dialogOpen("患者検索（スキャン）").within(() => {
    const drv = SearchPatientDialogDriver;
    drv.typeInput("1");
    drv.search();
    drv.getSearchResultByPatientId(patientId).click();
    drv.select();
  });
  dialogClose("患者検索（スキャン）");
  cy.get("[data-cy=patient-text]").contains(`(${patientId})`).should("exist")
  dialogClose("患者検索（スキャン）");
}

function scan() {
  cy.get("[data-cy=scan-block]").first().within(() => {
    cy.get("[data-cy=scan-commands]").within(() => {
      cy.get("button").contains("スキャン開始").click();
    });
  })
}

function interceptDevices() {
  cy.intercept(Cypress.env("PRINTER-API") + "/scanner/device/",
  scannerDevices).as("deviceList");
}

function interceptScan() {
  return cy.intercept(Cypress.env("PRINTER-API") + "/scanner/scan?*", (req) => {
    const deviceId = req.query["device-id"];
    const resolution = req.query["resolution"];
    expect(deviceId).equal(scannerDevices[0].deviceId);
    expect(resolution).equal("100");
    req.headers["Content-Type"] = "text/plain";
    req.headers["Content-Length"] = "10";
    req.reply({
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": "10",
        "x-saved-image": "scanned-image-17338846808322831557.jpg"
      },
      body: "**********"
    });
  });
}

function interceptScannerImage() {
  return cy.intercept(Cypress.env("PRINTER-API") + "/scanner/image/*", (req) => {
    req.reply({
      headers: {
        "Content-Type": "image/jpeg"
      },
      fixture: "scanned-image.jpg"
    })
  });
}
