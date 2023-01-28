import { Patient } from "myclinic-model";
import {
  isNotEmpty,
  isNotNull,
  isOneOf,
  isZeroOrPositive,
  toSqlDate,
  type VResult,
  validated9,
} from "../validation";

export class PatientInput {
  constructor(
    public patientId: VResult<number>,
    public lastName: VResult<string>,
    public firstName: VResult<string>,
    public lastNameYomi: VResult<string>,
    public firstNameYomi: VResult<string>,
    public sex: VResult<string>,
    public birthday: VResult<Date | null>,
    public address: VResult<string>,
    public phone: VResult<string>
  ) {}
}

export function validatePatient(input: PatientInput): VResult<Patient> {
  const patientId = input.patientId
    .validate(isZeroOrPositive)
    .mark("patient-id");
  const lastName = input.lastName.validate(isNotEmpty).mark("姓");
  const firstName = input.firstName.validate(isNotEmpty).mark("名");
  const lastNameYomi = input.lastNameYomi.validate(isNotEmpty).mark("姓のよみ");
  const firstNameYomi = input.firstNameYomi
    .validate(isNotEmpty)
    .mark("名のよみ");
  const sex = input.sex.validate(isOneOf("M", "F")).mark("性別");
  const birthday = input.birthday
    .validate(isNotNull("入力されていません"))
    .validate(toSqlDate)
    .mark("生年月日");
  const address = input.address.mark("住所");
  const phone = input.phone.mark("電話番号");
  return validated9(
    patientId,
    lastName,
    firstName,
    lastNameYomi,
    firstNameYomi,
    sex,
    birthday,
    address,
    phone
  ).map((args) => new Patient(...args));
}
