import { castList } from "@/lib/cast";
import { castOp } from "@/lib/drawer/op";
import { dialogOpen } from "./misc";

describe("Blank Receipt", () => {
  it("should open blank receipt dialog", () => {
    cy.visit("/reception/");
    cy.get("[data-cy=bars3-menu]").click();
    cy.intercept("http://localhost:48080/setting", "[]");
    cy.intercept("http://localhost:48080/pref/receipt", "null");
    cy.intercept("http://localhost:48080/print/", (req) => {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const setup = castList(castOp)(body.setup);
      const pages = castList(castList(castOp))(body.pages);
      console.log("setup", setup);
      console.log("pages", pages);
      req.reply("true");
    });
    cy.get("a").contains("手書き領収書印刷").click();
    dialogOpen("領収書印刷").within(() => {
      cy.get("button").contains("印刷").click();
    })
  })
})

export {}
