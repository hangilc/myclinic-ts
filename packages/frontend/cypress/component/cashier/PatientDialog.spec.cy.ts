import { Hoken } from "@/cashier/patient-dialog/hoken";
import { PatientData } from "@/cashier/patient-dialog/patient-data";
import PatientDialog from "@/cashier/patient-dialog/PatientDialog.svelte";
import { getBase } from "@/lib/api";
import { onshi_query_from_hoken } from "@/lib/onshi-query-from-hoken";
import patientJson from "@cypress/fixtures/patient-1.json";
import { dialogOpen } from "@cypress/lib/dialog";
import { mockOnshiSuccessResult, onshiCreationModifier } from "@cypress/lib/onshi-mock";
import { dateToSqlDateTime, Patient, Shahokokuho } from "myclinic-model";

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
    cy.get("button").contains("入力").click();
  });

  it.only("should support onshi-name", () => {
    const patient = Patient.cast(patientJson);
    const shaho = new Shahokokuho(1, patient.patientId, 123456, "23-1", "87654321",
      1, "2022-11-01", "0000-00-00", 0, "01");
    const hoken = new Hoken(shaho, 1);
    const data: PatientData = new PatientData(
      patient,
      [hoken]
    );
    const props = {
      destroy: () => { },
      data
    };
    cy.intercept("GET", getBase() + "/count-shahokokuho-usage-before*", (req) => {
      if( req.query["shahokokuho-id"] === "1") {
        req.reply("0");
      }
    });
    cy.mount(PatientDialog, { props} );
    cy.get("a").contains("国保").click();
    const onshiServer = "http://onshi-server";
    const onshiSecret = "SECRET";
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-server", JSON.stringify(onshiServer));
    cy.intercept("GET", getBase() + "/dict-get?key=onshi-secret", JSON.stringify(onshiSecret));
    const query = onshi_query_from_hoken(shaho, patient.birthday, "2022-08-09");
    const onshiResult = mockOnshiSuccessResult(query, onshiCreationModifier.patient(
      Patient.cast(Object.assign({}, patientJson, { birthday: "1957-01-01"}))
      // Patient.cast(Object.assign({}, patientJson, { lastName: "●療"}))
    ));
    cy.intercept("POST", onshiServer + "/onshi/kakunin", JSON.stringify(onshiResult));
    dialogOpen("社保国保情報").within(() => {
      cy.get("a").contains("資格確認").click();
    });
  });
});