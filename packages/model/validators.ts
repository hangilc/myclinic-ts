import { PatientSummary } from "myclinic-model";
import { object, number, string, parse } from "valibot";

const PatientSummarySchema = object({
  patientId: number(),
  content: string(),
});

export function validatePatientSummary(obj: any): PatientSummary {
  return parse(PatientSummarySchema, obj);
}
