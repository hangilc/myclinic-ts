import { KouhiInterface, PatientSummary } from "./model";
import * as v from "valibot";

const KouhiSchema = v.object({
  kouhiId: v.number(),
  futansha: v.number(),
  jukyuusha: v.number(),
  validFrom: v.string([v.regex(/^\d{4}-\d{2}-\d{2}$/)]),
  validUpto: v.string([v.regex(/^((\d{4}-\d{2}-\d{2})|(0000-00-00))$/)]),
  patientId: v.number(),
  memo: v.union([v.string(), v.undefined_()]),
});

export function validateKouhi(obj: any): KouhiInterface {
  return v.parse(KouhiSchema, obj);
}

const PatientSummarySchema = v.object({
  patientId: v.number(),
  content: v.string(),
});

export function validatePatientSummary(obj: any): PatientSummary {
  return v.parse(PatientSummarySchema, obj);
}
