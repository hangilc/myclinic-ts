describe("Scan", () => {
  beforeEach(() => {
    cy.visit("/reception/");
    cy.get("[data-cy=side-menu]").within(() => {
      cy.get("a").contains("スキャン").click();
    })
  });

  it("should open", () => {
  })
  
  it("should do new scan", () => {
    cy.get("button").contains("新規スキャン").click();
  })
});