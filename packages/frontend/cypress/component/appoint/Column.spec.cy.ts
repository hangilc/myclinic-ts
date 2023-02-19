import { AppointTimeData } from "@/appoint/appoint-time-data";
import { ColumnData } from "@/appoint/column-data";
import Column from "@/appoint/Column.svelte";
import { getBase } from "@/lib/api";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import type { MountReturn } from "cypress/svelte";
import { Appoint, AppointTime, ClinicOperation } from "myclinic-model";
import { AppointDialogDriver, fromToTime, untilToTime, withAppointPatient } from "./column-helper";

describe("Column (appoint)", () => {
  beforeEach(() => {
    cy.viewport(600, 600);
  });

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

  it("should have appoints", () => {
    const date = "2023-02-13";
    const from = "10:00";
    const until = "10:20";
    cy.mount(Column, {
      props: {
        data: new ColumnData(
          date,
          ClinicOperation.InOperation,
          [
            new AppointTimeData(
              new AppointTime(
                1, date, fromToTime(from), untilToTime(until), "regular", 1
              ),
              [],
              undefined
            )
          ]
        )
      }
    });
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
          cy.get("[data-cy=time-disp]").should("have.text", `${from} - ${until}`);
          cy.get("[data-cy=capacity-disp]").should("have.text", "");
          cy.get("[data-cy=kind-disp]").should("have.text", "");
          cy.get("[data-cy=appoint-patient]").should("not.exist");
        })
    });

  });

  it("add should cancel appoint input", () => {
    const date = "2023-02-13";
    const from = "10:00";
    const until = "10:20";
    const data = new AppointTimeData(
      new AppointTime(
        1, date, fromToTime(from), untilToTime(until), "regular", 1
      ),
      [],
      undefined
    )
    const props = {
      data: new ColumnData(
        date,
        ClinicOperation.InOperation,
        [data]
      )
    }
    cy.mount(Column, { props });
    cy.get(`[data-cy=appoint-column][data-date='${date}']` +
      " [data-cy=appoint-time-block]").click();
    dialogOpen("診察予約入力").within(() => {
      cy.get("button").contains("キャンセル").click();
    })
    dialogClose("診察予約入力");
  });

  it.only("add should make appoint", () => {
    const date = "2023-02-13";
    const from = "10:00";
    const until = "10:20";
    const appointTimeId = 1;
    const appointId = 1;
    const patientId = 1;
    const appointTimeData = new AppointTimeData(
      new AppointTime(
        appointTimeId, date, fromToTime(from), untilToTime(until), "regular", 1
      ),
      [],
      undefined
    )
    const data = new ColumnData(
      date,
      ClinicOperation.InOperation,
      [appointTimeData]
    )
    cy.mount(Column, { props: { data } }).as("mount");
    cy.get(`[data-cy=appoint-column][data-date='${date}']` +
      " [data-cy=time-disp]").click();
    cy.intercept("POST", getBase() + "/register-appoint", (req) => {
      const appoint = JSON.parse(req.body);
      const result = { appointId, ...appoint };
      req.reply(result);
    }).as("register");
    dialogOpen("診察予約入力").within(() => {
      AppointDialogDriver.setPatientInput(patientId.toString());
      AppointDialogDriver.enter();
    })
    dialogClose("診察予約入力");
    cy.wait("@register");
    cy.get<MountReturn<Column>>("@mount").then(mount => {
      appointTimeData.addAppoint(new Appoint(
        appointId, appointTimeId, "診療 太郎", 1, ""
      ));
      mount.component.$set({ data });
    });
    withAppointPatient(patientId, driver => {

    })
  });
})