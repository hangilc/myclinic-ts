import { ConfirmDriver } from "@cypress/lib/drivers";
import { accessUploadFileName, clickDelete, clickDisplay, clickRescan, clickUpload, confirmSavedFileName, confirmUploaded, confirmUploadFileName, doDelete, doRescan, doScan, equalUint8Array, getScannedDocElement, interceptDeletePatientImage, interceptDeleteScannedImage, interceptDevices, interceptSavePatientImage, interceptScan, interceptScannerImage, loadImageData, mount, PreviewDriver, scan, selectPatient, uploadSuccessElement, waitForSavePatientImage, waitForScan, type RescanInfo, type ScanInfo } from "./scan-helper";

describe("Scan Block", () => {
  it("sould mount", () => {
    interceptDevices();
    mount();
    selectPatient(1);
  });

  it("should scan", () => {
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
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    scan();
    waitForScan("@scan", savedFile => {
      accessUploadFileName(1, _uploadFile => {
        loadImageData("scanned-image.jpg", imageData => {
          interceptScannerImage(savedFile, imageData);
          clickDisplay(1);
          PreviewDriver.dialogOpen();
          PreviewDriver.hasImage();
          PreviewDriver.clickCross();
          PreviewDriver.dialogClose();
        })
      });
    })
  });

  it("should upload scanned image", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    scan();
    waitForScan("@scan", savedFile => {
      accessUploadFileName(1, uploadFile => {
        loadImageData("scanned-image.jpg", imageData => {
          interceptScannerImage(savedFile, imageData).as("saveImage");
          interceptSavePatientImage(1, uploadFile).as("upload");
          clickUpload();
          waitForSavePatientImage("@upload", uploadData => {
            expect(equalUint8Array(uploadData, imageData)).to.be.true;
          })
        })
      })
    });
  });

  it("should delete scanned image", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    scan();
    waitForScan("@scan", savedFile => {
      interceptDeleteScannedImage(savedFile).as("delete");
      clickDelete(1);
      ConfirmDriver.yes("このスキャン文書を削除しますか？");
      cy.wait("@delete");
      getScannedDocElement(1).should("not.exist");
    })
  });

  it("should rescan image", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    scan();
    waitForScan("@scan", savedFile => {
      confirmSavedFileName(1, savedFile);
      interceptDeleteScannedImage(savedFile).as("delete");
      clickRescan(1);
      waitForScan("@scan", savedFile2 => {
        confirmSavedFileName(1, savedFile2);
      });
      cy.wait("@delete");
    })
  });

  it("should delete scanned and uploaded images", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    scan();
    waitForScan("@scan", savedFile => {
      accessUploadFileName(1, uploadFile => {
        loadImageData("scanned-image.jpg", imageData => {
          interceptScannerImage(savedFile, imageData).as("saveImage");
          interceptSavePatientImage(1, uploadFile).as("upload");
          clickUpload();
          cy.wait("@upload");
          uploadSuccessElement(1).should("exist");
          interceptDeleteScannedImage(savedFile).as("deleteScanned");
          interceptDeletePatientImage(1, uploadFile).as("deleteUpload");
          clickDelete(1);
          ConfirmDriver.yes("このスキャン文書を削除しますか？");
          cy.wait(["@deleteScanned", "@deleteUpload"]);
          getScannedDocElement(1).should("not.exist");
        })
      })
    });
  });

  it("should delete first of two uploads", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    let scan1: ScanInfo;
    let scan2: ScanInfo;
    cy.wrap(doScan(1, "@scan", "scanned-image.jpg")).then(scan => scan1 = scan as ScanInfo);
    cy.wrap(doScan(2, "@scan", "scanned-image-2.jpg")).then(scan => scan2 = scan as ScanInfo);
    cy.then(() => {
      confirmSavedFileName(1, scan1!.savedFile);
      confirmSavedFileName(2, scan2!.savedFile);
    })
    cy.wrap(doDelete(1));
    cy.then(() => {
      confirmSavedFileName(1, scan2!.savedFile);
      confirmUploadFileName(1, scan1!.uploadFile);
    })
    clickUpload();
    uploadSuccessElement(1).should("be.visible");
    cy.then(() => {
      confirmUploaded(1, scan1!.uploadFile, scan2!.imageData);
    })
  });

  it("should delete second of two uploads", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    let scan1: ScanInfo;
    let scan2: ScanInfo;
    cy.wrap(doScan(1, "@scan", "scanned-image.jpg")).then(scan => scan1 = scan as ScanInfo);
    cy.wrap(doScan(2, "@scan", "scanned-image-2.jpg")).then(scan => scan2 = scan as ScanInfo);
    cy.then(() => {
      confirmSavedFileName(1, scan1!.savedFile);
      confirmSavedFileName(2, scan2!.savedFile);
    })
    cy.wrap(doDelete(2));
    cy.then(() => {
      confirmSavedFileName(1, scan1!.savedFile);
      confirmUploadFileName(1, scan1!.uploadFile);
    })
    clickUpload();
    uploadSuccessElement(1).should("be.visible");
    cy.then(() => {
      confirmUploaded(1, scan1!.uploadFile, scan1!.imageData);
    })
  });

  it("should rescan uploaded image", () => {
    interceptDevices();
    mount();
    selectPatient(1);
    interceptScan().as("scan");
    let scan: ScanInfo;
    cy.wrap(doScan(1, "@scan", "scanned-image.jpg")).then(info => scan = info as ScanInfo);
    cy.wrap({}).then(() => confirmSavedFileName(1, scan.savedFile))
    clickUpload();
    let rescan: RescanInfo;
    cy.wrap(doRescan(1, 1, "@scan", "scanned-image-2.jpg")).then(info => rescan = info as RescanInfo);
    cy.wrap({}).then(() => {
      confirmSavedFileName(1, rescan.savedFile);
      uploadSuccessElement(1).should("not.exist");
    });
  });

  it("should remove", () => {
    const obj = {
      remove: () => {}
    }
    cy.spy(obj, "remove");
    interceptDevices();
    mount(() => obj.remove());
    selectPatient(1);
    interceptScan().as("scan");
    let scan: ScanInfo;
    cy.wrap(doScan(1, "@scan", "scanned-image.jpg")).then(info => scan = info as ScanInfo);
    cy.then(() => {
      interceptDeleteScannedImage(scan.savedFile).as("deleteSavedFile");
    });
    cy.get("button").contains("閉じる").click();
    ConfirmDriver.yes("アップロードされていないファイルがありますが、閉じますか？");
    cy.wait("@deleteSavedFile");
    cy.then(() => {
      expect(obj.remove).to.be.called
    })
  })

});

