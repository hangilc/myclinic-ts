export function dialogOpen(title: string) {
  return cy.get("[data-cy=dialog]").should(($d) => {
    let found: HTMLElement | null = null;
    $d.find("[data-cy=dialog-title]").each((_, e) => {
      if( e.innerText === title ) {
        found = e;
      }
    })
    expect(found).not.null
    return $d;
  })
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

