import { dateToSqlDate, Patient, type Kouhi, type Koukikourei, type Shahokokuho } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";
import * as kanjidate from "kanjidate";
import api from "./api";
import { birthdayRep } from "./util";
import { convertHankakuKatakanaToZenkakuHiragana } from "./zenkaku";

export class OnshiPatient {
  lastName: string;
  firstName: string;
  lastNameYomi: string;
  firstNameYomi: string;
  birthday: string;
  sex: string;
  address: string;

  constructor(r: ResultItem) {
    const [lastName, firstName] = r.name.split("　");
    const [lastNameYomi, firstNameYomi] = r.nameKana ? r.nameKana.split(" ") : ["", ""];
    const sex = r.sex === "男" ? "M" : "F";
    this.lastName = lastName;
    this.firstName = firstName;
    this.lastNameYomi = lastNameYomi;
    this.firstNameYomi = firstNameYomi;
    this.birthday = r.birthdate;
    this.sex = sex;
    this.address = r.address ?? "";
  }

  fullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }

  fullYomi(): string {
    return `${this.lastNameYomi} ${this.firstNameYomi}`;
  }

  birthdayRep(): string {
    return birthdayRep(this.birthday);
  }

  toPatient(): Patient {
    return new Patient(
      0,
      this.lastName,
      this.firstName,
      convertHankakuKatakanaToZenkakuHiragana(this.lastNameYomi),
      convertHankakuKatakanaToZenkakuHiragana(this.firstNameYomi),
      this.sex,
      this.birthday,
      this.address,
      ""
    )
  }
}

export async function searchPatient(
  name: string,
  yomi: string | undefined,
  birthdate: string
): Promise<Patient[]> {
  let patients: Patient[] = (await api.searchPatient(name)).filter(
    (p) => name === `${p.lastName}　${p.firstName}`
  );
  if (yomi) {
    let yomiPatients = await api.searchPatient(yomi);
    yomiPatients
      .filter((p) => yomi === `${p.lastNameYomi} ${p.firstNameYomi}`)
      .filter((p) => {
        return patients.findIndex((a) => a.patientId === p.patientId) < 0;
      })
      .forEach((p) => patients.push(p));
  }
  return patients.filter((p) => p.birthday === birthdate);
}

export function yesterdayAsSqlDate(): string {
  const today = new Date();
  const yesterday = kanjidate.addDays(today, -1);
  return dateToSqlDate(yesterday);
}

export async function invalidateShahokokuho(shahokokuho: Shahokokuho, validUpto: string) {
  const s = Object.assign({}, shahokokuho, { validUpto: validUpto });
  await api.updateShahokokuho(s);
}

export async function invalidateKoukikourei(koukikourei: Koukikourei, validUpto: string) {
  const s = Object.assign({}, koukikourei, { validUpto: validUpto });
  await api.updateKoukikourei(s);
}

export async function fixShahokokuhoValidUpto(shahokokuho: Shahokokuho, otherStartDate: string)
  : Promise<string | undefined> {
  const shahokokuhoId = shahokokuho.shahokokuhoId;
  const visits = await api.shahokokuhoUsageSince(shahokokuhoId, otherStartDate);
  if (visits.length > 0) {
    return "失効している保険証の使用が" +
      visits.map(v => kanjidate.format(kanjidate.f2, v.visitedAt)).join("、") +
      "に確認されました。その旨を管理者に連絡してください。";
  } else {
    const at = dateToSqlDate(kanjidate.addDays(new Date(otherStartDate), -1));
    if (shahokokuho.validUpto === "0000-00-00" || shahokokuho.validUpto > at) {
      await invalidateShahokokuho(shahokokuho, at);
    }
    return undefined;
  }
}

export async function fixKoukikoureiValidUpto(koukikourei: Koukikourei, otherStartDate: string)
  : Promise<string | undefined> {
  const koukikoureiId = koukikourei.koukikoureiId;
  const visits = await api.koukikoureiUsageSince(koukikoureiId, otherStartDate);
  if (visits.length > 0) {
    return "失効している保険証の使用が" +
      visits.map(v => kanjidate.format(kanjidate.f2, v.visitedAt)).join("、") +
      "に確認されました。その旨を管理者に連絡してください。";
  } else {
    const at = dateToSqlDate(kanjidate.addDays(new Date(otherStartDate), -1));
    if (koukikourei.validUpto === "0000-00-00" || koukikourei.validUpto > at) {
      await invalidateKoukikourei(koukikourei, at);
    }
    return undefined;
  }
}

export class NoResultItem {
  readonly classKind = "NoResultItem";
}

export class MultipleResultItems {
  readonly classKind = "MultipleResultItems";

}

export class Initializing {
  readonly classKind = "Initializing";

}

export class NoPatient {
  readonly classKind = "NoPatient";
  constructor(
    public result: ResultItem,
  ) { }
}

export class MultiplePatients {
  readonly classKind = "MultiplePatients";
  constructor(
    public patients: Patient[],
    public result: ResultItem,
  ) { }
}

export class AllResolved {
  readonly classKind = "AllResolved";
  constructor(
    public patient: Patient,
    public hoken: Shahokokuho | Koukikourei,
    public kouhiList: Kouhi[],
  ) { }

  copy(modify: (c: AllResolved) => void): AllResolved {
    const c = new AllResolved(this.patient, this.hoken, this.kouhiList);
    modify(c);
    return c;
  }
}

export class NewHoken {
  readonly classKind = "NewHoken";
  constructor(
    public patient: Patient,
    public resultItem: ResultItem,
    public shahokokuhoOpt: Shahokokuho | undefined,
    public koukikoureiOpt: Koukikourei | undefined,
    public kouhiList: Kouhi[]
  ) { }
}

