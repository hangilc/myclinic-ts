import { AppointTimeData } from "@/appoint/appoint-time-data";
import AppointPatient from "@/appoint/AppointPatient.svelte";
import { apiBase } from "@cypress/lib/base";
import type { MountReturn } from "cypress/svelte";
import { Appoint, AppointTime } from "myclinic-model";
import { appointDialogClose, withAppointDialog, withAppointPatient } from "./column-helper";

describe("AppointPatient", () => {
  beforeEach(() => {
    cy.viewport(800, 600);
  });

  it("should mount", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const appoint = new Appoint(appointId, appointTimeId, "診療 太郎", patientId, "");
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }});
  });

  it("should display simple appoint", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const patientName = "診療 太郎"
    const appoint = new Appoint(appointId, appointTimeId, patientName, patientId, "");
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }});
    withAppointPatient(patientId, driver => {
      driver.shouldDisplayPatientId(patientId);
      driver.shouldDisplayPatientName(patientName);
      driver.shouldDisplayMemo("");
      driver.shouldHaveTagCount(0);
    })
  });

  it("should display memo", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const patientName = "診療 太郎"
    const memo = "相談"
    const appoint = new Appoint(appointId, appointTimeId, patientName, patientId, memo);
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }});
    withAppointPatient(patientId, driver => {
      driver.shouldDisplayPatientId(patientId);
      driver.shouldDisplayPatientName(patientName);
      driver.shouldDisplayMemo(memo);
      driver.shouldHaveTagCount(0);
    });
  });

  it("should display tag", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const patientName = "診療 太郎"
    const memo = "{{健診}}"
    const appoint = new Appoint(appointId, appointTimeId, patientName, patientId, memo);
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }});
    withAppointPatient(patientId, driver => {
      driver.shouldDisplayPatientId(patientId);
      driver.shouldDisplayPatientName(patientName);
      driver.shouldDisplayMemo("");
      driver.shouldHaveTagCount(1);
      driver.shouldDisplayTag("健診");
    });
  });

  it("should display both memo and tag", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const patientName = "診療 太郎"
    const memo = "{{健診}}相談"
    const appoint = new Appoint(appointId, appointTimeId, patientName, patientId, memo);
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }});
    withAppointPatient(patientId, driver => {
      driver.shouldDisplayPatientId(patientId);
      driver.shouldDisplayPatientName(patientName);
      driver.shouldDisplayMemo("相談");
      driver.shouldHaveTagCount(1);
      driver.shouldDisplayTag("健診");
    });
  });

  it("should invoke edit dialog", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const patientName = "診療 太郎"
    const appoint = new Appoint(appointId, appointTimeId, patientName, patientId, "");
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }});
    cy.get(`[data-cy=appoint-patient][data-patient-id=${patientId}]`).click();
    withAppointDialog(driver => {
      driver.shouldHaveAppointTimeText("2月13日（月）10時0分 - 10時20分");
      driver.shouldHavePatientInputValue(patientName);
      driver.shouldDisplayPatientId(patientId);
      driver.shouldHaveMemoInputValue("");
      driver.shouldHaveUncheckedKenshinTag();
      driver.cancel();
    });
    appointDialogClose();
  });

  it("should invoke edit dialog with memo and tag", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const patientName = "診療 太郎"
    const appoint = new Appoint(appointId, appointTimeId, patientName, patientId, 
      "{{健診}}相談");
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }});
    cy.get(`[data-cy=appoint-patient][data-patient-id=${patientId}]`).click();
    withAppointDialog(driver => {
      driver.shouldHaveAppointTimeText("2月13日（月）10時0分 - 10時20分");
      driver.shouldHavePatientInputValue(patientName);
      driver.shouldDisplayPatientId(patientId);
      driver.shouldHaveMemoInputValue("相談");
      driver.shouldHaveCheckedKenshinTag();
      driver.cancel();
    });
    appointDialogClose();
  });

  it("should update after edit", () => {
    const appointId = 1;
    const appointTimeId = 10;
    const patientId = 1;
    const patientName = "診療 太郎"
    const appoint = new Appoint(appointId, appointTimeId, patientName, patientId, "");
    const appointTimeData = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointPatient, { props: {
      data: appoint,
      appointTimeData
    }}).as("mount");
    cy.intercept("POST", apiBase() + "/update-appoint", "true").as("update");
    cy.get(`[data-cy=appoint-patient][data-patient-id=${patientId}]`).click();
    withAppointDialog(driver => {
      driver.setPatientInput("2");
      driver.clickSearchIcon();
      driver.shouldDisplayPatientId(2);
      driver.modify();
    });
    appointDialogClose();
    const newAppoint = new Appoint(2, appointTimeId, "看護 花子", 2, "");
    cy.get<MountReturn<AppointPatient>>("@mount").then(mount => {
      const c = mount.component;
      c.$set({
        data: newAppoint
      })
    });
    withAppointPatient(2, driver => {
      driver.shouldDisplayPatientId(2);
      driver.shouldDisplayPatientName("看護 花子");
      driver.shouldDisplayMemo("");
      driver.shouldHaveTagCount(0);
    })
  });
});