import { Kouhi } from "myclinic-model";
import {
  isNotNull,
  isPositive,
  isZeroOrPositive,
  toOptionalSqlDate,
  toSqlDate,
  validated7,
  validResult,
} from "../validation";
import type { VResult } from "../validation";

export interface KouhiInput {
  kouhiId: VResult<number>;
  futansha: VResult<number>;
  jukyuusha: VResult<number>;
  validFrom: VResult<Date | null>;
  validUpto: VResult<Date | null>;
  patientId: VResult<number>;
  memo: string | undefined;
}

export function validateKouhi(
  input: KouhiInput
): VResult<Kouhi> {
  const kouhiIdVal = input.kouhiId
    .validate(isZeroOrPositive)
    .mark("kouhi-id");
  const futanshaVal = input.futansha
    .validate(isPositive)
    .mark("負担者番号");
  const jukyuushaVal = input.jukyuusha
    .validate(isPositive)
    .mark("受給者番号");
  const validFromVal = input.validFrom
    .validate(isNotNull("入力されていません"))
    .validate(toSqlDate)
    .mark("期限開始");
  const validUptoVal = input.validUpto
    .validate(toOptionalSqlDate)
    .mark("期限終了");
  const patientIdVal = input.patientId.validate(isPositive).mark("patient-id");
  return validated7(
    kouhiIdVal,
    futanshaVal,
    jukyuushaVal,
    validFromVal,
    validUptoVal,
    patientIdVal,
    validResult<string | undefined>(input.memo),
  ).map((args) => new Kouhi(...args));
}

