export function dialogSelector(title: string): string {
  return `[data-cy=dialog][data-title='${title}']`;
}

export function dialogOpen(title: string) {
  return cy.get(dialogSelector(title)).should("exist");
}

export function doesNotExist(selector: string, pred: (e: JQuery<HTMLElement>) => boolean = _ => true) {
  cy.get("body").should(($body) => {
    let found = false;
    $body.find(selector).each((i, e) => {
      if (pred(Cypress.$(e))) {
        found = true;
      }
    })
    expect(found).to.be.false
  })
}

export function dialogClose(title: string) {
  function findTitle($e: JQuery<HTMLElement>): boolean {
    for (let i = 0; i < $e.length; i++) {
      if ($e[i].innerText === title) {
        return true;
      }
    }
    return false;
  }
  doesNotExist("[data-cy=dialog]", findTitle);
}

