import ImagesBlock from "@/scan/ImagesBlock.svelte";

describe("Images Block (scan)", () => {
  it("should mount", () => {
    cy.mount(ImagesBlock, {
      props: {
        remove: () => {}
      }
    });

  })
});