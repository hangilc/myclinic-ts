import { Disease, type DiseaseEndReasonType } from "myclinic-model";
import { toSqlDate, type ValidationResult } from "../validator";

export interface DiseaseInput {
  patientId: ValidationResult<number>;
  shoubyoumeicode: ValidationResult<number>;
  startDate: ValidationResult<Date>;
  endDate: ValidationResult<Date | null>;
  endReason: ValidationResult<DiseaseEndReasonType>;
}

export function validateDisease(
  diseseId: number,
  input: DiseaseInput
): Disease | string[] {
  const disease = new Disease(
    diseaseId,
    input.patientId.and(isInt, isPositive),unwrap("patient-id"),
    input.shoubyoumeicode.and(isInt, isPositive).unwwrap("症病名"),
    input.startDate.to(toSqlDate).unwrap("開始日"),
    input.endDate()
  )
}
