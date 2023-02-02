import type { Shahokokuho, Patient, Koukikourei, Kouhi } from "myclinic-model"
import { newPatient, newShahokokuho, newKoukikourei, newKouhi, openPatientDialog } from "./misc"

describe("Hoken History", () => {
  let patient: Patient;
  let shahokokuho: Shahokokuho;
  let koukikourei: Koukikourei;
  let kouhi: Kouhi;

  before(() => {
    newPatient().then(p => {
      patient = p;
      return newShahokokuho(patient.patientId)
    }).then(h => {
      shahokokuho = h;
      return newKoukikourei(patient.patientId);
    }).then(h => {
      koukikourei = h;
      return newKouhi(patient.patientId);
    }).then(h => {
      kouhi = h;
    })
  })

  it("should open hoken history dialog", () => {
    cy.visit("/reception/");
    openPatientDialog(patient.patientId);
  })
})