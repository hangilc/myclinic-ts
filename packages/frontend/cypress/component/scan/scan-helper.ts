import scannerDevices from "@cypress/fixtures/scanner-devices.json";
import ScanBlock from "@/scan/ScanBlock.svelte";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { SearchPatientDialogDriver } from "@cypress/lib/drivers";

export function mount() {
  cy.mount(ScanBlock, { props: { remove: () => { } } });
}

export function selectPatient(patientId: number) {
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

export function scan() {
  cy.get("[data-cy=scan-commands] button").contains("スキャン開始").click();
}


export function interceptDevices() {
  return cy.intercept("GET", Cypress.env("PRINTER-API") + "/scanner/device/",
    scannerDevices);
}

export function interceptScan() {
  return cy.intercept(Cypress.env("PRINTER-API") + "/scanner/scan?*", (req) => {
    const deviceId = req.query["device-id"];
    const resolution = req.query["resolution"];
    expect(deviceId).equal(scannerDevices[0].deviceId);
    expect(resolution).equal("100");
    req.headers["Content-Type"] = "text/plain";
    req.headers["Content-Length"] = "10";
    const saved = `scanned-image-${Date.now()}.jpg`;
    req.reply({
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": "10",
        "x-saved-image": saved
      },
      body: "**********"
    });
  });
}

export function waitForScan(alias: string, cb: (savedImage: string) => void) {
  cy.wait(alias).then(req => {
    const savedImage = req.response!.headers["x-saved-image"] as string;
    cb(savedImage);
  })
}

function scannedDocWrapperSelector() {
  return "[data-cy=scanned-documents]";
}

function scannedDocSelector(index: number): string {
  return "[data-cy=scanned-document-item]" + `[data-index=${index}]`;
}

function scannedDocUploadFileNameSelector(index: number): string {
  return scannedDocSelector(index) + " [data-cy=upload-file-name]";
}

export function confirmSavedFileName(index: number, savedFileName: string) {
  cy.get(scannedDocUploadFileNameSelector(index))
    .should("have.attr", "data-scanned-file-name", savedFileName);
}

