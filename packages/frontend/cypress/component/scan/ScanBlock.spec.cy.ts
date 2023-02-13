import { getBase } from "@/lib/api";
import ScanBlock from "@/scan/ScanBlock.svelte";
import { dialogClose, dialogOpen, dialogSelector } from "@cypress/lib/dialog";
import { ConfirmDriver, SearchPatientDialogDriver } from "@cypress/lib/drivers";
import { confirmSavedFileName, interceptDevices, interceptScan, mount, scan, selectPatient, waitForScan } from "./scan-helper";

function join(...items: string[]): string {
  return items.join(" ");
}

const ScannedDocDriver = {
  wrapper: "[data-cy=scanned-documents]",

  itemPart(index: number) {
    return "[data-cy=scanned-document-item]" + `[data-index=${index}]`;
  },

  fileNamePart: "[data-cy=upload-file-name]",

  itemSelector(index: number): string {
    return join(this.wrapper, this.itemPart(index));
  },

  getUploadFileNameElement(index: number) {
    const sel = join(this.itemSelector(index), this.fileNamePart);
    return cy.get(sel);
  },

  hasSavedFileName(index: number, savedFileName: string) {
    this.getUploadFileNameElement(index)
      .should("have.attr", "data-scanned-file-name", savedFileName);
  },

  clickDisplay(index: number) {
    cy.get(this.itemSelector(index) + " a").contains("表示").click();
  },

  clickRescan(index: number) {
    cy.get(this.itemSelector(index) + " a").contains("再スキャン").click();
  },

  clickUpload(index: number) {
    cy.get(this.itemSelector(index) + " a").contains("アップロード").click();
  },

  clickDelete(index: number) {
    cy.get(this.itemSelector(index) + " a").contains("削除").click();
  }
}

const PreviewDriver = {
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

describe("Scan Block", () => {

  it.only("should scan", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    scan();
    waitForScan("@scan", savedFile => {
      confirmSavedFileName(1, savedFile);
    })
  });

  it("should display scanned image", () => {
    interceptScan().as("scan");
    fixtureImage("scanned-image.jpg").as("imageData");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(1);
    scan();
    cy.wait("@scan").then(req => {
      return req.response!.headers["x-saved-image"] as string;
    }).as("savedFile");
    ScannedDocDriver.getUploadFileNameElement(1).invoke("text").as("uploadFile");
    cy.get<string>("@savedFile").then(savedFile => {
      cy.get<Uint8Array>("@imageData").then(imageData => {
        cy.get<string>("@uploadFile").then(uploadFile => {
          interceptScannerImage(savedFile, imageData);
          ScannedDocDriver.clickDisplay(1);
          PreviewDriver.dialogOpen();
          PreviewDriver.hasImage();
          PreviewDriver.clickCross();
          PreviewDriver.dialogClose();
        })
      })
    })
  })

  it("should upload scanned image", () => {
    interceptDevices();
    interceptScan().as("scan");
    cy.fixture("scanned-image.jpg", null).as("imageData");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(1);
    scan();
    cy.wait("@scan").then(req => {
      const savedFile = req.response!.headers["x-saved-image"] as string;
      return savedFile;
    }).as("savedFile");
    getUploadFileNameElement().invoke("text").as("uploadFile")
    cy.get<string>("@savedFile").then(savedFile => {
      cy.get<Uint8Array>("@imageData").then(imageData => {
        cy.get<string>("@uploadFile").then(uploadFile => {
          cy.log(imageData.length.toString());
          interceptScannerImage(savedFile, imageData);
          interceptSavePatientImage(1, uploadFile).as("saveImage");
          cy.get("button").contains("アップロード").click();
          cy.wait("@saveImage").then(req => {
            const a = new Uint8Array(req.request.body);
            const b = imageData;
            expect(equalUint8Array(a, b)).to.be.true;
          });
        })
      })
    });
  });

  it("should delete scanned image", () => {
    interceptScan().as("scan");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(1);
    scan();
    cy.wait("@scan").then((req) => {
      return req.response!.headers["x-saved-image"] as string;
    }).as("savedFile");
    cy.get<string>("@savedFile").then(savedFile => {
      interceptDeleteScannedImage(savedFile).as("delete");
      ScannedDocDriver.clickDelete(1);
    })
    ConfirmDriver.yes("このスキャン文書を削除しますか？");
    cy.wait("@delete");
    cy.get("[data-cy=scanned-documents] [data-cy=scanned-document-item][data-index=1]")
      .should("not.exist");
  });

  it("should rescan image", () => {
    interceptScan().as("scan");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(1);
    scan();
    cy.wait("@scan").then(req => {
      return req.response!.headers["x-saved-image"] as string;
    }).as("savedFile");
    cy.get<string>("@savedFile").then(savedFile => {
      interceptDeleteScannedImage(savedFile).as("delete");
      ScannedDocDriver.clickRescan(1);
      cy.wait("@scan").then(req => req.response!.headers["x-saved-image"] as string)
        .as("savedFile2");
      cy.wait("@delete");
      cy.get<string>("@savedFile2").then(savedFile => {
        ScannedDocDriver.hasSavedFileName(1, savedFile);
      })
    })
  });

  it("should display uploaded image", () => {
    interceptScan().as("scan");
    cy.fixture("scanned-image.jpg", null).as("imageData");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(1);
    scan();
    cy.wait("@scan").then(req => req.response!.headers["x-saved-image"] as string)
      .as("savedFile");
    cy.get<string>("@savedFile").then(savedFile => {
      cy.get<Uint8Array>("@imageData").then(imageData => {
        interceptScannerImage(savedFile, imageData);
      });
      ScannedDocDriver.getUploadFileNameElement(1).invoke("text").then(uploadFile => {
        ScannedDocDriver.clickDisplay(1);
      });
      PreviewDriver.dialogOpen();
      PreviewDriver.hasImage();
      PreviewDriver.dialogClose();
    })
  })

});

function equalUint8Array(a: Uint8Array, b: Uint8Array): boolean {
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


function interceptScannerImage(fileName: string, image: Uint8Array) {
  const url = Cypress.env("PRINTER-API") + `/scanner/image/${fileName}`;
  return cy.intercept("GET", url, { body: image.buffer });
}

function interceptSavePatientImage(
  patientId: number,
  fileName: string,
) {
  const url = getBase() + `/save-patient-image?patient-id=${patientId}&file-name=${fileName}`;
  return cy.intercept("POST", url)
}

function interceptDeleteScannedImage(fileName: string) {
  return cy.intercept("DELETE",
    Cypress.env("PRINTER-API") + `/scanner/image/${fileName}`, "true");
}

function scannedDocumentSelector(index: number = 1): string {
  return "[data-cy=scanned-documents]" + " " +
    `[data-cy=scanned-document-item][data-index=${index}]`;
}

function getScannedDocument(index: number = 1) {
  const seltor = scannedDocumentSelector(index);
  return cy.get(seltor)
}

function getUploadFileNameElement(index: number = 1) {
  const selector = scannedDocumentSelector(index) + " [data-cy=upload-file-name]";
  return cy.get(selector);
}

function clickDisplay(index: number = 1) {
  getScannedDocument(index).within(() => {
    cy.get("a").contains("表示").click();
  })
}

function fixtureImage(fixture: string) {
  return cy.fixture<Uint8Array>(fixture, null)
}