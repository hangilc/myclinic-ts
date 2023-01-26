import { Koukikourei } from "myclinic-model";
import {
  isInInclusiveRange,
  isNotEmpty,
  isNotNull,
  isPositive,
  isZeroOrPositive,
  toInt,
  toOptionalSqlDate,
  toSqlDate,
  validated7,
} from "../validation";
import type { VResult } from "../validation";

export interface KoukikoureiInput {
  koukikoureiId: VResult<number>;
  patientId: VResult<number>;
  hokenshaBangou: VResult<string>;
  hihokenshaBangou: VResult<string>;
  futanWari: VResult<number>;
  validFrom: VResult<Date | null>;
  validUpto: VResult<Date | null>;
}

export function validateKoukikourei(
  input: KoukikoureiInput
): VResult<Koukikourei> {
  const koukikoureiIdVal = input.koukikoureiId
    .validate(isZeroOrPositive)
    .mark("koukikourei-id");
  const patientIdVal = input.patientId.validate(isPositive).mark("patient-id");
  const hokenshaBangouVal = input.hokenshaBangou
    .validate(toInt)
    .validate(isPositive)
    .map((n) => n.toString())
    .mark("保険者番号");
  const hihokenshaBangouVal = input.hihokenshaBangou
    .validate(isNotEmpty)
    .map((n) => n.toString())
    .mark("被保険者番号");
  const futanWariVal = input.futanWari
    .validate(isInInclusiveRange(1, 3))
    .mark("負担割");
  const validFromVal = input.validFrom
    .validate(isNotNull("入力されていません"))
    .validate(toSqlDate)
    .mark("期限開始");
  const validUptoVal = input.validUpto
    .validate(toOptionalSqlDate)
    .mark("期限終了");
  return validated7(
    koukikoureiIdVal,
    patientIdVal,
    hokenshaBangouVal,
    hihokenshaBangouVal,
    futanWariVal,
    validFromVal,
    validUptoVal
  ).map((args) => new Koukikourei(...args));
}
