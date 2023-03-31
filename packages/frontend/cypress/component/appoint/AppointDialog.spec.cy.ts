import { AppointTimeData } from "@/appoint/appoint-time-data";
import AppointDialog from "@/appoint/AppointDialog.svelte";
import { getBase } from "@/lib/api";
// import { dialogOpen } from "@cypress/lib/dialog";
import { ConfirmDriver } from "@cypress/lib/drivers";
import { Appoint, AppointTime } from "myclinic-model";
// import { createTypeReferenceDirectiveResolutionCache } from "typescript";
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
        data,
        init: undefined
      }
    });
    driver.enter();
    driver.shouldContainErrorMessage("患者名：入力がありません。");
  });

  it("should search patient", () => {
    const appointTimeId = 10;
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => {},
        data,
        init: undefined
      }
    });
    driver.setPatientInput("1");
    driver.clickSearchIcon();
    driver.shouldHavePatientInputValue("診療 太郎");
    driver.shouldDisplayPatientId(1);
  });

  it("should enter new appoint", () => {
    const appointTimeId = 10;
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => {},
        data,
        init: undefined
      }
    });
    cy.intercept("POST", getBase() + "/register-appoint", (req) => {
      const appoint = JSON.parse(req.body);
      console.log(JSON.stringify(appoint, undefined, 2))
      expect(appoint).deep.equal({
        appointId: 0, 
        appointTimeId, 
        patientName: "診療 太郎", 
        patientId: 1, 
        memo: "{{健診}}血圧の相談"
      })
      appoint.appointId = 1;
      req.reply(appoint);
    }).as("register");
    driver.setPatientInput("1");
    driver.clickSearchIcon();
    driver.setMemoInput("血圧の相談");
    driver.checkKenshin();
    driver.enter();
    cy.get("@register");
  });

  it("should have consistent input values with init", () => {
    const appointTimeId = 10;
    const appointId = 200;
    const patientId = 1;
    const memo = "{{健診}}血圧の相談"
    const appoint = new Appoint(appointId, appointTimeId, "診療 太郎", patientId, memo);
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.mount(AppointDialog, {
      props: {
        destroy: () => {},
        data,
        init: appoint
      }
    });
    driver.shouldHaveTitle("診察予約編集");
    driver.shouldHavePatientInputValue("診療 太郎");
    driver.shouldDisplayPatientId(1);
    driver.shouldHaveMemoInputValue("血圧の相談");
    driver.shouldHaveCheckedKenshinTag();
  });

  it("should update appoint", () => {
    const appointTimeId = 10;
    const appointId = 200;
    const patientId = 1;
    const memo = "{{健診}}血圧の相談"
    const appoint = new Appoint(appointId, appointTimeId, "診療 太郎", patientId, memo);
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    )
    cy.intercept("POST", getBase() + "/update-appoint", (req) => {
      expect(JSON.parse(req.body)).deep.equal({
        appointId, 
        appointTimeId, 
        patientName: "看護 花子", 
        patientId: 2, 
        memo: ""
      })
      req.reply("true");
    }).as("update");
    const props = {
      destroy: () => {},
      data,
      init: appoint
    }
    cy.spy(props, "destroy").as("destroy");
    cy.mount(AppointDialog, { props });
    driver.setPatientInput("2");
    driver.clickSearchIcon();
    driver.setMemoInput("");
    driver.uncheckKenshin();
    driver.modify();
    cy.get("@update");
    cy.get("@destroy").should("be.called");
  });

  it("should show shinsatsu checkbox if appropriate", () => {
    const appointTimeId = 10;
    const appointId = 200;
    const patientId = 1;
    const memo = ""
    const appoint = new Appoint(appointId, appointTimeId, "診療 太郎", patientId, memo);
    const follow = new AppointTime(appointTimeId + 1, "2023-02-13", 
    "10:20:00", "10:40:00", "regular", 1);
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], follow
    )
    const props = {
      destroy: () => {},
      data,
      init: appoint
    }
    cy.mount(AppointDialog, { props });
    driver.shouldNotHaveWithVisit();
    driver.checkKenshin();
    driver.shouldHaveUncheckedWithVisit();
  });

  it("should enter with visit", () => {
    const appointTimeId = 10;
    const follow = new AppointTime(appointTimeId + 1, "2023-02-13", 
    "10:20:00", "10:40:00", "regular", 1);
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [], follow
    )
    const props = {
      destroy: () => {},
      data,
      init: undefined
    };
    cy.spy(props, "destroy").as("destroy");
    let nextAppointId = 200;
    cy.intercept("POST", getBase() + "/register-appoint", (req) => {
      const body = JSON.parse(req.body);
      body.appointId = nextAppointId++;
      req.reply(body);
    }).as("register");
    cy.mount(AppointDialog, { props });
    driver.setPatientInput("看護 花子");
    driver.checkKenshin();
    driver.shouldHaveUncheckedWithVisit();
    driver.checkWithVisit();
    driver.enter();
    cy.wait("@register").then(intercept => {
      const a = JSON.parse(intercept.request.body);
      expect(a.appointTimeId).to.be.equal(appointTimeId);
    })
    cy.wait("@register").then(intercept => {
      const a = JSON.parse(intercept.request.body);
      expect(a.appointTimeId).to.be.equal(appointTimeId + 1);
    })
    cy.get("@destroy").should("be.called");
  });

  it("should update with visit", () => {
    const appointTimeId = 10;
    const appointId = 300;
    const appoint = new Appoint(appointId, appointTimeId, "診療 太郎", 1, "{{健診}}");
    const follow = new AppointTime(appointTimeId + 1, "2023-02-13", 
    "10:20:00", "10:40:00", "regular", 1);
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], follow
    )
    const props = {
      destroy: () => {},
      data,
      init: appoint
    };
    cy.spy(props, "destroy").as("destroy");
    let nextAppointId = 200;
    cy.intercept("POST", getBase() + "/update-appoint", (req) => {
      req.reply("true");
    }).as("update");
    cy.intercept("POST", getBase() + "/register-appoint", (req) => {
      const body = JSON.parse(req.body);
      body.appointId = nextAppointId++;
      req.reply(body);
    }).as("register");
    cy.mount(AppointDialog, { props });
    driver.setPatientInput("看護 花子");
    driver.checkWithVisit();
    driver.modify();
    cy.wait("@update");
    cy.wait("@register").then(intercept => {
      const a = JSON.parse(intercept.request.body);
      expect(a.appointTimeId).to.be.equal(appointTimeId + 1);
    })
    cy.get("@destroy").should("be.called");
  });

  it("should delete appoint", () => {
    const appointTimeId = 10;
    const appointId = 200;
    const patientId = 1;
    const memo = ""
    const appoint = new Appoint(appointId, appointTimeId, "診療 太郎", patientId, memo);
    const data = new AppointTimeData(
      new AppointTime(appointTimeId, "2023-02-13", "10:00:00", "10:20:00", "regular", 1),
      [appoint], undefined
    );
    const props = { destroy: () => {}, data, init: appoint };
    cy.spy(props, "destroy").as("destroy").as("destroy");
    cy.mount(AppointDialog, { props });
    cy.intercept("POST", getBase() + `/cancel-appoint?appoint-id=${appointId}`, "true").as("cancel");
    driver.shouldHaveTitle("診察予約編集");
    driver.cancelAppoint();
    ConfirmDriver.yes("この予約を削除していいですか？");
    cy.wait("@cancel");
    cy.get("@destroy").should("be.called");
  });
});