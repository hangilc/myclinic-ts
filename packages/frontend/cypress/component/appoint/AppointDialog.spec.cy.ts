import { AppointTimeData } from "@/appoint/appoint-time-data";
import AppointDialog from "@/appoint/AppointDialog.svelte";
import { getBase } from "@/lib/api";
import { dialogOpen } from "@cypress/lib/dialog";
import { Appoint, AppointTime } from "myclinic-model";
import { createTypeReferenceDirectiveResolutionCache } from "typescript";
import { AppointDialogDriver as driver } from "./column-helper";

describe("AppointDialog", () => {
  beforeEach(() => {
    cy.viewport(800, 600);
  });

  it("should mount", () => {
    const appointTimeId = 10;
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => { },
        title: "診察予約入力",
        data,
        init: undefined
      }
    })
  });

  it("should have proper title", () => {
    const appointTimeId = 10;
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => { },
        title: "診察予約入力",
        data,
        init: undefined
      }
    })
    driver.shouldHaveTitle("診察予約入力");
  });

  it("should display appoint date and time", () => {
    const appointTimeId = 10;
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => { },
        title: "診察予約入力",
        data,
        init: undefined
      }
    })
    driver.shouldHaveAppointTimeText("2月13日（月）10時0分 - 10時20分");
  });

  it("should have proper blank inputs", () => {
    const appointTimeId = 10;
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => { },
        title: "診察予約入力",
        data,
        init: undefined
      }
    })
    driver.shouldHavePatientInputValue("");
    driver.shouldDisplayBlankPatientId();
    driver.shouldHaveMemoInputValue("");
    driver.shouldHaveUncheckedKenshinTag();
  });

  it("should display error when patient name input is blank", () => {
    const appointTimeId = 10;
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => {
          assert.fail("Should not be called.");
         },
        title: "診察予約入力",
        data,
        init: undefined
      }
    });
    // cy.intercept("POST", getBase() + "/register-appoint", (req) => {
    //   const appoint = JSON.parse(req.body);
    //   appoint.appointId = 1;
    //   req.reply(appoint);
    // });
    driver.enter();
    driver.shouldContainErrorMessage("患者名：入力がありません。");
  });

  it("should search patient", () => {
    const appointTimeId = 10;
    // const appoint = new Appoint(appointId, appointTimeId, "診療 太郎", patientId, "");
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => {
          assert.fail("Should not be called.");
         },
        title: "診察予約入力",
        data,
        init: undefined
      }
    });
    driver.setPatientInput("1");
    driver.clickSearchIcon();
    driver.shouldHavePatientInputValue("診療 太郎");
    driver.shouldDisplayPatientId(1);
  });
});