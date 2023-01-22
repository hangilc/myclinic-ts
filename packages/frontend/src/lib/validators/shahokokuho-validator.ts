import { Shahokokuho } from "myclinic-model";
import {
  isNotNull,
  isOneOf,
  isPositive,
  toSqlDate,
  toOptionalSqlDate,
  type VResult,
  isInInclusiveRange,
  isZeroOrPositive,
  validated10,
} from "../validation";

export interface ShahokokuhoInput {
  shahokokuhoId: VResult<number>;
  patientId: VResult<number>;
  hokenshaBangou: VResult<number>;
  hihokenshaKigou: VResult<string>;
  hihokenshaBangou: VResult<string>;
  honninStore: VResult<number>;
  validFrom: VResult<Date | null>;
  validUpto: VResult<Date | null>;
  koureiStore: VResult<number>;
  edaban: VResult<string>;
}

export function validateShahokokuho(
  input: ShahokokuhoInput
): VResult<Shahokokuho> {
  const shahokokuhoIdVal = input.shahokokuhoId
    .validate(isZeroOrPositive)
    .mark("shahokokuho-id");
  const patientIdVal = input.patientId.validate(isPositive).mark("patient-id");
  const hokenshaBangouVal = input.hokenshaBangou
    .validate(isPositive)
    .mark("保険者番号");
  const hihokenshaKigouVal = input.hihokenshaKigou.mark("被保険者記号");
  const hihokenshaBangouVal = input.hihokenshaBangou.mark("被保険者番号");
  const honninVal = input.honninStore
    .validate(isOneOf(0, 1))
    .mark("本人・家族");
  const validFromVal = input.validFrom
    .validate(isNotNull("入力されていません"))
    .validate(toSqlDate)
    .mark("期限開始");
  const validUptoVal = input.validUpto
    .validate(toOptionalSqlDate)
    .mark("期限終了");
  const koureiVal = input.koureiStore
    .validate(isInInclusiveRange(0, 3))
    .mark("高齢");
  const edabanVal = input.edaban.mark("枝番");
  return validated10(
    shahokokuhoIdVal,
    patientIdVal,
    hokenshaBangouVal,
    hihokenshaKigouVal,
    hihokenshaBangouVal,
    honninVal,
    validFromVal,
    validUptoVal,
    koureiVal,
    edabanVal
  )
    .map((args) => new Shahokokuho(...args))
    .ensure(
      (h) => !(h.hihokenshaKigou === "" && h.hihokenshaBangou === ""),
      "被保険者記号・番号の両方が空白です"
    )
    .ensure(
      (h) => h.validUpto === "0000-00-00" || h.validFrom <= h.validUpto,
      "期限開始が期限終了の後になっています"
    );
}
