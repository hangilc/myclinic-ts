import { Shahokokuho } from "myclinic-model";
import {
  isNotNull,
  isOneOf,
  isPositive,
  toSqlDate,
  toOptionalSqlDate,
  type VResult,
  isInInclusiveRange,
  validated9,
  valid,
} from "../validation";

export interface ShahokokuhoInput {
  patientId: number;
  hokenshaBangou: number;
  hihokenshaKigou: string;
  hihokenshaBangou: string;
  honninStore: number;
  validFrom: Date | null;
  validUpto: Date | null;
  koureiStore: number;
  edaban: string;
}

export function validateShahokokuho(
  shahokokuhoId: number,
  input: ShahokokuhoInput
): Shahokokuho | string[] {
  const patientIdVal = valid(input.patientId)
    .validate(isPositive)
    .mark("patient-id");
  const hokenshaBangouVal = valid(input.hokenshaBangou)
    .validate(isPositive)
    .mark("保険者番号");
  const hihokenshaKigouVal = valid(input.hihokenshaKigou).mark("被保険者記号");
  const hihokenshaBangouVal = valid(input.hihokenshaBangou).mark(
    "被保険者番号"
  );
  const honninVal = valid(input.honninStore)
    .validate(isOneOf(0, 1))
    .mark("本人・家族");
  const validFromVal = valid(input.validFrom)
    .validate(isNotNull)
    .validate(toSqlDate)
    .mark("期限開始");
  const validUptoVal = valid(input.validUpto)
    .validate(toOptionalSqlDate)
    .mark("期限終了");
  const koureiVal = valid(input.koureiStore)
    .validate(isInInclusiveRange(0, 3))
    .mark("高齢");
  const edabanVal = valid(input.edaban).mark("枝番");
  const vs = validated9(
    patientIdVal,
    hokenshaBangouVal,
    hihokenshaKigouVal,
    hihokenshaBangouVal,
    honninVal,
    validFromVal,
    validUptoVal,
    koureiVal,
    edabanVal
  );
  if (vs.isValid) {
    return new Shahokokuho(shahokokuhoId, ...vs.value);
  } else {
    return vs.errorMessages;
  }
}
