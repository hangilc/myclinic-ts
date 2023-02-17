import { AppointTimeData } from "@/appoint/appoint-time-data";
import { ColumnData } from "@/appoint/column-data";
import Column from "@/appoint/Column.svelte";
import { AppointTime, ClinicOperation } from "myclinic-model";

describe("Column (appoint)", () => {
  it("should mount", () => {
    cy.mount(Column, {
      props: {
        data: new ColumnData(
          "2023-02-13",
          ClinicOperation.InOperation,
          []
        )
      }
    })
  });

  it.only("should have appoints", () => {
    const date = "2023-02-13";
    cy.mount(Column, { props: {
      data: new ColumnData(
        date,
        ClinicOperation.InOperation,
        [
          new AppointTimeData(
            new AppointTime(
              1, date, "10:00:00", "10:20:00", "regular", 1
            ),
            [],
            undefined
          )
        ]
      )
    }});
    cy.get(`[data-cy=appoint-column][data-date='${date}']`).should("exist").within(() => {
      cy.get("[data-cy=date-block]").should("exist").within(() => {
        cy.get("[data-cy=date-disp]").should("have.text", "2月13日（月）");
        cy.get("[data-cy=kenshin-rep]").should("have.text", "");
        cy.get("[data-cy=appoint-avail]").should("have.length", 1)
          .first()
          .should("have.attr", "data-kind", "regular");
      });
      cy.get("[data-cy=appoint-time-block]")
        .should("exist")
        .should("have.attr", "data-is-vacant", "")
        .should("have.class", "regular")
        .should("have.class", "vacant")
        .within(() => {
          cy.get("[data-cy=time-disp]").should("have.text", "10:00 - 10:20");
          cy.get("[data-cy=capacity-disp]").should("have.text", "");
          cy.get("[data-cy=kind-disp]").should("have.text", "");
          cy.get("[data-cy=appoint-patient]").should("not.exist");
        })
    });
    
  })
})