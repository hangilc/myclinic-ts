import {
  Disease,
  DiseaseEndReason,
  type DiseaseEndReasonType,
} from "myclinic-model";
import { isNotNull, isOneOf, isPositive, isZeroOrPositive, toOptionalSqlDate, toSqlDate, validated6, type VResult } from "../validation";

export interface DiseaseInput {
  diseaseId: VResult<number>
  patientId: VResult<number>;
  shoubyoumeicode: VResult<number>;
  startDate: VResult<Date | null>;
  endDate: VResult<Date | null>;
  endReason: VResult<string>;
}

const endReasonCodes: string[] = Object.values(DiseaseEndReason).map(
  (r) => r.code
);

export function validateDisease(
  input: DiseaseInput
): VResult<Disease> {
  const diseaseId = input.diseaseId.validate(isZeroOrPositive).mark("disease-id");
  const patientId = input.patientId.validate(isPositive).mark("patient-id");
  const shoubyoumeicode = input.shoubyoumeicode.validate(isPositive).mark("症病名コード");
  const startDate = input.startDate.validate(isNotNull<Date>()).validate(toSqlDate).mark("開始日");
  const endDate = input.endDate.validate(toOptionalSqlDate).mark("終了日");
  const endReason = input.endReason.validate(isOneOf(...endReasonCodes)).mark("転機");
  return validated6(diseaseId, patientId, shoubyoumeicode, startDate, endDate, endReason)
    .map(args => new Disease(...args));
}


