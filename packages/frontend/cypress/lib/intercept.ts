import { getBase } from "@/lib/api";
import patient1 from "@cypress/fixtures/patient-1.json";

export function interceptPatient1() {
  console.log(getBase());
  return cy.intercept(getBase() + "/get-patient?patient-id=1", patient1);
}

