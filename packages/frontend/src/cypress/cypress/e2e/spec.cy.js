describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/vite/reception/');
    cy.get("[data-cy=test-flag]").contains("(Test-Client)");
    cy.get("button").contains("新規患者").click();
    cy.get("[data-cy=dialog-title").contains("新規患者入力");
    cy.get("[data-cy=last-name-input").type("田中");
    cy.get("[data-cy=first-name-input").type("正");
    cy.get("[data-cy=last-name-yomi-input").type("たなか");
    cy.get("[data-cy=first-name-yomi-input").type("ただし");
    cy.get(".birthday-input [data-cy=gengou-select]").select("昭和");
    cy.get(".birthday-input [data-cy=nen-input]").type("43");
    cy.get(".birthday-input [data-cy=month-input]").type("8");
    cy.get(".birthday-input [data-cy=day-input]").type("26");
    cy.get("[data-cy=sex-input][value=M]").click();
    cy.get("[data-cy=address]").type("東京");
    cy.get("[data-cy=phone]").type("03-1234-4567");
    cy.get("button").contains("入力").click();
  })
})