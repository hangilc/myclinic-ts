import ScanBlock from "@/scan/ScanBlock.svelte";
import { ConfirmDriver } from "@cypress/lib/drivers";
import { accessUploadFileName, clickDelete, clickDisplay, clickRescan, clickUpload, confirmSavedFileName, equalUint8Array, getScannedDocElement, interceptDeleteScannedImage, interceptDevices, interceptSavePatientImage, interceptScan, interceptScannerImage, loadImageData, mount, PreviewDriver, scan, selectPatient, uploadSuccessElement, waitForSavePatientImage, waitForScan } from "./scan-helper";

describe("Scan Block", () => {

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
      accessUploadFileName(1, uploadFile => {
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

});

