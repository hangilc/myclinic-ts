import type { Kouhi, Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { ResultItem } from "onshi-result/ResultItem";
import * as kanjidate from "kanjidate";
import api from "./api";

export class OnshiPatient {
  lastName: string;
  firstName: string;
  lastNameYomi: string;
  firstNameYomi: string;
  birthday: string;
  sex: string;
  address: string;

  constructor(r: ResultItem) {
    console.log(r);
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
    return kanjidate.format(kanjidate.f2, this.birthday);
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

export class NoResultItem {}

export class MultipleResultItems {}

export class Initializing {

}

export class NoPatient {
  constructor(
    public result: ResultItem
  ) {}
}

export class MultiplePatients {
  constructor(
    public patients: Patient[],
    public result: ResultItem,
  ) {}
}

export class AllResolved {
  constructor(
    public patient: Patient,
    public hoken: Shahokokuho | Koukikourei,
    public kouhiList: Kouhi[],
    public onshiResult: OnshiResult,
    public at: string, // date time
  ) { }
}

export class InconsistentHoken {
  constructor(
    public patient: Patient,
    public shahokokuhoOpt: Shahokokuho | undefined,
    public koukikoureiOpt: Koukikourei | undefined,
    public result: ResultItem,
  ) {}
}

export class NewHoken {
  constructor(
    public patient: Patient,
    public result: ResultItem,
  ) {}
}

