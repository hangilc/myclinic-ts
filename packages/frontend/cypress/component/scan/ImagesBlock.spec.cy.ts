import { getBase } from "@/lib/api";
import ImagesBlock from "@/scan/ImagesBlock.svelte";
import { PreviewDriver, selectPatient } from "./image-helper";

describe("Images Block (scan)", () => {
  it("should mount", () => {
    const uploadFile = `1-image-${Date.now()}-01.jpg`;
    cy.fixture("scanned-image.jpg", null).then(imageData => {
      console.log(imageData.buffer);
      const url = getBase() + `/save-patient-image?patient-id=1&file-name=${uploadFile}`;
      cy.request({
        method: "POST",
        url: getBase() + `/save-patient-image?patient-id=1&file-name=${uploadFile}`,
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: new Blob([imageData.buffer]),
        encoding: "binary"
      }).as("upload");
    })
    cy.get("@upload");
    cy.mount(ImagesBlock, {
      props: {
        remove: () => {}
      }
    });
    selectPatient(1);
    cy.get(`[data-cy=search-result] [data-cy=search-result-item][data-img='${uploadFile}']`).click();
    PreviewDriver.hasImage();
    PreviewDriver.clickCross();
  })
});