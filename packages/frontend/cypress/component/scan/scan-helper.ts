import scannerDevices from "@cypress/fixtures/scanner-devices.json";
import ScanBlock from "@/scan/ScanBlock.svelte";
import { dialogClose, dialogOpen, dialogSelector } from "@cypress/lib/dialog";
import { SearchPatientDialogDriver } from "@cypress/lib/drivers";
import { getBase } from "@/lib/api";

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

export function interceptScannerImage(fileName: string, image: Uint8Array) {
  const url = Cypress.env("PRINTER-API") + `/scanner/image/${fileName}`;
  return cy.intercept("GET", url, { body: image.buffer });
}

export function interceptDeleteScannedImage(fileName: string) {
  return cy.intercept("DELETE",
    Cypress.env("PRINTER-API") + `/scanner/image/${fileName}`, "true");
}

export function interceptSavePatientImage(
  patientId: number,
  fileName: string,
) {
  const url = getBase() + `/save-patient-image?patient-id=${patientId}&file-name=${fileName}`;
  return cy.intercept("POST", url)
}

export function waitForSavePatientImage(alias: string, cb: (uploadingData: Uint8Array) => void): void {
  cy.wait(alias).then(req => {
    cb(new Uint8Array(req.request.body));
  });
}

export function interceptDeletePatientImage(
  patientId: number,
  fileName: string,
) {
  const url = getBase() + `/delete-patient-image?patient-id=${patientId}&file-name=${fileName}`;
  return cy.intercept("GET", url)
}

function scannedDocWrapperSelector() {
  return "[data-cy=scanned-documents]";
}

function scannedDocSelector(index: number): string {
  return scannedDocWrapperSelector() +
    " [data-cy=scanned-document-item]" + `[data-index=${index}]`;
}

export function getScannedDocElement(index: number) {
  return cy.get(scannedDocSelector(index));
}

function scannedDocUploadFileNameSelector(index: number): string {
  return scannedDocSelector(index) + " [data-cy=upload-file-name]";
}

export function confirmSavedFileName(index: number, savedFileName: string): void {
  cy.get(scannedDocUploadFileNameSelector(index))
    .should("have.attr", "data-scanned-file-name", savedFileName);
}

export function accessUploadFileName(index: number, cb: (uploadFile: string) => void): void {
  cy.get(scannedDocUploadFileNameSelector(index)).invoke("text").then(cb)
}

export function uploadSuccessElement(index: number) {
  return cy.get(scannedDocSelector(index) + " [data-cy=ok-icon]");
}

export function clickDisplay(index: number): void {
  cy.get(scannedDocSelector(index) + " a").contains("表示").click();
}

export function clickRescan(index: number): void {
  cy.get(scannedDocSelector(index) + " a").contains("再スキャン").click();
}

export function clickDelete(index: number): void {
  cy.get(scannedDocSelector(index) + " a").contains("削除").click();
}

export function clickUpload(): void {
  cy.get("button").contains("アップロード").click();
}

export function loadImageData(fixture: string, cb: (imageData: Uint8Array) => void): void {
  cy.fixture(fixture, null).then(cb);
}

export const PreviewDriver = {
  title: "スキャン画像プレビュー",

  dialogSelector() {
    return dialogSelector(this.title);
  },

  dialogOpen() {
    dialogOpen(this.title);
  },

  dialogClose() {
    dialogClose(this.title);
  },

  hasImage() {
    cy.get<HTMLImageElement>(this.dialogSelector() + " img[src]")
      .should("exist")
      .and("be.visible")
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      })
  },

  clickCross() {
    const sel = this.dialogSelector() + " [data-cy=cross-icon]"
    cy.get(sel).click();
  }
}

export function equalUint8Array(a: Uint8Array, b: Uint8Array): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}


