import { PatientSummary } from "model";
import { object, number, string, parse } from "valibot";

const PatientSummarySchema = object({
  patientId: number(),
  content: string(),
});

export function validatePatientSummary(obj: any): PatientSummary {
  const src = { patientId: obj["patient-id"], content: obj.content };
  return parse(PatientSummarySchema, src);
}
