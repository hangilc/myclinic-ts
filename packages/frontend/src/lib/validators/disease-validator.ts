import {
  Disease,
  DiseaseEndReason,
  type DiseaseEndReasonType,
} from "myclinic-model";
import {
  intSrc,
  Invalid,
  isOptionalSqlDate,
  isPositiveInt,
  isSqlDate,
  oneOf,
  optionalSqlDateSrc,
  sqlDateSrc,
  strSrc,
  type ValidationResult,
} from "../validator";

export interface DiseaseInput {
  patientId: ValidationResult<number>;
  shoubyoumeicode: ValidationResult<number>;
  startDate: ValidationResult<string>;
  endDate: ValidationResult<string>;
  endReason: ValidationResult<string>;
}

const endReasonCodes: string[] = Object.values(DiseaseEndReason).map(
  (r) => r.code
);

export function validateDiseaseInput(
  diseaseId: number,
  input: DiseaseInput
): Disease | Invalid[] {
  const errs: Invalid[] = [];
  const disease = new Disease(
    diseaseId,
    input.patientId.and(isPositiveInt).unwrap(errs, "patient-id"),
    input.shoubyoumeicode.and(isPositiveInt).unwrap(errs, "症病名コード"),
    input.startDate.and(isSqlDate).unwrap(errs, "開始日"),
    input.endDate.and(isOptionalSqlDate).unwrap(errs, "終了日"),
    input.endReason.and(oneOf(endReasonCodes)).unwrap(errs, "転機")
  );
  if (errs.length === 0) {
    if (
      disease.endDate !== "0000-00-00" &&
      disease.startDate > disease.endDate
    ) {
      errs.push(new Invalid("開始日が終了日のあとです。"));
    }
    if (
      disease.endReasonStore !== DiseaseEndReason.NotEnded.code &&
      disease.endDate === "0000-00-00"
    ) {
      errs.push(new Invalid("終了日が設定されていません。"));
    }
  }
  if (errs.length > 0) {
    return errs;
  } else {
    if (disease.endReasonStore === DiseaseEndReason.NotEnded.code) {
      disease.endDate = "0000-00-00";
    }
    return disease;
  }
}

export interface DiseaseInput1 {
  diseaseId: number;
  patientId: number;
  shoubyoumeicode: number;
  startDate: Date | null;
  startDateErrors: Invalid[];
  endDate: Date | null;
  endDateErrors: Invalid[];
  endReason: DiseaseEndReasonType;
}

export function validateDisease(input: DiseaseInput1): Disease | Invalid[] {
  return validateDiseaseInput(input.diseaseId, {
    patientId: intSrc(input.patientId),
    shoubyoumeicode: intSrc(input.shoubyoumeicode),
    startDate: sqlDateSrc(input.startDate, input.startDateErrors),
    endDate: optionalSqlDateSrc(input.endDate, input.endDateErrors),
    endReason: strSrc(input.endReason.code),
  });
}
