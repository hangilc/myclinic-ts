import { getBase } from "@/lib/api";
import ScanBlock from "@/scan/ScanBlock.svelte";
import scannerDevices from "@cypress/fixtures/scanner-devices.json";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { ConfirmDriver, SearchPatientDialogDriver } from "@cypress/lib/drivers";

const ScannedDocDriver = {
  hasSavedFileName(index: number, savedFileName: string) {
    cy.get("[data-cy=upload-file-name]")
      .should("have.attr", "data-scanned-file-name", savedFileName);
  },

  clickDisplay() {
    cy.get("a").contains("表示").click();
  }
}

describe("Scan Block", () => {
  it("should scan", () => {
    interceptDevices();
    interceptScan().as("scan");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(1);
    scan();
    let savedFile: string;
    cy.wait("@scan").then(req => {
      savedFile = req.response!.headers["x-saved-image"] as string;
    });
    // cy.wrap({}).then(() => interceptScannerImage(savedFile, scannedImage).as("scannerImage"));
    // clickDisplay();
    getScannedDocument(1).within(() => {
      ScannedDocDriver.hasSavedFileName(1, savedFile);
    })
  });

  it.only("should display scanned image", () => {
    interceptDevices();
    interceptScan().as("scan");
    let scannedImage: Uint8Array;
    fixtureImage("scanned-image.jpg").then(img => scannedImage = img);
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(1);
    scan();
    let savedFile: string;
    cy.wait("@scan").then(req => {
      savedFile = req.response!.headers["x-saved-image"] as string;
    });
    cy.wrap({}).then(() => {
      interceptScannerImage(savedFile, scannedImage).as("getScannedImage");
    })
    getScannedDocument(1).within(() => {
      ScannedDocDriver.clickDisplay();
    });
    dialogOpen("スキャン画像プレビュー").within(() => {
      cy.get<HTMLImageElement>("[src]")
        .should("be.visible")
        .and(($img) => {
          expect($img[0].naturalWidth).to.be.greaterThan(0);
        })
      cy.get("[data-cy=cross-icon]").click();
    });
    dialogClose("スキャン画像プレビュー");
  })

  it("should upload scanned image", () => {
    const patientId = 1;
    interceptDevices();
    interceptScan().as("scan");
    // interceptScannerImage("scanned-image.jpg").as("image");
    cy.fixture("scanned-image.jpg", null).as("imageData");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(patientId);
    scan();
    cy.wait("@scan");
    cy.get("button").contains("アップロード").click();
    cy.wait("@image");
    let imageData: Uint8Array;
    cy.get<Uint8Array>("@imageData").then(d => imageData = d);
    cy.get("[data-cy=scanned-documents] [data-cy=scanned-document-item][data-index=1]").within(() => {
      cy.get("svg[data-cy=ok-icon]").should("be.visible");
      cy.get("[data-cy=upload-file-name]").invoke("text").then((fileName) => {
        cy.request<ArrayBuffer>({
          url: (getBase() + `/patient-image?patient-id=${patientId}&file-name=${fileName}`),
          encoding: null
        }).its("body")
          .then(async (body) => {
            const bodyArray = new Uint8Array(body);
            expect(equalUint8Array(bodyArray, imageData)).to.be.true;
          })
      })
    });
  });

  it("should delete scanned image", () => {
    const patientId = 1;
    interceptDevices();
    interceptScan().as("scan");
    // interceptScannerImage("scanned-image.jpg").as("image");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(patientId);
    scan();
    cy.wait("@scan").then((req) => {
      console.log(req);
      const savedFile = req.response!.headers["x-saved-image"] as string;
      interceptDeleteScannedImage(savedFile).as("delete");
    });
    cy.get("[data-cy=scanned-documents] [data-cy=scanned-document-item][data-index=1]").within(() => {
      cy.get("a").contains("削除").click();
    });
    ConfirmDriver.yes();
    cy.wait("@delete");
    cy.get("[data-cy=scanned-documents] [data-cy=scanned-document-item][data-index=1]")
      .should("not.exist");
  });

  it("should rescan image", () => {
    const patientId = 1;
    interceptDevices();
    interceptScan().as("scan");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(patientId);
    scan();
    let savedFile: string;
    cy.wait("@scan").then(req => {
      savedFile = req.response!.headers["x-saved-image"] as string;
    })
    getScannedDocument().within(() => {
      interceptDeleteScannedImage(savedFile).as("delete");
      cy.get("a").contains("再スキャン").click();
    });
    cy.wait("@scan");
    cy.wait("@delete");
  });

  it("should display uploaded image", () => {
    const patientId = 1;
    interceptDevices();
    interceptScan().as("scan");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
    selectPatient(patientId);
    scan();
    let savedFile: string;
    cy.wait("@scan").then(req => {
      savedFile = req.response!.headers["x-saved-image"] as string;
    })
    let uploadFileName: string;
    getUploadFileNameElement().invoke("text")
      .then(name => uploadFileName = name).as("uploadFileName");
    cy.wrap({}).then(() => {
      cy.log(savedFile);
      cy.log(uploadFileName);
    });
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

function interceptScannerImage(fileName: string, image: Uint8Array) {
  const url = Cypress.env("PRINTER-API") + `/scanner/image/${fileName}`
  return cy.intercept("GET", url, (req) => {
    req.reply({
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": image.length.toString()
      },
      body: image.buffer
    })
  });
}

function interceptDeleteScannedImage(fileName: string) {
  console.log("fileName", fileName);
  return cy.intercept("DELETE",
    Cypress.env("PRINTER-API") + `/scanner/image/${fileName}`, (req) => {
      req.reply("true")
    })
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