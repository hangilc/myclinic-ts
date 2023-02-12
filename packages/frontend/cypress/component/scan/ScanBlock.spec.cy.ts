import { getBase } from "@/lib/api";
import ScanBlock from "@/scan/ScanBlock.svelte";
import scannerDevices from "@cypress/fixtures/scanner-devices.json";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { ConfirmDriver, SearchPatientDialogDriver } from "@cypress/lib/drivers";

describe("Scan Block", () => {
  it("should show scanned document", () => {
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
        remove: () => { }
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
    interceptDevices();
    interceptScan().as("scan");
    interceptScannerImage("scanned-image.jpg").as("image");
    cy.mount(ScanBlock, { props: { remove: () => { } } });
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

  it("should upload scanned image", () => {
    const patientId = 1;
    interceptDevices();
    interceptScan().as("scan");
    interceptScannerImage("scanned-image.jpg").as("image");
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

  it.only("should delete scanned image", () => {
    const patientId = 1;
    interceptDevices();
    interceptScan().as("scan");
    interceptScannerImage("scanned-image.jpg").as("image");
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

function interceptScannerImage(fixture: string) {
  return cy.intercept("GET", Cypress.env("PRINTER-API") + "/scanner/image/*", (req) => {
    req.reply({
      headers: {
        "Content-Type": "image/jpeg"
      },
      fixture,
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