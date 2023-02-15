import scannerDevices from "@cypress/fixtures/scanner-devices.json";
import ScanBlock from "@/scan/ScanBlock.svelte";
import { dialogClose, dialogOpen, dialogSelector } from "@cypress/lib/dialog";
import { ConfirmDriver, SearchPatientDialogDriver } from "@cypress/lib/drivers";
import { getBase } from "@/lib/api";

export function mount(remove: () => void = () => {}) {
  cy.mount(ScanBlock, { props: { remove } });
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

function getSavedFileName(index: number): Cypress.Chainable<string> {
  return cy.get(scannedDocUploadFileNameSelector(index))
    .invoke("attr", "data-scanned-file-name");
}

export function accessUploadFileName(index: number, cb: (uploadFile: string) => void): void {
  cy.get(scannedDocUploadFileNameSelector(index)).invoke("text").then(cb)
}

export function confirmUploadFileName(index: number, uploadFileName: string): void {
  cy.get(scannedDocUploadFileNameSelector(index)).should("have.text", uploadFileName);
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

export function confirmUploaded(patientId: number, uploadFile: string, imageData: Uint8Array) {
  const url = getBase() + `/patient-image?patient-id=${patientId}&file-name=${uploadFile}`;
  cy.request<ArrayBuffer>({ method: "GET", url, encoding: null }).then(response => {
    const body = new Uint8Array(response.body);
    expect(equalUint8Array(body, imageData)).to.be.true
  })
}

export interface ScanInfo {
  savedFile: string,
  uploadFile: string,
  imageData: Uint8Array,
}

export function doScan(index: number, scanAlias: string, imageFixture: string) {
  return new Cypress.Promise<ScanInfo>((resolve) => {
    scan();
    waitForScan(scanAlias, savedFile => {
      accessUploadFileName(index, uploadFile => {
        loadImageData(imageFixture, imageData => {
          interceptScannerImage(savedFile, imageData);
          resolve({ savedFile, uploadFile, imageData });
        })
      })
    })
  })
}

export interface RescanInfo {
  savedFile: string,
  imageData: Uint8Array,
}

export function doRescan(patientId: number, index: number, scanAlias: string, imageFixture: string) {
  return new Cypress.Promise<RescanInfo>((resolve) => {
    getSavedFileName(index).then(savedFile => {
      const delAlias = `deleteScannedImage-${savedFile}`;
      interceptDeleteScannedImage(savedFile).as(delAlias);
      let delUploadAlias: string | undefined = undefined;
      uploadSuccessElement(index).then($el => {
        if ($el.is(":visible")) {
          console.log("visible");
          accessUploadFileName(index, uploadFile => {
            delUploadAlias = `deleteUploadImage-${uploadFile}`;
            interceptDeletePatientImage(patientId, uploadFile).as(delUploadAlias);
          });
        }
      });
      clickRescan(index);
      waitForScan(scanAlias, savedFile => {
        loadImageData(imageFixture, imageData => {
          interceptScannerImage(savedFile, imageData);
          resolve({ savedFile, imageData });
        })
      })
      cy.wait("@" + delAlias);
      if( delUploadAlias ){
        cy.wait("@" + delUploadAlias);
      }
    })
  });
}

export function doDelete(index: number) {
  return new Cypress.Promise<boolean>((resolve) => {
    cy.get(scannedDocUploadFileNameSelector(index))
      .invoke("attr", "data-scanned-file-name")
      .then(savedFile => {
        const alias = `deleteScannedImage-${savedFile}`
        interceptDeleteScannedImage(savedFile!).as(alias);
        clickDelete(index);
        ConfirmDriver.yes();
        cy.wait("@" + alias);
        resolve(true);
      })
  })
}
