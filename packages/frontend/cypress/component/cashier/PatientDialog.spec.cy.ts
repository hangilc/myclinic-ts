import { Hoken } from "@/cashier/patient-dialog/hoken";
import { PatientData } from "@/cashier/patient-dialog/patient-data";
import PatientDialog from "@/cashier/patient-dialog/PatientDialog.svelte";
import { getBase } from "@/lib/api";
import { onshi_query_from_hoken } from "@/lib/onshi-query-from-hoken";
import patientJson from "@cypress/fixtures/patient-1.json";
import { dialogClose, dialogOpen, dialogSelector } from "@cypress/lib/dialog";
import { mockOnshiSuccessResult, onshiCreationModifier } from "@cypress/lib/onshi-mock";
import { dateToSqlDateTime, Koukikourei, Patient, Shahokokuho } from "myclinic-model";

describe("PatientDialog", () => {
  it("should mount", () => {
    const patient = Patient.cast(patientJson);
    const data: PatientData = new PatientData(
      patient,
      []
    );
    const props = {
      destroy: () => { },
      data
    };
    cy.mount(PatientDialog, { props });
  });

  it("should mount with shahokokuiho", () => {
    const patient = Patient.cast(patientJson);
    const shaho = new Shahokokuho(1, patient.patientId, 123456, "23-1", "87654321",
      1, "2022-11-01", "0000-00-00", 0, "01");
    const hoken = new Hoken(shaho, 0);
    const data: PatientData = new PatientData(
      patient,
      [hoken]
    );
    const props = {
      destroy: () => { },
      data
    };
    cy.mount(PatientDialog, { props });
  });

  it("should register visit with valid hoken shahokokuho", () => {
    const patient = Patient.cast(patientJson);
    const shaho = new Shahokokuho(1, patient.patientId, 123456, "23-1", "87654321",
      1, "2022-11-01", "0000-00-00", 0, "01");
    const hoken = new Hoken(shaho, 0);
    const data: PatientData = new PatientData(
      patient,
      [hoken]
    );
    const props = {
      destroy: () => { },
      data
    };
    const at = dateToSqlDateTime(new Date());
    cy.intercept("GET",
      getBase() + "/get-patient?*",
      (req) => {
        const patientId = req.query["patient-id"] as number;
        expect(patientId).equal("1");
        req.reply(patient);
      }
    );
    const onshiServer = "http://onshi-server";
    const onshiSecret = "SECRET";
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-server", JSON.stringify(onshiServer));
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-secret", JSON.stringify(onshiSecret));
    const query = onshi_query_from_hoken(shaho, patient.birthday, "2022-08-09");
    const onshiResult = mockOnshiSuccessResult(query, onshiCreationModifier.patient(patient));
    cy.intercept("POST", onshiServer + "/onshi/kakunin", JSON.stringify(onshiResult));
    cy.mount(PatientDialog, { props });
    cy.get("button").contains("診察受付").click();
    dialogOpen("診察受付");
    cy.get("button").contains("資格確認").click();
    cy.get("[data-cy='onshi-confirmed']").contains("資格確認済");
    cy.get("button").contains("キャンセル").click();
  });

  it("should support onshi-name in shahokokuho info dialog", () => {
    let patient = Object.assign({}, patientJson, { patientId: 100 });
    cy.intercept("GET", getBase() + `/get-patient?patient-id=${patient.patientId}`, (req) => {
      console.log("get-patient reply", patient);
      req.reply(JSON.stringify(patient));
    });
    const shaho = new Shahokokuho(1, patient.patientId, 123456, "23-1", "87654321",
      1, "2022-11-01", "0000-00-00", 0, "01");
    const hoken = new Hoken(shaho, 1);
    const data: PatientData = new PatientData(
      Patient.cast(patient),
      [hoken]
    );
    const props = {
      destroy: () => { },
      data
    };
    cy.intercept("GET", getBase() + "/count-shahokokuho-usage-before*", (req) => {
      if (req.query["shahokokuho-id"] === shaho.shahokokuhoId.toString()) {
        req.reply("0");
      }
    });
    cy.mount(PatientDialog, { props });
    cy.get("a").contains("国保").click();
    const onshiServer = "http://onshi-server";
    const onshiSecret = "SECRET";
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-server", JSON.stringify(onshiServer));
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-secret", JSON.stringify(onshiSecret));
    const query = onshi_query_from_hoken(shaho, patient.birthday, "2022-12-09");
    const onshiResult = mockOnshiSuccessResult(query, onshiCreationModifier.patient(
      Patient.cast(Object.assign({}, patient, { lastName: "●療" }))
    ), onshiCreationModifier.shahokokuho(shaho));
    cy.intercept("POST", onshiServer + "/onshi/kakunin", JSON.stringify(onshiResult));
    cy.intercept("POST", getBase() + "/update-patient", (req) => {
      const body = JSON.parse(req.body);
      const memo = JSON.parse(body.memo);
      console.log("body", body);
      expect(body["patientId"]).equal(patient.patientId);
      expect(memo["onshi-name"]).equal(`●療　${patient.firstName}`);
      patient = body;
      req.reply("true");
    }).as("updatePatient");
    dialogOpen("社保国保情報").within(() => {
      cy.get("a").contains("資格確認").click();
    });
    dialogOpen("オンライン資格確認").within(() => {
      cy.get('button[data-cy="update-onshi-name-button"]').click();
    });
    cy.wait("@updatePatient");
    dialogClose("オンライン資格確認");
    cy.get("a").contains("資格確認").click();
    dialogOpen("オンライン資格確認").within(() => {
      cy.get(".announce").contains("資格確認成功");
      cy.get("button").contains("閉じる").click();
    });
    dialogClose("オンライン資格確認");
    dialogOpen("社保国保情報").within(() => {
      cy.get("button").contains("閉じる").click();
    });
    dialogClose("社保国保情報");
  });

  it("should support onshi-name in koukikourei info dialog", () => {
    let patient = Object.assign({}, patientJson, { patientId: 100 });
    cy.intercept("GET", getBase() + `/get-patient?patient-id=${patient.patientId}`, (req) => {
      console.log("get-patient reply", patient);
      req.reply(JSON.stringify(patient));
    });
    const koukikourei = new Koukikourei(1, patient.patientId, "12345678", "87654321",
      1, "2022-11-01", "2024-10-31");
    const hoken = new Hoken(koukikourei, 1);
    const data: PatientData = new PatientData(
      Patient.cast(patient),
      [hoken]
    );
    const props = {
      destroy: () => { },
      data
    };
    cy.intercept("GET", getBase() + "/count-koukikourei-usage-before*", (req) => {
      if (req.query["koukikourei-id"] === koukikourei.koukikoureiId.toString()) {
        req.reply("0");
      }
    });
    cy.mount(PatientDialog, { props });
    cy.get("a").contains("後期高齢").click();
    const onshiServer = "http://onshi-server";
    const onshiSecret = "SECRET";
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-server", JSON.stringify(onshiServer));
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-secret", JSON.stringify(onshiSecret));
    const query = onshi_query_from_hoken(koukikourei, patient.birthday, "2022-12-09");
    const onshiResult = mockOnshiSuccessResult(query, onshiCreationModifier.patient(
      Patient.cast(Object.assign({}, patient, { lastName: "●療" }))
    ), onshiCreationModifier.koukikourei(koukikourei));
    console.log("mock onshi result", onshiResult);
    cy.intercept("POST", onshiServer + "/onshi/kakunin", JSON.stringify(onshiResult));
    cy.intercept("POST", getBase() + "/update-patient", (req) => {
      const body = JSON.parse(req.body);
      const memo = JSON.parse(body.memo);
      console.log("body", body);
      expect(body["patientId"]).equal(patient.patientId);
      expect(memo["onshi-name"]).equal(`●療　${patient.firstName}`);
      patient = body;
      req.reply("true");
    }).as("updatePatient");
    dialogOpen("後期高齢情報").within(() => {
      cy.get("a").contains("資格確認").click();
    }).as("dialog1");
    cy.get("@dialog1");
    dialogOpen("オンライン資格確認").within(() => {
      cy.get('button[data-cy="update-onshi-name-button"]').click();
    });
    cy.wait("@updatePatient");
    dialogClose("オンライン資格確認");
    dialogOpen("後期高齢情報").within(() => {
      cy.get("a").contains("資格確認").click();
    }).as("dialog2");
    cy.get("@dialog2");
    dialogOpen("オンライン資格確認").within(() => {
      cy.get(".announce").contains("資格確認成功");
      cy.get("button").contains("閉じる").click();
    }).as("dialog3");
    cy.get("@dialog3");
    dialogClose("オンライン資格確認");
    cy.get(dialogSelector("後期高齢情報") + " button").contains("閉じる").click();
    cy.get(dialogSelector("後期高齢情報")).should("not.exist");
  });
});