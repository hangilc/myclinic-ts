export function dialogOpen(title: string) {
  return cy.get(`[data-cy=dialog][data-title='${title}']`).should("exist");
  // return cy.get<JQuery<HTMLElement>>("[data-cy=dialog]").then<HTMLElement | null>(($d) => {
  //   let found: HTMLElement | null = null;
  //   for(let i=0;i<$d.length;i++){
  //     const d = $d[i];
  //     console.log("test", d);
  //     const t = d.querySelector("[data-cy=dialog-title]") as HTMLElement;
  //     if( t && t.innerText === title ) {
  //       found = d;
  //       break;
  //     }
  //   }
  //   return found ? Cypress.$(found) : null;
  // }).should("not.be.null");
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

