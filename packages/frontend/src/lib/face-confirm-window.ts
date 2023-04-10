import type { Kouhi, Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { ResultItem } from "onshi-result/ResultItem";

export class AllResolved {
  constructor(
    public patient: Patient,
    public hoken: Shahokokuho | Koukikourei,
    public kouhiList: Kouhi[],
    public onshiResult: OnshiResult,
    public at: string, // date time
  ) { }
}

export class MultiplePatients {
  constructor(
    public patients: Patient[],
    public result: ResultItem,
  ) {}
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

export class NoPatient {
  constructor(
    public result: ResultItem
  ) {}
}