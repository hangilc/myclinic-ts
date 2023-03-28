import { Hoken } from "@/cashier/patient-dialog/hoken";
import { PatientData } from "@/cashier/patient-dialog/patient-data";
import PatientDialog from "@/cashier/patient-dialog/PatientDialog.svelte";
import { getBase } from "@/lib/api";
import patientJson from "@cypress/fixtures/patient-1.json";
import { dialogOpen } from "@cypress/lib/dialog";
import { dateToSqlDateTime, Patient, Shahokokuho, Visit } from "myclinic-model";

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

  // it("should invoke kakunin with shahokokuho", () => {
  //   const patient = Patient.cast(patientJson);
  //   const shaho = new Shahokokuho(1, patient.patientId, 123456, "23-1", "87654321",
  //     1, "2022-11-01", "0000-00-00", 0, "01");
  //   const hoken = new Hoken(shaho, 0);
  //   const data: PatientData = new PatientData(
  //     patient,
  //     [hoken]
  //   );
  //   const props = {
  //     destroy: () => { },
  //     data
  //   };
  //   const at = dateToSqlDateTime(new Date());
  //   cy.intercept("GET",
  //     getBase() + "/start-visit?*",
  //     (req) => {
  //       const patientId = req.query["patient-id"] as number;
  //       const at = req.query["at"] as string;
  //       const visit = new Visit(1, patientId, at, shaho.shahokokuhoId, 0, 0, 0, 0, 0, undefined);
  //       req.reply(visit);
  //     }
  //   ).as("startVisit");
  //   cy.mount(PatientDialog, { props });
  //   cy.get("button").contains("診察受付").click();
  //   dialogOpen("オンライン資格確認");
  //   cy.get("@startVisit").should("not.exist");
  // });
});